const Duty = require('../models/Duty');
const Driver = require('../models/Driver');
const Conductor = require('../models/Conductor');
const Employee = require('../models/Employee');
const User = require('../models/User');
const LeaveRequest = require('../models/LeaveRequest');
const PermissionRequest = require('../models/PermissionRequest');
const ReplacementAssignment = require('../models/ReplacementAssignment');
const Notification = require('../models/Notification');
const AuditLog = require('../models/AuditLog');

// @desc    Get eligible replacement candidates for a vacant duty using MongoDB queries
// @route   GET /api/replacements/candidates/:dutyId
// @access  Private (Manager/Admin)
exports.getReplacementCandidates = async (req, res) => {
  try {
    const duty = await Duty.findById(req.params.dutyId)
      .populate('bus')
      .populate('route')
      .populate('driver')
      .populate('conductor')
      .populate('originalDriver')
      .populate('originalConductor');

    if (!duty) {
      return res.status(404).json({ success: false, message: 'Duty not found' });
    }

    const dutyDate = new Date(duty.date || duty.dutyDate || new Date());
    const startOfDay = new Date(dutyDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(dutyDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Determine required vacancy role
    let requiredRole = duty.vacancyRole || 'DRIVER';
    if (requiredRole === 'NONE' || !requiredRole) {
      requiredRole = duty.driver ? 'CONDUCTOR' : 'DRIVER';
    }
    requiredRole = requiredRole.toUpperCase();

    // 1. Find all active approved leaves covering this duty date
    const activeLeaves = await LeaveRequest.find({
      status: { $in: ['APPROVED', 'approved'] },
      $or: [
        { fromDate: { $lte: endOfDay }, toDate: { $gte: startOfDay } },
        { startDate: { $lte: endOfDay }, endDate: { $gte: startOfDay } }
      ]
    }).populate('applicant');

    const leaveUserIds = activeLeaves.map((l) => l.applicant?._id?.toString()).filter(Boolean);

    // 2. Find all active approved permissions covering this duty date
    const activePermissions = await PermissionRequest.find({
      status: { $in: ['APPROVED', 'approved'] },
      date: { $gte: startOfDay, $lte: endOfDay }
    }).populate('applicant');

    const permissionUserIds = activePermissions.map((p) => p.applicant?._id?.toString()).filter(Boolean);

    // 3. Find all busy staff already assigned to another duty on this date
    const existingDuties = await Duty.find({
      _id: { $ne: duty._id },
      date: { $gte: startOfDay, $lte: endOfDay },
      status: { $nin: ['CANCELLED', 'cancelled'] }
    });

    const busyDriverIds = existingDuties.map((d) => d.driver?.toString()).filter(Boolean);
    const busyConductorIds = existingDuties.map((d) => d.conductor?.toString()).filter(Boolean);

    let candidates = [];

    if (requiredRole === 'DRIVER' || requiredRole === 'BOTH') {
      const drivers = await Driver.find().populate('user');

      const evaluatedDrivers = await Promise.all(
        drivers.map(async (drv) => {
          let isAvailable = true;
          let validationReason = '✓ Available for duty assignment';
          let score = 100;

          const userIdStr = drv.user?._id?.toString();

          if (drv.status === 'inactive' || drv.status === 'INACTIVE') {
            isAvailable = false;
            validationReason = '✕ Inactive staff status';
          } else if (drv.status === 'on_leave' || (userIdStr && leaveUserIds.includes(userIdStr))) {
            isAvailable = false;
            validationReason = '✕ On approved leave';
          } else if (userIdStr && permissionUserIds.includes(userIdStr)) {
            isAvailable = false;
            validationReason = '✕ On approved hourly permission';
          } else if (busyDriverIds.includes(drv._id.toString())) {
            isAvailable = false;
            validationReason = '✕ Already assigned to another duty on this date';
          } else if (duty.originalDriver && drv._id.toString() === duty.originalDriver._id?.toString()) {
            isAvailable = false;
            validationReason = '✕ Original assigned driver on leave';
          }

          if (isAvailable) {
            const pastWeek = new Date(dutyDate);
            pastWeek.setDate(pastWeek.getDate() - 7);
            const weeklyDutyCount = await Duty.countDocuments({
              driver: drv._id,
              date: { $gte: pastWeek, $lte: dutyDate },
              status: { $ne: 'CANCELLED' }
            });
            score -= weeklyDutyCount * 10;
          } else {
            score = 0;
          }

          return {
            id: drv._id,
            userId: drv.user?._id,
            name: drv.name,
            employeeId: drv.employeeId,
            role: 'DRIVER',
            phone: drv.phone,
            licenseNumber: drv.licenseNumber,
            currentStatus: drv.status,
            isAvailable,
            validationReason,
            score: Math.max(0, score),
            isRecommended: isAvailable && score >= 70
          };
        })
      );

      candidates.push(...evaluatedDrivers);
    }

    if (requiredRole === 'CONDUCTOR' || requiredRole === 'BOTH') {
      const conductors = await Conductor.find().populate('user');

      const evaluatedConductors = await Promise.all(
        conductors.map(async (cnd) => {
          let isAvailable = true;
          let validationReason = '✓ Available for duty assignment';
          let score = 100;

          const userIdStr = cnd.user?._id?.toString();

          if (cnd.status === 'on_leave' || (userIdStr && leaveUserIds.includes(userIdStr))) {
            isAvailable = false;
            validationReason = '✕ On approved leave';
          } else if (userIdStr && permissionUserIds.includes(userIdStr)) {
            isAvailable = false;
            validationReason = '✕ On approved hourly permission';
          } else if (busyConductorIds.includes(cnd._id.toString())) {
            isAvailable = false;
            validationReason = '✕ Already assigned to another duty on this date';
          } else if (duty.originalConductor && cnd._id.toString() === duty.originalConductor._id?.toString()) {
            isAvailable = false;
            validationReason = '✕ Original assigned conductor on leave';
          }

          if (isAvailable) {
            const pastWeek = new Date(dutyDate);
            pastWeek.setDate(pastWeek.getDate() - 7);
            const weeklyDutyCount = await Duty.countDocuments({
              conductor: cnd._id,
              date: { $gte: pastWeek, $lte: dutyDate },
              status: { $ne: 'CANCELLED' }
            });
            score -= weeklyDutyCount * 10;
          } else {
            score = 0;
          }

          return {
            id: cnd._id,
            userId: cnd.user?._id,
            name: cnd.name,
            employeeId: cnd.employeeId,
            role: 'CONDUCTOR',
            phone: cnd.phone,
            currentStatus: cnd.status,
            isAvailable,
            validationReason,
            score: Math.max(0, score),
            isRecommended: isAvailable && score >= 70
          };
        })
      );

      candidates.push(...evaluatedConductors);
    }

    // Sort available candidates first, then by highest score
    candidates.sort((a, b) => {
      if (a.isAvailable === b.isAvailable) return b.score - a.score;
      return a.isAvailable ? -1 : 1;
    });

    res.status(200).json({
      success: true,
      duty,
      vacancyRole: requiredRole,
      count: candidates.length,
      data: candidates
    });
  } catch (error) {
    console.error('getReplacementCandidates Error:', error);
    res.status(500).json({ success: false, message: 'Error retrieving replacement candidates' });
  }
};

// @desc    Assign replacement employee to a vacant/affected duty
// @route   POST /api/replacements/assign
// @access  Private (Manager/Admin)
exports.assignReplacement = async (req, res) => {
  try {
    const { dutyId, replacementStaffId, role, notes, leaveRequestId } = req.body;

    if (!dutyId || !replacementStaffId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both dutyId and replacementStaffId.'
      });
    }

    const duty = await Duty.findById(dutyId).populate('bus').populate('route');
    if (!duty) {
      return res.status(404).json({ success: false, message: 'Duty not found' });
    }

    const targetRole = (role || duty.vacancyRole || 'DRIVER').toUpperCase();
    let replacementDoc = null;
    let previousUserId = null;

    if (targetRole === 'DRIVER') {
      replacementDoc = await Driver.findById(replacementStaffId).populate('user');
      if (!replacementDoc) {
        return res.status(404).json({ success: false, message: 'Replacement Driver not found' });
      }

      previousUserId = duty.originalDriver || duty.driver;
      duty.originalDriver = duty.originalDriver || duty.driver;
      duty.driver = replacementDoc._id;
      duty.replacementDriver = replacementDoc._id;
      duty.status = 'SCHEDULED';
      duty.vacancyRole = 'NONE';
      duty.reassignmentReason = `Replacement driver assigned: ${replacementDoc.name}. ${notes || ''}`.trim();
      duty.reassignedAt = new Date();
      duty.reassignedBy = req.user._id;
    } else if (targetRole === 'CONDUCTOR') {
      replacementDoc = await Conductor.findById(replacementStaffId).populate('user');
      if (!replacementDoc) {
        return res.status(404).json({ success: false, message: 'Replacement Conductor not found' });
      }

      previousUserId = duty.originalConductor || duty.conductor;
      duty.originalConductor = duty.originalConductor || duty.conductor;
      duty.conductor = replacementDoc._id;
      duty.replacementConductor = replacementDoc._id;
      duty.status = 'SCHEDULED';
      duty.vacancyRole = 'NONE';
      duty.reassignmentReason = `Replacement conductor assigned: ${replacementDoc.name}. ${notes || ''}`.trim();
      duty.reassignedAt = new Date();
      duty.reassignedBy = req.user._id;
    }

    await duty.save();

    // Create ReplacementAssignment record
    const assignment = await ReplacementAssignment.create({
      duty: duty._id,
      leaveRequest: leaveRequestId || null,
      previousEmployee: previousUserId || req.user._id,
      replacementEmployee: replacementDoc.user?._id || req.user._id,
      role: targetRole,
      dutyDate: duty.date,
      assignedBy: req.user._id,
      notes: notes || `Replaced by ${replacementDoc.name}`
    });

    // Notify Replacement Staff Member
    if (replacementDoc.user) {
      await Notification.create({
        recipient: replacementDoc.user._id,
        title: 'Assigned as Replacement Staff',
        type: 'REPLACEMENT',
        message: `You have been assigned as replacement ${targetRole.toLowerCase()} for Duty on Bus ${duty.bus?.busNumber} (${new Date(duty.date).toLocaleDateString()}, ${duty.startTime} - ${duty.endTime}).`
      });
    }

    // Audit log
    await AuditLog.create({
      action: 'REPLACEMENT_ASSIGNED',
      performedBy: req.user._id,
      performerRole: req.user.role,
      targetModel: 'Duty',
      targetId: duty._id.toString(),
      details: {
        dutyId: duty._id,
        role: targetRole,
        replacementName: replacementDoc.name,
        bus: duty.bus?.busNumber
      }
    });

    const updatedDuty = await Duty.findById(duty._id)
      .populate('bus')
      .populate('route')
      .populate('driver')
      .populate('conductor')
      .populate('replacementDriver')
      .populate('replacementConductor');

    res.status(200).json({
      success: true,
      message: `Replacement ${targetRole.toLowerCase()} '${replacementDoc.name}' assigned to Bus ${duty.bus?.busNumber} successfully!`,
      data: {
        duty: updatedDuty,
        assignment
      }
    });
  } catch (error) {
    console.error('assignReplacement Error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Get replacement assignment history
// @route   GET /api/replacements/history
// @access  Private (Manager/Admin)
exports.getReplacementHistory = async (req, res) => {
  try {
    const history = await ReplacementAssignment.find()
      .populate('duty')
      .populate('previousEmployee', 'name email employeeId role')
      .populate('replacementEmployee', 'name email employeeId role')
      .populate('assignedBy', 'name email employeeId')
      .sort({ assignedAt: -1 });

    res.status(200).json({
      success: true,
      count: history.length,
      data: history
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

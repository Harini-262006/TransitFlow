const LeaveRequest = require('../models/LeaveRequest');
const Driver = require('../models/Driver');
const Conductor = require('../models/Conductor');
const User = require('../models/User');
const Shift = require('../models/Shift');
const Notification = require('../models/Notification');

// Normalize leave type string for display/storage
const formatLeaveType = (type) => {
  if (!type) return 'Casual Leave';
  const lower = type.toLowerCase().trim();
  if (lower.includes('sick')) return 'Sick Leave';
  if (lower.includes('emergency')) return 'Emergency Leave';
  if (lower.includes('personal')) return 'Personal Leave';
  if (lower.includes('other')) return 'Other';
  return 'Casual Leave';
};

// @desc    Get all leave requests (filtered for current user or all for admin/manager)
// @route   GET /api/leaves & GET /api/leaves/all & GET /api/leaves/my
// @access  Private
exports.getLeaves = async (req, res) => {
  try {
    let query = {};
    if (req.user.role !== 'manager') {
      query.applicant = req.user._id;
    }

    const leaves = await LeaveRequest.find(query)
      .populate('applicant', 'name email employeeId role')
      .populate('driver')
      .populate('conductor')
      .populate('reviewedBy', 'name email employeeId')
      .sort({ createdAt: -1, appliedAt: -1 });

    res.status(200).json({
      success: true,
      count: leaves.length,
      data: leaves
    });
  } catch (error) {
    console.error('getLeaves Error:', error);
    res.status(500).json({ success: false, message: error.message || 'Error fetching leave requests' });
  }
};

// @desc    Get logged in user's leave requests
// @route   GET /api/leaves/my
// @access  Private
exports.getMyLeaves = async (req, res) => {
  try {
    const leaves = await LeaveRequest.find({ applicant: req.user._id })
      .populate('applicant', 'name email employeeId role')
      .populate('driver')
      .populate('conductor')
      .populate('reviewedBy', 'name email employeeId')
      .sort({ createdAt: -1, appliedAt: -1 });

    res.status(200).json({
      success: true,
      count: leaves.length,
      data: leaves
    });
  } catch (error) {
    console.error('getMyLeaves Error:', error);
    res.status(500).json({ success: false, message: error.message || 'Error fetching user leave requests' });
  }
};

// @desc    Get all leave requests for Manager/Admin
// @route   GET /api/leaves/all
// @access  Private (Manager/Admin)
exports.getAllLeaves = async (req, res) => {
  try {
    const leaves = await LeaveRequest.find()
      .populate('applicant', 'name email employeeId role')
      .populate('driver')
      .populate('conductor')
      .populate('reviewedBy', 'name email employeeId')
      .sort({ createdAt: -1, appliedAt: -1 });

    res.status(200).json({
      success: true,
      count: leaves.length,
      data: leaves
    });
  } catch (error) {
    console.error('getAllLeaves Error:', error);
    res.status(500).json({ success: false, message: error.message || 'Error fetching all leave requests' });
  }
};

// @desc    Get pending leave requests for Manager/Admin
// @route   GET /api/leaves/pending
// @access  Private (Manager/Admin)
exports.getPendingLeaves = async (req, res) => {
  try {
    const leaves = await LeaveRequest.find({
      status: { $in: ['pending', 'PENDING'] }
    })
      .populate('applicant', 'name email employeeId role')
      .populate('driver')
      .populate('conductor')
      .sort({ createdAt: -1, appliedAt: -1 });

    res.status(200).json({
      success: true,
      count: leaves.length,
      data: leaves
    });
  } catch (error) {
    console.error('getPendingLeaves Error:', error);
    res.status(500).json({ success: false, message: error.message || 'Error fetching pending leave requests' });
  }
};

// @desc    Get leave by ID with affected shifts summary
// @route   GET /api/leaves/:id
// @access  Private
exports.getLeaveById = async (req, res) => {
  try {
    const leave = await LeaveRequest.findById(req.params.id)
      .populate('applicant', 'name email employeeId role')
      .populate('driver')
      .populate('conductor')
      .populate('reviewedBy', 'name email employeeId');

    if (!leave) {
      return res.status(404).json({ success: false, message: 'Leave request not found' });
    }

    // Authorization check: only owner or manager can view
    if (
      req.user.role !== 'manager' &&
      leave.applicant._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this leave request' });
    }

    const startDate = leave.fromDate || leave.startDate;
    const endDate = leave.toDate || leave.endDate;

    const startOfDay = new Date(startDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(endDate);
    endOfDay.setHours(23, 59, 59, 999);

    let affectedShifts = [];
    const applicantRole = leave.applicant.role || leave.employeeRole;

    if (applicantRole === 'driver' || leave.driver) {
      const driverObj = leave.driver || (await Driver.findOne({
        $or: [
          { user: leave.applicant._id },
          ...(leave.employeeId ? [{ employeeId: leave.employeeId }] : [])
        ]
      }));
      if (driverObj) {
        affectedShifts = await Shift.find({
          driver: driverObj._id,
          shiftDate: { $gte: startOfDay, $lte: endOfDay },
          status: { $ne: 'cancelled' }
        })
          .populate('bus')
          .populate('route')
          .populate('conductor')
          .populate('driver');
      }
    } else if (applicantRole === 'conductor' || leave.conductor) {
      const conductorObj = leave.conductor || (await Conductor.findOne({
        $or: [
          { user: leave.applicant._id },
          ...(leave.employeeId ? [{ employeeId: leave.employeeId }] : [])
        ]
      }));
      if (conductorObj) {
        affectedShifts = await Shift.find({
          conductor: conductorObj._id,
          shiftDate: { $gte: startOfDay, $lte: endOfDay },
          status: { $ne: 'cancelled' }
        })
          .populate('bus')
          .populate('route')
          .populate('driver')
          .populate('conductor');
      }
    }

    res.status(200).json({
      success: true,
      data: {
        leave,
        affectedShiftsCount: affectedShifts.length,
        affectedShifts
      }
    });
  } catch (error) {
    console.error('getLeaveById Error:', error);
    res.status(500).json({ success: false, message: error.message || 'Error fetching leave request details' });
  }
};

// @desc    Submit leave request
// @route   POST /api/leaves
// @access  Private (Driver/Conductor/Staff)
exports.submitLeave = async (req, res) => {
  try {
    const { leaveType, fromDate, toDate, startDate, endDate, reason, remarks } = req.body;

    const rawStart = fromDate || startDate;
    const rawEnd = toDate || endDate;

    if (!rawStart || !rawEnd) {
      return res.status(400).json({
        success: false,
        message: 'Validation Error: Please select both From Date and To Date.'
      });
    }

    if (!reason || !reason.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Validation Error: Please state a valid Reason for your leave request.'
      });
    }

    const start = new Date(rawStart);
    const end = new Date(rawEnd);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Validation Error: Invalid date format provided.'
      });
    }

    if (start > end) {
      return res.status(400).json({
        success: false,
        message: 'Validation Error: "From Date" cannot be after "To Date".'
      });
    }

    const startOfDay = new Date(start);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(end);
    endOfDay.setHours(23, 59, 59, 999);

    // Calculate number of days
    const diffTime = endOfDay.getTime() - startOfDay.getTime();
    const numberOfDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

    // 1. Check for overlapping pending or approved leave requests for the same employee
    const existingLeave = await LeaveRequest.findOne({
      applicant: req.user._id,
      status: { $in: ['pending', 'approved', 'PENDING', 'APPROVED'] },
      $or: [
        { fromDate: { $lte: endOfDay }, toDate: { $gte: startOfDay } },
        { startDate: { $lte: endOfDay }, endDate: { $gte: startOfDay } }
      ]
    });

    if (existingLeave) {
      const statusLabel = existingLeave.status.toUpperCase();
      const existingFrom = new Date(existingLeave.fromDate || existingLeave.startDate).toLocaleDateString();
      const existingTo = new Date(existingLeave.toDate || existingLeave.endDate).toLocaleDateString();
      return res.status(400).json({
        success: false,
        message: `Validation Error: You already have a ${statusLabel} leave request overlapping the selected period (${existingFrom} - ${existingTo}).`
      });
    }

    // Find linked Driver or Conductor document (with fallback to employeeId / email)
    let driverObj = null;
    let conductorObj = null;

    if (req.user.role === 'driver') {
      driverObj = await Driver.findOne({
        $or: [
          { user: req.user._id },
          ...(req.user.employeeId ? [{ employeeId: req.user.employeeId.toUpperCase() }] : []),
          ...(req.user.email ? [{ email: req.user.email.toLowerCase() }] : [])
        ]
      });
      if (driverObj && !driverObj.user) {
        driverObj.user = req.user._id;
        await driverObj.save().catch(() => {});
      }
    } else if (req.user.role === 'conductor') {
      conductorObj = await Conductor.findOne({
        $or: [
          { user: req.user._id },
          ...(req.user.employeeId ? [{ employeeId: req.user.employeeId.toUpperCase() }] : []),
          ...(req.user.email ? [{ email: req.user.email.toLowerCase() }] : [])
        ]
      });
      if (conductorObj && !conductorObj.user) {
        conductorObj.user = req.user._id;
        await conductorObj.save().catch(() => {});
      }
    }

    // Calculate affected shifts
    let affectedCount = 0;
    if (req.user.role === 'driver' || driverObj) {
      if (driverObj) {
        affectedCount = await Shift.countDocuments({
          driver: driverObj._id,
          shiftDate: { $gte: startOfDay, $lte: endOfDay },
          status: { $ne: 'cancelled' }
        });
      }
    } else if (req.user.role === 'conductor' || conductorObj) {
      if (conductorObj) {
        affectedCount = await Shift.countDocuments({
          conductor: conductorObj._id,
          shiftDate: { $gte: startOfDay, $lte: endOfDay },
          status: { $ne: 'cancelled' }
        });
      }
    }

    const formattedType = formatLeaveType(leaveType);

    const leave = await LeaveRequest.create({
      applicant: req.user._id,
      employeeId: req.user.employeeId,
      employeeName: req.user.name,
      employeeRole: req.user.role,
      driver: driverObj ? driverObj._id : null,
      conductor: conductorObj ? conductorObj._id : null,
      leaveType: formattedType,
      fromDate: startOfDay,
      toDate: endOfDay,
      startDate: startOfDay,
      endDate: endOfDay,
      numberOfDays,
      reason: reason.trim(),
      remarks: remarks ? remarks.trim() : '',
      status: 'pending',
      affectedShiftsCount: affectedCount,
      appliedAt: new Date(),
      submittedAt: new Date()
    });

    // Notify Applicant
    await Notification.create({
      recipient: req.user._id,
      title: 'Leave Request Submitted',
      message: `Your ${formattedType} request from ${startOfDay.toLocaleDateString()} to ${endOfDay.toLocaleDateString()} (${numberOfDays} day${numberOfDays > 1 ? 's' : ''}) has been submitted and is pending Manager approval.`
    });

    // Notify Managers
    const managers = await User.find({ role: 'manager' });
    const roleCapitalized = req.user.role === 'driver' ? 'Driver' : req.user.role === 'conductor' ? 'Conductor' : req.user.role;
    for (const mgr of managers) {
      await Notification.create({
        recipient: mgr._id,
        title: 'New Leave Request Received',
        message: `New leave request submitted by ${req.user.name} (${roleCapitalized}, ID: ${req.user.employeeId}) for ${startOfDay.toLocaleDateString()} to ${endOfDay.toLocaleDateString()} (${affectedCount} affected shifts).`
      });
    }

    const populatedLeave = await LeaveRequest.findById(leave._id)
      .populate('applicant', 'name email employeeId role')
      .populate('driver')
      .populate('conductor');

    res.status(201).json({
      success: true,
      message: 'Leave request submitted successfully! Your Manager will review your application.',
      data: populatedLeave
    });
  } catch (error) {
    console.error('submitLeave Error:', error);
    res.status(400).json({ success: false, message: error.message || 'Error submitting leave request' });
  }
};

// @desc    Get affected shifts by leave ID
// @route   GET /api/shifts/affected-by-leave/:leaveId
// @access  Private (Manager/Admin)
exports.getAffectedShiftsByLeave = async (req, res) => {
  try {
    const leave = await LeaveRequest.findById(req.params.leaveId)
      .populate('applicant')
      .populate('driver')
      .populate('conductor');

    if (!leave) {
      return res.status(404).json({ success: false, message: 'Leave request not found' });
    }

    const startOfDay = new Date(leave.fromDate || leave.startDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(leave.toDate || leave.endDate);
    endOfDay.setHours(23, 59, 59, 999);

    const role = leave.applicant?.role || leave.employeeRole;
    let affectedShifts = [];
    let crewDoc = null;

    if (role === 'driver' || leave.driver) {
      crewDoc = leave.driver || (await Driver.findOne({
        $or: [
          { user: leave.applicant._id },
          ...(leave.employeeId ? [{ employeeId: leave.employeeId }] : [])
        ]
      }));
      if (crewDoc) {
        affectedShifts = await Shift.find({
          driver: crewDoc._id,
          shiftDate: { $gte: startOfDay, $lte: endOfDay },
          status: { $ne: 'cancelled' }
        })
          .populate('bus')
          .populate('route')
          .populate('conductor')
          .populate('driver')
          .sort({ shiftDate: 1, startTime: 1 });
      }
    } else if (role === 'conductor' || leave.conductor) {
      crewDoc = leave.conductor || (await Conductor.findOne({
        $or: [
          { user: leave.applicant._id },
          ...(leave.employeeId ? [{ employeeId: leave.employeeId }] : [])
        ]
      }));
      if (crewDoc) {
        affectedShifts = await Shift.find({
          conductor: crewDoc._id,
          shiftDate: { $gte: startOfDay, $lte: endOfDay },
          status: { $ne: 'cancelled' }
        })
          .populate('bus')
          .populate('route')
          .populate('driver')
          .populate('conductor')
          .sort({ shiftDate: 1, startTime: 1 });
      }
    }

    res.status(200).json({
      success: true,
      count: affectedShifts.length,
      crewType: role === 'conductor' ? 'conductor' : 'driver',
      crew: crewDoc,
      leave,
      data: affectedShifts
    });
  } catch (error) {
    console.error('getAffectedShiftsByLeave Error:', error);
    res.status(500).json({ success: false, message: error.message || 'Error fetching affected shifts' });
  }
};

// @desc    Get available replacement drivers for a specific shift with validation reasons
// @route   GET /api/drivers/available-for-shift/:shiftId
// @access  Private (Manager/Admin)
exports.getAvailableDriversForShift = async (req, res) => {
  try {
    const shift = await Shift.findById(req.params.shiftId);
    if (!shift) {
      return res.status(404).json({ success: false, message: 'Shift not found' });
    }

    const shiftDate = new Date(shift.shiftDate);
    const startOfDay = new Date(shiftDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(shiftDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Active approved leaves covering this shift date
    const activeLeaves = await LeaveRequest.find({
      status: { $in: ['approved', 'APPROVED'] },
      $or: [
        { fromDate: { $lte: endOfDay }, toDate: { $gte: startOfDay } },
        { startDate: { $lte: endOfDay }, endDate: { $gte: startOfDay } }
      ]
    }).populate('applicant');

    const leaveUserIds = activeLeaves.map((l) => l.applicant?._id?.toString()).filter(Boolean);

    // Shifts scheduled on this date
    const existingShifts = await Shift.find({
      _id: { $ne: shift._id },
      shiftDate: { $gte: startOfDay, $lte: endOfDay },
      status: { $ne: 'cancelled' }
    });

    const busyDriverIds = existingShifts.map((s) => s.driver?.toString()).filter(Boolean);

    // Get all drivers
    const drivers = await Driver.find().populate('user');

    const evaluatedDrivers = await Promise.all(
      drivers.map(async (drv) => {
        let isAvailable = true;
        let validationReason = '✓ Available for assignment';
        let score = 100;

        const userIdStr = drv.user?._id?.toString();

        if (drv.status === 'inactive') {
          isAvailable = false;
          validationReason = '✕ Inactive driver status';
        } else if (drv.status === 'on_leave' || (userIdStr && leaveUserIds.includes(userIdStr))) {
          isAvailable = false;
          validationReason = '✕ On approved leave';
        } else if (busyDriverIds.includes(drv._id.toString())) {
          isAvailable = false;
          validationReason = '✕ Already assigned to another shift on this date';
        } else if (shift.driver && drv._id.toString() === shift.driver.toString()) {
          isAvailable = false;
          validationReason = '✕ Original assigned driver applying for leave';
        }

        // Workload calculation
        if (isAvailable) {
          const pastWeekDate = new Date(shiftDate);
          pastWeekDate.setDate(pastWeekDate.getDate() - 7);
          const weeklyShifts = await Shift.countDocuments({
            driver: drv._id,
            shiftDate: { $gte: pastWeekDate, $lte: shiftDate },
            status: { $ne: 'cancelled' }
          });
          score -= weeklyShifts * 10;
        } else {
          score = 0;
        }

        return {
          id: drv._id,
          name: drv.name,
          employeeId: drv.employeeId,
          licenseNumber: drv.licenseNumber,
          isAvailable,
          validationReason,
          score: Math.max(0, score),
          isRecommended: isAvailable && score >= 70
        };
      })
    );

    // Sort: available first, then highest score
    evaluatedDrivers.sort((a, b) => {
      if (a.isAvailable === b.isAvailable) return b.score - a.score;
      return a.isAvailable ? -1 : 1;
    });

    res.status(200).json({
      success: true,
      shift,
      data: evaluatedDrivers
    });
  } catch (error) {
    console.error('getAvailableDriversForShift Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get available replacement conductors for a specific shift with validation reasons
// @route   GET /api/conductors/available-for-shift/:shiftId
// @access  Private (Manager/Admin)
exports.getAvailableConductorsForShift = async (req, res) => {
  try {
    const shift = await Shift.findById(req.params.shiftId);
    if (!shift) {
      return res.status(404).json({ success: false, message: 'Shift not found' });
    }

    const shiftDate = new Date(shift.shiftDate);
    const startOfDay = new Date(shiftDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(shiftDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Active approved leaves covering this shift date
    const activeLeaves = await LeaveRequest.find({
      status: { $in: ['approved', 'APPROVED'] },
      $or: [
        { fromDate: { $lte: endOfDay }, toDate: { $gte: startOfDay } },
        { startDate: { $lte: endOfDay }, endDate: { $gte: startOfDay } }
      ]
    }).populate('applicant');

    const leaveUserIds = activeLeaves.map((l) => l.applicant?._id?.toString()).filter(Boolean);

    // Shifts scheduled on this date
    const existingShifts = await Shift.find({
      _id: { $ne: shift._id },
      shiftDate: { $gte: startOfDay, $lte: endOfDay },
      status: { $ne: 'cancelled' }
    });

    const busyConductorIds = existingShifts.map((s) => s.conductor?.toString()).filter(Boolean);

    // Get all conductors
    const conductors = await Conductor.find().populate('user');

    const evaluatedConductors = await Promise.all(
      conductors.map(async (cnd) => {
        let isAvailable = true;
        let validationReason = '✓ Available for assignment';
        let score = 100;

        const userIdStr = cnd.user?._id?.toString();

        if (cnd.status === 'on_leave' || (userIdStr && leaveUserIds.includes(userIdStr))) {
          isAvailable = false;
          validationReason = '✕ On approved leave';
        } else if (busyConductorIds.includes(cnd._id.toString())) {
          isAvailable = false;
          validationReason = '✕ Already assigned to another shift on this date';
        } else if (shift.conductor && cnd._id.toString() === shift.conductor.toString()) {
          isAvailable = false;
          validationReason = '✕ Original assigned conductor applying for leave';
        }

        // Workload calculation
        if (isAvailable) {
          const pastWeekDate = new Date(shiftDate);
          pastWeekDate.setDate(pastWeekDate.getDate() - 7);
          const weeklyShifts = await Shift.countDocuments({
            conductor: cnd._id,
            shiftDate: { $gte: pastWeekDate, $lte: shiftDate },
            status: { $ne: 'cancelled' }
          });
          score -= weeklyShifts * 10;
        } else {
          score = 0;
        }

        return {
          id: cnd._id,
          name: cnd.name,
          employeeId: cnd.employeeId,
          phone: cnd.phone,
          isAvailable,
          validationReason,
          score: Math.max(0, score),
          isRecommended: isAvailable && score >= 70
        };
      })
    );

    evaluatedConductors.sort((a, b) => {
      if (a.isAvailable === b.isAvailable) return b.score - a.score;
      return a.isAvailable ? -1 : 1;
    });

    res.status(200).json({
      success: true,
      shift,
      data: evaluatedConductors
    });
  } catch (error) {
    console.error('getAvailableConductorsForShift Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Approve leave with optional replacement crew assignments (Atomically processes leave approval & shift reassignments)
// @route   PUT /api/leaves/:id/approve
// @access  Private (Manager/Admin)
exports.approveLeaveWithReassignments = async (req, res) => {
  try {
    const { reassignments = [], managerRemarks, managerComment } = req.body;
    const leaveId = req.params.id;

    const leave = await LeaveRequest.findById(leaveId).populate('applicant');
    if (!leave) {
      return res.status(404).json({ success: false, message: 'Leave request not found' });
    }

    const applicantRole = leave.applicant?.role || leave.employeeRole;
    const isDriver = applicantRole === 'driver';
    const isConductor = applicantRole === 'conductor';

    const driverObj = await Driver.findOne({ user: leave.applicant._id });
    const conductorObj = await Conductor.findOne({ user: leave.applicant._id });

    const startOfDay = new Date(leave.fromDate || leave.startDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(leave.toDate || leave.endDate);
    endOfDay.setHours(23, 59, 59, 999);

    let affectedShifts = [];
    if (isDriver && driverObj) {
      affectedShifts = await Shift.find({
        driver: driverObj._id,
        shiftDate: { $gte: startOfDay, $lte: endOfDay },
        status: { $ne: 'cancelled' }
      });
    } else if (isConductor && conductorObj) {
      affectedShifts = await Shift.find({
        conductor: conductorObj._id,
        shiftDate: { $gte: startOfDay, $lte: endOfDay },
        status: { $ne: 'cancelled' }
      });
    }

    // Process Reassignments
    const reassignmentLogs = [];
    for (const shift of affectedShifts) {
      const reassignItem = reassignments.find((r) => r.shiftId === shift._id.toString());
      if (reassignItem) {
        if (isDriver && (reassignItem.replacementDriverId || reassignItem.replacementCrewId)) {
          const replacementId = reassignItem.replacementDriverId || reassignItem.replacementCrewId;
          const replacementDrv = await Driver.findById(replacementId).populate('user');
          if (replacementDrv) {
            shift.originalDriver = shift.driver;
            shift.driver = replacementDrv._id;
            shift.reassignmentReason = `Reassigned due to approved leave of Driver ${driverObj ? driverObj.name : leave.employeeName || 'Staff'}`;
            shift.reassignedAt = new Date();
            shift.reassignedBy = req.user._id;
            await shift.save();

            // Notify replacement driver
            if (replacementDrv.user) {
              await Notification.create({
                recipient: replacementDrv.user._id,
                title: 'Assigned as Replacement Driver',
                message: `You have been assigned as replacement driver for Shift on ${new Date(shift.shiftDate).toLocaleDateString()} (${shift.startTime} - ${shift.endTime}).`
              });
            }

            reassignmentLogs.push({
              shiftId: shift._id,
              date: shift.shiftDate,
              replacementName: replacementDrv.name,
              role: 'Driver'
            });
          }
        } else if (isConductor && (reassignItem.replacementConductorId || reassignItem.replacementCrewId)) {
          const replacementId = reassignItem.replacementConductorId || reassignItem.replacementCrewId;
          const replacementCnd = await Conductor.findById(replacementId).populate('user');
          if (replacementCnd) {
            shift.originalConductor = shift.conductor;
            shift.conductor = replacementCnd._id;
            shift.reassignmentReason = `Reassigned due to approved leave of Conductor ${conductorObj ? conductorObj.name : leave.employeeName || 'Staff'}`;
            shift.reassignedAt = new Date();
            shift.reassignedBy = req.user._id;
            await shift.save();

            // Notify replacement conductor
            if (replacementCnd.user) {
              await Notification.create({
                recipient: replacementCnd.user._id,
                title: 'Assigned as Replacement Conductor',
                message: `You have been assigned as replacement conductor for Shift on ${new Date(shift.shiftDate).toLocaleDateString()} (${shift.startTime} - ${shift.endTime}).`
              });
            }

            reassignmentLogs.push({
              shiftId: shift._id,
              date: shift.shiftDate,
              replacementName: replacementCnd.name,
              role: 'Conductor'
            });
          }
        }
      }
    }

    const remarksText = managerRemarks || managerComment || 'Leave approved by Manager';

    // Update Leave Status
    leave.status = 'approved';
    leave.managerRemarks = remarksText;
    leave.managerComment = remarksText;
    leave.reviewedBy = req.user._id;
    leave.reviewedAt = new Date();
    leave.approvedAt = new Date();
    leave.reassignedShiftsCount = reassignmentLogs.length;
    await leave.save();

    // Update User & Crew status to on_leave
    await User.findByIdAndUpdate(leave.applicant._id, { status: 'on_leave' });
    if (driverObj) {
      await Driver.findByIdAndUpdate(driverObj._id, { status: 'on_leave' });
    }
    if (conductorObj) {
      await Conductor.findByIdAndUpdate(conductorObj._id, { status: 'on_leave' });
    }

    // Send Approval Notification to Employee
    const fromStr = new Date(leave.fromDate || leave.startDate).toLocaleDateString();
    const toStr = new Date(leave.toDate || leave.endDate).toLocaleDateString();
    await Notification.create({
      recipient: leave.applicant._id,
      title: 'Leave Request Approved',
      message: `Your leave request from ${fromStr} to ${toStr} has been approved.${remarksText ? ` Remarks: ${remarksText}` : ''}`
    });

    res.status(200).json({
      success: true,
      message: `Leave approved successfully! ${reassignmentLogs.length > 0 ? `${reassignmentLogs.length} affected shift(s) reassigned.` : ''}`,
      data: {
        leave,
        reassignedShiftsCount: reassignmentLogs.length,
        reassignmentLogs
      }
    });
  } catch (error) {
    console.error('approveLeaveWithReassignments Error:', error);
    res.status(400).json({ success: false, message: error.message || 'Error approving leave request' });
  }
};

// @desc    Reject leave request
// @route   PUT /api/leaves/:id/reject
// @access  Private (Manager/Admin)
exports.rejectLeave = async (req, res) => {
  try {
    const { managerRemarks, managerComment, rejectionReason } = req.body;
    const leave = await LeaveRequest.findById(req.params.id).populate('applicant');

    if (!leave) {
      return res.status(404).json({ success: false, message: 'Leave request not found' });
    }

    const reasonText = managerRemarks || rejectionReason || managerComment || 'Leave request rejected by Manager';

    leave.status = 'rejected';
    leave.managerRemarks = reasonText;
    leave.managerComment = reasonText;
    leave.rejectionReason = reasonText;
    leave.reviewedBy = req.user._id;
    leave.reviewedAt = new Date();
    leave.rejectedAt = new Date();
    await leave.save();

    // Notify Employee
    const fromStr = new Date(leave.fromDate || leave.startDate).toLocaleDateString();
    const toStr = new Date(leave.toDate || leave.endDate).toLocaleDateString();
    await Notification.create({
      recipient: leave.applicant._id,
      title: 'Leave Request Rejected',
      message: `Your leave request from ${fromStr} to ${toStr} has been rejected. Reason: ${reasonText}`
    });

    res.status(200).json({
      success: true,
      message: 'Leave request rejected successfully.',
      data: leave
    });
  } catch (error) {
    console.error('rejectLeave Error:', error);
    res.status(400).json({ success: false, message: error.message || 'Error rejecting leave request' });
  }
};

const PermissionRequest = require('../models/PermissionRequest');
const Notification = require('../models/Notification');
const User = require('../models/User');

// @desc    Get permissions (Manager: all, Driver/Conductor: own)
// @route   GET /api/permissions
// @access  Private
exports.getPermissions = async (req, res) => {
  try {
    let query = {};
    if (req.user.role !== 'manager') {
      query = { applicant: req.user._id };
    }
    const permissions = await PermissionRequest.find(query)
      .populate('applicant', 'name email employeeId role phone')
      .populate('reviewedBy', 'name email employeeId')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: permissions.length,
      data: permissions
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Apply for short permission / leave hours
// @route   POST /api/permissions
// @access  Private
exports.applyPermission = async (req, res) => {
  try {
    const { date, startTime, endTime, durationHours, reason } = req.body;

    if (!date || !startTime || !endTime || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Please provide date, start time, end time, and reason.'
      });
    }

    const permission = await PermissionRequest.create({
      applicant: req.user._id,
      employeeId: req.user.employeeId,
      employeeName: req.user.name,
      employeeRole: req.user.role,
      date,
      startTime,
      endTime,
      durationHours: durationHours || 2,
      reason,
      status: 'PENDING'
    });

    // Notify manager(s)
    const managers = await User.find({ role: 'manager' });
    for (const mgr of managers) {
      await Notification.create({
        recipient: mgr._id,
        title: 'New Permission Request Submitted',
        message: `${req.user.name} (${req.user.role.toUpperCase()}) applied for permission on ${new Date(date).toLocaleDateString()} from ${startTime} to ${endTime}.`
      });
    }

    res.status(201).json({
      success: true,
      message: 'Permission request submitted successfully',
      data: permission
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Review permission request (Manager)
// @route   PUT /api/permissions/:id/review
// @access  Private (Manager only)
exports.reviewPermission = async (req, res) => {
  try {
    const { status, managerRemarks } = req.body; // 'APPROVED' or 'REJECTED'
    const permission = await PermissionRequest.findById(req.params.id);

    if (!permission) {
      return res.status(404).json({ success: false, message: 'Permission request not found' });
    }

    permission.status = status.toUpperCase();
    permission.managerRemarks = managerRemarks || '';
    permission.reviewedBy = req.user._id;
    permission.reviewedAt = new Date();
    await permission.save();

    // Notify applicant
    await Notification.create({
      recipient: permission.applicant,
      title: `Permission Request ${status.toUpperCase()}`,
      message: `Your permission request for ${new Date(permission.date).toLocaleDateString()} was ${status.toLowerCase()} by Manager.`
    });

    res.status(200).json({
      success: true,
      message: `Permission request ${status.toLowerCase()} successfully`,
      data: permission
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

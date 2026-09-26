const Attendance = require('../models/Attendance');

exports.getAttendance = async (req, res) => {
  try {
    let query = {};
    if (req.user.role !== 'manager') {
      query.user = req.user._id;
    }

    const records = await Attendance.find(query)
      .populate('user', 'name email employeeId role')
      .populate('shift')
      .sort({ date: -1 });

    res.status(200).json({ success: true, count: records.length, data: records });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.markAttendance = async (req, res) => {
  try {
    const { shift, status, notes } = req.body;
    const userId = req.user._id;

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    // Prevent duplicate attendance for same user on same day
    const existing = await Attendance.findOne({
      user: userId,
      date: { $gte: startOfDay, $lte: endOfDay }
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Attendance already marked for today!'
      });
    }

    const attendance = await Attendance.create({
      user: userId,
      shift,
      date: new Date(),
      status: status || 'present',
      timeIn: new Date().toLocaleTimeString(),
      notes: notes || 'Checked in via Driver/Conductor portal'
    });

    res.status(201).json({
      success: true,
      message: 'Attendance marked successfully!',
      data: attendance
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

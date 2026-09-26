const Duty = require('../models/Duty');
const Attendance = require('../models/Attendance');
const LeaveRequest = require('../models/LeaveRequest');
const Bus = require('../models/Bus');
const Maintenance = require('../models/Maintenance');
const User = require('../models/User');

// @desc    Get summary statistics and analytics report data
// @route   GET /api/reports/summary
// @access  Private (Manager)
exports.getSummaryReport = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endToday = new Date(today);
    endToday.setHours(23, 59, 59, 999);

    const [
      totalDrivers,
      totalConductors,
      totalBuses,
      busesInService,
      todayDuties,
      todayVacancies,
      todayAttendance,
      pendingLeaves,
      activeMaintenance
    ] = await Promise.all([
      User.countDocuments({ role: 'driver' }),
      User.countDocuments({ role: 'conductor' }),
      Bus.countDocuments(),
      Bus.countDocuments({ status: { $in: ['active', 'in_service'] } }),
      Duty.countDocuments({ date: { $gte: today, $lte: endToday } }),
      Duty.countDocuments({ date: { $gte: today, $lte: endToday }, status: 'VACANT' }),
      Attendance.countDocuments({ date: { $gte: today, $lte: endToday }, status: 'present' }),
      LeaveRequest.countDocuments({ status: { $in: ['pending', 'PENDING'] } }),
      Maintenance.countDocuments({ status: { $in: ['in_progress', 'scheduled'] } })
    ]);

    // Monthly attendance trend aggregation
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const attendanceTrends = await Attendance.aggregate([
      { $match: { date: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
          present: { $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] } },
          absent: { $sum: { $cond: [{ $eq: ['$status', 'absent'] }, 1, 0] } },
          late: { $sum: { $cond: [{ $eq: ['$status', 'late'] }, 1, 0] } }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Leave type breakdown
    const leaveBreakdown = await LeaveRequest.aggregate([
      {
        $group: {
          _id: '$leaveType',
          count: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalDrivers,
        totalConductors,
        totalBuses,
        busesInService,
        todayDuties,
        todayVacancies,
        todayAttendance,
        pendingLeaves,
        activeMaintenance,
        attendanceTrends,
        leaveBreakdown
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Export crew roster report
// @route   GET /api/reports/crew-roster
// @access  Private (Manager)
exports.getCrewRosterReport = async (req, res) => {
  try {
    const crew = await User.find({ role: { $in: ['driver', 'conductor'] } })
      .select('name email employeeId role phone status licenseNumber joiningDate')
      .sort({ role: 1, name: 1 });

    res.status(200).json({
      success: true,
      count: crew.length,
      data: crew
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

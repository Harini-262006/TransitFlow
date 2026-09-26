const Shift = require('../models/Shift');
const Bus = require('../models/Bus');
const Driver = require('../models/Driver');
const Conductor = require('../models/Conductor');
const Attendance = require('../models/Attendance');
const Maintenance = require('../models/Maintenance');
const LeaveRequest = require('../models/LeaveRequest');
const ShiftSwapRequest = require('../models/ShiftSwapRequest');

exports.getAnalyticsSummary = async (req, res) => {
  try {
    const totalBuses = await Bus.countDocuments();
    const activeBuses = await Bus.countDocuments({ status: { $in: ['available', 'on_duty'] } });
    const maintenanceBuses = await Bus.countDocuments({ status: 'maintenance' });

    const totalDrivers = await Driver.countDocuments();
    const totalConductors = await Conductor.countDocuments();

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const todaysShifts = await Shift.countDocuments({
      shiftDate: { $gte: startOfDay, $lte: endOfDay }
    });

    const activeShifts = await Shift.countDocuments({
      status: 'in_progress'
    });

    const pendingLeaves = await LeaveRequest.countDocuments({ status: 'pending' });
    const pendingSwaps = await ShiftSwapRequest.countDocuments({ adminStatus: 'pending' });

    // Weekly Shift Distribution (Past 7 Days)
    const weeklyDistribution = [];
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const s = new Date(d);
      s.setHours(0, 0, 0, 0);
      const e = new Date(d);
      e.setHours(23, 59, 59, 999);

      const count = await Shift.countDocuments({
        shiftDate: { $gte: s, $lte: e }
      });

      weeklyDistribution.push({
        day: days[d.getDay()],
        date: `${d.getMonth() + 1}/${d.getDate()}`,
        shifts: count
      });
    }

    // Bus Utilization Breakdown for Donut Chart
    const availableBusesCount = await Bus.countDocuments({ status: 'available' });
    const onDutyBusesCount = await Bus.countDocuments({ status: 'on_duty' });
    const inactiveBusesCount = await Bus.countDocuments({ status: 'inactive' });

    const busUtilization = [
      { name: 'Available', value: availableBusesCount, color: '#10b981' },
      { name: 'On Duty', value: onDutyBusesCount, color: '#3b82f6' },
      { name: 'Maintenance', value: maintenanceBuses, color: '#f59e0b' },
      { name: 'Inactive', value: inactiveBusesCount, color: '#ef4444' }
    ];

    // Attendance stats
    const presentCount = await Attendance.countDocuments({ status: 'present' });
    const lateCount = await Attendance.countDocuments({ status: 'late' });
    const absentCount = await Attendance.countDocuments({ status: 'absent' });

    const attendanceStats = [
      { status: 'Present', count: presentCount },
      { status: 'Late', count: lateCount },
      { status: 'Absent', count: absentCount }
    ];

    // Driver Working Hours Sample
    const driversList = await Driver.find().limit(5);
    const driverHours = await Promise.all(
      driversList.map(async (drv) => {
        const completedShifts = await Shift.countDocuments({
          driver: drv._id,
          status: 'completed'
        });
        return {
          name: drv.name,
          hours: completedShifts * 8
        };
      })
    );

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalBuses,
          activeBuses,
          maintenanceBuses,
          totalDrivers,
          totalConductors,
          todaysShifts,
          activeShifts,
          pendingLeaves,
          pendingSwaps
        },
        weeklyDistribution,
        busUtilization,
        attendanceStats,
        driverHours
      }
    });
  } catch (error) {
    console.error('getAnalyticsSummary Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

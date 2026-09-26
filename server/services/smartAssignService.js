const Driver = require('../models/Driver');
const Conductor = require('../models/Conductor');
const Shift = require('../models/Shift');
const LeaveRequest = require('../models/LeaveRequest');
const User = require('../models/User');

/**
 * Calculates smart shift assignment recommendations for Drivers and Conductors
 */
exports.getSmartRecommendations = async (shiftDateStr, startTimeStr, endTimeStr) => {
  const targetDate = shiftDateStr ? new Date(shiftDateStr) : new Date();
  
  // Define start and end of target day
  const startOfDay = new Date(targetDate);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(targetDate);
  endOfDay.setHours(23, 59, 59, 999);

  // Get active approved leave requests covering target date
  const activeLeaves = await LeaveRequest.find({
    status: 'approved',
    startDate: { $lte: endOfDay },
    endDate: { $gte: startOfDay }
  }).populate('applicant');

  const leaveUserIds = activeLeaves.map((l) => l.applicant?._id?.toString()).filter(Boolean);

  // Get shifts scheduled for target day
  const existingShifts = await Shift.find({
    shiftDate: { $gte: startOfDay, $lte: endOfDay },
    status: { $ne: 'cancelled' }
  });

  const busyDriverIds = existingShifts.map((s) => s.driver?.toString()).filter(Boolean);
  const busyConductorIds = existingShifts.map((s) => s.conductor?.toString()).filter(Boolean);

  // Fetch Drivers
  const drivers = await Driver.find().populate('user');
  const conductors = await Conductor.find().populate('user');

  // Evaluate Drivers
  const driverRecommendations = await Promise.all(
    drivers.map(async (driver) => {
      let score = 100;
      const reasons = [];
      let isAvailable = true;

      const userIdStr = driver.user?._id?.toString();

      if (driver.status === 'inactive' || driver.status === 'on_leave') {
        isAvailable = false;
        reasons.push(`Driver status is '${driver.status}'`);
      }

      if (userIdStr && leaveUserIds.includes(userIdStr)) {
        isAvailable = false;
        reasons.push('Driver is on approved leave for this date');
      }

      if (busyDriverIds.includes(driver._id.toString())) {
        isAvailable = false;
        reasons.push('Driver already assigned to another shift on this date');
      }

      // Workload calculation for past 7 days
      const pastWeekDate = new Date(targetDate);
      pastWeekDate.setDate(pastWeekDate.getDate() - 7);

      const weeklyShiftCount = await Shift.countDocuments({
        driver: driver._id,
        shiftDate: { $gte: pastWeekDate, $lte: targetDate },
        status: { $ne: 'cancelled' }
      });

      if (isAvailable) {
        score -= weeklyShiftCount * 8; // Workload balancing
        reasons.push(`${weeklyShiftCount} shifts completed in past 7 days`);
      } else {
        score = 0;
      }

      let tier = 'Unavailable';
      if (isAvailable) {
        if (score >= 80) tier = 'High Recommendation';
        else if (score >= 60) tier = 'Moderate Recommendation';
        else tier = 'High Workload';
      }

      return {
        id: driver._id,
        name: driver.name,
        employeeId: driver.employeeId,
        licenseNumber: driver.licenseNumber,
        score: Math.max(0, score),
        tier,
        isAvailable,
        reasons,
        weeklyShiftCount
      };
    })
  );

  // Evaluate Conductors
  const conductorRecommendations = await Promise.all(
    conductors.map(async (conductor) => {
      let score = 100;
      const reasons = [];
      let isAvailable = true;

      const userIdStr = conductor.user?._id?.toString();

      if (conductor.status === 'inactive' || conductor.status === 'on_leave') {
        isAvailable = false;
        reasons.push(`Conductor status is '${conductor.status}'`);
      }

      if (userIdStr && leaveUserIds.includes(userIdStr)) {
        isAvailable = false;
        reasons.push('Conductor is on approved leave for this date');
      }

      if (busyConductorIds.includes(conductor._id.toString())) {
        isAvailable = false;
        reasons.push('Conductor already assigned to another shift on this date');
      }

      // Workload calculation
      const pastWeekDate = new Date(targetDate);
      pastWeekDate.setDate(pastWeekDate.getDate() - 7);

      const weeklyShiftCount = await Shift.countDocuments({
        conductor: conductor._id,
        shiftDate: { $gte: pastWeekDate, $lte: targetDate },
        status: { $ne: 'cancelled' }
      });

      if (isAvailable) {
        score -= weeklyShiftCount * 8;
        reasons.push(`${weeklyShiftCount} shifts completed in past 7 days`);
      } else {
        score = 0;
      }

      let tier = 'Unavailable';
      if (isAvailable) {
        if (score >= 80) tier = 'High Recommendation';
        else if (score >= 60) tier = 'Moderate Recommendation';
        else tier = 'High Workload';
      }

      return {
        id: conductor._id,
        name: conductor.name,
        employeeId: conductor.employeeId,
        score: Math.max(0, score),
        tier,
        isAvailable,
        reasons,
        weeklyShiftCount
      };
    })
  );

  // Sort recommendations by score descending
  driverRecommendations.sort((a, b) => b.score - a.score);
  conductorRecommendations.sort((a, b) => b.score - a.score);

  return {
    drivers: driverRecommendations,
    conductors: conductorRecommendations
  };
};

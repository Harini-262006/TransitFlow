const Shift = require('../models/Shift');
const Bus = require('../models/Bus');
const Driver = require('../models/Driver');
const Conductor = require('../models/Conductor');
const Notification = require('../models/Notification');
const LeaveRequest = require('../models/LeaveRequest');
const { getSmartRecommendations } = require('../services/smartAssignService');

// @desc    Get all shifts
// @route   GET /api/shifts
// @access  Private
exports.getShifts = async (req, res) => {
  try {
    let query = {};
    
    // Role-based filtering for Driver / Conductor / Employee
    if (req.user.role === 'driver') {
      let driver = await Driver.findOne({
        $or: [
          { user: req.user._id },
          ...(req.user.employeeId ? [{ employeeId: req.user.employeeId.toUpperCase() }] : []),
          ...(req.user.email ? [{ email: req.user.email.toLowerCase() }] : [])
        ]
      });
      if (driver) {
        if (!driver.user) {
          driver.user = req.user._id;
          await driver.save().catch(() => {});
        }
        query.driver = driver._id;
      }
    } else if (req.user.role === 'conductor') {
      let conductor = await Conductor.findOne({
        $or: [
          { user: req.user._id },
          ...(req.user.employeeId ? [{ employeeId: req.user.employeeId.toUpperCase() }] : []),
          ...(req.user.email ? [{ email: req.user.email.toLowerCase() }] : [])
        ]
      });
      if (conductor) {
        if (!conductor.user) {
          conductor.user = req.user._id;
          await conductor.save().catch(() => {});
        }
        query.conductor = conductor._id;
      }
    } else if (req.user.role === 'employee') {
      const driver = await Driver.findOne({
        $or: [
          { user: req.user._id },
          ...(req.user.employeeId ? [{ employeeId: req.user.employeeId.toUpperCase() }] : [])
        ]
      });
      const conductor = await Conductor.findOne({
        $or: [
          { user: req.user._id },
          ...(req.user.employeeId ? [{ employeeId: req.user.employeeId.toUpperCase() }] : [])
        ]
      });
      const filters = [{ assignedBy: req.user._id }];
      if (driver) filters.push({ driver: driver._id });
      if (conductor) filters.push({ conductor: conductor._id });
      query = { $or: filters };
    }

    const shifts = await Shift.find(query)
      .populate('bus')
      .populate('driver')
      .populate('conductor')
      .populate('route')
      .populate('assignedBy', 'name email employeeId')
      .sort({ shiftDate: -1, startTime: 1 });

    res.status(200).json({ success: true, count: shifts.length, data: shifts });
  } catch (error) {
    console.error('getShifts Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new shift with conflict validation & maintenance check
// @route   POST /api/shifts
// @access  Private (Admin/Manager)
exports.createShift = async (req, res) => {
  try {
    const { bus, driver, conductor, route, startTime, endTime, shiftDate, shiftName, shiftType } = req.body;

    if (!bus || !driver || !conductor || !route || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: 'Please provide Bus, Driver, Conductor, Route, Start Time & End Time'
      });
    }

    // 1. Bus Maintenance Validation
    const busObj = await Bus.findById(bus);
    if (!busObj) {
      return res.status(404).json({ success: false, message: 'Selected Bus not found' });
    }
    if (busObj.status === 'maintenance') {
      return res.status(400).json({
        success: false,
        message: `Conflict Error: Bus '${busObj.busNumber}' is currently UNDER MAINTENANCE and cannot be assigned to a shift!`
      });
    }

    // 2. Driver Availability & Leave Validation
    const driverObj = await Driver.findById(driver).populate('user');
    if (!driverObj) {
      return res.status(404).json({ success: false, message: 'Selected Driver not found' });
    }

    const targetDate = shiftDate ? new Date(shiftDate) : new Date();
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    if (driverObj.user) {
      const driverLeave = await LeaveRequest.findOne({
        applicant: driverObj.user._id,
        status: 'approved',
        startDate: { $lte: endOfDay },
        endDate: { $gte: startOfDay }
      });

      if (driverLeave) {
        return res.status(400).json({
          success: false,
          message: `Conflict Error: Driver '${driverObj.name}' is on APPROVED LEAVE for this shift date!`
        });
      }
    }

    // 3. Driver Shift Overlap Check
    const existingDriverShift = await Shift.findOne({
      driver,
      shiftDate: { $gte: startOfDay, $lte: endOfDay },
      status: { $ne: 'cancelled' }
    });

    if (existingDriverShift) {
      return res.status(400).json({
        success: false,
        message: `Conflict Error: Driver '${driverObj.name}' is ALREADY ASSIGNED to another shift on this date!`
      });
    }

    // 4. Conductor Availability & Overlap Check
    const conductorObj = await Conductor.findById(conductor).populate('user');
    if (!conductorObj) {
      return res.status(404).json({ success: false, message: 'Selected Conductor not found' });
    }

    if (conductorObj.user) {
      const conductorLeave = await LeaveRequest.findOne({
        applicant: conductorObj.user._id,
        status: 'approved',
        startDate: { $lte: endOfDay },
        endDate: { $gte: startOfDay }
      });

      if (conductorLeave) {
        return res.status(400).json({
          success: false,
          message: `Conflict Error: Conductor '${conductorObj.name}' is on APPROVED LEAVE for this shift date!`
        });
      }
    }

    const existingConductorShift = await Shift.findOne({
      conductor,
      shiftDate: { $gte: startOfDay, $lte: endOfDay },
      status: { $ne: 'cancelled' }
    });

    if (existingConductorShift) {
      return res.status(400).json({
        success: false,
        message: `Conflict Error: Conductor '${conductorObj.name}' is ALREADY ASSIGNED to another shift on this date!`
      });
    }

    // Create Shift
    const shift = await Shift.create({
      shiftName: shiftName || `Shift on ${busObj.busNumber}`,
      shiftType: shiftType || 'morning',
      bus,
      driver,
      conductor,
      route,
      startTime,
      endTime,
      shiftDate: targetDate,
      status: 'scheduled',
      assignedBy: req.user._id
    });

    // Update statuses
    await Bus.findByIdAndUpdate(bus, { status: 'on_duty' });
    await Driver.findByIdAndUpdate(driver, { status: 'on_duty' });
    await Conductor.findByIdAndUpdate(conductor, { status: 'on_duty' });

    // Send notifications
    if (driverObj.user) {
      await Notification.create({
        recipient: driverObj.user._id,
        title: 'New Bus Shift Assignment',
        message: `You have been assigned to Bus ${busObj.busNumber} for route (${startTime} - ${endTime}).`
      });
    }

    if (conductorObj.user) {
      await Notification.create({
        recipient: conductorObj.user._id,
        title: 'New Bus Shift Assignment',
        message: `You have been assigned to Bus ${busObj.busNumber} for route (${startTime} - ${endTime}).`
      });
    }

    const populatedShift = await Shift.findById(shift._id)
      .populate('bus')
      .populate('driver')
      .populate('conductor')
      .populate('route');

    res.status(201).json({
      success: true,
      message: 'Bus shift created and validated with zero conflicts!',
      data: populatedShift
    });
  } catch (error) {
    console.error('createShift Error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Get Smart Shift Recommendations
// @route   GET /api/shifts/smart-recommendations
// @access  Private (Admin/Manager)
exports.getRecommendations = async (req, res) => {
  try {
    const { shiftDate, startTime, endTime } = req.query;
    const recommendations = await getSmartRecommendations(shiftDate, startTime, endTime);
    res.status(200).json({ success: true, data: recommendations });
  } catch (error) {
    console.error('getRecommendations Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update shift status
// @route   PUT /api/shifts/:id/status
// @access  Private
exports.updateShiftStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['scheduled', 'in_progress', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid shift status' });
    }

    const shift = await Shift.findById(req.params.id);
    if (!shift) {
      return res.status(404).json({ success: false, message: 'Shift not found' });
    }

    shift.status = status;
    await shift.save();

    if (status === 'completed' || status === 'cancelled') {
      if (shift.driver) await Driver.findByIdAndUpdate(shift.driver, { status: 'available' });
      if (shift.conductor) await Conductor.findByIdAndUpdate(shift.conductor, { status: 'available' });
      if (shift.bus) await Bus.findByIdAndUpdate(shift.bus, { status: 'available' });
    } else if (status === 'in_progress') {
      if (shift.driver) await Driver.findByIdAndUpdate(shift.driver, { status: 'on_duty' });
      if (shift.conductor) await Conductor.findByIdAndUpdate(shift.conductor, { status: 'on_duty' });
      if (shift.bus) await Bus.findByIdAndUpdate(shift.bus, { status: 'on_duty' });
    }

    const updatedShift = await Shift.findById(shift._id)
      .populate('bus')
      .populate('driver')
      .populate('conductor')
      .populate('route');

    res.status(200).json({
      success: true,
      message: `Shift status updated to ${status.replace('_', ' ')}`,
      data: updatedShift
    });
  } catch (error) {
    console.error('updateShiftStatus Error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete shift
// @route   DELETE /api/shifts/:id
// @access  Private (Admin/Manager)
exports.deleteShift = async (req, res) => {
  try {
    const shift = await Shift.findByIdAndDelete(req.params.id);
    if (!shift) {
      return res.status(404).json({ success: false, message: 'Shift not found' });
    }
    res.status(200).json({ success: true, message: 'Shift deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

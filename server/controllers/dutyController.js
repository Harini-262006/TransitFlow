const Duty = require('../models/Duty');
const Shift = require('../models/Shift');
const Bus = require('../models/Bus');
const Driver = require('../models/Driver');
const Conductor = require('../models/Conductor');
const User = require('../models/User');
const LeaveRequest = require('../models/LeaveRequest');
const PermissionRequest = require('../models/PermissionRequest');
const Notification = require('../models/Notification');
const AuditLog = require('../models/AuditLog');

// @desc    Get all duties with role-based visibility and filters
// @route   GET /api/duties & GET /api/shifts
// @access  Private
exports.getDuties = async (req, res) => {
  try {
    const { date, status, bus, route, vacancyOnly } = req.query;
    let query = {};

    // Role-based visibility
    if (req.user.role === 'driver') {
      const driver = await Driver.findOne({ user: req.user._id });
      if (driver) {
        query.$or = [{ driver: driver._id }, { replacementDriver: driver._id }];
      } else {
        query.$or = [{ driver: req.user._id }, { replacementDriver: req.user._id }];
      }
    } else if (req.user.role === 'conductor') {
      const conductor = await Conductor.findOne({ user: req.user._id });
      if (conductor) {
        query.$or = [{ conductor: conductor._id }, { replacementConductor: conductor._id }];
      } else {
        query.$or = [{ conductor: req.user._id }, { replacementConductor: req.user._id }];
      }
    }

    if (date) {
      const target = new Date(date);
      const startOfDay = new Date(target);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(target);
      endOfDay.setHours(23, 59, 59, 999);
      query.date = { $gte: startOfDay, $lte: endOfDay };
    }

    if (status && status !== 'all') {
      query.status = { $regex: new RegExp(`^${status}$`, 'i') };
    }

    if (vacancyOnly === 'true') {
      query.status = { $in: ['VACANT', 'vacant'] };
    }

    if (bus) query.bus = bus;
    if (route) query.route = route;

    const duties = await Duty.find(query)
      .populate('bus')
      .populate('route')
      .populate('driver')
      .populate('conductor')
      .populate('originalDriver')
      .populate('originalConductor')
      .populate('replacementDriver')
      .populate('replacementConductor')
      .populate('assignedBy', 'name email employeeId')
      .sort({ date: -1, departureTime: 1, startTime: 1 });

    res.status(200).json({
      success: true,
      count: duties.length,
      data: duties
    });
  } catch (error) {
    console.error('getDuties Error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve duties' });
  }
};

// @desc    Get duty by ID
// @route   GET /api/duties/:id
// @access  Private
exports.getDutyById = async (req, res) => {
  try {
    const duty = await Duty.findById(req.params.id)
      .populate('bus')
      .populate('route')
      .populate('driver')
      .populate('conductor')
      .populate('originalDriver')
      .populate('originalConductor')
      .populate('replacementDriver')
      .populate('replacementConductor')
      .populate('assignedBy', 'name email employeeId');

    if (!duty) {
      return res.status(404).json({ success: false, message: 'Duty not found' });
    }

    res.status(200).json({ success: true, data: duty });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get today's active duty for logged in user
// @route   GET /api/duties/today
// @access  Private
exports.getTodayDuty = async (req, res) => {
  try {
    const today = new Date();
    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    let query = {
      date: { $gte: startOfDay, $lte: endOfDay },
      status: { $ne: 'CANCELLED' }
    };

    if (req.user.role === 'driver') {
      const driver = await Driver.findOne({ user: req.user._id });
      if (driver) query.$or = [{ driver: driver._id }, { replacementDriver: driver._id }];
    } else if (req.user.role === 'conductor') {
      const conductor = await Conductor.findOne({ user: req.user._id });
      if (conductor) query.$or = [{ conductor: conductor._id }, { replacementConductor: conductor._id }];
    }

    const duty = await Duty.findOne(query)
      .populate('bus')
      .populate('route')
      .populate('driver')
      .populate('conductor')
      .populate('replacementDriver')
      .populate('replacementConductor');

    res.status(200).json({
      success: true,
      data: duty || null
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new duty with strict conflict validation
// @route   POST /api/duties
// @access  Private (Manager/Admin)
exports.createDuty = async (req, res) => {
  try {
    const {
      bus,
      route,
      driver,
      conductor,
      date,
      dutyDate,
      shiftType,
      reportingTime,
      departureTime,
      returnTime,
      startTime,
      endTime,
      notes
    } = req.body;

    const targetDate = new Date(date || dutyDate || new Date());
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    // 1. Bus Validation & Maintenance Check
    const busObj = await Bus.findById(bus);
    if (!busObj) {
      return res.status(404).json({ success: false, message: 'Selected Bus was not found.' });
    }
    if (busObj.status === 'MAINTENANCE' || busObj.status === 'maintenance') {
      return res.status(400).json({
        success: false,
        message: `Bus '${busObj.busNumber}' is currently UNDER MAINTENANCE and cannot be assigned to a duty.`
      });
    }

    // Bus Duplicate check on same date/shift
    const existingBusDuty = await Duty.findOne({
      bus,
      date: { $gte: startOfDay, $lte: endOfDay },
      status: { $nin: ['CANCELLED', 'cancelled'] }
    });
    if (existingBusDuty) {
      return res.status(400).json({
        success: false,
        message: `Bus '${busObj.busNumber}' is already assigned to a duty on ${targetDate.toLocaleDateString()}.`
      });
    }

    // 2. Driver Availability & Conflict Validation
    let driverObj = null;
    if (driver) {
      driverObj = await Driver.findById(driver).populate('user');
      if (!driverObj) {
        return res.status(404).json({ success: false, message: 'Selected Driver was not found.' });
      }

      const driverUserId = driverObj.user?._id || driverObj._id;

      // Check driver leave on target date
      const driverLeave = await LeaveRequest.findOne({
        applicant: driverUserId,
        status: { $in: ['APPROVED', 'approved'] },
        $or: [{ fromDate: { $lte: endOfDay }, toDate: { $gte: startOfDay } }]
      });
      if (driverLeave) {
        return res.status(400).json({
          success: false,
          message: `Conflict Error: Driver '${driverObj.name}' is on APPROVED LEAVE on ${targetDate.toLocaleDateString()}.`
        });
      }

      // Check driver permission on target date
      const driverPermission = await PermissionRequest.findOne({
        applicant: driverUserId,
        date: { $gte: startOfDay, $lte: endOfDay },
        status: { $in: ['APPROVED', 'approved'] }
      });
      if (driverPermission) {
        return res.status(400).json({
          success: false,
          message: `Conflict Error: Driver '${driverObj.name}' has an APPROVED PERMISSION (${driverPermission.startTime} - ${driverPermission.endTime}) on this date.`
        });
      }

      // Check driver already assigned to another duty
      const existingDriverDuty = await Duty.findOne({
        driver: driverObj._id,
        date: { $gte: startOfDay, $lte: endOfDay },
        status: { $nin: ['CANCELLED', 'cancelled'] }
      });
      if (existingDriverDuty) {
        return res.status(400).json({
          success: false,
          message: `Conflict Error: Driver '${driverObj.name}' is already assigned to another duty on this date.`
        });
      }
    }

    // 3. Conductor Availability & Conflict Validation
    let conductorObj = null;
    if (conductor) {
      conductorObj = await Conductor.findById(conductor).populate('user');
      if (!conductorObj) {
        return res.status(404).json({ success: false, message: 'Selected Conductor was not found.' });
      }

      const conductorUserId = conductorObj.user?._id || conductorObj._id;

      // Check conductor leave on target date
      const conductorLeave = await LeaveRequest.findOne({
        applicant: conductorUserId,
        status: { $in: ['APPROVED', 'approved'] },
        $or: [{ fromDate: { $lte: endOfDay }, toDate: { $gte: startOfDay } }]
      });
      if (conductorLeave) {
        return res.status(400).json({
          success: false,
          message: `Conflict Error: Conductor '${conductorObj.name}' is on APPROVED LEAVE on ${targetDate.toLocaleDateString()}.`
        });
      }

      // Check conductor permission on target date
      const conductorPermission = await PermissionRequest.findOne({
        applicant: conductorUserId,
        date: { $gte: startOfDay, $lte: endOfDay },
        status: { $in: ['APPROVED', 'approved'] }
      });
      if (conductorPermission) {
        return res.status(400).json({
          success: false,
          message: `Conflict Error: Conductor '${conductorObj.name}' has an APPROVED PERMISSION on this date.`
        });
      }

      // Check conductor already assigned
      const existingConductorDuty = await Duty.findOne({
        conductor: conductorObj._id,
        date: { $gte: startOfDay, $lte: endOfDay },
        status: { $nin: ['CANCELLED', 'cancelled'] }
      });
      if (existingConductorDuty) {
        return res.status(400).json({
          success: false,
          message: `Conflict Error: Conductor '${conductorObj.name}' is already assigned to another duty on this date.`
        });
      }
    }

    // Create Duty Record
    const duty = await Duty.create({
      dutyName: `Duty on Bus ${busObj.busNumber}`,
      date: targetDate,
      dutyDate: targetDate,
      bus,
      route,
      driver: driverObj?._id || null,
      conductor: conductorObj?._id || null,
      shiftType: shiftType || 'morning',
      reportingTime: reportingTime || '07:00 AM',
      departureTime: departureTime || startTime || '07:30 AM',
      returnTime: returnTime || endTime || '03:30 PM',
      startTime: departureTime || startTime || '07:30 AM',
      endTime: returnTime || endTime || '03:30 PM',
      status: 'SCHEDULED',
      assignedBy: req.user._id,
      notes: notes || ''
    });

    // Also sync to legacy Shift model for backward compatibility
    await Shift.create({
      shiftName: duty.dutyName,
      shiftType: duty.shiftType.toLowerCase(),
      bus,
      driver: driverObj?._id || driver,
      conductor: conductorObj?._id || conductor,
      route,
      startTime: duty.startTime,
      endTime: duty.endTime,
      shiftDate: targetDate,
      status: 'scheduled',
      assignedBy: req.user._id
    });

    // Update statuses
    await Bus.findByIdAndUpdate(bus, { status: 'ASSIGNED' });
    if (driverObj) await Driver.findByIdAndUpdate(driverObj._id, { status: 'on_duty' });
    if (conductorObj) await Conductor.findByIdAndUpdate(conductorObj._id, { status: 'on_duty' });

    // Send notifications to crew
    if (driverObj?.user) {
      await Notification.create({
        recipient: driverObj.user._id,
        title: 'New Duty Assigned',
        type: 'DUTY',
        message: `You have been assigned to Bus ${busObj.busNumber} for duty on ${targetDate.toLocaleDateString()} (${duty.startTime} - ${duty.endTime}).`
      });
    }

    if (conductorObj?.user) {
      await Notification.create({
        recipient: conductorObj.user._id,
        title: 'New Duty Assigned',
        type: 'DUTY',
        message: `You have been assigned to Bus ${busObj.busNumber} for duty on ${targetDate.toLocaleDateString()} (${duty.startTime} - ${duty.endTime}).`
      });
    }

    // Audit log
    await AuditLog.create({
      action: 'DUTY_CREATED',
      performedBy: req.user._id,
      performerRole: req.user.role,
      targetModel: 'Duty',
      targetId: duty._id.toString(),
      details: { bus: busObj.busNumber, date: targetDate }
    });

    const populatedDuty = await Duty.findById(duty._id)
      .populate('bus')
      .populate('route')
      .populate('driver')
      .populate('conductor');

    res.status(201).json({
      success: true,
      message: 'Duty scheduled successfully with zero conflicts verified.',
      data: populatedDuty
    });
  } catch (error) {
    console.error('createDuty Error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update duty status or details
// @route   PATCH /api/duties/:id
// @access  Private
exports.updateDuty = async (req, res) => {
  try {
    const duty = await Duty.findById(req.params.id);
    if (!duty) {
      return res.status(404).json({ success: false, message: 'Duty not found' });
    }

    const { status } = req.body;
    if (status) {
      duty.status = status.toUpperCase();
      if (status.toUpperCase() === 'COMPLETED' || status.toUpperCase() === 'CANCELLED') {
        if (duty.bus) await Bus.findByIdAndUpdate(duty.bus, { status: 'AVAILABLE' });
        if (duty.driver) await Driver.findByIdAndUpdate(duty.driver, { status: 'available' });
        if (duty.conductor) await Conductor.findByIdAndUpdate(duty.conductor, { status: 'available' });
      } else if (status.toUpperCase() === 'IN_PROGRESS') {
        if (duty.bus) await Bus.findByIdAndUpdate(duty.bus, { status: 'ASSIGNED' });
        if (duty.driver) await Driver.findByIdAndUpdate(duty.driver, { status: 'on_duty' });
        if (duty.conductor) await Conductor.findByIdAndUpdate(duty.conductor, { status: 'on_duty' });
      }
    }

    Object.assign(duty, req.body);
    await duty.save();

    const updated = await Duty.findById(duty._id)
      .populate('bus')
      .populate('route')
      .populate('driver')
      .populate('conductor')
      .populate('replacementDriver')
      .populate('replacementConductor');

    res.status(200).json({
      success: true,
      message: `Duty status updated to ${duty.status}`,
      data: updated
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

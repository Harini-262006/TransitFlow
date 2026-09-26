const Maintenance = require('../models/Maintenance');
const Bus = require('../models/Bus');

exports.getMaintenanceRecords = async (req, res) => {
  try {
    const records = await Maintenance.find()
      .populate('bus')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: records.length, data: records });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createMaintenance = async (req, res) => {
  try {
    const { bus, maintenanceType, description, cost, serviceProvider, status } = req.body;

    if (!bus || !description) {
      return res.status(400).json({ success: false, message: 'Please provide bus and description' });
    }

    const record = await Maintenance.create({
      bus,
      maintenanceType: maintenanceType || 'routine',
      description,
      cost: cost || 0,
      serviceProvider: serviceProvider || 'Depot Workshop',
      status: status || 'in_progress'
    });

    // Update Bus status to 'maintenance'
    await Bus.findByIdAndUpdate(bus, { status: 'maintenance' });

    res.status(201).json({
      success: true,
      message: 'Bus placed under maintenance successfully!',
      data: record
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateMaintenanceStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const record = await Maintenance.findById(req.params.id);

    if (!record) {
      return res.status(404).json({ success: false, message: 'Record not found' });
    }

    record.status = status;
    await record.save();

    // If completed, return bus status to 'available'
    if (status === 'completed') {
      await Bus.findByIdAndUpdate(record.bus, { status: 'available', lastServiceDate: new Date() });
    }

    res.status(200).json({ success: true, message: `Maintenance status updated to ${status}`, data: record });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

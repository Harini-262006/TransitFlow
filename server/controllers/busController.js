const Bus = require('../models/Bus');

exports.getBuses = async (req, res) => {
  try {
    const buses = await Bus.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: buses.length, data: buses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createBus = async (req, res) => {
  try {
    const bus = await Bus.create(req.body);
    res.status(201).json({ success: true, message: 'Bus created successfully', data: bus });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateBus = async (req, res) => {
  try {
    const bus = await Bus.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!bus) return res.status(404).json({ success: false, message: 'Bus not found' });
    res.status(200).json({ success: true, data: bus });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.deleteBus = async (req, res) => {
  try {
    const bus = await Bus.findByIdAndDelete(req.params.id);
    if (!bus) return res.status(404).json({ success: false, message: 'Bus not found' });
    res.status(200).json({ success: true, message: 'Bus deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

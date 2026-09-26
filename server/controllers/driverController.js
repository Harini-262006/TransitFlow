const Driver = require('../models/Driver');

exports.getDrivers = async (req, res) => {
  try {
    const drivers = await Driver.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: drivers.length, data: drivers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createDriver = async (req, res) => {
  try {
    const driver = await Driver.create(req.body);
    res.status(201).json({ success: true, message: 'Driver created successfully', data: driver });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

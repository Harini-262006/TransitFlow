const Conductor = require('../models/Conductor');

exports.getConductors = async (req, res) => {
  try {
    const conductors = await Conductor.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: conductors.length, data: conductors });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createConductor = async (req, res) => {
  try {
    const conductor = await Conductor.create(req.body);
    res.status(201).json({ success: true, message: 'Conductor created successfully', data: conductor });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const Route = require('../models/Route');

exports.getRoutes = async (req, res) => {
  try {
    const routes = await Route.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: routes.length, data: routes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createRoute = async (req, res) => {
  try {
    const route = await Route.create(req.body);
    res.status(201).json({ success: true, message: 'Route created successfully', data: route });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

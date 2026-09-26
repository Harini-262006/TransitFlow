const express = require('express');
const router = express.Router();
const { getRoutes, createRoute } = require('../controllers/routeController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getRoutes)
  .post(protect, createRoute);

module.exports = router;

const express = require('express');
const router = express.Router();
const { getDrivers, createDriver } = require('../controllers/driverController');
const { getAvailableDriversForShift } = require('../controllers/leaveController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getDrivers)
  .post(protect, createDriver);

router.route('/available-for-shift/:shiftId')
  .get(protect, authorize('manager'), getAvailableDriversForShift);

module.exports = router;

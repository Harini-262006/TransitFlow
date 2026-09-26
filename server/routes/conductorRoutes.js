const express = require('express');
const router = express.Router();
const { getConductors, createConductor } = require('../controllers/conductorController');
const { getAvailableConductorsForShift } = require('../controllers/leaveController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getConductors)
  .post(protect, createConductor);

router.route('/available-for-shift/:shiftId')
  .get(protect, authorize('manager'), getAvailableConductorsForShift);

module.exports = router;

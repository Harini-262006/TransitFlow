const express = require('express');
const router = express.Router();
const {
  getShifts,
  createShift,
  getRecommendations,
  updateShiftStatus,
  deleteShift
} = require('../controllers/shiftController');
const { getAffectedShiftsByLeave } = require('../controllers/leaveController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getShifts)
  .post(protect, authorize('manager'), createShift);

router.route('/smart-recommendations')
  .get(protect, authorize('manager'), getRecommendations);

router.route('/affected-by-leave/:leaveId')
  .get(protect, authorize('manager'), getAffectedShiftsByLeave);

router.route('/:id/status')
  .put(protect, updateShiftStatus);

router.route('/:id')
  .delete(protect, authorize('manager'), deleteShift);

module.exports = router;

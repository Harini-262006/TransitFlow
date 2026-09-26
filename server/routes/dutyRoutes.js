const express = require('express');
const router = express.Router();
const {
  getDuties,
  getDutyById,
  getTodayDuty,
  createDuty,
  updateDuty
} = require('../controllers/dutyController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
  .get(getDuties)
  .post(authorize('manager'), createDuty);

router.route('/today')
  .get(getTodayDuty);

router.route('/:id')
  .get(getDutyById)
  .patch(updateDuty)
  .put(updateDuty);

module.exports = router;

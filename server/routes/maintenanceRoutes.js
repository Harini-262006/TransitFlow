const express = require('express');
const router = express.Router();
const {
  getMaintenanceRecords,
  createMaintenance,
  updateMaintenanceStatus
} = require('../controllers/maintenanceController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getMaintenanceRecords)
  .post(protect, authorize('manager'), createMaintenance);

router.route('/:id/status')
  .put(protect, authorize('manager'), updateMaintenanceStatus);

module.exports = router;

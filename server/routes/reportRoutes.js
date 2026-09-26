const express = require('express');
const router = express.Router();
const { getSummaryReport, getCrewRosterReport } = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.use(authorize('manager'));

router.get('/summary', getSummaryReport);
router.get('/crew-roster', getCrewRosterReport);

module.exports = router;

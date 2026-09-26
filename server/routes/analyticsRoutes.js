const express = require('express');
const router = express.Router();
const { getAnalyticsSummary } = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');

router.route('/summary')
  .get(protect, getAnalyticsSummary);

module.exports = router;

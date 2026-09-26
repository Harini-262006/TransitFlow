const express = require('express');
const router = express.Router();
const {
  getReplacementCandidates,
  assignReplacement,
  getReplacementHistory
} = require('../controllers/replacementController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/candidates/:dutyId')
  .get(authorize('manager'), getReplacementCandidates);

router.route('/assign')
  .post(authorize('manager'), assignReplacement);

router.route('/history')
  .get(authorize('manager'), getReplacementHistory);

module.exports = router;

const express = require('express');
const router = express.Router();
const { getIssues, reportIssue, updateIssueStatus } = require('../controllers/issueController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getIssues)
  .post(protect, reportIssue);

router.route('/:id/status')
  .put(protect, authorize('manager'), updateIssueStatus);

module.exports = router;

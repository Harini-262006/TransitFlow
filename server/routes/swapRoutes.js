const express = require('express');
const router = express.Router();
const {
  getSwaps,
  requestSwap,
  peerReviewSwap,
  managerReviewSwap
} = require('../controllers/swapController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getSwaps)
  .post(protect, requestSwap);

router.route('/:id/peer-review')
  .put(protect, peerReviewSwap);

router.route('/:id/manager-review')
  .put(protect, authorize('manager'), managerReviewSwap);

// Retain compatibility alias
router.route('/:id/admin-review')
  .put(protect, authorize('manager'), managerReviewSwap);

module.exports = router;

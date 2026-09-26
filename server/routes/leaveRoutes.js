const express = require('express');
const router = express.Router();
const {
  getLeaves,
  getMyLeaves,
  getAllLeaves,
  getPendingLeaves,
  getLeaveById,
  submitLeave,
  approveLeaveWithReassignments,
  rejectLeave
} = require('../controllers/leaveController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Base route: GET all/own leaves, POST new leave
router.route('/')
  .get(protect, getLeaves)
  .post(protect, submitLeave);

// User's own leaves
router.route('/my')
  .get(protect, getMyLeaves);

// Manager: All leaves
router.route('/all')
  .get(protect, authorize('manager'), getAllLeaves);

// Manager: Pending leaves
router.route('/pending')
  .get(protect, authorize('manager'), getPendingLeaves);

// Single leave details
router.route('/:id')
  .get(protect, getLeaveById);

// Approve leave (with optional shift reassignments)
router.route('/:id/approve')
  .put(protect, authorize('manager'), approveLeaveWithReassignments);

// Reject leave
router.route('/:id/reject')
  .put(protect, authorize('manager'), rejectLeave);

// Compatibility alias for review
router.route('/:id/review')
  .put(protect, authorize('manager'), (req, res, next) => {
    if (req.body.status === 'approved') {
      return approveLeaveWithReassignments(req, res, next);
    }
    return rejectLeave(req, res, next);
  });

module.exports = router;

const express = require('express');
const router = express.Router();
const {
  getPermissions,
  applyPermission,
  reviewPermission
} = require('../controllers/permissionController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
  .get(getPermissions)
  .post(applyPermission);

router.route('/:id/review')
  .put(authorize('manager'), reviewPermission);

module.exports = router;

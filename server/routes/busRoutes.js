const express = require('express');
const router = express.Router();
const { getBuses, createBus, updateBus, deleteBus } = require('../controllers/busController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getBuses)
  .post(protect, createBus);

router.route('/:id')
  .put(protect, updateBus)
  .delete(protect, deleteBus);

module.exports = router;

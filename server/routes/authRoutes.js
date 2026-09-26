const express = require('express');
const router = express.Router();
const { signup, login, getMe, logout } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { authLimiter } = require('../middleware/rateLimiter');

// Public routes with rate limiting
router.post('/signup', authLimiter, signup);
router.post('/login', authLimiter, login);

// Protected routes
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);

module.exports = router;

const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Helper to generate JWT token
const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'shift_mgmt_secure_jwt_secret_key_2026_super_secret',
    { expiresIn: process.env.JWT_EXPIRE || '30d' }
  );
};

// @desc    Register new user
// @route   POST /api/auth/signup
// @access  Public
exports.signup = async (req, res) => {
  try {
    const { name, email, employeeId, password, role } = req.body;

    // Validate inputs
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Please enter your name' });
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, message: 'Please enter your email' });
    }
    if (!employeeId || !employeeId.trim()) {
      return res.status(400).json({ success: false, message: 'Please enter your Employee ID' });
    }
    if (!password) {
      return res.status(400).json({ success: false, message: 'Please enter a password' });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    // Role check: allow 'manager', 'driver', 'conductor'
    const targetRole = role ? role.toLowerCase() : 'driver';
    if (!['manager', 'driver', 'conductor'].includes(targetRole)) {
      return res.status(400).json({ success: false, message: 'Invalid role selected. Allowed roles: Manager, Driver, Conductor.' });
    }

    // Check duplicate email
    const existingEmail = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists'
      });
    }

    // Check duplicate Employee ID
    const existingEmpId = await User.findOne({ employeeId: employeeId.toUpperCase().trim() });
    if (existingEmpId) {
      return res.status(400).json({
        success: false,
        message: 'Employee ID is already registered'
      });
    }

    // Create user
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      employeeId: employeeId.toUpperCase().trim(),
      password,
      role: targetRole
    });

    const token = generateToken(user._id);

    return res.status(201).json({
      success: true,
      message: 'Account created successfully!',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        employeeId: user.employeeId,
        role: user.role,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Signup Error:', error);
    // Handle Mongoose duplicate key error (fallback)
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      const fieldName = field === 'email' ? 'Email' : 'Employee ID';
      return res.status(400).json({
        success: false,
        message: `${fieldName} is already registered.`
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Server error during signup. Please try again later.'
    });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, message: 'Please enter your email' });
    }
    if (!password) {
      return res.status(400).json({ success: false, message: 'Please enter your password' });
    }

    // Find user (with password field included)
    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check password match
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        employeeId: user.employeeId,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Unable to connect to server. Please try again later.'
    });
  }
};

// @desc    Get logged in user profile
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    return res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    console.error('GetMe Error:', error);
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
exports.logout = async (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'User logged out successfully'
  });
};

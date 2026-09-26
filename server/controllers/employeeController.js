const Employee = require('../models/Employee');
const User = require('../models/User');
const Driver = require('../models/Driver');
const Conductor = require('../models/Conductor');
const AuditLog = require('../models/AuditLog');
const bcrypt = require('bcryptjs');

// @desc    Get all employees with filters and search
// @route   GET /api/employees
// @access  Private (Manager/Admin)
exports.getEmployees = async (req, res) => {
  try {
    const { role, status, search } = req.query;
    let query = {};

    if (role && role !== 'all') {
      query.role = { $regex: new RegExp(`^${role}$`, 'i') };
    }

    if (status && status !== 'all') {
      query.status = { $regex: new RegExp(`^${status}$`, 'i') };
    }

    if (search && search.trim()) {
      const term = search.trim();
      query.$or = [
        { name: { $regex: term, $options: 'i' } },
        { employeeId: { $regex: term, $options: 'i' } },
        { email: { $regex: term, $options: 'i' } },
        { phone: { $regex: term, $options: 'i' } }
      ];
    }

    const employees = await Employee.find(query)
      .populate('user', 'name email role status')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: employees.length,
      data: employees
    });
  } catch (error) {
    console.error('getEmployees Error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve employees' });
  }
};

// @desc    Get employee by ID
// @route   GET /api/employees/:id
// @access  Private
exports.getEmployeeById = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id).populate('user');
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }
    res.status(200).json({ success: true, data: employee });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new employee and linked user account
// @route   POST /api/employees
// @access  Private (Manager/Admin)
exports.createEmployee = async (req, res) => {
  try {
    const {
      employeeId,
      name,
      email,
      phone,
      role,
      status,
      licenseNumber,
      assignedShift,
      emergencyContact,
      password
    } = req.body;

    if (!employeeId || !name || !email || !phone || !role) {
      return res.status(400).json({
        success: false,
        message: 'Please provide employeeId, name, email, phone, and role.'
      });
    }

    const cleanEmpId = employeeId.toUpperCase().trim();
    const cleanEmail = email.toLowerCase().trim();
    const normalizedRole = role.toUpperCase();

    // Check duplicate employee ID
    const existingEmp = await Employee.findOne({
      $or: [{ employeeId: cleanEmpId }, { email: cleanEmail }]
    });
    if (existingEmp) {
      return res.status(400).json({
        success: false,
        message: `An employee with ID '${cleanEmpId}' or email '${cleanEmail}' already exists.`
      });
    }

    // Create or find User account
    let user = await User.findOne({ email: cleanEmail });
    if (!user) {
      const defaultPassword = password || 'Transit@123';
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(defaultPassword, salt);

      user = await User.create({
        name: name.trim(),
        email: cleanEmail,
        employeeId: cleanEmpId,
        password: hashedPassword,
        role: normalizedRole.toLowerCase(),
        phone: phone.trim(),
        licenseNumber: licenseNumber || '',
        status: (status || 'AVAILABLE').toLowerCase()
      });
    }

    const employee = await Employee.create({
      employeeId: cleanEmpId,
      name: name.trim(),
      email: cleanEmail,
      phone: phone.trim(),
      role: normalizedRole,
      status: status || 'AVAILABLE',
      licenseNumber: licenseNumber || '',
      assignedShift: assignedShift || 'Morning',
      emergencyContact: emergencyContact || {},
      user: user._id
    });

    // Also sync Driver / Conductor model for legacy route compatibility
    if (normalizedRole === 'DRIVER') {
      await Driver.findOneAndUpdate(
        { employeeId: cleanEmpId },
        {
          name: name.trim(),
          employeeId: cleanEmpId,
          email: cleanEmail,
          phone: phone.trim(),
          licenseNumber: licenseNumber || 'DL-PENDING',
          status: (status || 'AVAILABLE').toLowerCase(),
          user: user._id
        },
        { upsert: true }
      );
    } else if (normalizedRole === 'CONDUCTOR') {
      await Conductor.findOneAndUpdate(
        { employeeId: cleanEmpId },
        {
          name: name.trim(),
          employeeId: cleanEmpId,
          email: cleanEmail,
          phone: phone.trim(),
          status: (status || 'AVAILABLE').toLowerCase(),
          user: user._id
        },
        { upsert: true }
      );
    }

    // Audit log
    await AuditLog.create({
      action: 'EMPLOYEE_CREATED',
      performedBy: req.user._id,
      performerRole: req.user.role,
      targetModel: 'Employee',
      targetId: employee._id.toString(),
      details: { employeeId: cleanEmpId, name, role: normalizedRole }
    });

    res.status(201).json({
      success: true,
      message: `Employee '${name}' created successfully.`,
      data: employee
    });
  } catch (error) {
    console.error('createEmployee Error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update employee
// @route   PATCH /api/employees/:id
// @access  Private (Manager/Admin)
exports.updateEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    const updated = await Employee.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    // Sync status to User
    if (req.body.status && employee.user) {
      await User.findByIdAndUpdate(employee.user, { status: req.body.status.toLowerCase() });
    }

    await AuditLog.create({
      action: 'EMPLOYEE_UPDATED',
      performedBy: req.user._id,
      performerRole: req.user.role,
      targetModel: 'Employee',
      targetId: employee._id.toString(),
      details: req.body
    });

    res.status(200).json({
      success: true,
      message: 'Employee updated successfully',
      data: updated
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Deactivate / Delete employee
// @route   DELETE /api/employees/:id
// @access  Private (Manager/Admin)
exports.deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    // Set to INACTIVE
    employee.status = 'INACTIVE';
    await employee.save();

    if (employee.user) {
      await User.findByIdAndUpdate(employee.user, { status: 'inactive' });
    }

    await AuditLog.create({
      action: 'EMPLOYEE_DEACTIVATED',
      performedBy: req.user._id,
      performerRole: req.user.role,
      targetModel: 'Employee',
      targetId: employee._id.toString()
    });

    res.status(200).json({
      success: true,
      message: `Employee '${employee.name}' has been marked INACTIVE.`
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

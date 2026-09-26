const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      required: [true, 'Please provide Employee ID'],
      unique: true,
      trim: true,
      uppercase: true,
      index: true
    },
    name: {
      type: String,
      required: [true, 'Please provide full name'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Please provide email address'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },
    phone: {
      type: String,
      required: [true, 'Please provide contact phone number'],
      trim: true
    },
    role: {
      type: String,
      enum: ['DRIVER', 'CONDUCTOR', 'MANAGER', 'STAFF', 'driver', 'conductor', 'manager', 'staff'],
      required: [true, 'Please specify employee role'],
      default: 'DRIVER',
      index: true
    },
    joiningDate: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: [
        'AVAILABLE',
        'ON_DUTY',
        'ON_LEAVE',
        'UNAVAILABLE',
        'INACTIVE',
        'available',
        'on_duty',
        'on_leave',
        'unavailable',
        'inactive'
      ],
      default: 'AVAILABLE',
      index: true
    },
    assignedShift: {
      type: String,
      default: 'Morning'
    },
    licenseNumber: {
      type: String,
      trim: true,
      uppercase: true,
      default: ''
    },
    licenseExpiry: {
      type: Date
    },
    emergencyContact: {
      name: { type: String, default: '' },
      relation: { type: String, default: '' },
      phone: { type: String, default: '' }
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true
  }
);

const Employee = mongoose.model('Employee', employeeSchema);

module.exports = Employee;

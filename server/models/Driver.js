const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide driver name'],
      trim: true
    },
    employeeId: {
      type: String,
      required: [true, 'Please provide driver employee ID'],
      unique: true,
      trim: true,
      uppercase: true
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      default: ''
    },
    phone: {
      type: String,
      required: [true, 'Please provide driver contact phone number'],
      trim: true
    },
    licenseNumber: {
      type: String,
      required: [true, 'Please provide driver license number'],
      unique: true,
      trim: true,
      uppercase: true
    },
    licenseExpiry: {
      type: Date
    },
    joiningDate: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['available', 'on_duty', 'on_leave', 'inactive'],
      default: 'available'
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

const Driver = mongoose.model('Driver', driverSchema);

module.exports = Driver;

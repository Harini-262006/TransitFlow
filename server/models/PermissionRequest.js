const mongoose = require('mongoose');

const permissionRequestSchema = new mongoose.Schema(
  {
    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please provide applicant reference']
    },
    employeeId: {
      type: String,
      trim: true,
      uppercase: true
    },
    employeeName: {
      type: String,
      trim: true
    },
    employeeRole: {
      type: String,
      trim: true
    },
    date: {
      type: Date,
      required: [true, 'Please provide permission date'],
      index: true
    },
    startTime: {
      type: String,
      required: [true, 'Please provide start time (e.g. 10:00 AM)']
    },
    endTime: {
      type: String,
      required: [true, 'Please provide end time (e.g. 12:00 PM)']
    },
    durationHours: {
      type: Number,
      default: 2
    },
    reason: {
      type: String,
      required: [true, 'Please specify reason for permission request'],
      trim: true
    },
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED', 'pending', 'approved', 'rejected', 'cancelled'],
      default: 'PENDING',
      index: true
    },
    managerRemarks: {
      type: String,
      trim: true,
      default: ''
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reviewedAt: {
      type: Date
    },
    appliedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

const PermissionRequest = mongoose.model('PermissionRequest', permissionRequestSchema);

module.exports = PermissionRequest;

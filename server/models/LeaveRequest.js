const mongoose = require('mongoose');

const leaveRequestSchema = new mongoose.Schema(
  {
    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please provide applicant user reference']
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
      trim: true,
      lowercase: true
    },
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Driver'
    },
    conductor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conductor'
    },
    leaveType: {
      type: String,
      required: [true, 'Please specify leave type'],
      trim: true,
      default: 'Casual Leave'
    },
    fromDate: {
      type: Date,
      required: [true, 'Please provide leave from date']
    },
    toDate: {
      type: Date,
      required: [true, 'Please provide leave to date']
    },
    startDate: {
      type: Date
    },
    endDate: {
      type: Date
    },
    numberOfDays: {
      type: Number,
      default: 1
    },
    reason: {
      type: String,
      required: [true, 'Please provide reason for leave'],
      trim: true
    },
    remarks: {
      type: String,
      trim: true,
      default: ''
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'cancelled', 'PENDING', 'APPROVED', 'REJECTED'],
      default: 'pending'
    },
    managerRemarks: {
      type: String,
      trim: true,
      default: ''
    },
    managerComment: {
      type: String,
      trim: true,
      default: ''
    },
    rejectionReason: {
      type: String,
      trim: true,
      default: ''
    },
    affectedShiftsCount: {
      type: Number,
      default: 0
    },
    reassignedShiftsCount: {
      type: Number,
      default: 0
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    appliedAt: {
      type: Date,
      default: Date.now
    },
    submittedAt: {
      type: Date,
      default: Date.now
    },
    reviewedAt: {
      type: Date
    },
    approvedAt: {
      type: Date
    },
    rejectedAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

// Pre-save hook to keep dates and counts synchronized
leaveRequestSchema.pre('save', function (next) {
  if (this.fromDate && !this.startDate) {
    this.startDate = this.fromDate;
  }
  if (this.toDate && !this.endDate) {
    this.endDate = this.toDate;
  }
  if (this.startDate && !this.fromDate) {
    this.fromDate = this.startDate;
  }
  if (this.endDate && !this.toDate) {
    this.toDate = this.endDate;
  }
  if (this.fromDate && this.toDate) {
    const diff = new Date(this.toDate) - new Date(this.fromDate);
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
    this.numberOfDays = days > 0 ? days : 1;
  }
  if (!this.appliedAt) {
    this.appliedAt = this.submittedAt || new Date();
  }
  if (!this.submittedAt) {
    this.submittedAt = this.appliedAt || new Date();
  }
  if (this.managerRemarks && !this.managerComment) {
    this.managerComment = this.managerRemarks;
  }
  if (this.managerComment && !this.managerRemarks) {
    this.managerRemarks = this.managerComment;
  }
  next();
});

const LeaveRequest = mongoose.model('LeaveRequest', leaveRequestSchema);

module.exports = LeaveRequest;

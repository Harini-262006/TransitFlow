const mongoose = require('mongoose');

const replacementAssignmentSchema = new mongoose.Schema(
  {
    duty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Duty',
      required: [true, 'Please reference affected Duty']
    },
    leaveRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LeaveRequest'
    },
    permissionRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PermissionRequest'
    },
    previousEmployee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please specify previous staff member on leave']
    },
    replacementEmployee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please specify assigned replacement staff member']
    },
    role: {
      type: String,
      enum: ['DRIVER', 'CONDUCTOR', 'driver', 'conductor'],
      required: [true, 'Please specify role being replaced']
    },
    dutyDate: {
      type: Date
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    assignedAt: {
      type: Date,
      default: Date.now
    },
    notes: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

const ReplacementAssignment = mongoose.model('ReplacementAssignment', replacementAssignmentSchema);

module.exports = ReplacementAssignment;

const mongoose = require('mongoose');

const dutyIssueSchema = new mongoose.Schema(
  {
    duty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Duty'
    },
    bus: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Bus'
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    reporterRole: {
      type: String,
      default: 'DRIVER'
    },
    issueType: {
      type: String,
      enum: [
        'breakdown',
        'traffic',
        'engine',
        'brake',
        'tyre',
        'ac',
        'electrical',
        'late_departure',
        'route_block',
        'other'
      ],
      required: [true, 'Please specify issue type'],
      default: 'breakdown'
    },
    description: {
      type: String,
      required: [true, 'Please describe the duty or vehicle issue in detail'],
      trim: true
    },
    photo: {
      type: String,
      default: ''
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
      default: 'medium'
    },
    status: {
      type: String,
      enum: ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'assigned_maintenance', 'open', 'in_progress', 'resolved'],
      default: 'OPEN',
      index: true
    },
    managerNotes: {
      type: String,
      default: ''
    },
    resolvedAt: {
      type: Date
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true
  }
);

const DutyIssue = mongoose.model('DutyIssue', dutyIssueSchema);

module.exports = DutyIssue;

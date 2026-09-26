const mongoose = require('mongoose');

const issueReportSchema = new mongoose.Schema(
  {
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    bus: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Bus',
      required: true
    },
    issueType: {
      type: String,
      enum: ['engine', 'brake', 'tyre', 'ac', 'electrical', 'other'],
      default: 'other'
    },
    description: {
      type: String,
      required: [true, 'Please describe the problem'],
      trim: true
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium'
    },
    status: {
      type: String,
      enum: ['reported', 'under_review', 'assigned_maintenance', 'resolved'],
      default: 'reported'
    }
  },
  {
    timestamps: true
  }
);

const IssueReport = mongoose.model('IssueReport', issueReportSchema);

module.exports = IssueReport;

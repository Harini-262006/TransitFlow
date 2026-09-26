const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    shift: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Shift'
    },
    date: {
      type: Date,
      required: true,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['present', 'absent', 'late', 'leave'],
      default: 'present'
    },
    timeIn: {
      type: String,
      default: () => new Date().toLocaleTimeString()
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

// Compound index to prevent duplicate attendance per user on same shift/date
attendanceSchema.index({ user: 1, shift: 1, date: 1 }, { unique: false });

const Attendance = mongoose.model('Attendance', attendanceSchema);

module.exports = Attendance;

const mongoose = require('mongoose');

const dutySchema = new mongoose.Schema(
  {
    dutyName: {
      type: String,
      default: 'Standard Bus Duty'
    },
    date: {
      type: Date,
      required: [true, 'Please specify duty date'],
      default: Date.now,
      index: true
    },
    dutyDate: {
      type: Date
    },
    bus: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Bus',
      required: [true, 'Please assign a Bus to the duty']
    },
    route: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Route',
      required: [true, 'Please assign a Route to the duty']
    },
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Driver'
    },
    originalDriver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Driver'
    },
    replacementDriver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Driver'
    },
    conductor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conductor'
    },
    originalConductor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conductor'
    },
    replacementConductor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conductor'
    },
    shift: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Shift'
    },
    shiftType: {
      type: String,
      enum: ['morning', 'afternoon', 'evening', 'night', 'Morning', 'Afternoon', 'Evening', 'Night'],
      default: 'morning'
    },
    reportingTime: {
      type: String,
      default: '07:00 AM'
    },
    departureTime: {
      type: String,
      default: '07:30 AM'
    },
    returnTime: {
      type: String,
      default: '03:30 PM'
    },
    startTime: {
      type: String,
      default: '07:30 AM'
    },
    endTime: {
      type: String,
      default: '03:30 PM'
    },
    status: {
      type: String,
      enum: [
        'SCHEDULED',
        'IN_PROGRESS',
        'COMPLETED',
        'CANCELLED',
        'VACANT',
        'scheduled',
        'in_progress',
        'completed',
        'cancelled',
        'vacant'
      ],
      default: 'SCHEDULED',
      index: true
    },
    vacancyRole: {
      type: String,
      enum: ['DRIVER', 'CONDUCTOR', 'BOTH', 'NONE', 'driver', 'conductor', 'both', 'none'],
      default: 'NONE'
    },
    vacancyReason: {
      type: String,
      default: ''
    },
    reassignmentReason: {
      type: String,
      default: ''
    },
    reassignedAt: {
      type: Date
    },
    reassignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
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

dutySchema.pre('save', function (next) {
  if (this.date && !this.dutyDate) {
    this.dutyDate = this.date;
  }
  if (this.dutyDate && !this.date) {
    this.date = this.dutyDate;
  }
  if (!this.startTime && this.departureTime) {
    this.startTime = this.departureTime;
  }
  if (!this.endTime && this.returnTime) {
    this.endTime = this.returnTime;
  }
  next();
});

const Duty = mongoose.model('Duty', dutySchema);

module.exports = Duty;

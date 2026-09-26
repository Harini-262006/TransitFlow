const mongoose = require('mongoose');

const shiftSchema = new mongoose.Schema(
  {
    shiftName: {
      type: String,
      default: 'Standard Bus Shift'
    },
    shiftType: {
      type: String,
      enum: ['morning', 'afternoon', 'evening', 'night'],
      default: 'morning'
    },
    bus: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Bus',
      required: [true, 'Please assign a Bus to the shift']
    },
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Driver',
      required: [true, 'Please assign a Driver to the shift']
    },
    originalDriver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Driver'
    },
    conductor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conductor',
      required: [true, 'Please assign a Conductor to the shift']
    },
    originalConductor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conductor'
    },
    route: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Route',
      required: [true, 'Please assign a Route to the shift']
    },
    startTime: {
      type: String,
      required: [true, 'Please provide shift start time (e.g., 08:00 AM)']
    },
    endTime: {
      type: String,
      required: [true, 'Please provide shift end time (e.g., 04:00 PM)']
    },
    shiftDate: {
      type: Date,
      required: [true, 'Please specify the date of the shift'],
      default: Date.now
    },
    status: {
      type: String,
      enum: ['scheduled', 'in_progress', 'completed', 'cancelled'],
      default: 'scheduled'
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
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
    }
  },
  {
    timestamps: true
  }
);

const Shift = mongoose.model('Shift', shiftSchema);

module.exports = Shift;

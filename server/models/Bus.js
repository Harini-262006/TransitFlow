const mongoose = require('mongoose');

const busSchema = new mongoose.Schema(
  {
    busNumber: {
      type: String,
      required: [true, 'Please provide a Bus Number'],
      unique: true,
      trim: true,
      uppercase: true
    },
    registrationNumber: {
      type: String,
      required: [true, 'Please provide a Registration Number'],
      unique: true,
      trim: true,
      uppercase: true
    },
    busType: {
      type: String,
      enum: ['Standard', 'AC Express', 'Double Decker', 'Minibus', 'Electric'],
      default: 'Standard'
    },
    capacity: {
      type: Number,
      required: [true, 'Please specify bus seating capacity'],
      min: [1, 'Capacity must be at least 1']
    },
    route: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Route'
    },
    status: {
      type: String,
      enum: ['available', 'active', 'on_duty', 'maintenance', 'inactive'],
      default: 'available'
    },
    purchaseYear: {
      type: Number,
      default: new Date().getFullYear()
    },
    lastServiceDate: {
      type: Date
    },
    nextServiceDate: {
      type: Date
    },
    notes: {
      type: String,
      trim: true,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

const Bus = mongoose.model('Bus', busSchema);

module.exports = Bus;

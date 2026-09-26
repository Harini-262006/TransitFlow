const mongoose = require('mongoose');

const maintenanceSchema = new mongoose.Schema(
  {
    bus: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Bus',
      required: true
    },
    maintenanceType: {
      type: String,
      enum: ['routine', 'repair', 'inspection', 'emergency'],
      default: 'routine'
    },
    description: {
      type: String,
      required: [true, 'Please describe maintenance details'],
      trim: true
    },
    maintenanceDate: {
      type: Date,
      default: Date.now
    },
    cost: {
      type: Number,
      default: 0
    },
    serviceProvider: {
      type: String,
      default: 'In-house Service Depot'
    },
    nextServiceDate: {
      type: Date
    },
    status: {
      type: String,
      enum: ['scheduled', 'in_progress', 'completed'],
      default: 'in_progress'
    }
  },
  {
    timestamps: true
  }
);

const Maintenance = mongoose.model('Maintenance', maintenanceSchema);

module.exports = Maintenance;

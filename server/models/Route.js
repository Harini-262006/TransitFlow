const mongoose = require('mongoose');

const routeSchema = new mongoose.Schema(
  {
    routeNumber: {
      type: String,
      required: [true, 'Please provide Route Number'],
      unique: true,
      trim: true,
      uppercase: true
    },
    source: {
      type: String,
      required: [true, 'Please provide starting location / source'],
      trim: true
    },
    destination: {
      type: String,
      required: [true, 'Please provide destination location'],
      trim: true
    },
    distanceKm: {
      type: Number,
      min: 0
    },
    estimatedDurationMins: {
      type: Number,
      min: 0
    },
    stops: [
      {
        type: String,
        trim: true
      }
    ]
  },
  {
    timestamps: true
  }
);

const Route = mongoose.model('Route', routeSchema);

module.exports = Route;

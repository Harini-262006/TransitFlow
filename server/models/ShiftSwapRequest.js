const mongoose = require('mongoose');

const shiftSwapRequestSchema = new mongoose.Schema(
  {
    requester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    targetEmployee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    requesterShift: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Shift',
      required: true
    },
    reason: {
      type: String,
      required: [true, 'Please state reason for swap request'],
      trim: true
    },
    peerStatus: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending'
    },
    adminStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    rejectionReason: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

const ShiftSwapRequest = mongoose.model('ShiftSwapRequest', shiftSwapRequestSchema);

module.exports = ShiftSwapRequest;

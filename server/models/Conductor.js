const mongoose = require('mongoose');

const conductorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide conductor name'],
      trim: true
    },
    employeeId: {
      type: String,
      required: [true, 'Please provide conductor employee ID'],
      unique: true,
      trim: true,
      uppercase: true
    },
    phone: {
      type: String,
      required: [true, 'Please provide conductor phone number'],
      trim: true
    },
    status: {
      type: String,
      enum: ['available', 'assigned', 'on_leave'],
      default: 'available'
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true
  }
);

const Conductor = mongoose.model('Conductor', conductorSchema);

module.exports = Conductor;

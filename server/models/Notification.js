const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please specify notification recipient']
    },
    title: {
      type: String,
      required: [true, 'Please provide notification title'],
      trim: true
    },
    message: {
      type: String,
      required: [true, 'Please provide notification message'],
      trim: true
    },
    read: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;

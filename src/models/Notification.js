const mongoose = require('mongoose')
const {
  NOTIFICATION_STATUS_READ,
  NOTIFICATION_STATUS_UNREAD,
} = require('../constants/notification')

const Schema = mongoose.Schema(
  {
    title: { type: String, required: true },
    message: { type: String, required: true },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    model: {
      type: String,
      default: null,
    },
    modelId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'model',
      default: null,
    },
    status: {
      type: String,
      enum: [NOTIFICATION_STATUS_READ, NOTIFICATION_STATUS_UNREAD],
      default: NOTIFICATION_STATUS_UNREAD,
    },
  },
  {
    versionKey: false,
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
)

const Notification = mongoose.model('Notification', Schema, 'notifications')

module.exports = Notification

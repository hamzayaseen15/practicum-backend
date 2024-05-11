const mongoose = require('mongoose')
const {
  SUPPORT_TICKET_STATUS_PENDING,
  SUPPORT_TICKET_STATUS_RESOLVED,
  SUPPORT_TICKET_PRIORITY_NORMAL,
  SUPPORT_TICKET_PRIORITY_URGENT,
} = require('../constants/supportTicket')

const Schema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    files: {
      type: [
        { type: mongoose.Schema.Types.ObjectId, ref: 'File', required: true },
      ],
      default: [],
    },
    status: {
      type: String,
      enum: [SUPPORT_TICKET_STATUS_PENDING, SUPPORT_TICKET_STATUS_RESOLVED],
      default: SUPPORT_TICKET_STATUS_PENDING,
    },
    priority: {
      type: String,
      enum: [SUPPORT_TICKET_PRIORITY_NORMAL, SUPPORT_TICKET_PRIORITY_URGENT],
      default: SUPPORT_TICKET_PRIORITY_NORMAL,
    },
    chat: {
      type: [
        mongoose.Schema(
          {
            message: {
              type: String,
              default: null,
            },
            attachment: {
              type: mongoose.Schema.Types.ObjectId,
              ref: 'File',
              default: null,
            },
            created_by: {
              type: mongoose.Schema.Types.ObjectId,
              ref: 'User',
              required: true,
            },
          },
          {
            versionKey: false,
            timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
          }
        ),
      ],
      default: [],
      select: false,
    },
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    versionKey: false,
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
)

const SupportTicket = mongoose.model('SupportTicket', Schema, 'support_tickets')

module.exports = SupportTicket

const mongoose = require('mongoose')

const Schema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, default: '' },
    start_date: { type: Date, required: true },
    end_date: { type: Date, required: true },
  },
  {
    versionKey: false,
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
)

const Event = mongoose.model('Event', Schema, 'events')

module.exports = Event

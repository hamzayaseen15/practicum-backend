const mongoose = require('mongoose')

const Schema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, default: '' },
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
  },
  {
    versionKey: false,
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
)

const Community = mongoose.model('Community', Schema, 'communities')

module.exports = Community

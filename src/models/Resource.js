const mongoose = require('mongoose')

const Schema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, default: '' },
    files: {
      type: [
        { type: mongoose.Schema.Types.ObjectId, ref: 'File', required: true },
      ],
      validate: {
        validator: (value) => value.length >= 1, // Minimum length check
        message: 'files must have at least 1 element',
      },
      required: true,
    },
  },
  {
    versionKey: false,
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
)

const Resource = mongoose.model('Resource', Schema, 'resources')

module.exports = Resource

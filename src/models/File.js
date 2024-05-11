const mongoose = require('mongoose')

const Schema = mongoose.Schema(
  {
    original_name: { type: String },
    name: { type: String, required: true },
    path: { type: String, required: true },
    url: { type: String },
    mimetype: { type: String, required: true },
    extension: { type: String, lowercase: true, required: true },
    uploaded_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Users',
    },
  },
  {
    versionKey: false,
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
)

const File = mongoose.model('File', Schema, 'files')

module.exports = File

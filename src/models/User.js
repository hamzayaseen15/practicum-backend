const mongoose = require('mongoose')
const {
  USER_TYPE_ADMIN,
  USER_TYPE_SUB_ADMIN,
  USER_TYPE_USER,
} = require('../constants/user')

const Schema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, select: false },
    name: { type: String, required: true },
    photo: { type: mongoose.Types.ObjectId, ref: 'File' },
    phone: { type: String, default: '' },
    address: { type: String, default: '' },
    type: {
      type: String,
      enum: [USER_TYPE_ADMIN, USER_TYPE_SUB_ADMIN, USER_TYPE_USER],
      default: USER_TYPE_USER,
      required: true,
    },
    community: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    deleted_at: { type: Date, default: null },
    deleted_by: { type: mongoose.Types.ObjectId, ref: 'User' },
  },
  {
    versionKey: false,
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
)

const User = mongoose.model('User', Schema, 'users')

module.exports = User

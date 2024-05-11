const bcrypt = require('bcrypt')
const yup = require('yup')

const ApiHelper = require('../helpers/ApiHelper')
const UploadHelper = require('../helpers/UploadHelper')

const User = require('../models/User')

const {
  USER_TYPE_ADMIN,
  USER_TYPE_SUB_ADMIN,
  USER_TYPE_USER,
} = require('../constants/user')
const Notification = require('../models/Notification')

const {NOTIFICATION_STATUS_READ} = require('../constants/notification')

/**
 * Get all users
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
exports.index = async (req, res) => {
  try {
    const { user } = req

    if (user.type != USER_TYPE_ADMIN) {
      return res.status(403).json({ message: 'Forbidden resource' })
    }

    const response = await ApiHelper.handleGet(
      req,
      User,
      {
        $or: [{ deleted_at: null }, { deleted_at: { $exists: false } }],
      },
      '-password'
    )
    return res.status(200).json(response)
  } catch (error) {
    console.log(error)
    return res
      .status(500)
      .json({ message: error?.message ?? 'Error getting users' })
  }
}

/**
 * Get one user by id
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
exports.show = async (req, res) => {
  try {
    const {
      user: loggedInUser,
      params: { id },
    } = req

    const user = await User.findOne({ _id: id })

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    // if (loggedInUser.type != USER_TYPE_ADMIN) {
    //   return res.status(403).json({ message: 'Forbidden resource' })
    // }

    return res.status(200).json(user)
  } catch (error) {
    console.log(error)
    return res
      .status(500)
      .json({ message: error?.message ?? 'Error getting  user' })
  }
}

/**
 * Create a new user
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
exports.store = async (req, res) => {
  try {
    const { user: loggedInUser, body } = req

    if (loggedInUser.type != USER_TYPE_ADMIN) {
      return res.status(403).json({ message: 'Forbidden resource' })
    }

    const bodySchema = yup.object().shape({
      email: yup.string().email().required(),
      password: yup.string().required(),
      name: yup.string().required(),
      phone: yup.string().nullable(),
      address: yup.string().nullable(),
      type: yup
        .string()
        .oneOf([USER_TYPE_ADMIN, USER_TYPE_SUB_ADMIN, USER_TYPE_USER])
        .nullable(),
    })

    // const filesSchema = yup.object().shape({
    //   photo: yup
    //     .mixed()
    //     .test('fileType', 'Invalid file type', (value) => {
    //       if (!value) {
    //         return true
    //       }
    //       return value.mimetype.startsWith('image/')
    //     })
    //     .test('fileSize', 'File size too large', (value) => {
    //       if (!value) {
    //         return true
    //       }
    //       return value.size <= 1024 * 1024 * 2 // 2 MB
    //     })
    // })

    const validationErrors = await req.validate(bodySchema)
    if (validationErrors) {
      return res
        .status(400)
        .json({ message: 'Validation Error', errors: validationErrors })
    }

    const userExists = await User.findOne({ email: body.email })
    if (userExists) {
      return res.status(400).json({ error: 'Email has already been used' })
    }

    // hash the password
    const hashedPassword = await bcrypt.hash(body.password, 10)

    const userObject = {
      ...body,
      password: hashedPassword,
    }

    if (req?.files?.photo) {
      const { file } = await UploadHelper.handleDocument(
        req,
        'photo',
        '/public/user-photos/'
      )
      if (file?._id) {
        userObject.photo = file._id
      }
    }

    // create a new user
    const user = await User.create(userObject)

    delete user._doc.password

    return res.status(201).json(user)
  } catch (error) {
    console.log(error)
    return res
      .status(500)
      .json({ message: error?.message ?? 'Error creating user' })
  }
}

/**
 * Update a user
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
exports.update = async (req, res) => {
  try {
    const {
      user: loggedInUser,
      params: { id },
      body,
    } = req

    const user = await User.findOne({ _id: id })

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    // if (
    //   loggedInUser.type != USER_TYPE_ADMIN ||
    //   (loggedInUser.type == USER_TYPE_SUB_ADMIN &&
    //     loggedInUser._id.toString() != user._id.toString())
    // ) {
    //   return res.status(403).json({ message: 'Forbidden resource' })
    // }

    const bodySchema = yup.object().shape({
      email: yup.string().email().required(),
      password: yup.string(),
      name: yup.string().required(),
      phone: yup.string().nullable(),
      address: yup.string().nullable(),
      type: yup
        .string()
        .oneOf([USER_TYPE_ADMIN, USER_TYPE_SUB_ADMIN, USER_TYPE_USER])
        .nullable(),
    })

    // const filesSchema = yup.object().shape({
    //   photo: yup
    //     .mixed()
    //     .test('fileType', 'Invalid file type', (value) => {
    //       if (!value) {
    //         return true
    //       }
    //       return value.mimetype.startsWith('image/')
    //     })
    //     .test('fileSize', 'File size too large', (value) => {
    //       if (!value) {
    //         return true
    //       }
    //       return value.size <= 1024 * 1024 * 2 // 2 MB
    //     })
    // })

    const validationErrors = await req.validate(bodySchema)
    if (validationErrors) {
      return res
        .status(400)
        .json({ message: 'Validation Error', errors: validationErrors })
    }

    const emailUsed = await User.findOne({
      email: body.email,
      _id: { $ne: id },
    })
    if (emailUsed) {
      return res.status(400).json({ error: 'Email has already been used' })
    }

    const updateObject = {
      ...body,
    }

    if (body.password) {
      // hash the password
      const hashedPassword = await bcrypt.hash(body.password, 10)
      updateObject.password = hashedPassword
    }

    if (body.approved_at) {
      updateObject.approved_at = body.approved_at
      updateObject.approved_by = user._id
    }

    if (req.files?.photo) {
      // deleting old photo from db and storage
      if (user.photo) {
        await UploadHelper.handleDeleteDocument(user.photo)
      }

      // saving new photo in db and storage
      const { file } = await UploadHelper.handleDocument(
        req,
        'photo',
        '/public/user-profile-photos/'
      )
      if (file?._id) {
        updateObject.photo = file._id
      }
    }

    const updateResponse = await User.findOneAndUpdate(
      { _id: id },
      { $set: updateObject },
      { new: true, useFindAndModify: false }
    ).select('-password')

    return res.status(200).json(updateResponse)
  } catch (error) {
    console.log(error)
    return res
      .status(500)
      .json({ message: error?.message ?? 'Error updating user' })
  }
}

/**
 * Delete a user by id
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
exports.destroy = async (req, res) => {
  try {
    const {
      user: loggedInUser,
      params: { id },
    } = req

    const user = await User.findOne({ _id: id })

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    if (
      loggedInUser.type != USER_TYPE_ADMIN &&
      loggedInUser._id.toString() == user._id.toString()
    ) {
      return res.status(403).json({ message: 'Forbidden resource' })
    }

    await User.findByIdAndDelete({ _id: id })

    return res.status(200).json({ message: 'Deleted successfully' })
  } catch (error) {
    console.log(error)
    return res
      .status(500)
      .json({ message: error?.message ?? 'Error deleting user' })
  }
}

/**
 * Get logged in user details
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
exports.me = async (req, res) => {
  try {
    const { user } = req

    return res.status(200).json(user)
  } catch (error) {
    console.log(error)
    return res
      .status(500)
      .json({ message: error?.message ?? 'Error getting logged in user info' })
  }
}

/**
 * Get logged in user's notification
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
exports.notifications = async (req, res) => {
  try {
    const { user } = req

    const response = await ApiHelper.handleGet(req, Notification, {
      user: user._id,
    })

    return res.status(200).json(response)
  } catch (error) {
    console.log(error)
    return res
      .status(500)
      .json({ message: error?.message ?? 'Error getting logged in user info' })
  }
}

/**
 * update logged in user's notification
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */

exports.markAllNotificationsAsRead = async (req, res) => {
  try {
    const { user } = req

    // Update all notifications for the user to mark them as read
    await Notification.updateMany(
      {user: user._id, },
      { $set: { status: NOTIFICATION_STATUS_READ } }
    );

    // Respond with success message
    return res.status(200).json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};


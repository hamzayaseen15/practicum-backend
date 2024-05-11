const bcrypt = require('bcrypt')
const yup = require('yup')
const UploadHelper = require('../helpers/UploadHelper')
const Event = require('../models/Event')
const {
  USER_TYPE_ADMIN,
  USER_TYPE_SUB_ADMIN,
  USER_TYPE_USER,
} = require('../constants/user')

/**
 * Update an event
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
exports.update = async (req, res) => {
  try {
    const {
      user: user,
      params: { id },
      body,
    } = req

    const user = await Event.findOne({ _id: id })

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    if (![USER_TYPE_ADMIN, USER_TYPE_SUB_ADMIN].includes(user.type)) {
      return res.status(403).json({ message: 'Forbidden resource' })
    }

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

    const emailUsed = await Event.findOne({
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

    const updateResponse = await Event.findOneAndUpdate(
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

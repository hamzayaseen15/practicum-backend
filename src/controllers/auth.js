const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const yup = require('yup')
const { default: mongoose } = require('mongoose')

const User = require('../models/User')

const UploadHelper = require('../helpers/UploadHelper')
const { sendEmail } = require('../utils/mail')

/**
 * Login
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
exports.login = async (req, res) => {
  try {
    const schema = yup.object().shape({
      email: yup.string().required(),
      password: yup.string().required(),
    })

    const validationErrors = await req.validate(schema)
    if (validationErrors) {
      return res
        .status(400)
        .json({ message: 'Validation Error', errors: validationErrors })
    }

    const { email, password } = req.body

    // find the user in the database
    const user = await User.findOne({ email }).select('+password').lean()
    if (!user) {
      return res.status(401).json({ error: 'Incorrect email or password' })
    }

    // compare the hashed password stored in the database with the provided password
    const passwordIsValid = await bcrypt.compare(password, user.password)
    if (!passwordIsValid) {
      return res.status(401).json({ error: 'Incorrect email or password' })
    }

    // create a JWT token
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET)

    delete user.password

    return res.json({ user, auth_token: token })
  } catch (error) {
    console.log({ error })
    return res.status(500).json({ error: 'Something went wrong' })
  }
}

/**
 * Register
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
exports.register = async (req, res) => {
  try {
    const bodySchema = yup.object().shape({
      email: yup.string().email().required(),
      password: yup.string().required(),
      name: yup.string().required(),
      phone: yup.string().nullable(),
      address: yup.string().nullable(),
    })

    const validationErrors = await req.validate(bodySchema)
    if (validationErrors) {
      return res
        .status(400)
        .json({ message: 'Validation Error', errors: validationErrors })
    }

    const { body } = req

    const emailExists = await User.findOne({ email: body.email })
    if (emailExists) {
      return res
        .status(400)
        .json({ error: 'An account already exist with this email' })
    }

    // hash the password
    const hashedPassword = await bcrypt.hash(body.password, 10)

    const userObject = {
      email: body.email,
      password: hashedPassword,
      name: body.name,
      phone: body.phone,
      address: body.address,
    }

    if (req.files) {
      if (req.files.photo) {
        const { file } = await UploadHelper.handleDocument(
          req,
          'photo',
          '/public/user-photos/'
        )
        if (file?._id) {
          userObject.photo = file._id
        }
      }
    }

    // create a new driver and save to the database
    await User.create(userObject)

    return res.status(201).json({ message: 'Successfully registered' })
  } catch (error) {
    return res
      .status(500)
      .json({ message: error?.message ?? 'Error registering' })
  }
}

/**
 * Forgot Password
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
exports.forgotPassword = async (req, res) => {
  try {
    const schema = yup.object().shape({
      email: yup.string().required(),
    })

    const validationErrors = await req.validate(schema)
    if (validationErrors) {
      return res
        .status(400)
        .json({ message: 'Validation Error', errors: validationErrors })
    }

    const { body } = req

    // find the user in the database
    const user = await User.findOne({ email: body.email }).lean()
    if (!user) {
      return res.status(401).json({ error: 'Incorrect email' })
    }

    const token = new mongoose.Schema.Types.ObjectId().toString()

    await User.findOneAndUpdate(
      { _id: user._id },
      {
        $set: {
          reset_token: token,
        },
      },
      { new: true, useFindAndModify: false }
    )

    await sendEmail({
      templateName: 'forgot-password',
      to: user.email,
      subject: 'Forgot Password',
      values: {
        name: user.name,
        email: user.email,
        front_end_url: process.env.FRONT_END_URL ?? 'http://localhost:3001',
        token,
      },
    })

    return res.status(200).json({ message: 'Code sent in email' })
  } catch (error) {
    console.log({ error })
    return res.status(500).json({ error: 'Something went wrong' })
  }
}

/**
 * Reset Password
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
exports.resetPassword = async (req, res) => {
  try {
    const schema = yup.object().shape({
      token: yup.string().required(),
      password: yup.string().required(),
    })

    const validationErrors = await req.validate(schema)
    if (validationErrors) {
      return res
        .status(400)
        .json({ message: 'Validation Error', errors: validationErrors })
    }

    const { body, params } = req

    // find the user in the database
    const user = await User.findOne({ reset_token: params.token }).lean()
    if (!user) {
      return res.status(401).json({ error: 'Code expired' })
    }

    // hash the password
    const hashedPassword = await bcrypt.hash(body.password, 10)

    await User.findOneAndUpdate(
      { _id: user._id },
      {
        $set: {
          password: hashedPassword,
          reset_token: null,
        },
      },
      { new: true, useFindAndModify: false }
    )

    return res.status(200).json({ message: 'Password reset successfully' })
  } catch (error) {
    console.log({ error })
    return res.status(500).json({ error: 'Something went wrong' })
  }
}

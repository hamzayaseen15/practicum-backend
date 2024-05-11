const yup = require('yup')

const ApiHelper = require('../helpers/ApiHelper')
const NotificationHelper = require('../helpers/NotificationHelper')
const UploadHelper = require('../helpers/UploadHelper')

const Community = require('../models/Community')
const User = require('../models/User')

const {
  USER_TYPE_ADMIN,
  USER_TYPE_SUB_ADMIN,
  USER_TYPE_USER,
} = require('../constants/user')

/**
 * Get all communities
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
exports.index = async (req, res) => {
  try {
    const response = await ApiHelper.handleGet(req, Community)
    return res.status(200).json(response)
  } catch (error) {
    console.log(error)
    return res
      .status(500)
      .json({ message: error?.message ?? 'Something went wrong' })
  }
}

/**
 * Get one community by id
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
exports.show = async (req, res) => {
  try {
    const {
      params: { id },
    } = req

    const community = await Community.findOne({ _id: id })

    if (!community) {
      return res.status(404).json({ message: 'Community not found' })
    }

    return res.status(200).json(community)
  } catch (error) {
    console.log(error)
    return res
      .status(500)
      .json({ message: error?.message ?? 'Something went wrong' })
  }
}

/**
 * Create a new community
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
exports.store = async (req, res) => {
  try {
    const { user, body } = req

    if (![USER_TYPE_ADMIN, USER_TYPE_SUB_ADMIN].includes(user.type)) {
      return res.status(403).json({ message: 'Forbidden resource' })
    }

    const schema = yup.object().shape({
      name: yup.string().required(),
      description: yup.string().nullable(),
    })

    const validationErrors = await req.validate(schema)
    if (validationErrors) {
      return res
        .status(400)
        .json({ message: 'Validation Error', errors: validationErrors })
    }

    const community = await Community.create(body)

    return res.status(201).json(community)
  } catch (error) {
    console.log(error)
    return res
      .status(500)
      .json({ message: error?.message ?? 'Something went wrong' })
  }
}

/**
 * Update an community
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
exports.update = async (req, res) => {
  try {
    const {
      user,
      params: { id },
      body,
    } = req

    const community = await Community.findOne({ _id: id })

    if (!community) {
      return res.status(404).json({ message: 'Community not found' })
    }

    if (![USER_TYPE_ADMIN, USER_TYPE_SUB_ADMIN].includes(user.type)) {
      return res.status(403).json({ message: 'Forbidden resource' })
    }

    const schema = yup.object().shape({
      name: yup.string().required(),
      description: yup.string().nullable(),
    })

    const validationErrors = await req.validate(schema)
    if (validationErrors) {
      return res
        .status(400)
        .json({ message: 'Validation Error', errors: validationErrors })
    }

    const updateResponse = await Community.findOneAndUpdate(
      { _id: id },
      { $set: body },
      { new: true, useFindAndModify: false }
    )

    return res.status(200).json(updateResponse)
  } catch (error) {
    console.log(error)
    return res
      .status(500)
      .json({ message: error?.message ?? 'Error updating user' })
  }
}

/**
 * Delete an community by id
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
exports.destroy = async (req, res) => {
  try {
    const {
      user,
      params: { id },
    } = req

    const community = await Community.findOne({ _id: id })

    if (!community) {
      return res.status(404).json({ message: 'Community not found' })
    }

    if (![USER_TYPE_ADMIN, USER_TYPE_SUB_ADMIN].includes(user.type)) {
      return res.status(403).json({ message: 'Forbidden resource' })
    }

    await Community.findByIdAndDelete({ _id: id })

    return res.status(200).json({ message: 'Deleted successfully' })
  } catch (error) {
    console.log(error)
    return res
      .status(500)
      .json({ message: error?.message ?? 'Something went wrong' })
  }
}

/**
 * Get community's messages
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
exports.chat = async (req, res) => {
  try {
    const {
      params: { id },
      user,
    } = req

    const community = await Community.findOne({ _id: id })
      .select('+chat')
      .populate([
        'chat.attachment',
        {
          path: 'chat.created_by',
          select: 'email name photo',
          populate: 'photo',
        },
      ])

    if (!community) {
      return res
        .status(404)
        .json({ message: 'You are not a member of any community' })
    }

    // if (
    //   user.type === USER_TYPE_USER &&
    //   community._id.toString() !== user.community.toString()
    // ) {
    //   return res
    //     .status(403)
    //     .json({ message: 'You are not allowed to access this resource' })
    // }

    return res.status(200).json(community.chat)
  } catch (error) {
    console.log(error)
    return res
      .status(500)
      .json({ message: error?.message ?? 'Something went wrong' })
  }
}

/**
 * Create a message in a community
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
exports.addMessage = async (req, res) => {
  try {
    const {
      body: { message },
      files,
      params: { id },
      user,
    } = req

    const communityId = id

    const schema = yup.object().shape({
      message: yup.lazy(() => {
        if (!files?.attachment) {
          return yup.string().required()
        }
        return yup.string().nullable()
      }),
      attachment: yup.lazy(() => {
        if (!message) {
          return yup.mixed().required()
        }
        return yup.mixed().nullable()
      }),
    })    
    const validationErrors = await req.validate(schema)
    if (validationErrors) {
      return res
        .status(400)
        .json({ message: 'Validation Error', errors: validationErrors })
    }

    const community = await Community.findOne({ _id: communityId }).select(
      '+chat'
    )

    if (!community) {
      return res
        .status(404)
        .json({ message: 'You are not a member of any community' })
    }

    // if (
    //   user.type === USER_TYPE_USER &&
    //   community._id.toString() !== user.community.toString()
    // ) {
    //   return res
    //     .status(403)
    //     .json({ message: 'You are not allowed to access this resource' })
    // }

    const messageObj = {
      created_by: user._id,
    }
    if (message) {
      messageObj.message = message
    } else if (files?.attachment) {
      const { file } = await UploadHelper.handleDocument(
        req,
        `attachment`,
        `/public/communities/${communityId}/`
      )
      messageObj.attachment = file._id
    }

    community.chat.push(messageObj)

    const users = await User.find({
      _id: { $ne: user._id },
      $or: [
        { type: { $in: [USER_TYPE_ADMIN, USER_TYPE_SUB_ADMIN] } },
        { community: communityId },
      ],
    })

    for (let idx = 0; idx < users.length; idx++) {
      const u = users[idx]

      await NotificationHelper.generate({
        userId: u._id,
        title: 'New Message',
        message: `You have a new message in community chat`,
        model: 'Community',
        modelId: community._id,
      })
    }

    await community.save()

    return res.status(200).json({ message: 'Message added' })
  } catch (error) {
    console.log(error)
    return res
      .status(500)
      .json({ message: error?.message ?? 'Something went wrong' })
  }
}

/**
 * Delete a message in a community
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
exports.deleteMessage = async (req, res) => {
  try {
    const {
      params: { id, messageId },
      user,
    } = req

    const communityId = id

    const community = await Community.findOne({ _id: communityId }).select(
      '+chat'
    )

    if (!community) {
      return res
        .status(404)
        .json({ message: 'You are not a member of any community' })
    }

    if (
      user.type === USER_TYPE_USER &&
      community._id.toString() !== user.community.toString()
    ) {
      return res
        .status(403)
        .json({ message: 'You are not allowed to access this resource' })
    }

    const messageIndex = community.chat.findIndex(
      (message) => message._id.toString() === messageId
    )
    if (messageIndex < 0) {
      return res.status(404).json({ message: 'Message not found' })
    }

    const message = community.chat[messageIndex]

    if (
      user.type === USER_TYPE_USER &&
      message.created_by.toString() !== user._id.toString()
    ) {
      return res
        .status(403)
        .json({ message: 'You are not allowed to perform this action' })
    }

    if (message.attachment) {
      await UploadHelper.handleDeleteDocument(message.attachment.toString())
    }

    community.chat.splice(messageIndex, 1)
    await community.save()

    return res.status(200).json({ message: 'Message deleted' })
  } catch (error) {
    console.log(error)
    return res
      .status(500)
      .json({ message: error?.message ?? 'Something went wrong' })
  }
}

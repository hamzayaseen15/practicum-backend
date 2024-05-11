const yup = require('yup')

const ApiHelper = require('../helpers/ApiHelper')
const UploadHelper = require('../helpers/UploadHelper')

const Resource = require('../models/Resource')

const { USER_TYPE_ADMIN, USER_TYPE_SUB_ADMIN } = require('../constants/user')

/**
 * Get all resources
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
exports.index = async (req, res) => {
  try {
    const response = await ApiHelper.handleGet(req, Resource)
    return res.status(200).json(response)
  } catch (error) {
    console.log(error)
    return res
      .status(500)
      .json({ message: error?.message ?? 'Something went wrong' })
  }
}

/**
 * Get one resource by id
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
exports.show = async (req, res) => {
  try {
    const {
      params: { id },
    } = req

    const resource = await Resource.findOne({ _id: id }).populate('files')

    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' })
    }

    return res.status(200).json(resource)
  } catch (error) {
    console.log(error)
    return res
      .status(500)
      .json({ message: error?.message ?? 'Something went wrong' })
  }
}

/**
 * Create a new resource
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
exports.store = async (req, res) => {
  try {
    const { user, body, files } = req

    if (![USER_TYPE_ADMIN, USER_TYPE_SUB_ADMIN].includes(user.type)) {
      return res.status(403).json({ message: 'Forbidden resource' })
    }

    const schema = yup.object().shape({
      name: yup.string().required(),
      description: yup.string().nullable(),
      files: yup.mixed().required(),
    })

    const validationErrors = await req.validate(schema)
    if (validationErrors) {
      return res
        .status(400)
        .json({ message: 'Validation Error', errors: validationErrors })
    }

    const data = {
      ...body,
      files: [],
    }

    if (files.files?.length > 0) {
      for (let fileIdx = 0; fileIdx < files.files.length; fileIdx++) {
        const { file } = await UploadHelper.handleDocument(
          req,
          `files[${fileIdx}]`,
          '/public/resources/'
        )
        data.files.push(file._id)
      }
    } else {
      const { file } = await UploadHelper.handleDocument(
        req,
        `files`,
        '/public/resources/'
      )

      console.log(file)

      data.files.push(file._id)
    }

    const resource = await Resource.create(data)

    return res.status(201).json(resource)
  } catch (error) {
    console.log(error)
    return res
      .status(500)
      .json({ message: error?.message ?? 'Something went wrong' })
  }
}

/**
 * Update an resource
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
exports.update = async (req, res) => {
  try {
    const {
      body,
      files,
      params: { id },
      user,
    } = req

    const resource = await Resource.findOne({ _id: id })

    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' })
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

    const data = {
      ...body,
      files: resource.files,
    }

    if (files) {
      for (let fileIdx = 0; fileIdx < resource.files.length; fileIdx++) {
        const file = resource.files[fileIdx]
        await UploadHelper.handleDeleteDocument(file)
      }

      data.files = []

      if (files.files?.length > 0) {
        for (let fileIdx = 0; fileIdx < files.files.length; fileIdx++) {
          const { file } = await UploadHelper.handleDocument(
            req,
            `files[${fileIdx}]`,
            '/public/resources/'
          )
          data.files.push(file._id)
        }
      } else {
        const { file } = await UploadHelper.handleDocument(
          req,
          `files`,
          '/public/resources/'
        )

        data.files.push(file._id)
      }
    }

    const updateResponse = await Resource.findOneAndUpdate(
      { _id: id },
      { $set: data },
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
 * Delete an resource by id
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
exports.destroy = async (req, res) => {
  try {
    const {
      user,
      params: { id },
    } = req

    const resource = await Resource.findOne({ _id: id })

    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' })
    }

    if (![USER_TYPE_ADMIN, USER_TYPE_SUB_ADMIN].includes(user.type)) {
      return res.status(403).json({ message: 'Forbidden resource' })
    }

    for (let fileIdx = 0; fileIdx < resource.files.length; fileIdx++) {
      const file = resource.files[fileIdx]
      await UploadHelper.handleDeleteDocument(file)
    }

    await Resource.findByIdAndDelete({ _id: id })

    return res.status(200).json({ message: 'Deleted successfully' })
  } catch (error) {
    console.log(error)
    return res
      .status(500)
      .json({ message: error?.message ?? 'Something went wrong' })
  }
}

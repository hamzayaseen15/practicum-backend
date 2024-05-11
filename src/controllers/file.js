const fs = require('fs')
const yup = require('yup')

const File = require('../models/File')

/**
 * Get one file by id
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
exports.show = async (req, res) => {
  try {
    const routeSchema = yup.object().shape({
      id: yup.string().required(),
    })

    /** Request validation */
    const validationErrors = await req.validate(null, null, routeSchema, null)
    if (validationErrors) {
      return res
        .status(400)
        .json({ message: 'Validation error', errors: validationErrors })
    }

    const {
      params: { id },
    } = req

    const file = await File.findOne({ _id: id })

    const file_path = `${root_directory}${file?.path}`

    if (!file || (file && !fs.existsSync(file_path))) {
      return res.status(404).json({ message: 'File not found' })
    }

    return res.sendFile(file_path)
  } catch (error) {
    return res
      .status(400)
      .send({ message: error?.message ?? 'Something went wrong' })
  }
}

/**
 * Download one file by id
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
exports.download = async (req, res) => {
  try {
    const routeSchema = yup.object().shape({
      id: yup.string().required(),
    })

    /** Request validation */
    const validationErrors = await req.validate(null, null, routeSchema, null)
    if (validationErrors) {
      return res
        .status(400)
        .json({ message: 'Validation error', errors: validationErrors })
    }

    const {
      params: { id },
    } = req

    const file = await File.findOne({ _id: id })

    const file_path = `${root_directory}${file?.path}`

    if (!file || (file && !fs.existsSync(file_path))) {
      return res.status(404).json({ message: 'File not found' })
    }

    return res.download(file_path)
  } catch (error) {
    return res
      .status(400)
      .send({ message: error?.message ?? 'Something went wrong' })
  }
}

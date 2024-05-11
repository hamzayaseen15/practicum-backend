const mongoose = require('mongoose')
const _ = require('lodash')

const FileModel = require('../models/File')

/**
 * @class UploadHelper
 * @description Upload files helper
 */
module.exports = class UploadHelper {
  /**
   * @method handleDocument
   * @description Handle upload of file and record it in files collection
   * @param {import('express').Request} request
   * @param {string} name
   * @param {string} path
   * @returns
   */
  static async handleDocument(request, name, path) {
    const file = _.get(request.files, name)

    if (!file) return { error: false, filename: null }

    const extension = /[^.]+$/.exec(file.name)
    let filename = `${new mongoose.Types.ObjectId()}.${extension}`
    filename = filename.replace(/ /g, '-')
    const uploadPath = path + filename
    const newFileName = root_directory + uploadPath

    const moveResponse = await file.mv(newFileName)
    if (moveResponse) return { error: true, message: 'Unable to upload file' }

    const fileResponse = await FileModel.create({
      original_name: file.name,
      name: filename,
      path: uploadPath,
      mimetype: file.mimetype,
      extension: `${extension}`,
      uploaded_by: request.user?._id ?? request.driver?._id,
    })

    // ^ @TODO add error logging
    return { error: false, filename, file: fileResponse }
  }

  /**
   * @method handleDeleteDocument
   * @description delete a file from storage and its entry from file model
   * @param {string} fileId
   * @returns
   */
  static async handleDeleteDocument(fileId) {
    try {
      const file = await FileModel.findOne({ _id: fileId })

      // deleting file from storage
      await this.handleDelete(file.path)

      // deleting file from file model in db
      await FileModel.deleteOne({ _id: fileId })

      return { error: false, message: 'Document deleted' }
    } catch (error) {
      return {
        error: true,
        message: error?.message ?? 'Error delete document',
        errorStack: error,
      }
    }
  }

  /**
   * @method handleDelete
   * @description delete a file
   * @param {string} path
   * @returns
   */
  static async handleDelete(path = '/public/images/') {
    const filePath = root_directory + path
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
      return true
    }
    return false
  }
}

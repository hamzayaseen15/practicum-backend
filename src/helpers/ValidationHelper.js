/**
 * @class UploadHelper
 * @description Upload files helper
 */
module.exports = class UploadHelper {
  /**
   * helper function to validate request data
   * @param {import('express').Request} req
   * @param {import('yup').Schema ?} schema
   * @returns
   */
  async validate(req, schema) {
    let validationErrors = []

    const data = {
      ...req.body,
      ...req.params,
      ...req.query,
      ...req.files
    }

    // validate the request data against the schema
    if (schema) {
      try {
        await schema.validate(data, { abortEarly: false })
      } catch (error) {
        validationErrors = [...validationErrors, ...error.errors]
      }
    }

    console.log({ validationErrors })

    // if there are any validation errors, return the array of errors
    if (validationErrors.length > 0) {
      return validationErrors
    }

    // if there are no validation errors, return null
    return null
  }
}

const ValidationHelper = require('../helpers/ValidationHelper')

const validator = new ValidationHelper()

/**
 * Validate Request
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
module.exports = async (req, res, next) => {
  /**
   * validate request data
   * @param {import('yup').Schema ?} schema
   * @returns
   */
  req.validate = async (schema) =>
    validator.validate(req, schema)
  next()
}

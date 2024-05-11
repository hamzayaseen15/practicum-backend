const jwt = require('jsonwebtoken')
const User = require('../models/User')

/**
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
module.exports = async (req, res, next) => {
  try {
    if (req.headers.authorization == null) {
      return res.status(401).json({ error: 'UNAUTHORIZED' })
    }

    const token = req.headers.authorization?.split(' ')[1]

    // verifying authorization token
    const data = jwt.verify(token, process.env.JWT_SECRET)

    const user = await User.findOne({ _id: data._id })
    if (!user) {
      return res.status(401).json({ error: 'UNAUTHORIZED' })
    }
    req.user = user

    return next()
  } catch (error) {
    console.log(error)
    if (error?.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'UNAUTHORIZED' })
    }
    return res.status(500).json({ message: error?.message ?? 'UNAUTHORIZED' })
  }
}

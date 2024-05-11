const authRouter = require('./auth')
const communityRouter = require('./community')
const eventRouter = require('./event')
const fileRouter = require('./file')
const resourceRouter = require('./resource')
const supportTicketRouter = require('./supportTicket')
const userRouter = require('./user')
const auth = require('../middlewares/auth')

/**
 * main app router
 * @param {import('express').Application} app
 */
const router = (app) => {
  app.use('/auth', authRouter)
  app.use('/communities', auth, communityRouter)
  app.use('/events', auth, eventRouter)
  app.use('/files', fileRouter)
  app.use('/resources', auth, resourceRouter)
  app.use('/support-tickets', auth, supportTicketRouter)
  app.use('/users', auth, userRouter)
  app.use('*', (req, res) =>
    res.status(404).json({ message: 'Path not found' })
  )
}

module.exports = router

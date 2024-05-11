const express = require('express')
const AuthController = require('../controllers/auth')

const router = express.Router()

router.post('/login', AuthController.login)
router.post('/register', AuthController.register)

router.post('/forgot-password', AuthController.forgotPassword)
router.post('/reset-password/:token', AuthController.resetPassword)

module.exports = router

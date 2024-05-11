const cors = require('cors')
const fileUpload = require('express-fileupload')
const express = require('express')
const morgan = require('morgan')
const path = require('path')
const requestValidator = require('../middlewares/request-validator')

/**
 * initialize common middleware in the app
 * @param {import('express').Application} app
 */
const initializeMiddleware = (app) => {
  // HTTP request logging in console
  app.use(morgan('dev'))

  // cors middleware to enabling pre-flight
  app.use(cors())

  // middleware to accept file in request body
  app.use(fileUpload({ createParentPath: true }))

  // for parsing application/xwww-
  app.use(express.urlencoded({ extended: true }))

  // To parse the incoming requests with JSON payloads
  app.use(express.json())

  // to add validate function in the request object
  app.use(requestValidator)

  app.use('/public', express.static(path.join(root_directory, 'public')))
}

module.exports = initializeMiddleware

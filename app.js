const createServer = require('./src/utils/server')
const initializeMiddleware = require('./src/utils/middleware')
const router = require('./src/router')
const initializeDatabaseConnection = require('./src/utils/database')

/**
 * Global Variables
 */
global.fs = require('fs')

global.root_directory = __dirname

const app = createServer()

// initializing connection with database
initializeDatabaseConnection()

// initializing common middleware
initializeMiddleware(app)

// initializing app router
router(app)

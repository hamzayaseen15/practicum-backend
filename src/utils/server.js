const express = require('express')

const dotenv = require('dotenv')

dotenv.config({ path: '.env' })

/**
 * initializes express application instance and returns it
 * @returns
 */
const createServer = () => {
  /**
   * initializing app instance
   */
  const app = express()

  // initializing server port to run
  const PORT = process.env.PORT || 5001

  // listen to the server port
  app.listen(PORT, () => {
    console.log(`server is running on port: ${PORT}`)
  })

  return app
}

module.exports = createServer

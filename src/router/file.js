const express = require('express')

const FileController = require('../controllers/file')

const router = express.Router()

router.get('/:id', FileController.show)
router.get('/:id/download', FileController.download)

module.exports = router

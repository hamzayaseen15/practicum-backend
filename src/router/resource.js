const express = require('express')

const ResourceController = require('../controllers/resource')

const router = express.Router()

router.get('/', ResourceController.index)

router.get('/:id', ResourceController.show)

router.post('/', ResourceController.store)

router.put('/:id', ResourceController.update)

router.delete('/:id', ResourceController.destroy)

module.exports = router

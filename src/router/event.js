const express = require('express')

const EventController = require('../controllers/event')

const router = express.Router()

router.get('/', EventController.index)

router.get('/:id', EventController.show)

router.post('/', EventController.store)

router.put('/:id', EventController.update)

router.delete('/:id', EventController.destroy)

module.exports = router

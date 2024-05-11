const express = require('express')

const SupportTicketController = require('../controllers/supportTicket')

const router = express.Router()

router.get('/', SupportTicketController.index)
router.get('/:id', SupportTicketController.show)
router.post('/', SupportTicketController.store)
router.put('/:id', SupportTicketController.update)
router.delete('/:id', SupportTicketController.destroy)

router.get('/:id/chat', SupportTicketController.chat)
router.post('/:id/chat', SupportTicketController.addMessage)

module.exports = router

const express = require('express');
const messageRouter = express.Router();
const messageController = require('../controllers/messageController');
const { authenticate } = require('../middlewares/authMiddleware');

// POST /api/messages
messageRouter.post('/', authenticate, messageController.sendMessage);

// GET /api/messages
messageRouter.get('/', authenticate, messageController.getMessages);

// GET /api/messages/:messageId
messageRouter.get('/:messageId', authenticate, messageController.getMessageById);

// DELETE /api/messages/:messageId
messageRouter.delete('/:messageId', messageController.deleteMessage);

module.exports = messageRouter;
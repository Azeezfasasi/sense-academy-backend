const express = require('express');
const emailRouter = express.Router();
const { authenticate } = require('../middlewares/authMiddleware');
const authorize = require('../middlewares/roleMiddleware');

// POST /api/email/send
emailRouter.post('/api/email/send', authenticate, authorize('Admin'), emailController.sendEmail);
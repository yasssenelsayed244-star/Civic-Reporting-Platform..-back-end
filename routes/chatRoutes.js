const express = require('express');
const router = express.Router();
const { chat, getChatHistory } = require('../controllers/chatController');
const { auth, optionalAuth } = require('../middleware/auth');
const { chatLimiter } = require('../middleware/rateLimiter');

router.post('/', optionalAuth, chatLimiter, chat);
router.get('/history', auth, getChatHistory);

module.exports = router;

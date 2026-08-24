const express = require('express');
const router = express.Router();
const { register, login, getMe, updateProfile } = require('../controllers/authController');
const { auth } = require('../middleware/auth');
const { loginLimiter } = require('../middleware/rateLimiter');

router.post('/register', register);
router.post('/login', loginLimiter, login);
router.get('/me', auth, getMe);
router.patch('/profile', auth, updateProfile);

module.exports = router;

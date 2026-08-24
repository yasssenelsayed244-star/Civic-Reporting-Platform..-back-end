const rateLimit = require('express-rate-limit');

// Login rate limiter: 5 attempts per 15 minutes per IP
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    message: 'Too many login attempts. Please try again in 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Report creation limiter: 5 reports per 10 minutes per user
const reportLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  keyGenerator: (req) => req.user?.id || req.ip,
  message: {
    success: false,
    message: 'Too many reports. Please wait before creating another.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// General API limiter: 100 requests per 15 minutes
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    message: 'Too many requests. Please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Chat limiter: 20 messages per 5 minutes
const chatLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 20,
  keyGenerator: (req) => req.user?.id || req.ip,
  message: {
    success: false,
    message: 'Too many chat messages. Please slow down.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

module.exports = { loginLimiter, reportLimiter, apiLimiter, chatLimiter };

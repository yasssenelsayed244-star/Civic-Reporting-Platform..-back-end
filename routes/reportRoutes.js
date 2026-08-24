const express = require('express');
const router = express.Router();
const {
  createReport,
  getReports,
  getReportById,
  upvoteReport,
  deleteReport,
  submitFeedback,
  classifyReportDescription,
  getMyReports,
  getLeaderboard
} = require('../controllers/reportController');
const { auth, optionalAuth } = require('../middleware/auth');
const { uploadMiddleware } = require('../middleware/upload');
const { reportLimiter } = require('../middleware/rateLimiter');

// Public routes (with optional auth for upvote status)
router.get('/', optionalAuth, getReports);
router.get('/user/my-reports', auth, getMyReports);
router.get('/leaderboard', optionalAuth, getLeaderboard);
router.get('/:id', optionalAuth, getReportById);

// Protected routes
router.post('/', auth, reportLimiter, uploadMiddleware('image'), createReport);
router.post('/classify', auth, classifyReportDescription);
router.patch('/:id/upvote', auth, upvoteReport);
router.delete('/:id', auth, deleteReport);
router.post('/:id/feedback', auth, submitFeedback);

module.exports = router;

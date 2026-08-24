const express = require('express');
const router = express.Router();
const { updateReportStatus, getStats, getAdminReports } = require('../controllers/adminController');
const { auth } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleCheck');

// All admin routes require authentication + admin/supervisor role
router.use(auth, requireRole('admin', 'supervisor'));

router.patch('/reports/:id/status', updateReportStatus);
router.get('/stats', getStats);
router.get('/reports', getAdminReports);

module.exports = router;

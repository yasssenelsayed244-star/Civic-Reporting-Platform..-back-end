const { Report, User, StatusUpdate, Upvote, ReportFeedback } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('../config/db');
const { notifyStatusChange } = require('../services/notificationService');

// PATCH /api/admin/reports/:id/status
const updateReportStatus = async (req, res) => {
  try {
    const { status, note } = req.body;
    
    const validStatuses = ['new', 'under_review', 'in_progress', 'resolved', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    const report = await Report.findByPk(req.params.id, {
      include: [{ model: User, as: 'user', attributes: ['id', 'name'] }]
    });
    
    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found.' });
    }

    const oldStatus = report.status;
    
    if (oldStatus === status) {
      return res.status(400).json({ success: false, message: 'Report already has this status.' });
    }

    // Update status
    report.status = status;
    await report.save();

    // Log the status change
    await StatusUpdate.create({
      reportId: report.id,
      adminId: req.user.id,
      oldStatus,
      newStatus: status,
      note: note || null
    });

    // Send notification to report owner
    await notifyStatusChange(report.userId, report.id, report.title, oldStatus, status, note);

    // If resolving, update trust score of the reporter
    if (status === 'resolved') {
      const reporter = await User.findByPk(report.userId);
      if (reporter) {
        reporter.trustScore = Math.min(100, reporter.trustScore + 2);
        await reporter.save();
      }
    }

    // If rejecting as spam, decrease trust score
    if (status === 'rejected') {
      const reporter = await User.findByPk(report.userId);
      if (reporter) {
        reporter.trustScore = Math.max(0, reporter.trustScore - 5);
        await reporter.save();
      }
    }

    res.json({
      success: true,
      message: `Report status updated to "${status}".`,
      data: { report }
    });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// GET /api/admin/stats
const getStats = async (req, res) => {
  try {
    // Total reports count
    const totalReports = await Report.count();
    
    // Reports by status
    const byStatus = await Report.findAll({
      attributes: ['status', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
      group: ['status'],
      raw: true
    });

    // Reports by category
    const byCategory = await Report.findAll({
      attributes: ['category', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
      group: ['category'],
      raw: true
    });

    // Reports by neighborhood (top 10)
    const byNeighborhood = await Report.findAll({
      attributes: ['neighborhood', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
      where: { neighborhood: { [Op.not]: null } },
      group: ['neighborhood'],
      order: [[sequelize.fn('COUNT', sequelize.col('id')), 'DESC']],
      limit: 10,
      raw: true
    });

    // Reports created in the last 7 days (by day)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentReports = await Report.findAll({
      where: { createdAt: { [Op.gte]: sevenDaysAgo } },
      attributes: [
        [sequelize.fn('DATE', sequelize.col('createdAt')), 'date'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: [sequelize.fn('DATE', sequelize.col('createdAt'))],
      order: [[sequelize.fn('DATE', sequelize.col('createdAt')), 'ASC']],
      raw: true
    });

    // Resolution rate
    const resolvedCount = await Report.count({ where: { status: 'resolved' } });
    const resolutionRate = totalReports > 0 ? ((resolvedCount / totalReports) * 100).toFixed(1) : 0;

    // Confirmed resolved (with positive feedback)
    const confirmedResolved = await ReportFeedback.count({
      where: { wasResolved: true }
    });

    // Total users
    const totalUsers = await User.count();

    // Average resolution time (approximation)
    const avgResolutionData = await StatusUpdate.findAll({
      where: { newStatus: 'resolved' },
      attributes: ['reportId', 'createdAt'],
      raw: true
    });

    res.json({
      success: true,
      data: {
        totalReports,
        totalUsers,
        resolutionRate: parseFloat(resolutionRate),
        confirmedResolved,
        byStatus: byStatus.reduce((acc, item) => { acc[item.status] = parseInt(item.count); return acc; }, {}),
        byCategory: byCategory.reduce((acc, item) => { acc[item.category] = parseInt(item.count); return acc; }, {}),
        byNeighborhood: byNeighborhood.map(n => ({ name: n.neighborhood, count: parseInt(n.count) })),
        recentTrend: recentReports.map(r => ({ date: r.date, count: parseInt(r.count) }))
      }
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching stats.' });
  }
};

// GET /api/admin/reports
const getAdminReports = async (req, res) => {
  try {
    const { sort = 'newest', status, category, search, page = 1, limit = 20 } = req.query;
    
    const where = {};
    if (status) where.status = status;
    if (category) where.category = category;
    if (search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
        { neighborhood: { [Op.like]: `%${search}%` } }
      ];
    }

    let order;
    switch (sort) {
      case 'priority':
        order = [['upvoteCount', 'DESC'], ['createdAt', 'DESC']];
        break;
      case 'oldest':
        order = [['createdAt', 'ASC']];
        break;
      default: // newest
        order = [['createdAt', 'DESC']];
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows: reports } = await Report.findAndCountAll({
      where,
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'name', 'email', 'trustScore']
      }],
      order,
      limit: parseInt(limit),
      offset
    });

    res.json({
      success: true,
      data: {
        reports,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Admin reports error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { updateReportStatus, getStats, getAdminReports };

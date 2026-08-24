const { z } = require('zod');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');
const { Report, User, Upvote, StatusUpdate, ReportFeedback } = require('../models');
const { Op } = require('sequelize');
const { classifyReport, findDuplicates } = require('../services/aiService');
const { notifyReportCreated } = require('../services/notificationService');

const reportSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().min(10).max(2000),
  category: z.enum(['pothole', 'lighting', 'water_leak', 'garbage', 'other']),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  neighborhood: z.string().optional(),
  isAnonymous: z.boolean().optional()
});

// Save uploaded image locally (fallback when Cloudinary is not configured)
async function saveImageLocally(file) {
  const uploadsDir = path.join(__dirname, '..', 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  
  const ext = path.extname(file.originalname) || '.jpg';
  const filename = `${uuidv4()}${ext}`;
  const filepath = path.join(uploadsDir, filename);
  
  fs.writeFileSync(filepath, file.buffer);
  return `/uploads/${filename}`;
}

// POST /api/reports
const createReport = async (req, res) => {
  try {
    // Parse body - handle multipart form data string fields
    const body = {
      ...req.body,
      latitude: parseFloat(req.body.latitude),
      longitude: parseFloat(req.body.longitude),
      isAnonymous: req.body.isAnonymous === 'true' || req.body.isAnonymous === true
    };
    
    const data = reportSchema.parse(body);
    
    // Handle image upload
    let imageUrl = null;
    if (req.file) {
      imageUrl = await saveImageLocally(req.file);
    }

    // Check for geo-spam (same user, same area, within 2 hours)
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    const latDelta = 0.05 / 111;
    const lngDelta = 0.05 / (111 * Math.cos(data.latitude * Math.PI / 180));
    
    const recentNearby = await Report.findOne({
      where: {
        userId: req.user.id,
        createdAt: { [Op.gte]: twoHoursAgo },
        latitude: { [Op.between]: [data.latitude - latDelta, data.latitude + latDelta] },
        longitude: { [Op.between]: [data.longitude - lngDelta, data.longitude + lngDelta] }
      }
    });

    // Create the report
    const report = await Report.create({
      ...data,
      userId: req.user.id,
      imageUrl
    });

    // Send notification
    await notifyReportCreated(req.user.id, report.id, report.title);

    // Check for duplicates nearby
    const duplicates = await findDuplicates(
      data.description, data.latitude, data.longitude, data.category
    );

    res.status(201).json({
      success: true,
      message: 'Report created successfully.',
      data: {
        report,
        geoSpamWarning: recentNearby ? 'You have a recent report nearby. Please make sure this is not a duplicate.' : null,
        possibleDuplicates: duplicates.filter(d => d.id !== report.id).map(d => ({
          id: d.id,
          title: d.title,
          status: d.status,
          upvoteCount: d.upvoteCount
        }))
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error.',
        errors: error.errors.map(e => ({ field: e.path.join('.'), message: e.message }))
      });
    }
    console.error('Create report error:', error);
    res.status(500).json({ success: false, message: 'Server error creating report.' });
  }
};

// GET /api/reports
const getReports = async (req, res) => {
  try {
    const { category, status, neighborhood, page = 1, limit = 20, lat, lng, radius } = req.query;
    
    const where = {};
    
    if (category) where.category = category;
    if (status) where.status = status;
    if (neighborhood) where.neighborhood = { [Op.like]: `%${neighborhood}%` };
    
    // Geo bounds filter
    if (lat && lng && radius) {
      const latNum = parseFloat(lat);
      const lngNum = parseFloat(lng);
      const radiusKm = parseFloat(radius) || 5;
      const latDelta = radiusKm / 111;
      const lngDelta = radiusKm / (111 * Math.cos(latNum * Math.PI / 180));
      
      where.latitude = { [Op.between]: [latNum - latDelta, latNum + latDelta] };
      where.longitude = { [Op.between]: [lngNum - lngDelta, lngNum + lngDelta] };
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    const { count, rows: reports } = await Report.findAndCountAll({
      where,
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'name', 'avatar']
      }],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset
    });

    // Hide user info for anonymous reports
    const sanitizedReports = reports.map(r => {
      const report = r.toJSON();
      if (report.isAnonymous) {
        report.user = { id: null, name: 'Anonymous', avatar: null };
      }
      return report;
    });

    res.json({
      success: true,
      data: {
        reports: sanitizedReports,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching reports.' });
  }
};

// GET /api/reports/:id
const getReportById = async (req, res) => {
  try {
    const report = await Report.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'avatar']
        },
        {
          model: StatusUpdate,
          as: 'statusUpdates',
          include: [{
            model: User,
            as: 'admin',
            attributes: ['id', 'name']
          }],
          order: [['createdAt', 'ASC']]
        },
        {
          model: ReportFeedback,
          as: 'feedbacks',
          attributes: ['wasResolved', 'comment', 'createdAt']
        }
      ]
    });

    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found.' });
    }

    const reportData = report.toJSON();
    if (reportData.isAnonymous) {
      reportData.user = { id: null, name: 'Anonymous', avatar: null };
    }

    // Check if current user has upvoted
    let hasUpvoted = false;
    if (req.user) {
      const upvote = await Upvote.findOne({
        where: { reportId: report.id, userId: req.user.id }
      });
      hasUpvoted = !!upvote;
    }

    res.json({
      success: true,
      data: { report: reportData, hasUpvoted }
    });
  } catch (error) {
    console.error('Get report error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching report.' });
  }
};

// PATCH /api/reports/:id/upvote
const upvoteReport = async (req, res) => {
  try {
    const report = await Report.findByPk(req.params.id);
    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found.' });
    }

    // Check if already upvoted
    const existing = await Upvote.findOne({
      where: { reportId: report.id, userId: req.user.id }
    });

    if (existing) {
      // Remove upvote (toggle)
      await existing.destroy();
      report.upvoteCount = Math.max(0, report.upvoteCount - 1);
    } else {
      // Add upvote
      await Upvote.create({ reportId: report.id, userId: req.user.id });
      report.upvoteCount += 1;
    }

    // Recalculate priority
    report.recalculatePriority();
    await report.save();

    res.json({
      success: true,
      data: {
        upvoted: !existing,
        upvoteCount: report.upvoteCount,
        priority: report.priority
      }
    });
  } catch (error) {
    console.error('Upvote error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// DELETE /api/reports/:id
const deleteReport = async (req, res) => {
  try {
    const report = await Report.findByPk(req.params.id);
    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found.' });
    }

    // Only owner or admin can delete
    if (report.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this report.' });
    }

    await report.destroy();
    res.json({ success: true, message: 'Report deleted.' });
  } catch (error) {
    console.error('Delete report error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// POST /api/reports/:id/feedback
const submitFeedback = async (req, res) => {
  try {
    const { wasResolved, comment } = req.body;
    
    const report = await Report.findByPk(req.params.id);
    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found.' });
    }

    if (report.status !== 'resolved') {
      return res.status(400).json({ success: false, message: 'Can only submit feedback for resolved reports.' });
    }

    // Upsert feedback
    const [feedback, created] = await ReportFeedback.findOrCreate({
      where: { reportId: report.id, userId: req.user.id },
      defaults: { wasResolved, comment }
    });

    if (!created) {
      await feedback.update({ wasResolved, comment });
    }

    // Check if enough feedback to auto-reopen
    const allFeedback = await ReportFeedback.findAll({
      where: { reportId: report.id }
    });

    if (allFeedback.length >= 3) {
      const negativeCount = allFeedback.filter(f => !f.wasResolved).length;
      const negativeRatio = negativeCount / allFeedback.length;
      
      if (negativeRatio > 0.4) {
        // Auto-reopen the report
        const oldStatus = report.status;
        report.status = 'under_review';
        await report.save();
        
        await StatusUpdate.create({
          reportId: report.id,
          adminId: req.user.id,
          oldStatus,
          newStatus: 'under_review',
          note: 'Automatically reopened based on user feedback indicating the issue was not resolved.'
        });
      }
    }

    res.json({
      success: true,
      message: 'Feedback submitted. Thank you!',
      data: { feedback }
    });
  } catch (error) {
    console.error('Feedback error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// POST /api/reports/classify
const classifyReportDescription = async (req, res) => {
  try {
    const { description } = req.body;
    if (!description || description.length < 5) {
      return res.status(400).json({ success: false, message: 'Description too short.' });
    }

    const result = await classifyReport(description);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Classify error:', error);
    res.status(500).json({ success: false, message: 'Classification failed.' });
  }
};

// GET /api/reports/user/my-reports
const getMyReports = async (req, res) => {
  try {
    const reports = await Report.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']],
      include: [{
        model: StatusUpdate,
        as: 'statusUpdates',
        limit: 1,
        order: [['createdAt', 'DESC']]
      }]
    });

    res.json({ success: true, data: { reports } });
  } catch (error) {
    console.error('My reports error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// GET /api/reports/leaderboard
const getLeaderboard = async (req, res) => {
  try {
    const sequelize = require('../config/db');
    
    // 1. Get Top Neighborhoods by resolution rate
    // Group reports by neighborhood and calculate total reports, resolved reports, and resolution rate
    const neighborhoodStats = await Report.findAll({
      attributes: [
        'neighborhood',
        [sequelize.fn('COUNT', sequelize.col('id')), 'totalCount'],
        [sequelize.literal("SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END)"), 'resolvedCount']
      ],
      where: {
        neighborhood: { [Op.not]: null, [Op.ne]: '' }
      },
      group: ['neighborhood'],
      raw: true
    });

    const formattedNeighborhoods = neighborhoodStats.map(stat => {
      const total = parseInt(stat.totalCount) || 0;
      const resolved = parseInt(stat.resolvedCount) || 0;
      const rate = total > 0 ? parseFloat(((resolved / total) * 100).toFixed(1)) : 0;
      return {
        name: stat.neighborhood,
        totalCount: total,
        resolvedCount: resolved,
        resolutionRate: rate
      };
    }).sort((a, b) => b.resolutionRate - a.resolutionRate || b.totalCount - a.totalCount).slice(0, 10);

    // 2. Get Top 5 Users by trust score
    const topUsersRaw = await User.findAll({
      attributes: [
        'id',
        'name',
        'neighborhood',
        'trustScore',
        [sequelize.literal('(SELECT COUNT(*) FROM Reports WHERE Reports.userId = User.id)'), 'reportsCount']
      ],
      where: {
        role: 'citizen'
      },
      order: [['trustScore', 'DESC'], ['createdAt', 'ASC']],
      limit: 5
    });

    const formattedUsers = topUsersRaw.map(user => {
      const userData = user.toJSON();
      // Mask name for privacy (e.g. "John Doe" -> "John D.")
      const nameParts = userData.name.trim().split(/\s+/);
      let maskedName = userData.name;
      if (nameParts.length > 1) {
        maskedName = `${nameParts[0]} ${nameParts[1].charAt(0).toUpperCase()}.`;
      } else if (nameParts.length === 1 && nameParts[0].length > 3) {
        maskedName = `${nameParts[0].substring(0, nameParts[0].length - 2)}**`;
      }
      return {
        id: userData.id,
        name: maskedName,
        neighborhood: userData.neighborhood || 'Unknown',
        trustScore: userData.trustScore,
        reportsCount: parseInt(userData.reportsCount) || 0
      };
    });

    res.json({
      success: true,
      data: {
        neighborhoods: formattedNeighborhoods,
        users: formattedUsers
      }
    });
  } catch (error) {
    console.error('Leaderboard error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching leaderboard.' });
  }
};

module.exports = {
  createReport,
  getReports,
  getReportById,
  upvoteReport,
  deleteReport,
  submitFeedback,
  classifyReportDescription,
  getMyReports,
  getLeaderboard
};

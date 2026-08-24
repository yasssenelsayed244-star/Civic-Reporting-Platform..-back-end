const { ChatMessage, Report } = require('../models');
const { chatWithUser } = require('../services/aiService');

// POST /api/chat
const chat = async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Message is required.'
      });
    }

    // Build user context
    let userContext = null;
    if (req.user) {
      const reportsCount = await Report.count({ where: { userId: req.user.id } });
      const recentReports = await Report.findAll({
        where: { userId: req.user.id },
        limit: 3,
        order: [['createdAt', 'DESC']],
        attributes: ['id', 'title', 'status', 'category']
      });

      userContext = {
        userName: req.user.name,
        reportsCount,
        recentReports: recentReports.map(r => ({
          title: r.title,
          status: r.status,
          category: r.category
        }))
      };
    }

    // Get AI response
    const response = await chatWithUser(message.trim(), userContext);

    // Save conversation
    await ChatMessage.create({
      userId: req.user?.id || null,
      message: message.trim(),
      response
    });

    res.json({
      success: true,
      data: { response }
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({
      success: false,
      message: 'Chat service temporarily unavailable.'
    });
  }
};

// GET /api/chat/history
const getChatHistory = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }

    const messages = await ChatMessage.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']],
      limit: 50
    });

    res.json({
      success: true,
      data: { messages: messages.reverse() }
    });
  } catch (error) {
    console.error('Chat history error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { chat, getChatHistory };

const { Notification } = require('../models');

// Store io instance for real-time notifications
let io = null;

function setSocketIO(socketIO) {
  io = socketIO;
}

/**
 * Create a notification and optionally emit via Socket.io
 */
async function notify(userId, type, title, message, payload = null) {
  try {
    const notification = await Notification.create({
      userId,
      type,
      title,
      message,
      payload
    });

    // Emit real-time notification if Socket.io is available
    if (io) {
      io.to(`user:${userId}`).emit('notification', {
        id: notification.id,
        type,
        title,
        message,
        payload,
        isRead: false,
        createdAt: notification.createdAt
      });
    }

    return notification;
  } catch (error) {
    console.error('Notification error:', error.message);
    return null;
  }
}

/**
 * Notify about a report status change
 */
async function notifyStatusChange(userId, reportId, reportTitle, oldStatus, newStatus, adminNote) {
  return notify(
    userId,
    'status_change',
    'Report Status Updated',
    `Your report "${reportTitle}" status changed from "${oldStatus}" to "${newStatus}".${adminNote ? ` Note: ${adminNote}` : ''}`,
    { reportId, oldStatus, newStatus }
  );
}

/**
 * Notify about upvotes (batched — called periodically, not per-upvote)
 */
async function notifyUpvote(userId, reportId, reportTitle, upvoteCount) {
  return notify(
    userId,
    'upvote',
    'New Upvotes!',
    `Your report "${reportTitle}" now has ${upvoteCount} upvotes.`,
    { reportId, upvoteCount }
  );
}

/**
 * Notify about feedback request (3 days after resolution)
 */
async function notifyFeedbackRequest(userId, reportId, reportTitle) {
  return notify(
    userId,
    'feedback_request',
    'Was your issue resolved?',
    `Your report "${reportTitle}" was marked as resolved. Was the issue actually fixed?`,
    { reportId }
  );
}

/**
 * Notify about report creation confirmation
 */
async function notifyReportCreated(userId, reportId, reportTitle) {
  return notify(
    userId,
    'report_created',
    'Report Received',
    `Your report "${reportTitle}" has been received and is being reviewed.`,
    { reportId }
  );
}

module.exports = {
  setSocketIO,
  notify,
  notifyStatusChange,
  notifyUpvote,
  notifyFeedbackRequest,
  notifyReportCreated
};

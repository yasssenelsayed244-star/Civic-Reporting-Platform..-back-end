const User = require('./User');
const Report = require('./Report');
const Upvote = require('./Upvote');
const StatusUpdate = require('./StatusUpdate');
const ChatMessage = require('./ChatMessage');
const Notification = require('./Notification');
const ReportFeedback = require('./ReportFeedback');

// ─── User <-> Report ───
User.hasMany(Report, { foreignKey: 'userId', as: 'reports' });
Report.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// ─── Report <-> Upvote ───
Report.hasMany(Upvote, { foreignKey: 'reportId', as: 'upvotes' });
Upvote.belongsTo(Report, { foreignKey: 'reportId' });

// ─── User <-> Upvote ───
User.hasMany(Upvote, { foreignKey: 'userId', as: 'userUpvotes' });
Upvote.belongsTo(User, { foreignKey: 'userId' });

// ─── Report <-> StatusUpdate ───
Report.hasMany(StatusUpdate, { foreignKey: 'reportId', as: 'statusUpdates' });
StatusUpdate.belongsTo(Report, { foreignKey: 'reportId' });

// ─── User (admin) <-> StatusUpdate ───
User.hasMany(StatusUpdate, { foreignKey: 'adminId', as: 'adminUpdates' });
StatusUpdate.belongsTo(User, { foreignKey: 'adminId', as: 'admin' });

// ─── User <-> ChatMessage ───
User.hasMany(ChatMessage, { foreignKey: 'userId', as: 'chatMessages' });
ChatMessage.belongsTo(User, { foreignKey: 'userId' });

// ─── User <-> Notification ───
User.hasMany(Notification, { foreignKey: 'userId', as: 'notifications' });
Notification.belongsTo(User, { foreignKey: 'userId' });

// ─── Report <-> ReportFeedback ───
Report.hasMany(ReportFeedback, { foreignKey: 'reportId', as: 'feedbacks' });
ReportFeedback.belongsTo(Report, { foreignKey: 'reportId' });

// ─── User <-> ReportFeedback ───
User.hasMany(ReportFeedback, { foreignKey: 'userId', as: 'userFeedbacks' });
ReportFeedback.belongsTo(User, { foreignKey: 'userId' });

module.exports = {
  User,
  Report,
  Upvote,
  StatusUpdate,
  ChatMessage,
  Notification,
  ReportFeedback
};

const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const ReportFeedback = sequelize.define('ReportFeedback', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  reportId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  wasResolved: {
    type: DataTypes.BOOLEAN,
    allowNull: false
  },
  comment: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  timestamps: true,
  updatedAt: false,
  indexes: [
    {
      unique: true,
      fields: ['reportId', 'userId']
    }
  ]
});

module.exports = ReportFeedback;

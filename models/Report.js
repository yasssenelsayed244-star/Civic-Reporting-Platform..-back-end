const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Report = sequelize.define('Report', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: { len: [3, 200] }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: { len: [10, 2000] }
  },
  category: {
    type: DataTypes.ENUM('pothole', 'lighting', 'water_leak', 'garbage', 'other'),
    allowNull: false
  },
  imageUrl: {
    type: DataTypes.STRING,
    allowNull: true
  },
  latitude: {
    type: DataTypes.FLOAT,
    allowNull: false,
    validate: { min: -90, max: 90 }
  },
  longitude: {
    type: DataTypes.FLOAT,
    allowNull: false,
    validate: { min: -180, max: 180 }
  },
  neighborhood: {
    type: DataTypes.STRING,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('new', 'under_review', 'in_progress', 'resolved', 'rejected'),
    defaultValue: 'new'
  },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high'),
    defaultValue: 'low'
  },
  upvoteCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  isAnonymous: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  imageModerationStatus: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    defaultValue: 'approved'
  }
}, {
  timestamps: true
});

// Auto-compute priority based on upvote count
Report.prototype.recalculatePriority = function() {
  if (this.upvoteCount >= 20) {
    this.priority = 'high';
  } else if (this.upvoteCount >= 5) {
    this.priority = 'medium';
  } else {
    this.priority = 'low';
  }
};

module.exports = Report;

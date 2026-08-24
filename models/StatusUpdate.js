const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const StatusUpdate = sequelize.define('StatusUpdate', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  reportId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  adminId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  oldStatus: {
    type: DataTypes.STRING,
    allowNull: false
  },
  newStatus: {
    type: DataTypes.STRING,
    allowNull: false
  },
  note: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  timestamps: true,
  updatedAt: false
});

module.exports = StatusUpdate;

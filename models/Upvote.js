const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Upvote = sequelize.define('Upvote', {
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

module.exports = Upvote;

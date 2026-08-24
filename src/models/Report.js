const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Report = sequelize.define('Report', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'users', key: 'id' },
    },
    categoryId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'categories', key: 'id' },
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    // Location stored as separate lat/lng (no PostGIS dependency)
    latitude: {
      type: DataTypes.DOUBLE,
      allowNull: false,
    },
    longitude: {
      type: DataTypes.DOUBLE,
      allowNull: false,
    },
    address: {
      type: DataTypes.STRING(300),
      allowNull: true,
    },
    neighborhood: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('pending', 'under_review', 'assigned', 'in_progress', 'resolved', 'closed'),
      defaultValue: 'pending',
      allowNull: false,
    },
    priority: {
      type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
      defaultValue: 'low',
      allowNull: false,
    },
    isAnonymous: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    assignedTo: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: 'users', key: 'id' },
    },
  }, {
    tableName: 'reports',
    timestamps: true,
  });

  Report.associate = (models) => {
    Report.belongsTo(models.User, { foreignKey: 'userId', as: 'reporter' });
    Report.belongsTo(models.User, { foreignKey: 'assignedTo', as: 'assignee' });
    Report.belongsTo(models.Category, { foreignKey: 'categoryId', as: 'category' });
    Report.hasMany(models.ReportImage, { foreignKey: 'reportId', as: 'images' });
    Report.hasMany(models.ReportStatusHistory, { foreignKey: 'reportId', as: 'statusHistory' });
    Report.hasMany(models.ResolutionFeedback, { foreignKey: 'reportId', as: 'feedbacks' });
  };

  return Report;
};

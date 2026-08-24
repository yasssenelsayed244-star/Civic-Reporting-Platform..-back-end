const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ReportStatusHistory = sequelize.define('ReportStatusHistory', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    reportId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'reports', key: 'id' },
      onDelete: 'CASCADE',
    },
    changedBy: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'users', key: 'id' },
    },
    previousStatus: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    newStatus: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    reason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
  }, {
    tableName: 'report_status_history',
    timestamps: true,
    updatedAt: false, // Immutable records — no updates
  });

  ReportStatusHistory.associate = (models) => {
    ReportStatusHistory.belongsTo(models.Report, { foreignKey: 'reportId', as: 'report' });
    ReportStatusHistory.belongsTo(models.User, { foreignKey: 'changedBy', as: 'changedByUser' });
  };

  return ReportStatusHistory;
};

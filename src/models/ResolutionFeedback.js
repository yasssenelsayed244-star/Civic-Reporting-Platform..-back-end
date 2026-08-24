const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ResolutionFeedback = sequelize.define('ResolutionFeedback', {
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
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'users', key: 'id' },
    },
    wasResolved: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  }, {
    tableName: 'resolution_feedback',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['reportId', 'userId'],
        name: 'resolution_feedback_report_user_unique',
      },
    ],
  });

  ResolutionFeedback.associate = (models) => {
    ResolutionFeedback.belongsTo(models.Report, { foreignKey: 'reportId', as: 'report' });
    ResolutionFeedback.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
  };

  return ResolutionFeedback;
};

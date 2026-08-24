const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const AuditLog = sequelize.define('AuditLog', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: 'users', key: 'id' },
      comment: 'Nullable for system-generated actions',
    },
    action: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    resourceType: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    resourceId: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    previousValue: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    newValue: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    ipAddress: {
      type: DataTypes.STRING(45),
      allowNull: true,
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
  }, {
    tableName: 'audit_logs',
    timestamps: true,
    updatedAt: false, // Immutable audit records
  });

  AuditLog.associate = (models) => {
    AuditLog.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
  };

  return AuditLog;
};

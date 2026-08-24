const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM('citizen', 'admin', 'supervisor'),
      defaultValue: 'citizen',
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    neighborhood: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    avatar: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
    },
  }, {
    tableName: 'users',
    timestamps: true,
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          user.password = await bcrypt.hash(user.password, 12);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('password')) {
          user.password = await bcrypt.hash(user.password, 12);
        }
      },
    },
  });

  User.prototype.validatePassword = async function (password) {
    return bcrypt.compare(password, this.password);
  };

  User.prototype.toSafeJSON = function () {
    const values = { ...this.get() };
    delete values.password;
    return values;
  };

  User.associate = (models) => {
    User.hasMany(models.Report, { foreignKey: 'userId', as: 'reports' });
    User.hasMany(models.Notification, { foreignKey: 'userId', as: 'notifications' });
    User.hasMany(models.ResolutionFeedback, { foreignKey: 'userId', as: 'feedbacks' });
    User.hasMany(models.AuditLog, { foreignKey: 'userId', as: 'auditLogs' });
    User.hasMany(models.RefreshToken, { foreignKey: 'userId', as: 'refreshTokens' });
  };

  return User;
};

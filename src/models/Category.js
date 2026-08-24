const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Category = sequelize.define('Category', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      comment: 'Machine-readable slug, e.g. "pothole"',
    },
    label: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: 'Human-readable label, e.g. "Pothole / حفرة"',
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    icon: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'Icon identifier for frontend rendering',
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
    },
  }, {
    tableName: 'categories',
    timestamps: true,
  });

  Category.associate = (models) => {
    Category.hasMany(models.Report, { foreignKey: 'categoryId', as: 'reports' });
  };

  return Category;
};

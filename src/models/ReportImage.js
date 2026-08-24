const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ReportImage = sequelize.define('ReportImage', {
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
    url: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    publicId: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'Cloudinary public_id for deletion/transformations',
    },
    originalName: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    mimeType: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    sizeBytes: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    order: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  }, {
    tableName: 'report_images',
    timestamps: true,
  });

  ReportImage.associate = (models) => {
    ReportImage.belongsTo(models.Report, { foreignKey: 'reportId', as: 'report' });
  };

  return ReportImage;
};

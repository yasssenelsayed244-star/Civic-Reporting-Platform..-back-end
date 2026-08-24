'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // ─── Enable uuid-ossp extension ─────────────────────
    await queryInterface.sequelize.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');

    // ─── 1. Users ──────────────────────────────────────
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('uuid_generate_v4()'),
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true,
      },
      password: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      role: {
        type: Sequelize.ENUM('citizen', 'admin', 'supervisor'),
        defaultValue: 'citizen',
        allowNull: false,
      },
      phone: {
        type: Sequelize.STRING(20),
        allowNull: true,
      },
      neighborhood: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      avatar: {
        type: Sequelize.STRING(500),
        allowNull: true,
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false,
        field: 'isActive',
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('NOW()'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('NOW()'),
      },
    });

    // ─── 2. Categories ─────────────────────────────────
    await queryInterface.createTable('categories', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('uuid_generate_v4()'),
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true,
      },
      label: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      icon: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false,
        field: 'isActive',
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('NOW()'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('NOW()'),
      },
    });

    // ─── 3. Reports ────────────────────────────────────
    await queryInterface.createTable('reports', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('uuid_generate_v4()'),
        primaryKey: true,
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
        field: 'userId',
      },
      categoryId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'categories', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
        field: 'categoryId',
      },
      title: {
        type: Sequelize.STRING(200),
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      // Location as separate lat/lng columns (no PostGIS dependency)
      latitude: {
        type: Sequelize.DOUBLE,
        allowNull: false,
      },
      longitude: {
        type: Sequelize.DOUBLE,
        allowNull: false,
      },
      address: {
        type: Sequelize.STRING(300),
        allowNull: true,
      },
      neighborhood: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM('pending', 'under_review', 'assigned', 'in_progress', 'resolved', 'closed'),
        defaultValue: 'pending',
        allowNull: false,
      },
      priority: {
        type: Sequelize.ENUM('low', 'medium', 'high', 'critical'),
        defaultValue: 'low',
        allowNull: false,
      },
      isAnonymous: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false,
        field: 'isAnonymous',
      },
      assignedTo: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        field: 'assignedTo',
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('NOW()'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('NOW()'),
      },
    });

    // B-tree indexes
    await queryInterface.addIndex('reports', ['status'], { name: 'reports_status_idx' });
    await queryInterface.addIndex('reports', ['categoryId'], { name: 'reports_category_idx' });
    await queryInterface.addIndex('reports', ['userId'], { name: 'reports_user_idx' });
    await queryInterface.addIndex('reports', ['createdAt'], { name: 'reports_created_at_idx' });
    await queryInterface.addIndex('reports', ['latitude', 'longitude'], { name: 'reports_lat_lng_idx' });

    // ─── 4. Report Images ──────────────────────────────
    await queryInterface.createTable('report_images', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('uuid_generate_v4()'),
        primaryKey: true,
      },
      reportId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'reports', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        field: 'reportId',
      },
      url: {
        type: Sequelize.STRING(500),
        allowNull: false,
      },
      publicId: {
        type: Sequelize.STRING(255),
        allowNull: true,
        field: 'publicId',
      },
      originalName: {
        type: Sequelize.STRING(255),
        allowNull: true,
        field: 'originalName',
      },
      mimeType: {
        type: Sequelize.STRING(50),
        allowNull: true,
        field: 'mimeType',
      },
      sizeBytes: {
        type: Sequelize.INTEGER,
        allowNull: true,
        field: 'sizeBytes',
      },
      order: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        field: 'order',
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('NOW()'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('NOW()'),
      },
    });

    await queryInterface.addIndex('report_images', ['reportId'], { name: 'report_images_report_idx' });

    // ─── 5. Report Status History ──────────────────────
    await queryInterface.createTable('report_status_history', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('uuid_generate_v4()'),
        primaryKey: true,
      },
      reportId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'reports', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        field: 'reportId',
      },
      changedBy: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
        field: 'changedBy',
      },
      previousStatus: {
        type: Sequelize.STRING(20),
        allowNull: false,
        field: 'previousStatus',
      },
      newStatus: {
        type: Sequelize.STRING(20),
        allowNull: false,
        field: 'newStatus',
      },
      reason: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      metadata: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('NOW()'),
      },
    });

    await queryInterface.addIndex('report_status_history', ['reportId'], { name: 'status_history_report_idx' });

    // ─── 6. Notifications ──────────────────────────────
    await queryInterface.createTable('notifications', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('uuid_generate_v4()'),
        primaryKey: true,
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        field: 'userId',
      },
      type: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      title: {
        type: Sequelize.STRING(200),
        allowNull: false,
      },
      message: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      payload: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
      isRead: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false,
        field: 'isRead',
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('NOW()'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('NOW()'),
      },
    });

    await queryInterface.addIndex('notifications', ['userId', 'isRead'], { name: 'notifications_user_read_idx' });

    // ─── 7. Resolution Feedback ────────────────────────
    await queryInterface.createTable('resolution_feedback', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('uuid_generate_v4()'),
        primaryKey: true,
      },
      reportId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'reports', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        field: 'reportId',
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
        field: 'userId',
      },
      wasResolved: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        field: 'wasResolved',
      },
      comment: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('NOW()'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('NOW()'),
      },
    });

    await queryInterface.addIndex('resolution_feedback', ['reportId', 'userId'], {
      unique: true,
      name: 'resolution_feedback_report_user_unique',
    });

    // ─── 8. Audit Logs ─────────────────────────────────
    await queryInterface.createTable('audit_logs', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('uuid_generate_v4()'),
        primaryKey: true,
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        field: 'userId',
      },
      action: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      resourceType: {
        type: Sequelize.STRING(50),
        allowNull: false,
        field: 'resourceType',
      },
      resourceId: {
        type: Sequelize.STRING(255),
        allowNull: true,
        field: 'resourceId',
      },
      previousValue: {
        type: Sequelize.JSONB,
        allowNull: true,
        field: 'previousValue',
      },
      newValue: {
        type: Sequelize.JSONB,
        allowNull: true,
        field: 'newValue',
      },
      ipAddress: {
        type: Sequelize.STRING(45),
        allowNull: true,
        field: 'ipAddress',
      },
      metadata: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('NOW()'),
      },
    });

    await queryInterface.addIndex('audit_logs', ['userId'], { name: 'audit_logs_user_idx' });
    await queryInterface.addIndex('audit_logs', ['resourceType', 'resourceId'], { name: 'audit_logs_resource_idx' });
    await queryInterface.addIndex('audit_logs', ['createdAt'], { name: 'audit_logs_created_at_idx' });

    // ─── 9. Refresh Tokens ─────────────────────────────
    await queryInterface.createTable('refresh_tokens', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('uuid_generate_v4()'),
        primaryKey: true,
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        field: 'userId',
      },
      token: {
        type: Sequelize.STRING(500),
        allowNull: false,
        unique: true,
      },
      expiresAt: {
        type: Sequelize.DATE,
        allowNull: false,
        field: 'expiresAt',
      },
      isRevoked: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false,
        field: 'isRevoked',
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('NOW()'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('NOW()'),
      },
    });

    await queryInterface.addIndex('refresh_tokens', ['userId'], { name: 'refresh_tokens_user_idx' });
  },

  async down(queryInterface) {
    // Drop in reverse dependency order
    await queryInterface.dropTable('refresh_tokens');
    await queryInterface.dropTable('audit_logs');
    await queryInterface.dropTable('resolution_feedback');
    await queryInterface.dropTable('notifications');
    await queryInterface.dropTable('report_status_history');
    await queryInterface.dropTable('report_images');
    await queryInterface.dropTable('reports');
    await queryInterface.dropTable('categories');
    await queryInterface.dropTable('users');
  },
};

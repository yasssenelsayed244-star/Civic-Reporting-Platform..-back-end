'use strict';

const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    // ─── Seed Categories ────────────────────────────────
    const categories = [
      {
        id: uuidv4(),
        name: 'pothole',
        label: 'Pothole / حفرة في الطريق',
        description: 'Road surface damage including potholes, cracks, and crumbling pavement',
        icon: 'circle-alert',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        name: 'broken_streetlight',
        label: 'Broken Streetlight / عمود إنارة معطل',
        description: 'Non-functioning, flickering, or damaged street lights',
        icon: 'lightbulb-off',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        name: 'water_leak',
        label: 'Water Leak / تسريب مياه',
        description: 'Water pipe leaks, burst mains, or visible water waste',
        icon: 'droplets',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        name: 'garbage',
        label: 'Garbage / نفايات',
        description: 'Uncollected garbage, overflowing bins, or illegal dumping',
        icon: 'trash-2',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        name: 'damaged_sidewalk',
        label: 'Damaged Sidewalk / رصيف متضرر',
        description: 'Broken, cracked, or hazardous sidewalks and walkways',
        icon: 'footprints',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        name: 'sewage',
        label: 'Sewage Issue / مشكلة صرف صحي',
        description: 'Blocked drains, sewage overflow, or drainage problems',
        icon: 'waves',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        name: 'traffic_sign',
        label: 'Traffic Sign / لافتة مرور',
        description: 'Damaged, missing, or obscured traffic signs and signals',
        icon: 'triangle-alert',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        name: 'other',
        label: 'Other / أخرى',
        description: 'Infrastructure issues not covered by other categories',
        icon: 'more-horizontal',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    await queryInterface.bulkInsert('categories', categories);

    // ─── Seed Default Admin ─────────────────────────────
    const hashedPassword = await bcrypt.hash('admin123', 12);

    await queryInterface.bulkInsert('users', [
      {
        id: uuidv4(),
        name: 'Admin',
        email: 'admin@civic.com',
        password: hashedPassword,
        role: 'admin',
        neighborhood: 'Downtown',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('users', { email: 'admin@civic.com' });
    await queryInterface.bulkDelete('categories', null, {});
  },
};

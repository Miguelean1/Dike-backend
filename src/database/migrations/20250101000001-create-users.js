'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tables = await queryInterface.showAllTables();
    if (tables.includes('users')) return;
    await queryInterface.createTable('users', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      email: { type: Sequelize.STRING(100), allowNull: false, unique: true },
      password: { type: Sequelize.STRING(255), allowNull: false },
      username: { type: Sequelize.STRING(100), allowNull: false },
      profile_picture: { type: Sequelize.STRING(255) },
      bio: { type: Sequelize.TEXT },
      role: { type: Sequelize.ENUM('visitor', 'user', 'admin'), defaultValue: 'user' },
      reputation: { type: Sequelize.INTEGER, defaultValue: 0 },
      registration_date: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
    });
  },

  down: async (queryInterface) => {
    const tables = await queryInterface.showAllTables();
    if (!tables.includes('users')) return;
    await queryInterface.dropTable('users');
  },
};

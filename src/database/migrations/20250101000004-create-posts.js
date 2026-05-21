'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tables = await queryInterface.showAllTables();
    if (tables.includes('posts')) return;
    await queryInterface.createTable('posts', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      user_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
      title: { type: Sequelize.STRING(200), allowNull: false },
      description: { type: Sequelize.TEXT, allowNull: false },
      category: { type: Sequelize.STRING(100), allowNull: false },
      image: { type: Sequelize.STRING(255) },
      type: { type: Sequelize.ENUM('loan', 'donation', 'exchange'), allowNull: false },
      status: { type: Sequelize.ENUM('active', 'completed', 'cancelled'), defaultValue: 'active' },
      creation_date: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
    });
  },

  down: async (queryInterface) => {
    const tables = await queryInterface.showAllTables();
    if (!tables.includes('posts')) return;
    await queryInterface.dropTable('posts');
  },
};

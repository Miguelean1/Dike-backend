'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tables = await queryInterface.showAllTables();
    if (tables.includes('categories')) return;
    await queryInterface.createTable('categories', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      name: { type: Sequelize.STRING(100), allowNull: false, unique: true },
      description: { type: Sequelize.TEXT },
    });
  },

  down: async (queryInterface) => {
    const tables = await queryInterface.showAllTables();
    if (!tables.includes('categories')) return;
    await queryInterface.dropTable('categories');
  },
};

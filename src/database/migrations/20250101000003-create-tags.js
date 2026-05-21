'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tables = await queryInterface.showAllTables();
    if (tables.includes('tags')) return;
    await queryInterface.createTable('tags', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      name: { type: Sequelize.STRING(50), allowNull: false, unique: true },
    });
  },

  down: async (queryInterface) => {
    const tables = await queryInterface.showAllTables();
    if (!tables.includes('tags')) return;
    await queryInterface.dropTable('tags');
  },
};

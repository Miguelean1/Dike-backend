'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tables = await queryInterface.showAllTables();
    if (tables.includes('requests')) return;
    await queryInterface.createTable('requests', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      post_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'posts', key: 'id' }, onDelete: 'CASCADE' },
      requester_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
      status: { type: Sequelize.ENUM('pending', 'accepted', 'rejected'), defaultValue: 'pending' },
      message: { type: Sequelize.TEXT },
      return_date: { type: Sequelize.DATEONLY },
      request_date: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
    });
  },

  down: async (queryInterface) => {
    const tables = await queryInterface.showAllTables();
    if (!tables.includes('requests')) return;
    await queryInterface.dropTable('requests');
  },
};

'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tables = await queryInterface.showAllTables();
    if (tables.includes('post_tags')) return;
    await queryInterface.createTable('post_tags', {
      post_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'posts', key: 'id' }, onDelete: 'CASCADE' },
      tag_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'tags', key: 'id' }, onDelete: 'CASCADE' },
    });
  },

  down: async (queryInterface) => {
    const tables = await queryInterface.showAllTables();
    if (!tables.includes('post_tags')) return;
    await queryInterface.dropTable('post_tags');
  },
};

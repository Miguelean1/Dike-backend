'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tables = await queryInterface.showAllTables();
    if (tables.includes('ratings')) return;
    await queryInterface.createTable('ratings', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      rated_user_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
      rating_user_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
      post_id: { type: Sequelize.INTEGER, references: { model: 'posts', key: 'id' }, onDelete: 'SET NULL' },
      score: { type: Sequelize.INTEGER },
      comment: { type: Sequelize.TEXT },
      rating_date: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
    });
  },

  down: async (queryInterface) => {
    const tables = await queryInterface.showAllTables();
    if (!tables.includes('ratings')) return;
    await queryInterface.dropTable('ratings');
  },
};

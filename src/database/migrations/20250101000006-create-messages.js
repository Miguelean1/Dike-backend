'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tables = await queryInterface.showAllTables();
    if (tables.includes('messages')) return;
    await queryInterface.createTable('messages', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      sender_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
      receiver_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
      content: { type: Sequelize.TEXT, allowNull: false },
      sent_date: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      read_status: { type: Sequelize.BOOLEAN, defaultValue: false },
    });
  },

  down: async (queryInterface) => {
    const tables = await queryInterface.showAllTables();
    if (!tables.includes('messages')) return;
    await queryInterface.dropTable('messages');
  },
};

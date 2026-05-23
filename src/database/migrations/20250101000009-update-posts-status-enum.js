'use strict';

module.exports = {
  up: async (queryInterface) => {
    // Expand ENUM to include both old and new values before migrating data
    await queryInterface.sequelize.query(
      "ALTER TABLE posts MODIFY COLUMN status ENUM('active','completed','cancelled','available','borrowed','reserved') DEFAULT 'active'"
    );
    await queryInterface.sequelize.query(
      "UPDATE posts SET status = 'available' WHERE status = 'active'"
    );
    await queryInterface.sequelize.query(
      "UPDATE posts SET status = 'borrowed' WHERE status = 'completed'"
    );
    await queryInterface.sequelize.query(
      "UPDATE posts SET status = 'available' WHERE status = 'cancelled'"
    );
    // Now remove old values
    await queryInterface.sequelize.query(
      "ALTER TABLE posts MODIFY COLUMN status ENUM('available','borrowed','reserved') DEFAULT 'available'"
    );
  },

  down: async (queryInterface) => {
    await queryInterface.sequelize.query(
      "ALTER TABLE posts MODIFY COLUMN status ENUM('active','completed','cancelled','available','borrowed','reserved') DEFAULT 'available'"
    );
    await queryInterface.sequelize.query(
      "UPDATE posts SET status = 'active' WHERE status = 'available'"
    );
    await queryInterface.sequelize.query(
      "UPDATE posts SET status = 'completed' WHERE status = 'borrowed'"
    );
    await queryInterface.sequelize.query(
      "UPDATE posts SET status = 'active' WHERE status = 'reserved'"
    );
    await queryInterface.sequelize.query(
      "ALTER TABLE posts MODIFY COLUMN status ENUM('active','completed','cancelled') DEFAULT 'active'"
    );
  },
};

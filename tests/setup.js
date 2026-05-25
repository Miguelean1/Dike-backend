const sequelize = require('../src/config/database');

beforeAll(async () => {
  await sequelize.sync({ force: true });
});

afterEach(async () => {
  await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
  await sequelize.query('DELETE FROM ratings');
  await sequelize.query('DELETE FROM requests');
  await sequelize.query('DELETE FROM messages');
  await sequelize.query('DELETE FROM post_tags');
  await sequelize.query('DELETE FROM posts');
  await sequelize.query('DELETE FROM users');
  await sequelize.query('DELETE FROM categories');
  await sequelize.query('DELETE FROM tags');
  await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
});

afterAll(async () => {
  await sequelize.close();
});

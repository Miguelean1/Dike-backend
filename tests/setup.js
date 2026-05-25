const sequelize = require('../src/config/database');

beforeAll(async () => {
  await sequelize.sync({ force: true });
});

afterEach(async () => {
  await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
  for (const model of Object.values(sequelize.models)) {
    await model.destroy({ where: {}, truncate: true });
  }
  await sequelize.query('DELETE FROM post_tags');
  await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
});

afterAll(async () => {
  await sequelize.close();
});

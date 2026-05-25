require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const sequelize = require('./src/config/database');
const app = require('./src/app');

const PORT = process.env.PORT || 3001;

sequelize.authenticate()
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error('Database connection failed:', err.message);
    process.exit(1);
  });

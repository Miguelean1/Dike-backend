require('dotenv').config();
const express = require('express');
const sequelize = require('./src/config/database');

const authRoutes = require('./src/routes/auth.routes');
const usersRoutes = require('./src/routes/users.routes');
const postsRoutes = require('./src/routes/posts.routes');
const messagesRoutes = require('./src/routes/messages.routes');
const ratingsRoutes = require('./src/routes/ratings.routes');
const categoriesRoutes = require('./src/routes/categories.routes');
const tagsRoutes = require('./src/routes/tags.routes');

const app = express();
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/posts', postsRoutes);
app.use('/api/messages', messagesRoutes);
app.use('/api/ratings', ratingsRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/tags', tagsRoutes);

const PORT = process.env.PORT || 3001;

sequelize.authenticate()
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error('Database connection failed:', err.message);
    process.exit(1);
  });

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Post = sequelize.define('Post', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  title: { type: DataTypes.STRING(200), allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: false },
  category: { type: DataTypes.STRING(100), allowNull: false },
  image: { type: DataTypes.STRING(255) },
  type: { type: DataTypes.ENUM('loan', 'donation', 'exchange'), allowNull: false },
  status: { type: DataTypes.ENUM('active', 'completed', 'cancelled'), defaultValue: 'active' },
  creation_date: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, {
  tableName: 'posts',
  timestamps: false,
});

module.exports = Post;

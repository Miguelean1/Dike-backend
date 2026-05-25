const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  email: { type: DataTypes.STRING(100), allowNull: false, unique: true },
  password: { type: DataTypes.STRING(255), allowNull: false },
  username: { type: DataTypes.STRING(100), allowNull: false },
  profile_picture: { type: DataTypes.STRING(255) },
  bio: { type: DataTypes.TEXT },
  role: { type: DataTypes.ENUM('visitor', 'user', 'admin'), defaultValue: 'user' },
  reputation: { type: DataTypes.INTEGER, defaultValue: 0 },
  registration_date: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  email_verified: { type: DataTypes.BOOLEAN, defaultValue: false },
  verification_token: { type: DataTypes.STRING(64), allowNull: true },
  reset_token: { type: DataTypes.STRING(64), allowNull: true },
  reset_token_expires: { type: DataTypes.DATE, allowNull: true },
}, {
  tableName: 'users',
  timestamps: false,
});

module.exports = User;

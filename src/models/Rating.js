const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Rating = sequelize.define('Rating', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  rated_user_id: { type: DataTypes.INTEGER, allowNull: false },
  rating_user_id: { type: DataTypes.INTEGER, allowNull: false },
  post_id: { type: DataTypes.INTEGER },
  score: { type: DataTypes.INTEGER },
  comment: { type: DataTypes.TEXT },
  rating_date: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, {
  tableName: 'ratings',
  timestamps: false,
});

module.exports = Rating;

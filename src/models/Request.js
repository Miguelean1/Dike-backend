const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Request = sequelize.define('Request', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  post_id: { type: DataTypes.INTEGER, allowNull: false },
  requester_id: { type: DataTypes.INTEGER, allowNull: false },
  status: { type: DataTypes.ENUM('pending', 'accepted', 'rejected'), defaultValue: 'pending' },
  message: { type: DataTypes.TEXT },
  return_date: { type: DataTypes.DATEONLY },
  request_date: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, {
  tableName: 'requests',
  timestamps: false,
});

module.exports = Request;

const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const User = require('./user');

const Task = sequelize.define('Task', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: true },
  status: { type: DataTypes.ENUM('Pending', 'In Progress', 'Completed'), defaultValue: 'Pending' },
  dueDate: { type: DataTypes.DATEONLY, allowNull: true }
});

User.hasMany(Task, { onDelete: 'CASCADE' });
Task.belongsTo(User);

module.exports = Task;

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Contact = sequelize.define('Contact', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  },
  first_name: { type: DataTypes.STRING(100), allowNull: false },
  last_name: { type: DataTypes.STRING(100), allowNull: false },
  email: { type: DataTypes.STRING(150), allowNull: false, unique: true, validate: { isEmail: true } },
  date_of_birth: { type: DataTypes.DATEONLY, allowNull: true },
  photo_url: { type: DataTypes.TEXT, allowNull: true }
}, {
  tableName: 'contacts',
  timestamps: true
});

module.exports = Contact;

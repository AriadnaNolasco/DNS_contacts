const sequelize = require('../config/database');
const Contact = require('./contact');

async function init() {
  await sequelize.authenticate();
  await sequelize.sync({ alter: true }); // crea/actualiza tablas
  console.log('DB connected and models synced');
}

module.exports = { sequelize, Contact, init };

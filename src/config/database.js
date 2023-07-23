const Sequelize = require('sequelize');

const { DB_NAME, DB_USER, DB_PASS } = require('./constants');

const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASS, {
  dialect: 'sqlite',
  storage: './database.sqlite',
});

module.exports = sequelize;

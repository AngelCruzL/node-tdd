const Sequelize = require('sequelize');

const { DB_NAME, DB_USER, DB_PASS, NODE_ENV } = require('./constants');
const isInTestEnv = NODE_ENV === 'test';

const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASS, {
  dialect: 'sqlite',
  storage: isInTestEnv ? ':memory:' : 'database.sqlite',
  logging: false,
});

module.exports = sequelize;

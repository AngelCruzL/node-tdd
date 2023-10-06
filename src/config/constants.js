require('dotenv').config();

const {
  DB_HOST,
  DB_USER,
  DB_PASS,
  DB_NAME,
  PORT,
  NODE_ENV,
  EMAIL_HOST,
  EMAIL_PORT,
  EMAIL_USER,
  EMAIL_PASS,
} = process.env;

module.exports = {
  DB_HOST,
  DB_USER,
  DB_PASS,
  DB_NAME,
  PORT,
  NODE_ENV,
  EMAIL_HOST,
  EMAIL_PORT,
  EMAIL_USER,
  EMAIL_PASS,
  DEFAULT_USERS_PER_PAGE: 10,
};

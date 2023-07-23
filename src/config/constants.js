require('dotenv').config();

const { DB_HOST, DB_USER, DB_PASS, DB_NAME, PORT, NODE_ENV } = process.env;

module.exports = {
  DB_HOST,
  DB_USER,
  DB_PASS,
  DB_NAME,
  PORT,
  NODE_ENV,
};

const nodemailer = require('nodemailer');

const {
  NODE_ENV,
  EMAIL_HOST,
  EMAIL_PORT,
  EMAIL_USER,
  EMAIL_PASS,
} = require('./constants');

let mailConfig;

if (NODE_ENV === 'test') {
  mailConfig = {
    host: 'localhost',
    port: 8587,
    tls: {
      rejectUnauthorized: false,
    },
  };
} else {
  mailConfig = {
    host: EMAIL_HOST,
    port: EMAIL_PORT,
    secure: false,
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS,
    },
  };
}

const transporter = nodemailer.createTransport({ ...mailConfig });

module.exports = transporter;

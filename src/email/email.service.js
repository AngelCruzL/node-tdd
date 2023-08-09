const transporter = require('../config/email-transporter');
const { EMAIL_USER } = require('../config/constants');

async function sendActivationEmail(email, username, token) {
  // TODO: Fix the link in the email
  const emailInformation = await transporter.sendMail({
    from: EMAIL_USER,
    to: email,
    subject: 'Account activation',
    html: `Hello ${username},
    <br/>
    To activate your account visit 
    <a href='http://localhost:3000/api/1.0/users/token/${token}'>
    this link
    </a>`,
  });

  if (process.env.NODE_ENV === 'development') {
    const nodemailer = require('nodemailer');
    console.log(
      'Mocked email URL: ' + nodemailer.getTestMessageUrl(emailInformation),
    );
    console.log({ emailInformation });
  }
}

module.exports = { sendActivationEmail };

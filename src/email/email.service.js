const transporter = require('../config/email-transporter');

async function sendActivationEmail(email, username, token) {
  // TODO: Fix the link in the email
  const emailInformation = await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Account activation',
    html: `Hello ${username},
    <br/>
    To activate your account visit 
    <a href='http://localhost:3000/api/1.0/users/token/${token}'>
    this link
    </a>`,
  });

  if (process.env.NODE_ENV !== 'production') {
    console.log({ emailInformation });
  }
}

module.exports = { sendActivationEmail };

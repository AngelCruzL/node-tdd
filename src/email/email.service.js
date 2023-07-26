const transporter = require('../config/email-transporter');

async function sendActivationEmail(email, token) {
  await transporter.sendMail({
    from: 'Node API <node_tdd@angelcruzl.dev>',
    to: email,
    subject: 'Account activation',
    html: `Hello,<br/>To activate your account use this token <strong>${token}</strong>`,
  });
}

module.exports = { sendActivationEmail };

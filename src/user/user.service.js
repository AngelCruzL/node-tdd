const bcrypt = require('bcrypt');
const crypto = require('crypto');

const sequelize = require('../config/database');
const EmailException = require('../email/email.exception');
const InvalidTokenException = require('./invalid-token.exception');
const EmailService = require('../email/email.service');
const User = require('./User');

async function save({ username, email, password }) {
  const hashedPassword = await bcrypt.hash(password, 10);
  const transaction = await sequelize.transaction();
  const user = {
    username,
    email,
    password: hashedPassword,
    activationToken: generateActivationToken(16),
  };

  await User.create(user, { transaction });
  try {
    await EmailService.sendActivationEmail(
      email,
      user.username,
      user.activationToken,
    );
    await transaction.commit();
  } catch (err) {
    await transaction.rollback();
    throw new EmailException();
  }
}

async function findByEmail(email) {
  return await User.findOne({ where: { email } });
}

function generateActivationToken(length) {
  return crypto.randomBytes(length).toString('hex').substring(0, length);
}

async function activate(activationToken) {
  const user = await User.findOne({ where: { activationToken } });
  if (!user) throw new InvalidTokenException();

  user.inactive = false;
  user.activationToken = null;
  await user.save();
}

module.exports = { save, findByEmail, activate };

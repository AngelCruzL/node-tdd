const bcrypt = require('bcrypt');

const User = require('./User');

async function save(body) {
  const hashedPassword = await bcrypt.hash(body.password, 10);
  // const user = { ...body, password: hashedPassword };
  const user = Object.assign({}, body, { password: hashedPassword });
  await User.create(user);
}

module.exports = { save };

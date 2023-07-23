const express = require('express');
const bcrypt = require('bcrypt');

const User = require('./models/User');

const app = express();

app.use(express.json());

app.post('/api/1.0/users', (req, res) => {
  bcrypt.hash(req.body.password, 10).then(hashedPassword => {
    // const user = {
    //   ...req.body,
    //   password: hashedPassword,
    // };
    const user = Object.assign({}, req.body, { password: hashedPassword });

    User.create(user).then(() => {
      return res.send({ message: 'User created successfully' });
    });
  });
});

module.exports = app;

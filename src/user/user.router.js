const router = require('express').Router();

const UserService = require('./user.service');

function validateUsername(req, res, next) {
  const user = req.body;

  if (user.username === null) {
    req.validationErrors = {
      username: 'Username cannot be null',
    };
  }
  next();
}

function validateEmail(req, res, next) {
  const user = req.body;

  if (user.email === null) {
    req.validationErrors = {
      ...req.validationErrors,
      email: 'Email cannot be null',
    };
  }
  next();
}

router.post('', validateUsername, validateEmail, async (req, res) => {
  if (req.validationErrors) {
    return res.status(400).send({ validationErrors: req.validationErrors });
  }

  await UserService.save(req.body);

  return res.send({ message: 'User created successfully' });
});

module.exports = router;

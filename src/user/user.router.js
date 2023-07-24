const router = require('express').Router();
const { check, validationResult } = require('express-validator');

const UserService = require('./user.service');

router.post(
  '',
  check('username').notEmpty().withMessage('Username cannot be null'),
  check('email').notEmpty().withMessage('Email cannot be null'),
  check('password').notEmpty().withMessage('Password cannot be null'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const validationErrors = {};
      errors
        .array()
        .forEach(error => (validationErrors[error.path] = error.msg));

      return res.status(400).send({ validationErrors });
    }

    await UserService.save(req.body);

    return res.send({ message: 'User created successfully' });
  },
);

module.exports = router;

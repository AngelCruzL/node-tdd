const router = require('express').Router();
const { check, validationResult } = require('express-validator');

const UserService = require('./user.service');

router.post(
  '',
  check('username')
    .notEmpty()
    .withMessage('username_null_error_message')
    .bail()
    .isLength({ min: 4, max: 32 })
    .withMessage('username_size_error_message'),
  check('email')
    .notEmpty()
    .withMessage('email_null_error_message')
    .bail()
    .isEmail()
    .withMessage('email_invalid_error_message')
    .bail()
    .custom(async email => {
      const user = await UserService.findByEmail(email);
      if (user) throw new Error('email_inuse_error_message');
    }),
  check('password')
    .notEmpty()
    .withMessage('password_null_error_message')
    .bail()
    .isLength({ min: 6 })
    .withMessage('password_size_error_message')
    .bail()
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{6,}$/)
    .withMessage('password_pattern_error_message'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const validationErrors = {};
      errors
        .array()
        .forEach(error => (validationErrors[error.path] = req.t(error.msg)));

      return res.status(400).send({ validationErrors });
    }

    await UserService.save(req.body);

    return res.send({ message: req.t('user_create_success_message') });
  },
);

module.exports = router;

const router = require('express').Router();
const { check, validationResult } = require('express-validator');

const ValidationException = require('../error/validation.exception');
const { pagination } = require('../middlewares/pagination');
const UserService = require('./user.service');
const UserNotFoundException = require('./user-not-found.exception');

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
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new ValidationException(errors.array()));
    }

    try {
      await UserService.save(req.body);
      return res.send({ message: req.t('user_create_success_message') });
    } catch (err) {
      next(err);
    }
  },
);

router.post('/token/:token', async (req, res, next) => {
  const { token } = req.params;

  try {
    await UserService.activate(token);
    return res.send({ message: req.t('account_activation_success_message') });
  } catch (err) {
    next(err);
  }
});

router.get('', pagination, async (req, res) => {
  const { page, size } = req.pagination;
  const users = await UserService.getUsers(page, size);
  res.send(users);
});

router.get('/:id', async (req, res, next) => {
  try {
    const user = await UserService.getUser(req.params.id);
    res.send(user);
  } catch (err) {
    next(new UserNotFoundException());
  }
});

module.exports = router;

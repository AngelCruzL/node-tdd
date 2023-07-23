const router = require('express').Router();

const UserService = require('./user.service');

router.post('', async (req, res) => {
  const user = req.body;

  if (user.username === null)
    return res.status(400).send({
      validationErrors: {
        username: 'Username cannot be null',
      },
    });

  await UserService.save(req.body);

  return res.send({ message: 'User created successfully' });
});

module.exports = router;

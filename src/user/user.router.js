const router = require('express').Router();

const UserService = require('./user.service');

router.post('', async (req, res) => {
  await UserService.save(req.body);

  return res.send({ message: 'User created successfully' });
});

module.exports = router;

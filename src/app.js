const express = require('express');

const userRouter = require('./user/user.router');

const app = express();

app.use(express.json());

app.use('/api/1.0/users', userRouter);

module.exports = app;

const request = require('supertest');

const app = require('../src/app');
const sequelize = require('../src/config/database');
const User = require('../src/user/User');

beforeAll(() => sequelize.sync());

beforeEach(() => User.destroy({ truncate: true }));

const username = 'user1';
const email = 'user1@mail.com';
const password = 'Secret123';

const validUser = {
  username,
  email,
  password,
};

const postUser = (user = validUser) => {
  return request(app).post('/api/1.0/users').send(user);
};

describe('User register', () => {
  it('should return 200 OK when signup request is valid', async () => {
    const response = await postUser();

    expect(response.status).toBe(200);
  });

  it('should return a success message when the signup request is valid', async () => {
    const response = await postUser();

    expect(response.body.message).toBe('User created successfully');
  });

  it('should save the user on database', async () => {
    await postUser();
    const users = await User.findAll();

    expect(users.length).toBe(1);
  });

  it('should send user data match with inserted user data', async () => {
    await postUser();
    const users = await User.findAll();
    const insertedUser = users[0];

    expect(insertedUser.username).toBe(username);
    expect(insertedUser.email).toBe(email);
  });

  it('should store hashed user password in database', async () => {
    await postUser();
    const users = await User.findAll();
    const insertedUser = users[0];

    expect(insertedUser.password).not.toBe(password);
  });

  it('should return 400 when username is null', async () => {
    const response = await postUser({
      username: null,
      email,
      password,
    });

    expect(response.status).toBe(400);
  });

  it('should return the validationErrors field in response body when validation error occurs', async () => {
    const response = await postUser({
      username: null,
      email,
      password,
    });
    const body = response.body;

    expect(body.validationErrors).not.toBeUndefined();
  });

  it('should return Username cannot be null when username is null', async () => {
    const response = await postUser({
      username: null,
      email,
      password,
    });
    const body = response.body;

    expect(body.validationErrors.username).toBe('Username cannot be null');
  });

  it('should return Email cannot be null when email is null', async () => {
    const response = await postUser({
      username,
      email: null,
      password,
    });
    const body = response.body;

    expect(body.validationErrors.email).toBe('Email cannot be null');
  });

  it('should return validation errors for username and email if both are null', async () => {
    const response = await postUser({
      username: null,
      email: null,
      password,
    });
    const body = response.body;

    expect(Object.keys(body.validationErrors)).toEqual(['username', 'email']);
  });
});

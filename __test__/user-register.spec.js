const request = require('supertest');

const app = require('../src/app');
const sequelize = require('../src/config/database');
const User = require('../src/user/User');

beforeAll(() => sequelize.sync());

beforeEach(() => User.destroy({ truncate: true }));

describe('User register', () => {
  const username = 'user1';
  const email = 'user1@mail.com';
  const password = 'Secret123';

  const postValidUser = () => {
    return request(app).post('/api/1.0/users').send({
      username,
      email,
      password,
    });
  };

  it('should return 200 OK when signup request is valid', async () => {
    const response = await postValidUser();

    expect(response.status).toBe(200);
  });

  it('should return a success message when the signup request is valid', async () => {
    const response = await postValidUser();

    expect(response.body.message).toBe('User created successfully');
  });

  it('should save the user on database', async () => {
    await postValidUser();
    const users = await User.findAll();

    expect(users.length).toBe(1);
  });

  it('should send user data match with inserted user data', async () => {
    await postValidUser();
    const users = await User.findAll();
    const insertedUser = users[0];

    expect(insertedUser.username).toBe(username);
    expect(insertedUser.email).toBe(email);
  });

  it('should store hashed user password in database', async () => {
    await postValidUser();
    const users = await User.findAll();
    const insertedUser = users[0];
    
    expect(insertedUser.password).not.toBe(password);
  });
});

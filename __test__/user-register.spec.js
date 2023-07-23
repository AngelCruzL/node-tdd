const request = require('supertest');

const app = require('../src/app');
const sequelize = require('../src/config/database');
const User = require('../src/models/User');

beforeAll(() => sequelize.sync());

beforeEach(() => User.destroy({ truncate: true }));

describe('User register', () => {
  it('should return 200 OK when signup request is valid', done => {
    request(app)
      .post('/api/1.0/users')
      .send({
        username: 'user1',
        email: 'user1@mail.com',
        password: 'Secret123',
      })
      .then(response => {
        expect(response.status).toBe(200);
        done();
      });
  });

  it('should return a success message when the signup request is valid', done => {
    request(app)
      .post('/api/1.0/users')
      .send({
        username: 'user1',
        email: 'user1@mail.com',
        password: 'Secret123',
      })
      .then(response => {
        expect(response.body.message).toBe('User created successfully');
        done();
      });
  });

  it('should save the user on database', done => {
    request(app)
      .post('/api/1.0/users')
      .send({
        username: 'user1',
        email: 'user1@mail.com',
        password: 'Secret123',
      })
      .then(() => {
        User.findAll().then(users => {
          expect(users.length).toBe(1);
          done();
        });
      });
  });

  it('should send user data match with inserted user data', done => {
    const username = 'user1';
    const email = 'user1@mail.com';

    request(app)
      .post('/api/1.0/users')
      .send({
        username,
        email,
        password: 'Secret123',
      })
      .then(() => {
        User.findAll().then(users => {
          const insertedUser = users[0];
          expect(insertedUser.username).toBe(username);
          expect(insertedUser.email).toBe(email);
          done();
        });
      });
  });

  it('should store hashed user password in database', done => {
    const username = 'user1';
    const email = 'user1@mail.com';
    const password = 'Secret123';

    request(app)
      .post('/api/1.0/users')
      .send({ username, email, password })
      .then(() => {
        User.findAll().then(users => {
          const insertedUser = users[0];

          expect(insertedUser.username).toBe(username);
          expect(insertedUser.email).toBe(email);
          expect(insertedUser.password).not.toBe(password);
          done();
        });
      });
  });
});

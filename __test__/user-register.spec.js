const request = require('supertest');
const app = require('../src/app');

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
});

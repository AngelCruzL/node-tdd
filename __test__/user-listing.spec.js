const request = require('supertest');

const app = require('../src/app');
const sequelize = require('../src/config/database');
const User = require('../src/user/User');

beforeAll(async () => {
  await sequelize.sync();
});

beforeEach(() => {
  return User.destroy({ truncate: true });
});

const getUsers = async queryArgs => {
  if (!queryArgs) return request(app).get('/api/1.0/users');

  return request(app).get('/api/1.0/users').query(queryArgs);
};

const addUsers = async (activeUserCount, inactiveUserCount = 0) => {
  for (let i = 0; i < activeUserCount + inactiveUserCount; i++) {
    await User.create({
      username: `user${i + 1}`,
      email: `user${i + 1}@test.com`,
      inactive: i >= activeUserCount,
    });
  }
};

describe('Listing Users', () => {
  it('returns 200 ok when there are no users in database', async () => {
    const response = await getUsers();

    expect(response.status).toBe(200);
  });

  it('should return a page object as response body', async () => {
    const response = await getUsers();

    expect(response.body).toEqual({
      content: [],
      page: 0,
      size: 10,
      totalPages: 0,
    });
  });

  it('should return only id, username & email in content array for each user', async () => {
    await addUsers(11);
    const response = await getUsers();
    const user = response.body.content[0];

    expect(Object.keys(user)).toEqual(['id', 'username', 'email']);
  });

  it('should return 10 users in page content when we have 11 or more users in database', async () => {
    await addUsers(11);
    const response = await getUsers();

    expect(response.body.content.length).toBe(10);
  });

  it('should return 6 users in page content when there are active 6 users and inactive 5 users in database', async () => {
    await addUsers(6, 5);
    const response = await getUsers();

    expect(response.body.content.length).toBe(6);
  });

  it('should return "2" as totalPages value when we have more than 10 active users', async () => {
    await addUsers(11, 5);
    const response = await getUsers();

    expect(response.body.totalPages).toBe(2);
  });

  it('should return a second users page and page indicator when page is set as 1 in request parameter', async () => {
    await addUsers(11);
    const response = await getUsers({ page: 1 });

    expect(response.body.content[0].username).toBe('user11');
    expect(response.body.page).toBe(1);
  });

  it('should return first page when page is set below zero as request parameter', async () => {
    await addUsers(11);
    const response = await getUsers({ page: -5 });

    expect(response.body.page).toBe(0);
  });

  it('should return 5 users and corresponding size indicator when size is set as 5 in request parameter', async () => {
    await addUsers(11);
    const response = await getUsers({ size: 5 });

    expect(response.body.content.length).toBe(5);
    expect(response.body.size).toBe(5);
  });

  it('should return 10 users and corresponding size indicator when size is set to 1000', async () => {
    await addUsers(11);
    const response = await getUsers({ size: 1000 });

    expect(response.body.content.length).toBe(10);
    expect(response.body.size).toBe(10);
  });

  it('should return 10 users and corresponding size indicator when size is set to 0', async () => {
    await addUsers(11);
    const response = await getUsers({ size: 0 });

    expect(response.body.content.length).toBe(10);
    expect(response.body.size).toBe(10);
  });

  it('should return page as 0 and size as 10 when non numeric query parameters had provided for both', async () => {
    await addUsers(11);
    const response = await getUsers({ size: 'size', page: 'page' });

    expect(response.body.page).toBe(0);
    expect(response.body.size).toBe(10);
  });
});

describe('Get User', () => {
  const getUser = async (id = 5) => {
    return request(app).get(`/api/1.0/users/${id}`);
  };

  it('should return a 404 status code when the user is not found', async () => {
    const response = await getUser();

    expect(response.status).toBe(404);
  });

  it.each`
    language | message
    ${'en'}  | ${'User not found'}
    ${'es'}  | ${'Usuario no encontrado'}
  `(
    'should return "$message" when the user is not found and language is set to "$language"',
    async ({ language, message }) => {
      const response = await request(app)
        .get('/api/1.0/users/5')
        .set('Accept-Language', language);

      expect(response.body.message).toBe(message);
    },
  );

  it('should return the proper error body when the user is not found', async () => {
    const nowInMillis = new Date().getTime();
    const response = await getUser();
    const error = response.body;

    expect(error.path).toBe('/api/1.0/users/5');
    expect(error.timestamp).toBeGreaterThanOrEqual(nowInMillis);
    expect(Object.keys(error)).toEqual(['path', 'timestamp', 'message']);
  });

  it('should return status 200 when an active user exist', async () => {
    const user = await User.create({
      username: 'user1',
      email: 'test1@mail.com',
      inactive: false,
    });
    const response = await getUser(user.id);

    expect(response.status).toBe(200);
  });

  it('should return "id", "username" & "email" when an active user exist', async () => {
    const user = await User.create({
      username: 'user1',
      email: 'test1@mail.com',
      inactive: false,
    });
    const response = await getUser(user.id);
    const { id, username, email } = response.body;

    expect(id).toBe(user.id);
    expect(username).toBe(user.username);
    expect(email).toBe(user.email);
  });

  it('should return status 404 when an inactive user is requested', async () => {
    const user = await User.create({
      username: 'user1',
      email: 'test1@mail.com',
      inactive: true,
    });
    const response = await getUser(user.id);

    expect(response.status).toBe(404);
  });
});

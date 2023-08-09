const request = require('supertest');
const SMTPServer = require('smtp-server').SMTPServer;

const app = require('../src/app');
const sequelize = require('../src/config/database');
const User = require('../src/user/User');

let lastMail, server;
let simulateSmtpFailure = false;

beforeAll(async () => {
  server = new SMTPServer({
    authOptional: true,
    onData(stream, session, callback) {
      let mailBody;
      stream.on('data', data => {
        mailBody += data.toString();
      });

      stream.on('end', () => {
        if (simulateSmtpFailure) {
          const err = new Error('Invalid mailbox');
          err.responseCode = 553;
          return callback(err);
        }

        lastMail = mailBody;
        callback();
      });
    },
  });

  await server.listen(8587, 'localhost');
  await sequelize.sync();
});

beforeEach(() => {
  simulateSmtpFailure = false;

  return User.destroy({ truncate: true });
});

afterAll(async () => {
  await server.close();
});

const username = 'user1';
const email = 'user1@mail.com';
const password = 'Secret123';

const validUser = {
  username,
  email,
  password,
};

const postUser = (user = validUser, options = {}) => {
  const agent = request(app).post('/api/1.0/users');
  if (options.language) agent.set('Accept-Language', options.language);

  return agent.send(user);
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

  it('should return validation errors for username and email if both are null', async () => {
    const response = await postUser({
      username: null,
      email: null,
      password,
    });
    const body = response.body;

    expect(Object.keys(body.validationErrors)).toEqual(['username', 'email']);
  });

  const username_null_error_message = 'Username cannot be null';
  const username_size_error_message = 'Must have min 4 and max 32 characters';
  const email_null_error_message = 'Email cannot be null';
  const email_invalid_error_message = 'Email is not valid';
  const email_inuse_error_message = 'Email already in use';
  const password_null_error_message = 'Password cannot be null';
  const password_size_error_message = 'Password must be at least 6 characters';
  const password_pattern_error_message =
    'Password must have at least 1 uppercase, 1 lowercase letter and 1 number';

  it.each`
    field         | value              | expectedMessage
    ${'username'} | ${null}            | ${username_null_error_message}
    ${'username'} | ${'usr'}           | ${username_size_error_message}
    ${'username'} | ${'a'.repeat(33)}  | ${username_size_error_message}
    ${'email'}    | ${null}            | ${email_null_error_message}
    ${'email'}    | ${'mail.com'}      | ${email_invalid_error_message}
    ${'email'}    | ${'user.mail.com'} | ${email_invalid_error_message}
    ${'password'} | ${null}            | ${password_null_error_message}
    ${'password'} | ${'P4ssw'}         | ${password_size_error_message}
    ${'password'} | ${'alllowercase'}  | ${password_pattern_error_message}
    ${'password'} | ${'ALLUPPERCASE'}  | ${password_pattern_error_message}
    ${'password'} | ${'1234567890'}    | ${password_pattern_error_message}
    ${'password'} | ${'lowerandUPPER'} | ${password_pattern_error_message}
    ${'password'} | ${'lower4nd123'}   | ${password_pattern_error_message}
    ${'password'} | ${'UPPER4ND123'}   | ${password_pattern_error_message}
  `(
    'should return "$expectedMessage" when $field is "$value"',
    async ({ field, value, expectedMessage }) => {
      const user = {
        username,
        email,
        password,
      };
      user[field] = value;
      const response = await postUser(user);
      const body = response.body;

      expect(body.validationErrors[field]).toBe(expectedMessage);
    },
  );

  it(`should return "${email_inuse_error_message}" when the email is in use`, async () => {
    await User.create({ ...validUser });
    const response = await postUser();

    expect(response.body.validationErrors.email).toBe(
      email_inuse_error_message,
    );
  });

  it('should return errors for username when has null value and email is already in use', async () => {
    await User.create({ ...validUser });
    const response = await postUser({
      username: null,
      email: validUser.email,
      password,
    });
    const body = response.body;

    expect(Object.keys(body.validationErrors)).toEqual(['username', 'email']);
  });

  it('should create an user on inactive mode', async () => {
    await postUser();
    const users = await User.findAll();
    const savedUser = users[0];

    expect(savedUser.inactive).toBeTruthy();
  });

  it('should create an user on inactive mode even if the request body contains inactive on false', async () => {
    await postUser({ ...validUser, inactive: false });
    const users = await User.findAll();
    const savedUser = users[0];

    expect(savedUser.inactive).toBeTruthy();
  });

  it('should create an activationToken for user', async () => {
    await postUser();
    const users = await User.findAll();
    const savedUser = users[0];

    expect(savedUser.activationToken).toBeTruthy();
  });

  it('should send an account activation email with activationToken', async () => {
    await postUser();
    const users = await User.findAll();
    const savedUser = users[0];

    expect(lastMail).toContain(email);
    expect(lastMail).toContain(savedUser.activationToken);
  });

  it('should return a 502 Bad Gateway when the email send fails', async () => {
    simulateSmtpFailure = true;
    const response = await postUser();

    expect(response.status).toBe(502);
  });

  it('should return "Error sending email" when the email send fails', async () => {
    simulateSmtpFailure = true;
    const response = await postUser();

    expect(response.body.message).toBe('Error sending email');
  });

  it('should not save the user in the database if the activation email fails', async () => {
    simulateSmtpFailure = true;
    await postUser();
    const users = await User.findAll();

    expect(users.length).toBe(0);
  });
});

describe('Internationalization', () => {
  const username_null_error_message = 'El usuario no puede estar vacío';
  const username_size_error_message =
    'El usuario debe tener entre 4 y 32 caracteres';
  const email_null_error_message = 'El correo electrónico no puede estar vacío';
  const email_invalid_error_message = 'El correo electrónico no es válido';
  const email_inuse_error_message = 'El correo electrónico ya está en uso';
  const password_null_error_message = 'La contraseña no puede estar vacía';
  const password_size_error_message =
    'La contraseña debe tener al menos 6 caracteres';
  const password_pattern_error_message =
    'La contraseña debe tener al menos 1 mayúscula, 1 minúscula y 1 número';
  const user_create_success_message = 'Usuario creado con éxito';
  const send_email_error_message = 'Error al enviar el correo electrónico';

  it.each`
    field         | value              | expectedMessage
    ${'username'} | ${null}            | ${username_null_error_message}
    ${'username'} | ${'usr'}           | ${username_size_error_message}
    ${'username'} | ${'a'.repeat(33)}  | ${username_size_error_message}
    ${'email'}    | ${null}            | ${email_null_error_message}
    ${'email'}    | ${'mail.com'}      | ${email_invalid_error_message}
    ${'email'}    | ${'user.mail.com'} | ${email_invalid_error_message}
    ${'password'} | ${null}            | ${password_null_error_message}
    ${'password'} | ${'P4ssw'}         | ${password_size_error_message}
    ${'password'} | ${'alllowercase'}  | ${password_pattern_error_message}
    ${'password'} | ${'ALLUPPERCASE'}  | ${password_pattern_error_message}
    ${'password'} | ${'1234567890'}    | ${password_pattern_error_message}
    ${'password'} | ${'lowerandUPPER'} | ${password_pattern_error_message}
    ${'password'} | ${'lower4nd123'}   | ${password_pattern_error_message}
    ${'password'} | ${'UPPER4ND123'}   | ${password_pattern_error_message}
  `(
    'should return "$expectedMessage" when $field is "$value" and the language is set to Spanish',
    async ({ field, value, expectedMessage }) => {
      const user = {
        username,
        email,
        password,
      };
      user[field] = value;
      const response = await postUser(user, { language: 'es' });
      const body = response.body;

      expect(body.validationErrors[field]).toBe(expectedMessage);
    },
  );

  it(`should return "${email_inuse_error_message}" when the email is in use and the language is set to Spanish`, async () => {
    await User.create({ ...validUser });
    const response = await postUser({ ...validUser }, { language: 'es' });

    expect(response.body.validationErrors.email).toBe(
      email_inuse_error_message,
    );
  });

  it(`should return "${user_create_success_message}" when the signup request is valid and the language is set to Spanish`, async () => {
    const response = await postUser({ ...validUser }, { language: 'es' });

    expect(response.body.message).toBe(user_create_success_message);
  });

  it(`should return "${send_email_error_message}" when the email send fails and the language is set to Spanish`, async () => {
    simulateSmtpFailure = true;
    const response = await postUser({ ...validUser }, { language: 'es' });

    expect(response.body.message).toBe(send_email_error_message);
  });
});

describe('Account activation', () => {
  it('should activate the account when the correct token is sent', async () => {
    await postUser();
    const users = await User.findAll();
    const token = users[0].activationToken;

    await request(app).post(`/api/1.0/users/token/${token}`).send();
    const usersAfterActivation = await User.findAll();
    const activatedUser = usersAfterActivation[0];

    expect(activatedUser.inactive).toBe(false);
  });

  it('should remove the token from the user table after successful activation', async () => {
    await postUser();
    const users = await User.findAll();
    const token = users[0].activationToken;

    await request(app).post(`/api/1.0/users/token/${token}`).send();
    const usersAfterActivation = await User.findAll();
    const activatedUser = usersAfterActivation[0];

    expect(activatedUser.activationToken).toBeFalsy();
  });

  it('should not activate the account when the token is wrong', async () => {
    await postUser();
    const token = 'this-token-does-not-exist';
    await request(app).post(`/api/1.0/users/token/${token}`).send();
    const usersAfterActivationAttempt = await User.findAll();

    expect(usersAfterActivationAttempt[0].inactive).toBe(true);
  });

  it('should return bad request when the token is wrong', async () => {
    await postUser();
    const token = 'this-token-does-not-exist';
    const response = await request(app)
      .post(`/api/1.0/users/token/${token}`)
      .send();

    expect(response.status).toBe(400);
  });

  it.each`
    languageKey | language     | tokenStatus  | message
    ${'en'}     | ${'english'} | ${'wrong'}   | ${'The account was not activated. Please check your token'}
    ${'es'}     | ${'spanish'} | ${'wrong'}   | ${'La cuenta no fue activada. Por favor, compruebe su token'}
    ${'en'}     | ${'english'} | ${'correct'} | ${'The account was activated successfully'}
    ${'es'}     | ${'spanish'} | ${'correct'} | ${'La cuenta fue activada satisfactoriamente'}
  `(
    'should return "$message" when token is wrong and language is set to $language',
    async ({ languageKey, tokenStatus, message }) => {
      await postUser();
      let token = 'this-token-does-not-exist';

      if (tokenStatus === 'correct') {
        const users = await User.findAll();
        token = users[0].activationToken;
      }

      const response = await request(app)
        .post(`/api/1.0/users/token/${token}`)
        .set('Accept-Language', languageKey)
        .send();

      expect(response.body.message).toBe(message);
    },
  );
});

import { User } from '@src/models/user';
import AuthService from '@src/services/auth';
import { ACCESS_TOKEN_HEADER } from '@src/middlewares/auth';

describe('users functional tests', () => {
  const newUser = {
    name: 'Jhon Doe',
    email: 'jhon@gmail.com',
    password: '12345678',
  };
  beforeEach(async () => {
    await User.deleteMany({});
  });
  describe('when creating a user', () => {
    it('should successfully create an user with enscrypted password', async () => {
      const response = await global.testRequest.post('/users').send(newUser);
      expect(response.status).toBe(201);
      await expect(
        AuthService.compare(newUser.password, response.body.password)
      ).resolves.toBeTruthy();
      expect(response.body).toEqual(
        expect.objectContaining({
          ...newUser,
          password: expect.any(String),
        })
      );
    });

    it('should return a 422 when there is a validation error', async () => {
      const invalidUser = {
        name: 'Jhon Doe',
        email: 'jhon@gmail.com',
        password: '',
      };

      const result = await global.testRequest.post('/users').send(invalidUser);
      expect(result.status).toBe(422);
      expect(result.body).toEqual({
        code: 422,
        error: 'Unprocessable Entity',
        message:
          'User validation failed: password: Path `password` is required.',
      });
    });

    it('should return 409 when the email already exists', async () => {
      await global.testRequest.post('/users').send(newUser);
      const response = await global.testRequest.post('/users').send(newUser);
      expect(response.status).toBe(409);
      expect(response.body).toEqual({
        code: 409,
        error: 'Conflict',
        message:
          'User validation failed: email: already exists in the database.',
      });
    });
  });

  describe('when authenticating', () => {
    it('should generate a token for a valid user', async () => {
      await global.testRequest.post('/users').send(newUser);
      const response = await global.testRequest
        .post('/users/authenticate')
        .send({ email: newUser.email, password: newUser.password });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        code: 200,
        token: expect.any(String),
      });
    });

    it('should return Unauthorized if the user with the given email is not found', async () => {
      const response = await global.testRequest
        .post('/users/authenticate')
        .send({ email: newUser.email, password: newUser.password });

      expect(response.status).toBe(401);
      expect(response.body).toEqual({
        code: 401,
        error: 'Unauthorized',
        message: 'Not found',
      });
    });

    it('should return Unauthorized if the user password does not match', async () => {
      const differentPassword = 'another_password';

      await global.testRequest.post('/users').send(newUser);
      const response = await global.testRequest
        .post('/users/authenticate')
        .send({ email: newUser.email, password: differentPassword });

      expect(response.status).toBe(401);
      expect(response.body).toEqual({
        code: 401,
        error: 'Unauthorized',
        message: 'Unauthorized',
      });
    });
  });

  describe('when getting user profile info', () => {
    it(`should return the token's user information`, async () => {
      const user = await User.create(newUser);
      const token = AuthService.generateToken(user.toJSON());

      const userInfoResponse = await global.testRequest
        .get('/users/me')
        .set(ACCESS_TOKEN_HEADER, token);

      expect(userInfoResponse.status).toBe(200);
      expect(userInfoResponse.body).toEqual({
        code: 200,
        info: {
          name: newUser.name,
          email: newUser.email,
        },
      });
    });
  });

  it(`should return not found if the user does not exists`, async () => {
    const token = AuthService.generateToken(newUser);

    const userInfoResponse = await global.testRequest
      .get('/users/me')
      .set(ACCESS_TOKEN_HEADER, token);

    expect(userInfoResponse.status).toBe(404);
    expect(userInfoResponse.body).toEqual({
      code: 404,
      error: 'Not Found',
      message: 'User not found',
    });
  });
});

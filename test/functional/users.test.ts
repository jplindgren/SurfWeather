import { User } from '@src/models/user';
import AuthService from '@src/services/auth';

describe('users functional tests', () => {
  beforeEach(async () => {
    await User.deleteMany({});
  });
  describe('when creating a user', () => {
    it('should successfully create an user with enscrypted password', async () => {
      const newUser = {
        name: 'Jhon Doe',
        email: 'jhon@gmail.com',
        password: '12345678',
      };
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
      const newUser = {
        name: 'Jhon Doe',
        email: 'jhon@gmail.com',
        password: '',
      };

      const result = await global.testRequest.post('/users').send(newUser);
      expect(result.status).toBe(422);
      expect(result.body).toEqual({
        code: 422,
        error: 'User validation failed: password: Path `password` is required.',
      });
    });

    it('should return 409 when the email already exists', async () => {
      const newUser = {
        name: 'Jhon Doe',
        email: 'jhon@gmail.com',
        password: '12345678',
      };

      await global.testRequest.post('/users').send(newUser);
      const response = await global.testRequest.post('/users').send(newUser);
      expect(response.status).toBe(409);
      expect(response.body).toEqual({
        code: 409,
        error: 'User validation failed: email: already exists in the database.',
      });
    });
  });
});

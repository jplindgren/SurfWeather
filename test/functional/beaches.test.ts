import { Beach } from '@src/models/beach';
import { User } from '@src/models/user';
import AuthService from '@src/services/auth';

describe('Beaches functional tests', () => {
  let token: string;
  const defaultUser = {
    name: 'Jhon Doe',
    email: 'jhon@gmail.com',
    password: '12345678',
  };
  beforeEach(async () => {
    await Beach.deleteMany({});
    await User.deleteMany({});

    const user = await new User(defaultUser).save();
    token = AuthService.generateToken(user.toJSON());
  });
  describe('when creating a beach', () => {
    it('should create a beach with success', async () => {
      const newBeach = {
        name: 'Manly',
        position: {
          direction: 'E',
          lat: -33.792726,
          lng: 151.289824,
        },
      };

      const response = await global.testRequest
        .post('/beaches')
        .set({ 'x-access-token': token })
        .send(newBeach);
      expect(response.status).toBe(201);
      expect(response.body).toEqual(expect.objectContaining(newBeach));
    });
  });

  it('should return 422 when there is a validation error', async () => {
    const newBeach = {
      name: 'Manly',
      position: {
        direction: 'E',
        lat: 'invalid_lat',
        lng: 151.289824,
      },
    };

    const response = await global.testRequest
      .post('/beaches')
      .set({ 'x-access-token': token })
      .send(newBeach);
    expect(response.status).toBe(422);
    expect(response.body).toEqual({
      code: 422,
      error:
        'Beach validation failed: position.lat: Cast to Number failed for value "invalid_lat" at path "position.lat"',
    });
  });

  it.todo(
    'should return 500 when there is any error other than validation error'
  );
});

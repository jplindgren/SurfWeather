import { Beach } from '@src/models/beach';

describe('Beaches functional tests', () => {
  beforeAll(async () => {
    await Beach.deleteMany({});
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

      const response = await global.testRequest.post('/beaches').send(newBeach);
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

    const response = await global.testRequest.post('/beaches').send(newBeach);
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

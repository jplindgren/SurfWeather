import nock from 'nock';
import stormglass_weather_3_hours from '@test/fixtures/stormglass_weather_3_hours.json';
import api_forecast_response_1_beach from '@test/fixtures/api_forecast_response_1_beach.json';
import { Beach } from '@src/models/beach';
import { User } from '@src/models/user';
import AuthService from '@src/services/auth';

describe('Beach forecast functional test', () => {
  const defaultUser = {
    name: 'Jhon Doe',
    email: 'jhon@gmail.com',
    password: '12345678',
  };
  let token: string;

  beforeEach(async () => {
    await Beach.deleteMany({});
    await User.deleteMany({});

    const otherUser = await new User({
      name: 'Other user',
      email: 'other@gmail.com',
      password: '444444',
    }).save();
    const user = await new User(defaultUser).save();
    token = AuthService.generateToken(user.toJSON());

    await new Beach({
      name: 'Manly',
      position: {
        direction: 'E',
        lat: -33.792726,
        lng: 151.289824,
      },
      user: user.id,
    }).save();

    await new Beach({
      name: 'Other Beach',
      position: {
        direction: 'E',
        lat: 33.792726,
        lng: -151.289824,
      },
      user: otherUser.id,
    }).save();
  });

  it('should return a forecast with just a few times', async () => {
    nock('https://api.stormglass.io:443', {
      encodedQueryParams: true,
      reqheaders: {
        Authorization: (): boolean => true,
      },
    })
      .defaultReplyHeaders({ 'access-control-allow-origin': '*' })
      .get('/v2/weather/point')
      .query({
        lat: '-33.792726',
        lng: '151.289824',
        params: /(.*)/,
        source: 'noaa',
        end: /(.*)/,
      })
      .reply(200, stormglass_weather_3_hours);

    const { body, status } = await global.testRequest
      .get('/forecast')
      .set({ 'x-access-token': token });
    expect(status).toBe(200);
    expect(body).toStrictEqual(api_forecast_response_1_beach);
  });

  it('should return 500 if something goes wrong during the processing', async () => {
    nock('https://api.stormglass.io:443', {
      encodedQueryParams: true,
      reqheaders: {
        Authorization: (): boolean => true,
      },
    })
      .defaultReplyHeaders({ 'access-control-allow-origin': '*' })
      .get('/v2/weather/point')
      .query({ lat: '-33.792726', lng: '151.289824' })
      .replyWithError('Some unexpected error');

    const { body, status } = await global.testRequest
      .get('/forecast')
      .set({ 'x-access-token': token });

    expect(status).toBe(500);
    expect(body).toStrictEqual({
      code: 500,
      error: 'Internal Server Error',
      message: 'Oops.. Something went wrong',
    });
  });
});

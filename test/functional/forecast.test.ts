import nock from 'nock';
import stormglass_weather_3_hours from '@test/fixtures/stormglass_weather_3_hours.json';
import api_forecast_response_1_beach from '@test/fixtures/api_forecast_response_1_beach.json';
import { Beach } from '@src/models/beach';

describe('Beach forecast functional test', () => {
  beforeEach(async () => {
    Beach.deleteMany({});
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

    const { body, status } = await global.testRequest.get('/forecast');
    console.log(body);
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

    const { body, status } = await global.testRequest.get('/forecast');

    expect(status).toBe(500);
    expect(body).toStrictEqual({ error: 'Oops.. Something went wrong' });
  });
});

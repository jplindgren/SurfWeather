import {
  StormGlass,
  StormGlassForecastResponse,
} from '@src/clients/stormGlass';
import axios from 'axios';
import stormGlassWeather3HoursFixture from '@test/fixtures/stormglass_weather_3_hours.json';
import stormGlassNormalizedWeather3HoursFixture from '@test/fixtures/stormglass_normalized_response_3_hours.json';
import CacheUtil from '@src/util/cache';

jest.mock('axios');
jest.mock('@src/util/cache');

describe('StormGlass client', () => {
  const mockedAxios = axios as jest.Mocked<typeof axios>;
  const mockedCache = CacheUtil as jest.Mocked<typeof CacheUtil>;
  it('should return the normalized forecast from StormGlass service', async () => {
    const lat = -3.7927263;
    const long = 151.28712;

    mockedAxios.get.mockResolvedValue({
      data: stormGlassWeather3HoursFixture,
    });
    mockedCache.hasKey.mockReturnValue(false);

    const stormGlass = new StormGlass(axios);
    const points = await stormGlass.fetchPoints(lat, long);

    expect(points).toEqual(stormGlassNormalizedWeather3HoursFixture);
  });

  it('should get the normalized forecast points from cache and use it to return data points', async () => {
    const lat = -3.7927263;
    const long = 151.28712;

    mockedCache.hasKey.mockReturnValue(true);
    mockedCache.get.mockReturnValue(stormGlassNormalizedWeather3HoursFixture);

    const stormGlass = new StormGlass(axios);
    const points = await stormGlass.fetchPoints(lat, long);

    expect(points).toEqual(stormGlassNormalizedWeather3HoursFixture);
    expect(mockedAxios).toHaveBeenCalledTimes(0);
  });

  it('should exclude incomplete data points', async () => {
    const lat = -3.7927263;
    const long = 151.28712;

    const incompleteResponse = {
      hours: [
        {
          waveDirection: {
            noaa: 231.38,
          },
          time: '2020-04-26T00:00:00+00:00',
        },
      ],
    };

    mockedCache.hasKey.mockReturnValue(false);
    mockedAxios.get.mockResolvedValue({
      data: incompleteResponse,
    });

    const stormGlass = new StormGlass(axios);
    const points = await stormGlass.fetchPoints(lat, long);

    expect(points).toEqual([]);
  });

  it('it should get a generic error from StormGlass service when the request fail before reaching the service', async () => {
    const lat = -3.7927263;
    const long = 151.28712;

    mockedAxios.get.mockRejectedValue({ message: 'Network Error' });

    const stormGlass = new StormGlass(axios);
    await expect(stormGlass.fetchPoints(lat, long)).rejects.toThrow(
      'Unexpected error when trying to communicate to StormGlass: Network Error'
    );
  });

  it('should get an StormGlassResponseError when the StormGlass service responds with error', async () => {
    const lat = -3.7927263;
    const long = 151.28712;

    mockedAxios.get.mockRejectedValue({
      response: {
        status: 429,
        data: { errors: ['Rate Limit reached'] },
      },
    });

    const stormGlass = new StormGlass(axios);
    await expect(stormGlass.fetchPoints(lat, long)).rejects.toThrow(
      'Unexpected error returned by the StormGlass service: Error: {"errors":["Rate Limit reached"]} Code: 429'
    );
  });
});

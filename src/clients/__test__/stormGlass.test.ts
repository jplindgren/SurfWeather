import { StormGlass } from '@src/clients/stormGlass';
import axios from 'axios';
import stormGlassWeather3HoursFixture from '@test/fixtures/stormglass_weather_3_hours.json';
import stormGlassNormalizedWeather3HoursFixture from '@test/fixtures/stormglass_normalized_response_3_hours.json';
jest.mock('axios');

describe('StormGlass client', () => {
  const mockedAxios = axios as jest.Mocked<typeof axios>;
  it('should return the normalized forecast from StormGlass service', async () => {
    const lat = -3.7927263;
    const long = 151.28712;

    mockedAxios.get.mockResolvedValue({
      data: stormGlassWeather3HoursFixture,
    });

    const stormGlass = new StormGlass(axios);
    const points = await stormGlass.fetchPoints(lat, long);

    expect(points).toEqual(stormGlassNormalizedWeather3HoursFixture);
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

import { StormGlass } from '@src/clients/stormGlass';
import stormglass_normalized_response_3_hours from '@test/fixtures/stormglass_normalized_response_3_hours.json';
import {
  Beach,
  BeachDirection,
  Forecast,
  ForecastProcessingInternalError,
} from './Forecast';

jest.mock('@src/clients/stormGlass');

describe('Forecast Service', () => {
  const mockedStormGlass = new StormGlass() as jest.Mocked<StormGlass>;
  const beaches: Beach[] = [
    {
      name: 'Manly',
      position: {
        direction: BeachDirection.E,
        lat: -33.792726,
        lng: 151.289824,
      },
      user: 'some-id',
    },
  ];

  it('should return forecast for a list of beaches', async () => {
    mockedStormGlass.fetchPoints.mockResolvedValue(
      stormglass_normalized_response_3_hours
    );

    const expectedResponse = [
      {
        time: '2020-04-26T00:00:00+00:00',
        forecast: [
          {
            position: {
              direction: BeachDirection.E,
              lat: -33.792726,
              lng: 151.289824,
            },
            name: 'Manly',
            rating: 1,
            swellDirection: 64.26,
            swellHeight: 0.15,
            swellPeriod: 3.89,
            time: '2020-04-26T00:00:00+00:00',
            waveDirection: 231.38,
            waveHeight: 0.47,
            windDirection: 299.45,
            windSpeed: 100,
          },
        ],
      },
      {
        time: '2020-04-26T01:00:00+00:00',
        forecast: [
          {
            position: {
              direction: BeachDirection.E,
              lat: -33.792726,
              lng: 151.289824,
            },
            name: 'Manly',
            rating: 1,
            swellDirection: 123.41,
            swellHeight: 0.21,
            swellPeriod: 3.67,
            time: '2020-04-26T01:00:00+00:00',
            waveDirection: 232.12,
            waveHeight: 0.46,
            windDirection: 310.48,
            windSpeed: 100,
          },
        ],
      },
      {
        time: '2020-04-26T02:00:00+00:00',
        forecast: [
          {
            position: {
              direction: BeachDirection.E,
              lat: -33.792726,
              lng: 151.289824,
            },
            name: 'Manly',
            rating: 1,
            swellDirection: 182.56,
            swellHeight: 0.28,
            swellPeriod: 3.44,
            time: '2020-04-26T02:00:00+00:00',
            waveDirection: 232.86,
            waveHeight: 0.46,
            windDirection: 321.5,
            windSpeed: 100,
          },
        ],
      },
    ];

    const forecast = new Forecast(mockedStormGlass);
    const ratedBeaches = await forecast.getBeachesForecast(beaches);
    expect(ratedBeaches).toEqual(expectedResponse);
  });

  it('should return an empty list when beaches array is empty', async () => {
    const beaches: Beach[] = [];
    const forecast = new Forecast(mockedStormGlass);
    const ratedBeaches = await forecast.getBeachesForecast(beaches);
    expect(ratedBeaches).toEqual([]);
  });

  it('should throw internal processing error when something goes wrong during the rating process', async () => {
    mockedStormGlass.fetchPoints.mockRejectedValue('Error fetching data');
    const forecast = new Forecast(mockedStormGlass);
    expect(forecast.getBeachesForecast(beaches)).rejects.toThrow(
      ForecastProcessingInternalError
    );
  });
});

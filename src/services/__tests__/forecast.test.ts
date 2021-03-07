import { StormGlass } from '@src/clients/stormGlass';
import stormglass_normalized_response_3_hours from '@test/fixtures/stormglass_normalized_response_3_hours.json';
import api_forecast_response_1_beach from '@test/fixtures/api_forecast_response_1_beach.json';
import { Forecast, ForecastProcessingInternalError } from '../forecast';
import { Beach, Direction } from '@src/models/beach';

jest.mock('@src/clients/stormGlass');

describe('Forecast Service', () => {
  const mockedStormGlassService = new StormGlass() as jest.Mocked<StormGlass>;
  const beaches: Beach[] = [
    {
      name: 'Manly',
      position: {
        direction: Direction.E,
        lat: -33.792726,
        lng: 151.289824,
      },
      user: 'some-id',
    },
  ];

  it('should return the forecast for mutiple beaches in the same hour with different ratings ordered by rating', async () => {
    mockedStormGlassService.fetchPoints.mockResolvedValueOnce([
      {
        swellDirection: 123.41,
        swellHeight: 0.21,
        swellPeriod: 3.67,
        time: '2020-04-26T00:00:00+00:00',
        waveDirection: 232.12,
        waveHeight: 0.46,
        windDirection: 310.48,
        windSpeed: 100,
      },
    ]);
    mockedStormGlassService.fetchPoints.mockResolvedValueOnce([
      {
        swellDirection: 64.26,
        swellHeight: 0.15,
        swellPeriod: 13.89,
        time: '2020-04-26T00:00:00+00:00',
        waveDirection: 231.38,
        waveHeight: 2.07,
        windDirection: 299.45,
        windSpeed: 100,
      },
    ]);
    const beaches: Beach[] = [
      {
        name: 'Manly',
        position: {
          lat: -33.792726,
          lng: 151.289824,
          direction: Direction.E,
        },
        user: 'fake-id',
      },
      {
        name: 'Dee Why',
        position: {
          lat: -33.792726,
          lng: 141.289824,
          direction: Direction.S,
        },
        user: 'fake-id',
      },
    ];
    const expectedResponse = [
      {
        time: '2020-04-26T00:00:00+00:00',
        forecast: [
          {
            name: 'Dee Why',
            position: {
              lat: -33.792726,
              lng: 141.289824,
              direction: 'S',
            },
            rating: 3,
            swellDirection: 64.26,
            swellHeight: 0.15,
            swellPeriod: 13.89,
            time: '2020-04-26T00:00:00+00:00',
            waveDirection: 231.38,
            waveHeight: 2.07,
            windDirection: 299.45,
            windSpeed: 100,
          },
          {
            name: 'Manly',
            position: {
              lat: -33.792726,
              lng: 151.289824,
              direction: 'E',
            },
            rating: 2,
            swellDirection: 123.41,
            swellHeight: 0.21,
            swellPeriod: 3.67,
            time: '2020-04-26T00:00:00+00:00',
            waveDirection: 232.12,
            waveHeight: 0.46,
            windDirection: 310.48,
            windSpeed: 100,
          },
        ],
      },
    ];
    const forecast = new Forecast(mockedStormGlassService);
    const beachesWithRating = await forecast.processBeachesForecast(beaches);
    expect(beachesWithRating).toEqual(expectedResponse);
  });

  it('should return forecast for a list of beaches', async () => {
    mockedStormGlassService.fetchPoints.mockResolvedValue(
      stormglass_normalized_response_3_hours
    );

    const expectedResponse = api_forecast_response_1_beach;

    const forecast = new Forecast(mockedStormGlassService);
    const ratedBeaches = await forecast.processBeachesForecast(beaches);
    expect(ratedBeaches).toEqual(expectedResponse);
  });

  it('should return an empty list when beaches array is empty', async () => {
    const beaches: Beach[] = [];
    const forecast = new Forecast(mockedStormGlassService);
    const ratedBeaches = await forecast.processBeachesForecast(beaches);
    expect(ratedBeaches).toEqual([]);
  });

  it('should throw internal processing error when something goes wrong during the rating process', async () => {
    mockedStormGlassService.fetchPoints.mockRejectedValue(
      'Error fetching data'
    );
    const forecast = new Forecast(mockedStormGlassService);
    expect(forecast.processBeachesForecast(beaches)).rejects.toThrow(
      ForecastProcessingInternalError
    );
  });
});

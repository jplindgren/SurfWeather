import { StormGlass } from '@src/clients/stormGlass';
import stormglass_normalized_response_3_hours from '@test/fixtures/stormglass_normalized_response_3_hours.json';
import api_forecast_response_1_beach from '@test/fixtures/api_forecast_response_1_beach.json';
import { Forecast, ForecastProcessingInternalError } from '../forecast';
import { Beach, BeachDirection } from '@src/models/beach';

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

    const expectedResponse = api_forecast_response_1_beach;

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

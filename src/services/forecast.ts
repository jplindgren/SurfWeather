import { ForecastPoint, StormGlass } from '@src/clients/stormGlass';
import logger from '@src/logger';
import { Beach } from '@src/models/beach';
import { InternalError } from '@src/util/errors/internal-error';

export interface BeachForecast extends Omit<Beach, 'user'>, ForecastPoint {
  rating: number;
}

export interface TimeForecast {
  time: string;
  forecast: BeachForecast[];
}

export class ForecastProcessingInternalError extends InternalError {
  constructor(message: string) {
    super(`Unexpected error during the forecast processing ${message}`);
  }
}

export class Forecast {
  constructor(protected stormGlass: StormGlass = new StormGlass()) {}

  public async getBeachesForecast(beaches: Beach[]): Promise<TimeForecast[]> {
    const forecast: BeachForecast[] = [];
    logger.info(`Preparing the forecast for ${beaches.length} beaches`);
    try {
      for (const beach of beaches) {
        const points = await this.stormGlass.fetchPoints(
          beach.position.lat,
          beach.position.lng
        );

        const enrichedPoints = points.map((point) =>
          this.enrichForeCastPointData(beach, point, 1)
        );
        forecast.push(...enrichedPoints);
      }
      return this.groupForecastByTime(forecast);
    } catch (err) {
      logger.error(err);
      throw new ForecastProcessingInternalError(err.message);
    }
  }

  private enrichForeCastPointData(
    beach: Beach,
    point: ForecastPoint,
    rating: number
  ) {
    return {
      ...point,
      name: beach.name,
      position: beach.position,
      rating,
    };
  }

  private groupForecastByTime(forecast: BeachForecast[]): TimeForecast[] {
    return forecast.reduce((acc, curr) => {
      const forecastByTime: TimeForecast[] = acc;
      const timePoint = forecastByTime.find((x) => x.time === curr.time);
      if (timePoint) {
        timePoint.forecast.push(curr);
      } else {
        forecastByTime.push({
          time: curr.time,
          forecast: [curr],
        });
      }
      return forecastByTime;
    }, [] as TimeForecast[]);
  }
}

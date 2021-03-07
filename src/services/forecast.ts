import { ForecastPoint, StormGlass } from '@src/clients/stormGlass';
import logger from '@src/logger';
import { Beach } from '@src/models/beach';
import { Rating } from '@src/services/rating';
import { InternalError } from '@src/util/errors/internal-error';
import { orderBy } from 'lodash';

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
  constructor(
    protected stormGlass: StormGlass = new StormGlass(),
    protected RatingService: typeof Rating = Rating
  ) {}

  public async processBeachesForecast(
    beaches: Beach[]
  ): Promise<TimeForecast[]> {
    logger.info(`Preparing the forecast for ${beaches.length} beaches`);
    try {
      const beachForecast = await this.calculateBeachRating(beaches);
      const timeForecast = this.groupForecastByTime(beachForecast);
      return timeForecast.map((x) => ({
        time: x.time,
        forecast: orderBy(x.forecast, 'rating', 'desc'),
      }));
    } catch (err) {
      logger.error(err);
      throw new ForecastProcessingInternalError(err.message);
    }
  }

  private async calculateBeachRating(
    beaches: Beach[]
  ): Promise<BeachForecast[]> {
    const forecast: BeachForecast[] = [];
    for (const beach of beaches) {
      const rating = new this.RatingService(beach);
      const points = await this.stormGlass.fetchPoints(
        beach.position.lat,
        beach.position.lng
      );

      const enrichedPoints = points.map((point) =>
        this.enrichForeCastPointData(
          beach,
          point,
          rating.getRateForPoint(point)
        )
      );
      forecast.push(...enrichedPoints);
    }
    return forecast;
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

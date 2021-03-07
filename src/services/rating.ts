import { ForecastPoint } from '@src/clients/stormGlass';
import { Beach, Direction } from '@src/models/beach';

const waveHeights = {
  ankleToKnee: {
    min: 0.3,
    max: 1.0,
  },
  waistHeight: {
    min: 1.0,
    max: 2.0,
  },
  headHigh: {
    min: 2.0,
    max: 2.5,
  },
};

export class Rating {
  constructor(private beach: Beach) {}

  public getRateForPoint(point: ForecastPoint): number {
    const swellDirection = this.getDirectionFromLocation(point.swellDirection);
    const windDirection = this.getDirectionFromLocation(point.windDirection);

    const windAndWaveRating = this.calculateRatingBasedOnWindAndWaveDirections(
      swellDirection,
      windDirection
    );
    const swellPeriodRating = this.calculateRatingForPeriod(point.swellPeriod);
    const swellHeightRating = this.calculateRatingForSwellSize(
      point.swellHeight
    );

    const finalRating =
      (windAndWaveRating + swellPeriodRating + swellHeightRating) / 3;
    return Math.round(finalRating);
  }

  public calculateRatingBasedOnWindAndWaveDirections(
    waveDirection: Direction,
    windDirection: Direction
  ): number {
    if (waveDirection === windDirection) return 1;
    if (this.isWindOffShore(waveDirection, windDirection)) return 5;
    return 3;
  }

  public calculateRatingForPeriod(period: number): number {
    if (period >= 7 && period < 10) return 2;
    if (period >= 10 && period < 14) return 4;
    if (period >= 14) return 5;
    return 1;
  }

  public calculateRatingForSwellSize(height: number): number {
    if (
      height >= waveHeights.ankleToKnee.min &&
      height < waveHeights.ankleToKnee.max
    )
      return 2;

    if (
      height >= waveHeights.waistHeight.min &&
      height < waveHeights.waistHeight.max
    )
      return 3;

    if (height >= waveHeights.waistHeight.min) return 5;

    return 1;
  }

  public getDirectionFromLocation(coordinates: number): Direction {
    if (coordinates < 0) throw Error('coordinates cannot be less than 0');

    if (coordinates >= 310 || coordinates < 50) return Direction.N;
    if (coordinates >= 50 && coordinates < 120) return Direction.E;
    if (coordinates >= 120 && coordinates < 220) return Direction.S;
    if (coordinates >= 220 && coordinates < 310) return Direction.W;
    return Direction.E;
  }

  private isWindOffShore(
    waveDirection: Direction,
    windDirection: Direction
  ): boolean {
    return (
      (waveDirection === Direction.N &&
        windDirection === Direction.S &&
        this.beach.position.direction === Direction.N) ||
      (waveDirection === Direction.S &&
        windDirection === Direction.N &&
        this.beach.position.direction === Direction.S) ||
      (waveDirection === Direction.E &&
        windDirection === Direction.W &&
        this.beach.position.direction === Direction.E) ||
      (waveDirection === Direction.W &&
        windDirection === Direction.E &&
        this.beach.position.direction === Direction.W)
    );
  }
}

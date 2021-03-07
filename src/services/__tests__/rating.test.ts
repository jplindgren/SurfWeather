import { Beach, Direction } from '@src/models/beach';
import { Rating } from '../rating';

describe('rating service', () => {
  const beach: Beach = {
    name: 'Manly',
    position: {
      direction: Direction.E,
      lat: -33.792726,
      lng: 151.289824,
    },
    user: 'some-id',
  };
  const defaultRating = new Rating(beach);

  describe('calculate rating for a given point', () => {
    const defaultPoint = {
      swellDirection: 110,
      swellHeight: 0.1,
      swellPeriod: 5,
      time: 'test',
      waveDirection: 110,
      waveHeight: 0.1,
      windDirection: 100,
      windSpeed: 100,
    };

    it('should get a rating less than 1 for a poor point', () => {
      const rating = defaultRating.getRateForPoint(defaultPoint);
      expect(rating).toBe(1);
    });

    it('should get a rating of 1 for an ok point', () => {
      const pointData = {
        swellHeight: 0.4,
      };
      // using spread operator for cloning objects instead of Object.assign
      const point = { ...defaultPoint, ...pointData };

      const rating = defaultRating.getRateForPoint(point);
      expect(rating).toBe(1);
    });

    it('should get a rating of 3 for a point with offshore winds and a half overhead height', () => {
      const point = {
        ...defaultPoint,
        ...{
          swellHeight: 0.7,
          windDirection: 250,
        },
      };
      const rating = defaultRating.getRateForPoint(point);
      expect(rating).toBe(3);
    });

    it('should get a rating of 4 for a point with offshore winds, half overhead high swell and good interval', () => {
      const point = {
        ...defaultPoint,
        ...{
          swellHeight: 0.7,
          swellPeriod: 12,
          windDirection: 250,
        },
      };
      const rating = defaultRating.getRateForPoint(point);
      expect(rating).toBe(4);
    });

    it('should get a rating of 4 for a point with offshore winds, shoulder high swell and good interval', () => {
      const point = {
        ...defaultPoint,
        ...{
          swellHeight: 1.5,
          swellPeriod: 12,
          windDirection: 250,
        },
      };
      const rating = defaultRating.getRateForPoint(point);
      expect(rating).toBe(4);
    });

    it('should get a rating of 5 classic day!', () => {
      const point = {
        ...defaultPoint,
        ...{
          swellHeight: 2.5,
          swellPeriod: 16,
          windDirection: 250,
        },
      };
      const rating = defaultRating.getRateForPoint(point);
      expect(rating).toBe(5);
    });
    it('should get a rating of 4 a good condition but with crossshore winds', () => {
      const point = {
        ...defaultPoint,
        ...{
          swellHeight: 2.5,
          swellPeriod: 16,
          windDirection: 130,
        },
      };
      const rating = defaultRating.getRateForPoint(point);
      expect(rating).toBe(4);
    });
  });

  describe('get rating based on wind and wave directions', () => {
    it('should get rating 1 for onshore winds', () => {
      const result = defaultRating.calculateRatingBasedOnWindAndWaveDirections(
        Direction.N,
        Direction.N
      );
      expect(result).toBe(1);
    });

    it('should get rating 3 for crossshore winds', () => {
      const result = defaultRating.calculateRatingBasedOnWindAndWaveDirections(
        Direction.N,
        Direction.E
      );
      expect(result).toBe(3);
    });

    it('should get rating 5 for offshore winds', () => {
      const result = defaultRating.calculateRatingBasedOnWindAndWaveDirections(
        Direction.E,
        Direction.W
      );
      expect(result).toBe(5);
    });
  });

  describe('get rating based on swell period', () => {
    it('should get a rating 1 for a period of 5 seconds', () => {
      const result = defaultRating.calculateRatingForPeriod(5);
      expect(result).toBe(1);
    });
    it('should get a rating 2 for a period of 9 seconds', () => {
      const result = defaultRating.calculateRatingForPeriod(9);
      expect(result).toBe(2);
    });
    it('should get a rating 4 for a period of 12 seconds', () => {
      const result = defaultRating.calculateRatingForPeriod(12);
      expect(result).toBe(4);
    });
    it('should get a rating 5 for a period of 16 seconds', () => {
      const result = defaultRating.calculateRatingForPeriod(16);
      expect(result).toBe(5);
    });
  });

  describe('get rating based on swell height', () => {
    it('should get a rating 1 for less than ankle to knee high swell', () => {
      const result = defaultRating.calculateRatingForSwellSize(0.2);
      expect(result).toBe(1);
    });
    it('should get a rating 2 for an ankle to knee swell', () => {
      const result = defaultRating.calculateRatingForSwellSize(0.6);
      expect(result).toBe(2);
    });
    it('should get a rating 3 for waist high swell', () => {
      const result = defaultRating.calculateRatingForSwellSize(1.5);
      expect(result).toBe(3);
    });
    it('should get a rating 5 for overhead swell', () => {
      const result = defaultRating.calculateRatingForSwellSize(2.5);
      expect(result).toBe(5);
    });
  });

  /**
   * Location specific calculation
   */
  describe('Get position based on points location', () => {
    it('should get the point based on a east location', () => {
      const response = defaultRating.getDirectionFromLocation(92);
      expect(response).toBe(Direction.E);
    });

    it('should get the point based on a north location 1', () => {
      const response = defaultRating.getDirectionFromLocation(360);
      expect(response).toBe(Direction.N);
    });

    it('should get the point based on a north location 2', () => {
      const response = defaultRating.getDirectionFromLocation(40);
      expect(response).toBe(Direction.N);
    });

    it('should get the point based on a south location', () => {
      const response = defaultRating.getDirectionFromLocation(200);
      expect(response).toBe(Direction.S);
    });

    it('should get the point based on a west location', () => {
      const response = defaultRating.getDirectionFromLocation(300);
      expect(response).toBe(Direction.W);
    });

    it('should get the point based on a west location', () => {
      const response = defaultRating.getDirectionFromLocation(250);
      expect(response).toBe(Direction.W);
    });
  });
});

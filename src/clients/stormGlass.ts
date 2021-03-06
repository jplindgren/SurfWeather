import logger from '@src/logger';
import { InternalError } from '@src/util/errors/internal-error';
import { TimeUtil } from '@src/util/time';
import axios, { AxiosResponse, AxiosStatic } from 'axios';
import config from 'config';
import { StormGlassConfig } from './stormGlassConfig';
import CacheUtil from '@src/util/cache';

export interface StormGlassPointValue {
  readonly [key: string]: number;
}
export interface StormGlassPoint {
  readonly time: string;
  readonly swellDirection: StormGlassPointValue;
  readonly swellHeight: StormGlassPointValue;
  readonly swellPeriod: StormGlassPointValue;
  readonly waveDirection: StormGlassPointValue;
  readonly waveHeight: StormGlassPointValue;
  readonly windDirection: StormGlassPointValue;
  readonly windSpeed: StormGlassPointValue;
}
export interface StormGlassForecastResponse {
  readonly hours: StormGlassPoint[];
}

export interface ForecastPoint {
  time: string;
  swellDirection: number;
  swellHeight: number;
  swellPeriod: number;
  waveDirection: number;
  waveHeight: number;
  windDirection: number;
  windSpeed: number;
}

export class ClientRequestError extends InternalError {
  constructor(message: string) {
    const internalError = `Unexpected error when trying to communicate to StormGlass`;
    super(`${internalError}: ${message}`);
  }
}

export class StormGlassResponseError extends InternalError {
  constructor(message: string) {
    const internalMessage =
      'Unexpected error returned by the StormGlass service';
    super(`${internalMessage}: ${message}`);
  }
}

const stormGlassResourceConfig: StormGlassConfig = config.get<StormGlassConfig>(
  'App.resources.StormGlass'
);

export class StormGlass {
  readonly stormGlassApiParams =
    'swellDirection,swellHeight,swellPeriod,waveDirection,waveHeight,windDirection,windSpeed';
  readonly stormGlassApiSource = 'noaa';

  constructor(
    protected request: AxiosStatic = axios,
    protected cache: typeof CacheUtil = CacheUtil
  ) {}

  public async fetchPoints(
    lat: number,
    long: number
  ): Promise<ForecastPoint[]> {
    try {
      const cacheKey = this.getCacheKey(lat, long);
      if (CacheUtil.hasKey(cacheKey)) {
        return CacheUtil.get(cacheKey)!;
      } else {
        const response = await this.fetchPointsFromApi(lat, long);
        CacheUtil.set(cacheKey, response);
        return response;
      }
    } catch (err) {
      if (err.response?.status) {
        throw new StormGlassResponseError(
          `Error: ${JSON.stringify(err.response.data)} Code: ${
            err.response.status
          }`
        );
      }
      throw new ClientRequestError(err.message);
    }
  }

  public async fetchPointsFromApi(
    lat: number,
    long: number
  ): Promise<ForecastPoint[]> {
    const endTimeStamp = TimeUtil.getUnixTimeForAFutureDay(1);
    const response = await this.request.get<StormGlassForecastResponse>(
      `${stormGlassResourceConfig.apiUrl}/weather/point?params=${this.stormGlassApiParams}
          &source=${this.stormGlassApiSource}&end=${endTimeStamp}
          &lat=${lat}&lng=${long}`,
      {
        headers: {
          Authorization: stormGlassResourceConfig.apiToken,
        },
      }
    );
    return this.normalizeStormGlassResponse(response.data);
  }

  private getCacheKey(lat: number, lng: number): string {
    return `forecast_key_lat:${lat}&lng:${lng}`;
  }

  private normalizeStormGlassResponse(
    response: StormGlassForecastResponse
  ): ForecastPoint[] {
    return response.hours
      .filter(this.isValidPoint.bind(this))
      .map(this.normalizePoint.bind(this));
  }

  private normalizePoint(point: StormGlassPoint): ForecastPoint {
    return {
      swellDirection: point.swellDirection[this.stormGlassApiSource],
      swellHeight: point.swellHeight[this.stormGlassApiSource],
      swellPeriod: point.swellPeriod[this.stormGlassApiSource],
      time: point.time,
      waveDirection: point.waveDirection[this.stormGlassApiSource],
      waveHeight: point.waveHeight[this.stormGlassApiSource],
      windDirection: point.windDirection[this.stormGlassApiSource],
      windSpeed: point.windSpeed[this.stormGlassApiSource],
    };
  }

  //Partial transform all keys in a typescript interface to nullable
  private isValidPoint(point: Partial<StormGlassPoint>) {
    return !!(
      point.time &&
      point.swellDirection?.[this.stormGlassApiSource] &&
      point.swellHeight?.[this.stormGlassApiSource] &&
      point.swellPeriod?.[this.stormGlassApiSource] &&
      point.waveDirection?.[this.stormGlassApiSource] &&
      point.waveHeight?.[this.stormGlassApiSource] &&
      point.windDirection?.[this.stormGlassApiSource] &&
      point.windSpeed?.[this.stormGlassApiSource]
    );
  }
}

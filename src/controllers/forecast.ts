import { Controller, Get } from '@overnightjs/core';
import { Request, Response } from 'express';
import { Forecast } from '@src/services/forecast';
import { Beach } from '@src/models/beach';

@Controller('forecast')
export class ForecastController {
  constructor(protected forecast: Forecast = new Forecast()) {}
  @Get('')
  public async getForecastForLoggedUser(
    _: Request,
    res: Response
  ): Promise<void> {
    try {
      const beaches = await Beach.find({});
      const result = await this.forecast.getBeachesForecast(beaches);
      res.status(200).send(result);
    } catch (err) {
      res.status(500).send({ error: 'Oops.. Something went wrong' });
    }
  }
}

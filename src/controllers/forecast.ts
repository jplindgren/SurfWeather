import { ClassMiddleware, Controller, Get } from '@overnightjs/core';
import { Request, Response } from 'express';
import { Forecast } from '@src/services/forecast';
import { Beach } from '@src/models/beach';
import { authMiddleware } from '@src/middlewares/auth';
import { DecodedUser } from '@src/services/auth';
import logger from '@src/logger';

@Controller('forecast')
@ClassMiddleware(authMiddleware)
export class ForecastController {
  constructor(protected forecast: Forecast = new Forecast()) {}
  @Get('')
  public async getForecastForLoggedUser(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const user: DecodedUser = req.user!;
      const beaches = await Beach.find({ user: user.id });
      const result = await this.forecast.getBeachesForecast(beaches);
      res.status(200).send(result);
    } catch (err) {
      logger.error(err);
      res.status(500).send({ error: 'Oops.. Something went wrong' });
    }
  }
}

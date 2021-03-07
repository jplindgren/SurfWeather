import { ClassMiddleware, Controller, Get } from '@overnightjs/core';
import { Request, Response } from 'express';
import { Forecast } from '@src/services/forecast';
import { Beach } from '@src/models/beach';
import { authMiddleware } from '@src/middlewares/auth';
import { DecodedUser } from '@src/services/auth';
import logger from '@src/logger';
import { BaseController } from '.';
import { error } from 'console';

@Controller('forecast')
@ClassMiddleware(authMiddleware)
export class ForecastController extends BaseController {
  constructor(protected forecast: Forecast = new Forecast()) {
    super();
  }

  @Get('')
  public async getForecastForLoggedUser(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const user: DecodedUser = req.user!;
      const beaches = await Beach.find({ user: user.id });
      const result = await this.forecast.processBeachesForecast(beaches);
      res.status(200).send(result);
    } catch (err) {
      logger.error(err);
      this.sendErrorResponse(res, {
        code: 500,
        message: 'Oops.. Something went wrong',
      });
    }
  }
}

import { ClassMiddleware, Controller, Post } from '@overnightjs/core';
import logger from '@src/logger';
import { authMiddleware } from '@src/middlewares/auth';
import { Beach } from '@src/models/beach';
import { Request, Response } from 'express';
import { BaseController } from './index';

@Controller('beaches')
@ClassMiddleware(authMiddleware)
export class BeachesController extends BaseController {
  @Post('')
  public async create(req: Request, resp: Response): Promise<void> {
    try {
      const result = await Beach.create({ ...req.body, user: req.user?.id });
      resp.status(201).send(result); //will call the toJson from beach model
    } catch (err) {
      logger.error(err);
      this.handleCreateUpdateErrorResponse(resp, err);
    }
  }
}

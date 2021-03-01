import { Controller, Post } from '@overnightjs/core';
import { Beach } from '@src/models/beach';
import { Request, Response } from 'express';
import { BaseController } from './index';

@Controller('beaches')
export class BeachesController extends BaseController {
  @Post('')
  public async create(req: Request, resp: Response): Promise<void> {
    try {
      const result = await Beach.create(req.body);
      resp.status(201).send(result); //will call the toJson from beach model
    } catch (err) {
      this.handleCreateUpdateErrorResponse(resp, err);
    }
  }
}

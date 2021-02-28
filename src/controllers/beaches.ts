import { Controller, Post } from '@overnightjs/core';
import { Beach } from '@src/models/beach';
import { Request, Response } from 'express';
import mongoose from 'mongoose';

@Controller('beaches')
export class BeachesController {
  @Post('')
  public async create(req: Request, resp: Response): Promise<void> {
    try {
      const result = await Beach.create(req.body);
      resp.status(201).send(result); //will cal the toJson from beach model
    } catch (err) {
      if (err instanceof mongoose.Error.ValidationError) {
        resp.status(422).send({ error: err.message });
      } else {
        resp.status(500).send({ error: 'Internal Server Error' });
      }
    }
  }
}

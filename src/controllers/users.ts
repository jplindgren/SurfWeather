import { Controller, Post } from '@overnightjs/core';
import { User } from '@src/models/user';
import { Request, Response } from 'express';
import { BaseController } from './index';

@Controller('users')
export class UsersController extends BaseController {
  @Post('')
  public async createUser(req: Request, resp: Response): Promise<void> {
    try {
      const newUser = new User(req.body);
      const result = await newUser.save();

      resp.status(201).send(result); //will call the toJson from beach model
    } catch (err) {
      this.handleCreateUpdateErrorResponse(resp, err);
    }
  }
}

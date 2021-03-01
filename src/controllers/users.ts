import { Controller, Get, Post } from '@overnightjs/core';
import { User } from '@src/models/user';
import AuthService from '@src/services/auth';
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

  @Post('authenticate')
  public async authenticate(req: Request, res: Response): Promise<Response> {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email });
    if (!user) return res.status(401).send({ code: 401, error: 'Not found' });

    const authenticated = await AuthService.compare(password, user.password);
    if (!authenticated)
      return res.status(401).send({ code: 401, error: 'Unauthorized' });

    const token = AuthService.generateToken(user.toJSON());
    return res.status(200).send({ code: 200, token });
  }
}

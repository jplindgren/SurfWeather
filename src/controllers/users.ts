import { Controller, Get, Middleware, Post } from '@overnightjs/core';
import { authMiddleware } from '@src/middlewares/auth';
import { User } from '@src/models/user';
import AuthService, { DecodedUser } from '@src/services/auth';
import { Request, Response } from 'express';
import { decode } from 'jsonwebtoken';
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
    if (!user)
      return this.sendErrorResponse(res, { code: 401, message: 'Not found' });

    const authenticated = await AuthService.compare(password, user.password);
    if (!authenticated)
      return this.sendErrorResponse(res, {
        code: 401,
        message: 'Unauthorized',
      });

    const token = AuthService.generateToken(user.toJSON());
    return res.status(200).send({ code: 200, token });
  }

  @Get('me')
  @Middleware(authMiddleware)
  public async getUserInfo(req: Request, res: Response): Promise<Response> {
    const decodedUser: DecodedUser = req.user!;
    const user = await User.findOne({ email: decodedUser.email });
    if (!user)
      return this.sendErrorResponse(res, {
        code: 404,
        message: 'User not found',
      });
    return res
      .status(200)
      .send({ code: 200, info: { name: user?.name, email: user?.email } });
  }
}

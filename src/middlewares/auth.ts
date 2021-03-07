import { NextFunction, Request, Response } from 'express';
import AuthService from '@src/services/auth';
import { User } from '@src/models/user';
import logger from '@src/logger';

export const ACCESS_TOKEN_HEADER = 'x-access-token';

export async function authMiddleware(
  req: Partial<Request>,
  res: Partial<Response>,
  next: NextFunction
) {
  const token = req.headers?.[ACCESS_TOKEN_HEADER];
  if (!token)
    return res
      .status?.(401)
      ?.send({ code: 401, error: 'jwt must be provided' });

  try {
    const decodedUser = AuthService.decodeToken(token as string);

    //TODO: check if user is active or deleted
    // const userExists = User.exists({ id: decodedUser.id });
    // if (!userExists) {
    //   //return res.status(401);
    // }

    req.user = decodedUser;
    return next();
  } catch (err) {
    logger.error(err);
    return res.status?.(401)?.send({ code: 401, error: err.message });
  }
}

async function checkIfUserIsValid(userId: string): Promise<boolean> {
  return await User.exists({ id: userId });
}

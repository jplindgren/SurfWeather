import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import config from 'config';
import { User } from '@src/models/user';

export interface DecodedUser extends Omit<User, '_id'> {
  id: string;
}
export default class AuthService {
  public static async hashPassword(password: string, salt: number = 10) {
    return await bcrypt.hash(password, salt);
  }

  public static async compare(password: string, hashedPassword: string) {
    return await bcrypt.compare(password, hashedPassword);
  }

  public static generateToken(user: object) {
    const token = jwt.sign(user, config.get('App.auth.jwtSecretKey'), {
      expiresIn: config.get('App.auth.tokenExpiresIn'),
    });
    return token;
  }

  public static decodeToken(token: string): DecodedUser {
    return jwt.verify(
      token,
      config.get('App.auth.jwtSecretKey')
    ) as DecodedUser;
  }
}

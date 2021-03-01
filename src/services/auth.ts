import { User } from '@src/models/user';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import config from 'config';

export default class AuthService {
  public static async hashPassword(password: string, salt: number = 10) {
    return await bcrypt.hash(password, salt);
  }

  public static async compare(password: string, hashedPassword: string) {
    return await bcrypt.compare(password, hashedPassword);
  }

  public static generateToken(user: User) {
    const token = jwt.sign(user, config.get('App.auth.jwtSecretKey'), {
      expiresIn: config.get('App.auth.tokenExpiresIn'),
    });
    return token;
  }
}

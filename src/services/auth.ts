import bcrypt from 'bcrypt';
export default class AuthService {
  public static async hashPassword(password: string, salt: number = 10) {
    return await bcrypt.hash(password, salt);
  }

  public static async compare(password: string, hashedPassword: string) {
    return await bcrypt.compare(password, hashedPassword);
  }
}

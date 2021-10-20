import { HttpInternalServerError } from '@errors/http';
import { Model } from 'mongoose';
import { SuccessSignup, User } from './signup.interface';

export class SignupService {
  async signUp(user: User, Users: Model<User>): Promise<SuccessSignup> {
    try {
      await Users.create({ email: user.email, password: user.password });
    } catch (e) {
      throw new HttpInternalServerError(e.message);
    }

    return {
      message: `${user.email} успешно зарегистрирован!`,
    };
  }
}

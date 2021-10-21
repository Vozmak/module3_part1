import { HttpInternalServerError } from '@errors/http';
import { getEnv } from '@helper/environment';
import * as jwt from 'jsonwebtoken';
import { Model } from 'mongoose';
import { SuccessSignup, Token, User, VerifyUser } from './auth.interface';

export class AuthService {
  async logIn(verifyUser: VerifyUser): Promise<Token> {
    let token: Token;

    try {
      token = { token: this.getJWTToken(verifyUser) };
    } catch (e) {
      throw new HttpInternalServerError(e.message);
    }

    return token;
  }

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

  getJWTToken(user: VerifyUser): string {
    const body: VerifyUser = { _id: user._id, email: user.email };
    return jwt.sign({ user: body }, getEnv('SECRET', true));
  }
}

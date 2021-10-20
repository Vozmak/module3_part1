import { HttpInternalServerError } from '@errors/http';
import { getJWTToken } from '@helper/gallery/getJWTToken';
import { Token, VerifyUser } from './login.interface';

export class LoginService {
  async logIn(verifyUser: VerifyUser): Promise<Token> {
    let token: Token;

    try {
      token = { token: getJWTToken(verifyUser) };
    } catch (e) {
      throw new HttpInternalServerError(e.message);
    }

    return token;
  }
}

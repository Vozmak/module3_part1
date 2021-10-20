import { HttpBadRequestError } from '@errors/http';
import { Token, User } from './login.interface';
import { LoginService } from './login.service';

export class LoginManager {
  private readonly service: LoginService;

  constructor() {
    this.service = new LoginService();
  }

  logIn(user: User): Promise<Token> {
    if (!user || !user.email || !user.password) {
      throw new HttpBadRequestError('Email and password is required.');
    }

    return this.service.logIn(user);
  }
}

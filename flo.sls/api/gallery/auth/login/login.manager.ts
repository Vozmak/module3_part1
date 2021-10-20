import { HttpBadRequestError, HttpInternalServerError } from '@errors/http';
import { UserScheme } from '@models/MongoDB';
import { checkMongoConnect } from '@services/mongoDbConnect';
import * as mongoose from 'mongoose';
import { Token, User, VerifyUser } from './login.interface';
import { LoginService } from './login.service';

export class LoginManager {
  private readonly service: LoginService;

  constructor() {
    this.service = new LoginService();
  }

  async logIn(user: User): Promise<Token> {
    let verifyUser: VerifyUser;

    try {
      await checkMongoConnect;
      const Users = mongoose.models.Users || mongoose.model('Users', UserScheme, 'Users');

      if (!user || !user.email || !user.password) {
        throw new HttpBadRequestError('Email and password is required.');
      }

      verifyUser = await Users.findOne({ email: user.email });
      if (!verifyUser) throw new HttpBadRequestError(`Пользователь ${user.email} не найден`);
      // @ts-ignore
      const validate = await verifyUser.isValidPassword(user.password);
      if (!validate) throw new HttpBadRequestError('Неверный пароль');
    } catch (e) {
      if (e instanceof HttpBadRequestError) throw new HttpBadRequestError(e.message);

      throw new HttpInternalServerError(e.message);
    }

    return this.service.logIn(verifyUser);
  }
}

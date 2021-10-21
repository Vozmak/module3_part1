import { HttpBadRequestError, HttpInternalServerError } from '@errors/http';
import { Users } from '@models/MongoDB';
import { userValidation } from '@helper/gallery/usersValidator';
import { dbConnect } from '@services/mongoDbConnect';
import { SuccessSignup, Token, User, VerifyUser } from './auth.interface';
import { AuthService } from './auth.service';

export class AuthManager {
  private readonly service: AuthService;

  constructor() {
    this.service = new AuthService();
  }

  async logIn(user: User): Promise<Token> {
    let verifyUser: VerifyUser | null;

    try {
      await dbConnect;

      if (!user || !user.email || !user.password) {
        throw new HttpBadRequestError('Email and password is required.');
      }

      verifyUser = await Users.findOne({ email: user.email });
      if (!verifyUser) throw new HttpBadRequestError(`Пользователь ${user.email} не найден`);
      //@ts-ignore
      const validate: boolean = await verifyUser.isValidPassword(user.password);
      if (!validate) throw new HttpBadRequestError('Неверный пароль');
    } catch (e) {
      if (e instanceof HttpBadRequestError) throw new HttpBadRequestError(e.message);

      throw new HttpInternalServerError(e.message);
    }

    return this.service.logIn(verifyUser);
  }

  async signUp(user: User): Promise<SuccessSignup> {
    await dbConnect;

    if (!user || !user.email || !user.password) {
      throw new HttpBadRequestError('Не указаны данные');
    }

    const userVerify: User = await Users.findOne({ email: user.email });
    if (userVerify) {
      throw new HttpBadRequestError('Пользователь уже зарегестрирован');
    }

    if (!userValidation(user)) {
      throw new HttpBadRequestError('Некорректный ввод email или пароля');
    }

    return this.service.signUp(user, Users);
  }
}

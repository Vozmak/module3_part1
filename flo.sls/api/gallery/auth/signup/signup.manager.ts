import { HttpBadRequestError } from '@errors/http';
import { userValidation } from '@helper/gallery/usersValidator';
import { UserScheme } from '@models/MongoDB';
import { checkMongoConnect } from '@services/mongoDbConnect';
import * as mongoose from 'mongoose';
import { SuccessSignup, User } from './signup.interface';
import { SignupService } from './signup.service';

export class SignupManager {
  private readonly service: SignupService;

  constructor() {
    this.service = new SignupService();
  }

  async signUp(user: User): Promise<SuccessSignup> {
    await checkMongoConnect;
    const Users = mongoose.models.Users || mongoose.model('Users', UserScheme, 'Users');

    if (!user || !user.email || !user.password) {
      throw new HttpBadRequestError('Не указаны данные');
    }

    const userVerify = await Users.findOne({ email: user.email });
    if (userVerify) {
      throw new HttpBadRequestError('Пользователь уже зарегестрирован');
    }

    if (!userValidation(user)) {
      throw new HttpBadRequestError('Некорректный ввод email или пароля');
    }

    return this.service.signUp(user, Users);
  }
}

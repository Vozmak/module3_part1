import { HttpError } from '@errors/http/http-error';
import { User } from './login.interface';
import { getToken } from '@helper/rest-api/getJWT';
import { userValidation } from '@helper/rest-api/usersValidator';
import { log } from '@helper/logger';
import { UserScheme } from '@models/MongoDB';
import { Handler } from 'aws-lambda';
import { errorHandler } from '@helper/rest-api/error-handler';
import { APIGatewayLambdaEvent } from '@interfaces/api-gateway-lambda.interface';
import { checkMongoConnect } from '@services/mongoDbConnect';
import * as mongoose from 'mongoose';

export const signUp: Handler<APIGatewayLambdaEvent<User>, any> = async (event) => {
  log(event);

  try {
    await checkMongoConnect;
    const Users = mongoose.models.Users || mongoose.model('Users', UserScheme, 'Users');

    const user = event.body;
    if (!user || !user.email || !user.password) {
      throw new HttpError(401, 'Error', 'Не указаны данные');
    }

    const userVerify = await Users.findOne({ email: user.email });
    if (userVerify) {
      throw new HttpError(400, 'Error', 'Пользователь уже зарегестрирован');
    }

    if (!userValidation(user)) {
      throw new HttpError(400, 'Error', 'Некорректный ввод email или пароля');
    }

    await Users.create({ email: user.email, password: user.password });

    return {
      message: `${user.email} успешно зарегистрирован!`,
    };
  } catch (error) {
    return errorHandler(error);
  }
};

export const login: Handler<APIGatewayLambdaEvent<User>, any> = async (event) => {
  log(event);

  try {
    await checkMongoConnect;
    const Users = mongoose.models.Users || mongoose.model('Users', UserScheme, 'Users');

    const user = event.body;

    if (!user || !user.email || !user.password) {
      throw new HttpError(400, 'Error', 'Не указаны данные');
    }

    const verifyUser = await Users.findOne({ email: user.email });

    if (!verifyUser) throw new HttpError(404, 'FindError', `Пользователь ${user.email} не найден`);

    // @ts-ignore
    const validate = await verifyUser.isValidPassword(user.password);

    if (!validate) throw new HttpError(401, 'AuthError', 'Неверный пароль');

    // @ts-ignore
    return { token: getToken(verifyUser) };
  } catch (error) {
    return errorHandler(error);
  }
};

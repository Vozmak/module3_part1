// Remove example

import { HttpError } from '@errors/http/http-error';
import { getToken } from '@helper/rest-api/getJWT';
import { saveImages } from '@helper/rest-api/saveImages';
import { userValidation } from '@helper/rest-api/usersValidator';
import { log } from '@helper/logger';
import { Images, Users } from '@models/MongoDB';
import { Handler } from 'aws-lambda';
import { errorHandler } from '@helper/rest-api/error-handler';
import { APIGatewayLambdaEvent } from '@interfaces/api-gateway-lambda.interface';
import { LeanDocument } from 'mongoose';
import * as parser from 'lambda-multipart-parser';

interface Path {
  path: string | null;
}

interface User {
  email: string;
  password: string;
}

export const handler: Handler<APIGatewayLambdaEvent<null>, string> = async (event) => {
  log(event);

  try {
    return 'Hi!';
  } catch (error) {
    errorHandler(error);
  }
};

export const getGallery: Handler<APIGatewayLambdaEvent<null>, any> = async (event) => {
  log(event);

  try {
    const querystring = event.query;
    const page: string = querystring?.page || '1';
    const limit: string = querystring?.limit || '0';
    const filter: string = querystring?.filter || 'all';

    const numberPage = Number(page);
    const numberLimit = Number(limit);

    let findFilter;

    if (filter !== 'all') {
      const id = await Users.findOne({ email: filter }).lean();

      if (!id) throw new HttpError(404, 'FindError', `Пользователь ${filter} не найден`);

      findFilter = { imgCreator: id._id };
    } else {
      findFilter = {};
    }

    const pathImages: Array<LeanDocument<Path>> = await Images.find(findFilter, {
      _id: false,
      path: 1,
    })
      .lean()
      .skip((numberPage - 1) * numberLimit)
      .limit(numberLimit);

    const totalCount = await Images.count(findFilter);
    const total: number = Math.ceil(totalCount / (numberLimit ? numberLimit : totalCount));

    if (numberPage > total || numberPage < 1) throw new HttpError(404, 'FindError', `Страница не найдена`);

    if (pathImages.length === 0) throw new HttpError(404, 'FindError', `Пользователь ${filter} загрузил 0 картинок`);

    const images = pathImages.map((img) => img.path);

    return {
      objects: images,
      page: numberPage,
      total: total,
    };
  } catch (error) {
    return errorHandler(error);
  }
};

export const addImageGallery: Handler<APIGatewayLambdaEvent<null>, any> = async (event) => {
  // log(event);

  try {
    // @ts-ignore
    const result = await parser.parse(event);

    if (result.files.length === 0) {
      throw new HttpError(400, 'Error', 'Нет изображений для загрузки');
    }

    // @ts-ignore
    await saveImages(result, event.requestContext.authorizer.claims._id);

    return 'Картинки успешно загружены';
  } catch (error) {
    return errorHandler(error);
  }
};

export const signUp: Handler<APIGatewayLambdaEvent<User>, any> = async (event) => {
  log(event);

  try {
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
    const user = event.body;

    if (!user || !user.email || !user.password) {
      throw new HttpError(400, 'Error', 'Не указаны данные');
    }

    const verifyUser = await Users.findOne({ email: user.email });

    if (!verifyUser) throw new HttpError(404, 'FindError', `Пользователь ${user.email} не найден`);

    const validate = await verifyUser.isValidPassword(user.password);

    if (!validate) throw new HttpError(401, 'AuthError', 'Неверный пароль');

    return { token: getToken(verifyUser) };
  } catch (error) {
    return errorHandler(error);
  }
};

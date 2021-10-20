import { User } from './login.interface';
import { log } from '@helper/logger';
import { Handler } from 'aws-lambda';
import { errorHandler } from '@helper/rest-api/error-handler';
import { APIGatewayLambdaEvent } from '@interfaces/api-gateway-lambda.interface';
import { LoginManager } from './login.manager';

export const login: Handler<APIGatewayLambdaEvent<User>, any> = async (event) => {
  log(event);

  try {
    const manager = new LoginManager();

    const user: User = event.body;

    return await manager.logIn(user);
  } catch (error) {
    return errorHandler(error);
  }
};

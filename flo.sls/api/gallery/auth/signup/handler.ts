import { User } from './signup.interface';
import { log } from '@helper/logger';
import { Handler } from 'aws-lambda';
import { errorHandler } from '@helper/rest-api/error-handler';
import { APIGatewayLambdaEvent } from '@interfaces/api-gateway-lambda.interface';
import { SignupManager } from './signup.manager';

export const signUp: Handler<APIGatewayLambdaEvent<User>, any> = async (event) => {
  log(event);

  try {
    const manager = new SignupManager();

    const user = event.body;

    return await manager.signUp(user);
  } catch (error) {
    return errorHandler(error);
  }
};

import { getEnv } from '@helper/environment';
import * as jwt from 'jsonwebtoken';

interface User {
  _id: string;
  email: string;
}

export function getJWTToken(user: User): string {
  const body = { _id: user._id, email: user.email };
  return jwt.sign({ user: body }, getEnv('SECRET', true));
}

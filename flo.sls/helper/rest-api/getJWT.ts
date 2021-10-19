import { getEnv } from '@helper/environment';
import * as jwt from 'jsonwebtoken';

interface User {
  [k: string]: string;
}

export function getToken(user: User): string {
  const body = { _id: user._id, email: user.email };
  return jwt.sign({ user: body }, getEnv('SECRET', true));
}

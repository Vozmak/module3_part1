import * as jwt from 'jsonwebtoken';
import * as config from 'config';

interface User {
  [k: string]: string;
}

export function getToken(user: User): string {
  const body = { _id: user._id, email: user.email };
  return jwt.sign({ user: body }, config.get('secret'));
}

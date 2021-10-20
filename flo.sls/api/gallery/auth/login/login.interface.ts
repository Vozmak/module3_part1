export interface User {
  email: string;
  password: string;
}

export interface VerifyUser {
  _id: string;
  email: string;
}

export interface Token {
  token: string;
}

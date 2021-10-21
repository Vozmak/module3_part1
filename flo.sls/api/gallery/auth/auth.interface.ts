export interface User {
  email: string;
  password: string;
}

export interface VerifyUser {
  _id: string;
  email: string;
  password?: string;
}

export interface Token {
  token: string;
}

export interface User {
  email: string;
  password: string;
}

export interface SuccessSignup {
  message: string;
}

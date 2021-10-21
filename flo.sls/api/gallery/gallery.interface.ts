import { Schema } from 'mongoose';

export interface Path {
  path: string | null;
}

export interface User {
  _id: Schema.Types.ObjectId;
}

export interface Gallery {
  objects: Array<string | null>;
  page: number;
  total: number;
}

export interface Query {
  page?: string;
  limit?: string;
  filter?: string;
}

export interface Filter {
  imgCreator?: Schema.Types.ObjectId;
}

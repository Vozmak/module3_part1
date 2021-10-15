import { Mongoose } from 'mongoose';
import * as mongoose from 'mongoose';
import * as config from 'config';

const url: string = config.get('connectDb');

export async function connectMongo(): Promise<Mongoose> {
  await mongoose.connect(url);
  return mongoose;
}

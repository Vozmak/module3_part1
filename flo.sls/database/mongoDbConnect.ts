import { connect } from 'mongoose';
import * as config from 'config';

const url: string = config.get('connectDb');

const connectDb = async () => {
  await connect(url);
};

export { connectDb };

import { getEnv } from '@helper/environment';
import { log } from '@helper/logger';
import * as mongoose from 'mongoose';

const url: string = getEnv('MONGODB', true);

mongoose.connect(url);

export const dbConnect = new Promise((resolve, reject) => {
  const checkMongoConnect = mongoose.connection;

  checkMongoConnect.on('error', (error) => {
    log(error);
    reject(error);
  });

  checkMongoConnect.on('open', () => {
    log('Connect to DB success.');
  });

  resolve(checkMongoConnect);
});

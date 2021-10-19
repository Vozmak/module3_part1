import { getEnv } from '@helper/environment';
import { log } from '@helper/logger';
import * as mongoose from 'mongoose';

const url: string = getEnv('MONGODB', true);

mongoose.connect(url);

const checkMongoConnect = mongoose.connection;

checkMongoConnect.on('error', (error) => {
  log(error);
});

checkMongoConnect.on('open', () => {
  log('Connect to DB success.');
});

export { checkMongoConnect };

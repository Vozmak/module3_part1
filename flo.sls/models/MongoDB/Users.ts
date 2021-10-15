interface User {
  email: string;
  password: string;
}

import * as mongoose from 'mongoose';
import * as bcrypt from 'bcrypt';
import * as config from 'config';

const UserScheme = new mongoose.Schema<User>({
  email: {
    type: String,
    required: true,
    unique: true,
  },

  password: {
    type: String,
    required: true,
  },
});

UserScheme.pre('save', async function () {
  // eslint-disable-next-line @typescript-eslint/no-this-alias
  // const user = this;
  this.password = await bcrypt.hash(this.password, config.get('saltRounds'));
});

UserScheme.methods.isValidPassword = async function (password: string) {
  // eslint-disable-next-line @typescript-eslint/no-this-alias
  const user = this;
  return await bcrypt.compare(password, user.password);
};

export const Users = mongoose.models.Users || mongoose.model('Users', UserScheme, 'Users');

import { promisify } from 'util';
import * as childProcess from 'child_process';
import * as plist from 'plist';

const execFileP = promisify(childProcess.execFile);

const parse = (data) => {
  const object = plist.parse(data);
  const returnValue = {};

  // eslint-disable-next-line prefer-const
  for (let [key, value] of Object.entries(object)) {
    key = key.replace(/^kMDItem/, '').replace(/_/g, '');
    key = key.startsWith('FS') ? key.replace(/^FS/, 'fs') : key[0].toLowerCase() + key.slice(1);
    returnValue[key] = value;
  }

  return returnValue;
};

export async function fileMetadataAsync(filePath) {
  const { stdout } = await execFileP('mdls', ['-plist', '-', filePath]);
  return parse(stdout.trim());
}

export function fileMetadataSync(filePath) {
  const stdout = childProcess.execFileSync('mdls', ['-plist', '-', filePath], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'ignore'],
  });

  return parse(stdout.trim());
}

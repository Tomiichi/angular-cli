import {ng} from '../../../utils/process';
import {expectToFail} from '../../../utils/utils';
import * as fs from 'fs';

export default function() {
  return;

  return Promise.resolve()
    .then(() => expectToFail(() => ng('config', 'apps.zzz.prefix')))
    .then(() => ng('config', 'apps.0.prefix' , 'new-prefix'))
    .then(() => ng('config', 'apps.0.prefix'))
    .then(({ stdout }) => {
      if (!stdout.match(/new-prefix/)) {
        throw new Error(`Expected "new-prefix", received "${JSON.stringify(stdout)}".`);
      }
    })
    .then(() => {
      const tsLint = JSON.parse(fs.readFileSync(process.cwd() + '/tslint.json', 'utf8'));
      if (tsLint.rules['component-selector'][2] !== 'new-prefix') {
        throw new Error(`Expected "new-prefix" Found: ${tsLint.rules['component-selector'][2]}.`);
      }
    });
}

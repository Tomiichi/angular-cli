import {
  writeMultipleFiles,
  deleteFile,
  expectFileToMatch,
  replaceInFile
} from '../../../utils/fs';
import { expectToFail } from '../../../utils/utils';
import { ng } from '../../../utils/process';
import { stripIndents } from 'common-tags';
import { updateJsonFile } from '../../../utils/project';

export default function () {
  // TODO(architect): Delete this test. It is now in devkit/build-webpack.

  return writeMultipleFiles({
    'src/styles.scss': stripIndents`
      @import './imported-styles.scss';
      body { background-color: blue; }
    `,
    'src/imported-styles.scss': stripIndents`
      p { background-color: red; }
    `,
    'src/app/app.component.scss': stripIndents`
        .outer {
          .inner {
            background: #fff;
          }
        }
      `})
    .then(() => deleteFile('src/app/app.component.css'))
    .then(() => updateJsonFile('.angular.json', workspaceJson => {
      const appArchitect = workspaceJson.projects.app.architect;
      appArchitect.build.options.styles = [
        { input: 'src/styles.scss' }
      ];
    }))
    .then(() => replaceInFile('src/app/app.component.ts',
      './app.component.css', './app.component.scss'))
    .then(() => ng('build', '--extract-css', '--source-map'))
    .then(() => expectFileToMatch('dist/styles.css',
      /body\s*{\s*background-color: blue;\s*}/))
    .then(() => expectFileToMatch('dist/styles.css',
      /p\s*{\s*background-color: red;\s*}/))
    .then(() => expectToFail(() => expectFileToMatch('dist/styles.css', '"mappings":""')))
    .then(() => expectFileToMatch('dist/main.js', /.outer.*.inner.*background:\s*#[fF]+/));
}

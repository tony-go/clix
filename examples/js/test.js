import assert from 'assert';
import path from 'path';

import clix from '../../src/index.js';

async function test() {
  const cwd = process.cwd();
  const fullPath = path.join(cwd, 'examples', 'js', 'bin.js');
  const scenario = clix('node' + ' ' + fullPath)
    .expect('What is your name?')
    .input('Joe')
    .expect('Hello, Joe!');

  const { ok } = await scenario.run();

  assert.ok(ok, 'Scenario should be ok');
}

test()
  .then(() => console.log('Success'))
  .catch(console.error);

import assert from 'assert';

import clix from '../../src/index.js';

async function test() {
  const scenario = clix('node ./bin.js')
    .expect('What is your name?')
    .input('Joe')
    .expect('Hello, Joe!');

  const { ok } = await scenario.run();

  assert.ok(ok, 'Scenario should be ok');
}

test()
  .then(() => console.log('Success'))
  .catch(console.error);

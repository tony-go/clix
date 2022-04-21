import assert from 'assert';

import clix from '@tonygo/clix';

async function test() {
  const scenario = clix('node ./bin.js')
    .expect('What is your name?')
    .input('jowpi')
    .expect('Hello, jowpi!');

  const { ok } = await scenario.run();

  // console.log(steps.all());

  assert.ok(ok);
}

test().catch(console.error);

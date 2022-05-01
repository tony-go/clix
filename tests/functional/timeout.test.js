import { test } from 'tap';

import clix from '../../src/index.js';

test('.run should succeed if expect timeout are not elapsed', async (t) => {
  const kCustomTimeoutCommand = 'bash ./tests/functional/fixtures/timeout.sh';
  const name = 'hali';
  const scenario = clix(kCustomTimeoutCommand)
    .expect('Hello, who am I talking to?')
    .input(name)
    .expect(`Hey ${name}!`, { timeout: 3_000 });

  const res = await scenario.run();

  t.ok(res.ok);
  t.end();
});

test('.run rejects failed if expect timeout are elapsed', async (t) => {
  const kCustomTimeoutCommand = 'bash ./tests/functional/fixtures/timeout.sh';
  const name = 'hali';
  const scenario = clix(kCustomTimeoutCommand)
    .expect('Hello, who am I talking to?')
    .input(name)
    .expect(`Hey ${name}!`, { timeout: 1_000 });

  await t.rejects(scenario.run());
  t.end();
});

test('.run should succeed if expectError timeout are not elapsed', async (t) => {
  const kCustomTimeoutCommand =
    'bash ./tests/functional/fixtures/timeout-error.sh';
  const name = 'hali';
  const scenario = clix(kCustomTimeoutCommand)
    .expect('Hello, who am I talking to?')
    .input(name)
    .expectError('Hey ' + name + '!', { timeout: 3_000 });

  const res = await scenario.run();

  t.ok(res.ok);
  t.end();
});

test('.run should rejects if expectError timeout are elapsed', async (t) => {
  const kCustomTimeoutCommand =
    'bash ./tests/functional/fixtures/timeout-error.sh';
  const name = 'hali';
  const scenario = clix(kCustomTimeoutCommand)
    .expect('Hello, who am I talking to?')
    .input(name)
    .expectError('Hey ' + name + '!', { timeout: 1_000 });

  await t.rejects(scenario.run());
  t.end();
});

import { test } from 'tap';

import clix, { Scenario } from '../../../src/index.js';
import { kActType } from '../../../src/constant.js';
import { Player } from '../../../src/player.js';

test('it expectError function could add expected errors', (t) => {
  const scenario = clix('foo bar');

  const error = 'error';
  scenario.expectError(error);

  t.same(scenario.acts, [
    {
      value: error,
      type: kActType.expectError,
      options: {},
    },
  ]);
  t.end();
});

test('it expectError could take an array of string', (t) => {
  const scenario = clix('foo bar');
  const errorA = 'boom';
  const errorB = 'paf';

  scenario.expectError([errorA, errorB]);

  t.same(scenario.acts, [
    { value: errorA, type: kActType.expectError, options: {} },
    { value: errorB, type: kActType.expectError, options: {} },
  ]);
  t.end();
});

test('it should allow chaining with input method', (t) => {
  const scenario = clix('foo bar').expectError('yo').expectError('foo');

  t.ok(scenario instanceof Scenario);
  t.end();
});

test('it should handle a timeout option', (t) => {
  const scenario = clix('foo').expectError('bar', { timeout: 3000 });

  t.same(scenario.acts, [
    { value: 'bar', type: kActType.expectError, options: { timeout: 3000 } },
  ]);

  t.end();
});

test('it should throw a timeout error when time is out', async (t) => {
  class PlayerStub extends Player {
    start() {}
    next() {}
  }

  const player = new PlayerStub();
  const scenario = new Scenario('foo', player).expectError('bar', {
    timeout: 5,
  });

  try {
    await scenario.run();
    t.ok(false);
  } catch (e) {
    t.ok(e.message);
  }

  t.end();
});

test('it should not throw the timeout error', async (t) => {
  class PlayerStub extends Player {
    #context = null;

    setContext(context) {
      this.#context = context;
    }

    start() {
      this.#context.handler('bar', { ...this.#context, isError: false });
    }
    next() {}
  }

  const player = new PlayerStub();
  const scenario = new Scenario('foo', player).expectError('bar', {
    timeout: 5,
  });

  await scenario.run();

  t.end();
});

import { test } from 'tap';

import clix, { Scenario } from '../../../src/index.js';
import { kActType } from '../../../src/constant.js';
import { Player } from '../../../src/player.js';

test('it should expose an expect function to add an expected value', (t) => {
  const scenario = clix('foo bar');
  const expectedValue = 'hey';

  scenario.expect(expectedValue);

  t.same(scenario.acts, [
    { value: expectedValue, type: kActType.expect, options: {} },
  ]);
  t.end();
});

test('it should expose an expect function to add an several expected Values', (t) => {
  const scenario = clix('foo bar');
  const valueA = 'hey';
  const valueB = 'yo';

  scenario.expect([valueA, valueB]);

  t.same(scenario.acts, [
    { value: valueA, type: kActType.expect, options: {} },
    { value: valueB, type: kActType.expect, options: {} },
  ]);
  t.end();
});

test('it should allow chaining with expect method', (t) => {
  const scenario = clix('foo bar').expect('yo').expect('foo');

  t.ok(scenario instanceof Scenario);
  t.end();
});

test('it should handle a timeout option', (t) => {
  const scenario = clix('foo').expect('bar', { timeout: 3000 });

  t.same(scenario.acts, [
    { value: 'bar', type: kActType.expect, options: { timeout: 3000 } },
  ]);

  t.end();
});

test('it should throw a timeout error when time is out', async (t) => {
  class PlayerStub extends Player {
    start() {}
  }

  const player = new PlayerStub();
  const scenario = new Scenario('foo', player).expect('bar', { timeout: 5 });

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
  }

  const player = new PlayerStub();
  const scenario = new Scenario('foo', player).expect('bar', { timeout: 5 });

  await scenario.run();

  t.end();
});

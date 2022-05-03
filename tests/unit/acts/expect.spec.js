import { test } from 'tap';

import clix from '../../../src/index.js';
import { kActType } from '../../../src/constant.js';
import { Player } from '../../../src/player.js';
import { ScenarioBuilder } from '../../../src/scenario-builder.js';

test('it should expose an expect function to add an expected value', (t) => {
  const scenarioBuilder = clix('foo bar');
  const expectedValue = 'hey';

  scenarioBuilder.expect(expectedValue);
  const scenario = scenarioBuilder.build();

  t.same(scenario.acts, [
    { value: expectedValue, type: kActType.expect, options: {} },
  ]);
  t.end();
});

test('it should expose an expect function to add an several expected Values', (t) => {
  const scenarioBuilder = clix('foo bar');
  const valueA = 'hey';
  const valueB = 'yo';

  scenarioBuilder.expect([valueA, valueB]);
  const scenario = scenarioBuilder.build();

  t.same(scenario.acts, [
    { value: valueA, type: kActType.expect },
    { value: valueB, type: kActType.expect },
  ]);
  t.end();
});

test('it should allow chaining with expect method', (t) => {
  const scenarioBuilder = clix('foo bar').expect('yo').expect('foo');

  t.ok(scenarioBuilder instanceof ScenarioBuilder);
  t.end();
});

test('it should handle a timeout option', (t) => {
  const scenario = clix('foo').expect('bar', { timeout: 3000 }).build();

  t.same(scenario.acts, [
    { value: 'bar', type: kActType.expect, options: { timeout: 3000 } },
  ]);

  t.end();
});

test('it should throw a timeout error when time is out', async (t) => {
  class PlayerStub extends Player {
    start() {}
    continue() {}
  }

  const player = new PlayerStub();
  const scenarioBuilder = new ScenarioBuilder()
    .withCommand('foo')
    .withPlayer(player)
    .expect('bar', { timeout: 5 });

  try {
    await scenarioBuilder.run();
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

    continue() {}
  }

  const player = new PlayerStub();
  const scenarioBuilder = new ScenarioBuilder()
    .withCommand('foo')
    .withPlayer(player)
    .expect('bar', { timeout: 5 });

  await scenarioBuilder.run();

  t.end();
});

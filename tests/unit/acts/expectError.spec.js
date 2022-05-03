import { test } from 'tap';

import clix from '../../../src/index.js';
import { kActType } from '../../../src/constant.js';
import { Player } from '../../../src/player.js';
import { ScenarioBuilder } from '../../../src/scenario-builder.js';

test('it expectError function could add expected errors', (t) => {
  const scenarioBuilder = clix('foo bar');

  const error = 'error';
  scenarioBuilder.expectError(error);
  const scenario = scenarioBuilder.build();

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
  const scenarioBuilder = clix('foo bar');
  const errorA = 'boom';
  const errorB = 'paf';

  scenarioBuilder.expectError([errorA, errorB]);
  const scenario = scenarioBuilder.build();

  t.same(scenario.acts, [
    { value: errorA, type: kActType.expectError },
    { value: errorB, type: kActType.expectError },
  ]);
  t.end();
});

test('it should allow chaining with input method', (t) => {
  const scenarioBuilder = clix('foo bar').expectError('yo').expectError('foo');

  t.ok(scenarioBuilder instanceof ScenarioBuilder);
  t.end();
});

test('it should handle a timeout option', (t) => {
  const scenarioBuilder = clix('foo').expectError('bar', { timeout: 3000 });
  const scenario = scenarioBuilder.build();

  t.same(scenario.acts, [
    { value: 'bar', type: kActType.expectError, options: { timeout: 3000 } },
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
    .expectError('bar', { timeout: 5 });

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
    .expectError('bar', { timeout: 5 });

  await scenarioBuilder.run();

  t.end();
});

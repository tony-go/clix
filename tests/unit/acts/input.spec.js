import { test } from 'tap';

import clix from '../../../src/index.js';
import { kActType } from '../../../src/constant.js';
import { ScenarioBuilder } from '../../../src/scenario-builder.js';

test('it should expose an input function to add an expected value', (t) => {
  const scenarioBuilder = clix('foo bar');
  const inputValue = 'hey';

  scenarioBuilder.input(inputValue);
  const scenario = scenarioBuilder.build();

  t.same(scenario.acts, [{ value: inputValue, type: kActType.input }]);
  t.end();
});

test('it should expose an input function to add an several expected Values', (t) => {
  const scenarioBuilder = clix('foo bar');
  const inputA = 'hey';
  const inputB = 'yo';

  scenarioBuilder.input([inputA, inputB]);
  const scenario = scenarioBuilder.build();

  t.same(scenario.acts, [
    { value: inputA, type: kActType.input },
    { value: inputB, type: kActType.input },
  ]);
  t.end();
});

test('it should allow chaining with input method', (t) => {
  const scenarioBuilder = clix('foo bar').input('yo').input('foo');

  t.ok(scenarioBuilder instanceof ScenarioBuilder);
  t.end();
});

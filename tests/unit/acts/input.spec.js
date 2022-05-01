import { test } from 'tap';

import clix, { Scenario } from '../../../src/index.js';
import { kActType } from '../../../src/constant.js';

test('it should expose an input function to add an expected value', (t) => {
  const scenario = clix('foo bar');
  const inputValue = 'hey';

  scenario.input(inputValue);

  t.same(scenario.acts, [{ value: inputValue, type: kActType.input }]);
  t.end();
});

test('it should expose an input function to add an several expected Values', (t) => {
  const scenario = clix('foo bar');
  const inputA = 'hey';
  const inputB = 'yo';

  scenario.input([inputA, inputB]);

  t.same(scenario.acts, [
    { value: inputA, type: kActType.input },
    { value: inputB, type: kActType.input },
  ]);
  t.end();
});

test('it should allow chaining with input method', (t) => {
  const scenario = clix('foo bar').input('yo').input('foo');

  t.ok(scenario instanceof Scenario);
  t.end();
});

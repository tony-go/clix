import { test } from 'tap';

import clix, { Scenario } from '../../../src/index.js';
import { kActType } from '../../../src/constant.js';

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

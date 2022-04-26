import { test } from 'tap';

import clix, { Scenario } from '../../src/index.js';
import { kActType } from '../../src/constant.js';

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

test('it withError function could add an expected error code', (t) => {
  const scenario = clix('foo bar');

  const code = 1;
  const errorText = 'yo';
  scenario.expectError(errorText).withCode(code);

  const lastAct = scenario.acts.at(-1);
  t.same(lastAct, {
    value: code,
    type: kActType.exitCode,
  });
  t.end();
});

test('it should allow chaining with input method', (t) => {
  const scenario = clix('foo bar').expectError('yo').withCode(2);

  t.ok(scenario instanceof Scenario);
  t.end();
});

test('it should be possible to call withCode after an expect', (t) => {
  const code = 2;

  const scenario = clix('foo bar').expect('yo').withCode(code);

  const lastAct = scenario.acts.at(-1);
  t.same(lastAct, {
    value: code,
    type: kActType.exitCode,
  });
  t.end();
});

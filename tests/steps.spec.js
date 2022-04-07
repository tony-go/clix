import { test } from 'tap';

import clix, { Scenario } from '../src/index.js';

test('it should expose an expect function to add an expected value', (t) => {
  const scenario = clix('foo bar');
  const expectedValue = 'hey';

  scenario.expect(expectedValue);

  t.same(scenario.steps, [{ value: expectedValue, type: 'expect' }]);
  t.end();
});

test('it should expose an expect function to add an several expected Values', (t) => {
  const scenario = clix('foo bar');
  const valueA = 'hey';
  const valueB = 'yo';

  scenario.expect([valueA, valueB]);

  t.same(scenario.steps, [
    { value: valueA, type: 'expect' },
    { value: valueB, type: 'expect' },
  ]);
  t.end();
});

test('it should allow chaining with expect method', (t) => {
  const scenario = clix('foo bar').expect('yo').expect('foo');

  t.ok(scenario instanceof Scenario);
  t.end();
});

test('it should expose an input function to add an expected value', (t) => {
  const scenario = clix('foo bar');
  const inputValue = 'hey';

  scenario.input(inputValue);

  t.same(scenario.steps, [{ value: inputValue, type: 'input' }]);
  t.end();
});

test('it should expose an expect function to add an several expected Values', (t) => {
  const scenario = clix('foo bar');
  const inputA = 'hey';
  const inputB = 'yo';

  scenario.input([inputA, inputB]);

  t.same(scenario.steps, [
    { value: inputA, type: 'input' },
    { value: inputB, type: 'input' },
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

  t.same(scenario.steps, [
    {
      value: error,
      type: 'expect-error',
    },
  ]);
  t.end();
});

test('it expectError could take an array of string', (t) => {
  const scenario = clix('foo bar');
  const errorA = 'boom';
  const errorB = 'paf';

  scenario.expectError([errorA, errorB]);

  t.same(scenario.steps, [
    { value: errorA, type: 'expect-error' },
    { value: errorB, type: 'expect-error' },
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

  const lastStep = scenario.steps.at(-1);
  t.same(lastStep, {
    value: code,
    type: 'expect-error-code',
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

  const lastStep = scenario.steps.at(-1);
  t.same(lastStep, {
    value: code,
    type: 'expect-error-code',
  });
  t.end();
});

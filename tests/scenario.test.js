import test from 'tape';

import clix, { Scenario } from '../src/index.js';

test('it should expose an expect function to add an expected value', (t) => {
  const scenario = clix('foo bar');
  const expectedValue = 'hey';

  scenario.expect(expectedValue);

  t.deepEqual(scenario.steps, [{ value: expectedValue, type: 'expect' }]);
  t.end();
});

test('it should expose an expect function to add an several expected Values', (t) => {
  const scenario = clix('foo bar');
  const valueA = 'hey';
  const valueB = 'yo';

  scenario.expect([valueA, valueB]);

  t.deepEqual(scenario.steps, [
    { value: valueA, type: 'expect' },
    { value: valueB, type: 'expect' },
  ]);
  t.end();
});

test('it should allow chaining with expect method', (t) => {
  const scenario = clix('foo bar').expect('yo').expect('foo');

  t.true(scenario instanceof Scenario);
  t.end();
});

test('it should expose an input function to add an expected value', (t) => {
  const scenario = clix('foo bar');
  const inputValue = 'hey';

  scenario.input(inputValue);

  t.deepEqual(scenario.steps, [{ value: inputValue, type: 'input' }]);
  t.end();
});

test('it should expose an expect function to add an several expected Values', (t) => {
  const scenario = clix('foo bar');
  const inputA = 'hey';
  const inputB = 'yo';

  scenario.input([inputA, inputB]);

  t.deepEqual(scenario.steps, [
    { value: inputA, type: 'input' },
    { value: inputB, type: 'input' },
  ]);
  t.end();
});

test('it should allow chaining with input method', (t) => {
  const scenario = clix('foo bar').input('yo').input('foo');

  t.true(scenario instanceof Scenario);
  t.end();
});

// third party dependencies
import { test, afterEach } from 'tap';
import { spyOn } from 'tinyspy';

// internal dependencies
import clix from '../../src/index.js';

afterEach(() => {
  process.env['DEBUG'] = '';
});

test('it should expose a compare function', (t) => {
  const scenario = clix('test');

  t.equal(typeof scenario._compare, 'function');
  t.end();
});

test('it should set currentStep.ok to true if values are equal', (t) => {
  const step = {
    type: 'equal',
    value: 'foo',
  };
  const equalBufferValue = 'foo';

  clix('test')._compare(step, equalBufferValue);

  t.ok(step.ok);
  t.end();
});

test('it should set currentStep.ok to false if values are not equal', (t) => {
  const step = {
    type: 'equal',
    value: 'foo',
  };
  const notEqualBufferValue = 'zoo';

  clix('test')._compare(step, notEqualBufferValue);

  t.notOk(step.ok);
  t.end();
});

test('it should add an actual property to the current step within buffer value', (t) => {
  const step = {
    type: 'equal',
    value: 'foo',
  };
  const equalBufferValue = 'foo';

  clix('test')._compare(step, equalBufferValue);

  t.equal(step.actual, equalBufferValue);
  t.end();
});

test('it should call debug method with expected and actual value', (t) => {
  process.env['DEBUG'] = '1';
  const debugSpy = spyOn(console, 'log');
  const step = {
    type: 'equal',
    value: 'foo',
  };
  const equalBufferValue = 'foo';

  clix('test')._compare(step, equalBufferValue);

  t.equal(debugSpy.calls.length, 1);
  const consoleArguments = debugSpy.calls.at(0).at(1);
  t.equal(consoleArguments[('equal', equalBufferValue, step.value)]);
  t.end();
});

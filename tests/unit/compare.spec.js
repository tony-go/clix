// third party dependencies
import { test, afterEach } from 'tap';
import { spyOn } from 'tinyspy';

// internal dependencies
import clix from '../../src/index.js';

afterEach(() => {
  process.env['DEBUG'] = '';
});

test('it should expose a compare function', (t) => {
  const scenario = clix('test').build();

  t.equal(typeof scenario._compare, 'function');
  t.end();
});

test('it should set currentAct.ok to true if values are equal', (t) => {
  const act = {
    type: 'equal',
    value: 'foo',
  };
  const equalBufferValue = 'foo';

  clix('test').build()._compare(act, equalBufferValue);

  t.ok(act.ok);
  t.end();
});

test('it should set currentAct.ok to false if values are not equal', (t) => {
  const act = {
    type: 'equal',
    value: 'foo',
  };
  const notEqualBufferValue = 'zoo';

  clix('test').build()._compare(act, notEqualBufferValue);

  t.notOk(act.ok);
  t.end();
});

test('it should add an actual property to the current act within buffer value', (t) => {
  const act = {
    type: 'equal',
    value: 'foo',
  };
  const equalBufferValue = 'foo';

  clix('test').build()._compare(act, equalBufferValue);

  t.equal(act.actual, equalBufferValue);
  t.end();
});

test('it should call debug method with expected and actual value', (t) => {
  process.env['DEBUG'] = '1';
  const debugSpy = spyOn(console, 'log');
  const act = {
    type: 'equal',
    value: 'foo',
  };
  const equalBufferValue = 'foo';

  clix('test').build()._compare(act, equalBufferValue);

  t.equal(debugSpy.calls.length, 1);
  const consoleArguments = debugSpy.calls.at(0).at(1);
  t.equal(consoleArguments[('equal', equalBufferValue, act.value)]);
  t.end();
});

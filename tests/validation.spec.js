import { test } from 'tap';

import clix, { Scenario } from '../src/index.js';

test('it should expose a function', (t) => {
  t.ok(clix instanceof Function);
  t.end();
});

test('it should throw an error if command is nullish', (t) => {
  const nullCommand = null;
  t.throws(
    () => clix(nullCommand),
    new Error(`Command should be a string but got ${nullCommand}`)
  );
  t.end();
});

test('it should throw an error if command is undefined', (t) => {
  const undefinedCommand = null;
  t.throws(
    () => clix(undefinedCommand),
    new Error(`Command should be a string but got ${undefinedCommand}`)
  );
  t.end();
});

test('it should throw an error if command is an empty string', (t) => {
  const emptyCommand = '';
  t.throws(
    () => clix(emptyCommand),
    new Error('Command should not be an empty string')
  );
  t.end();
});

test('it should return a Scenario instance if command type is valid', (t) => {
  const validCommand = 'bash ./fixtures/basic';

  const res = clix(validCommand);

  t.ok(res instanceof Scenario);
  t.end();
});

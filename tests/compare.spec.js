import { test } from 'tap';

import clix from '../src/index.js';

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

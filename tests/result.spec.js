import { test } from 'tap';

import clix from '../src/index.js';

test('it should expose a buildResult method as public', (t) => {
  const scenario = clix('my-command');

  t.ok(scenario.buildResult);
  t.end();
});

test('buildResult should return an .ok property', (t) => {
  const scenario = clix('my-command');

  const { ok } = scenario.buildResult();

  t.equal(typeof ok, 'boolean');
  t.end();
});

test('buildResult should return a .steps property within an .all property', (t) => {
  const scenario = clix('my-command');

  const { steps } = scenario.buildResult();

  t.equal(typeof steps.all, 'function');
  t.end();
});

test('steps.all should return all steps', (t) => {
  // given
  const scenario = clix('my-command')
    .expect('foo')
    .input('bar')
    .expectError('baz');

  // when
  const { steps } = scenario.buildResult();
  const allSteps = steps.all();

  // then
  t.equal(allSteps.length, scenario.steps.length);
  t.end();
});

test('steps.last should return the last step that failed', (t) => {
  // given
  const scenario = clix('my-command')
    .expect('foo')
    .input('bar')
    .expectError('baz');
  scenario.steps[0].ok = false; // simulate .run() call

  // when
  const { steps } = scenario.buildResult();
  const lastFailedSteps = steps.failed();

  // then
  t.equal(lastFailedSteps.value, 'foo');
  t.end();
});

test('steps.last should return the last step if nothing failed', (t) => {
  // given
  const scenario = clix('my-command')
    .expect('foo')
    .input('bar')
    .expectError('baz');
  const res = scenario.buildResult();

  // when
  const step = res.steps.failed();

  // then
  t.equal(step, null);
  t.end();
});

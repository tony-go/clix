import { test } from 'tap';

import clix from '../../src/index.js';

test('it should expose a _buildResult method as public', (t) => {
  const scenario = clix('my-command');

  t.ok(scenario._buildResult);
  t.end();
});

test('_buildResult should return an .ok property', (t) => {
  const scenario = clix('my-command');

  const { ok } = scenario._buildResult();

  t.equal(typeof ok, 'boolean');
  t.end();
});

test('_buildResult should return a .steps property within an .all property', (t) => {
  const scenario = clix('my-command');

  const { steps } = scenario._buildResult();

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
  const { steps } = scenario._buildResult();
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
  const { steps } = scenario._buildResult();
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
  const res = scenario._buildResult();

  // when
  const step = res.steps.failed();

  // then
  t.equal(step, null);
  t.end();
});

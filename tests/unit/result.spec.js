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

test('_buildResult should return a .acts property within an .all property', (t) => {
  const scenario = clix('my-command');

  const { acts } = scenario._buildResult();

  t.equal(typeof acts.all, 'function');
  t.end();
});

test('acts.all should return all acts', (t) => {
  // given
  const scenario = clix('my-command')
    .expect('foo')
    .input('bar')
    .expectError('baz');

  // when
  const { acts } = scenario._buildResult();
  const allActs = acts.all();

  // then
  t.equal(allActs.length, scenario.acts.length);
  t.end();
});

test('acts.last should return the last act that failed', (t) => {
  // given
  const scenario = clix('my-command')
    .expect('foo')
    .input('bar')
    .expectError('baz');
  scenario.acts[0].ok = false; // simulate .run() call

  // when
  const { acts } = scenario._buildResult();
  const lastFailedActs = acts.failed();

  // then
  t.equal(lastFailedActs.value, 'foo');
  t.end();
});

test('acts.last should return the last act if nothing failed', (t) => {
  // given
  const scenario = clix('my-command')
    .expect('foo')
    .input('bar')
    .expectError('baz');
  const res = scenario._buildResult();

  // when
  const act = res.acts.failed();

  // then
  t.equal(act, null);
  t.end();
});

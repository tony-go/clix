// node.js dependencies
import cp from 'child_process';

// third-party dependencies
import { test } from 'tap';
import { spyOn } from 'tinyspy';

// internal dependencies
import clix from '../../src/index.js';

// constants
const kSimpleOutputCommand = 'bash ./tests/functional/fixtures/simple.sh';
const kSimpleCommandWithOutput =
  'bash ./tests/functional/fixtures/simple-with-input.sh';
const kReturnError = 'bash ./tests/functional/fixtures/return-error.sh';
const kReturnErrorWithCode =
  'bash ./tests/functional/fixtures/return-error-with-code.sh';

test('it should expose a run method', (t) => {
  const scenario = clix(kSimpleOutputCommand);

  t.ok(scenario.run);
  t.end();
});

test('it should spawn a process when run is called', async (t) => {
  const spawnSpy = spyOn(cp, 'spawn');
  const scenario = clix(kSimpleOutputCommand).expect(
    'Hello, who am I talking to?'
  );

  await scenario.run();

  t.ok(spawnSpy.called);
  t.end();
});

test('it should assert the expect value passed', async (t) => {
  const expectedValue = 'Hello, who am I talking to?';
  const scenario = clix(kSimpleOutputCommand).expect(expectedValue);

  const { ok, acts } = await scenario.run();

  t.ok(ok);
  t.same(acts.all(), [
    {
      value: expectedValue,
      type: 'expect',
      ok: true,
      actual: expectedValue,
      options: {},
    },
  ]);
  t.end();
});

test('it should write input value passed', async (t) => {
  const name = 'tony';
  const scenario = clix(kSimpleCommandWithOutput)
    .expect('Hello, who am I talking to?')
    .input(name)
    .expect(`Hey ${name}!`);

  const { ok, acts } = await scenario.run();

  t.ok(ok);
  t.ok(acts.all().every((act) => act.ok));
  t.end();
});

test('it should assert error message', async (t) => {
  const scenario = clix(kReturnError)
    .expect('Hello, who am I talking to?')
    .input('tony')
    .expectError('error');

  const { ok, acts } = await scenario.run();

  t.ok(ok);
  t.ok(acts.all().every((act) => act.ok));
  t.end();
});

test('it should assert error message and the error message', async (t) => {
  const scenario = clix(kReturnErrorWithCode)
    .expect('Hello, who am I talking to?')
    .input('tony')
    .expectError('error')
    .withCode(2);

  const { ok, acts } = await scenario.run();

  t.ok(ok);
  t.ok(acts.all().every((act) => act.ok));
  t.end();
});

test('it should assert exit code without error message', async (t) => {
  const kExitCodeWithoutErrorMessage =
    'bash ./tests/functional/fixtures/exit-code-without-error-message.sh';
  const fakeInput = 'tony';
  const scenario = clix(kExitCodeWithoutErrorMessage)
    .expect('Hello, who am I talking to?')
    .input(fakeInput)
    .expect(fakeInput)
    .withCode(2);

  const { ok, acts } = await scenario.run();

  t.ok(ok);
  t.ok(acts.all().every((act) => act.ok));
  t.end();
});

test('.run should append actual value in each act object', async (t) => {
  const scenario = clix(kReturnErrorWithCode)
    .expect('Hello, who am I talking to?')
    .input('tony')
    .expectError('error')
    .withCode(2);

  const { acts } = await scenario.run();
  console.log(scenario.acts);
  const allActs = acts.all();

  const allActsHaveActualProperty = allActs
    .filter(isNotInputAct)
    .every(shouldHaveAnActualProperty);
  t.ok(allActsHaveActualProperty);
  t.end();
});

test('.run should throw error when a act fail but was not expected to fail', async (t) => {
  const scenario = clix('unknown command').expect('should throw');

  try {
    await scenario.run();
    t.ok(false);
  } catch (e) {
    t.ok(e.message);
  }

  t.end();
});

test('.run should succeed if timeout are not elapsed', async (t) => {
  const kCustomTimeoutCommand = 'bash ./tests/functional/fixtures/timeout.sh';
  const name = 'hali';
  const scenario = clix(kCustomTimeoutCommand)
    .expect('Hello, who am I talking to?')
    .input(name)
    .expect(`Hey ${name}!`, { timeout: 3_000 });

  const res = await scenario.run();

  t.ok(res.ok);
  t.end();
});

test('.run should failed of timeout are elapsed', async (t) => {
  const kCustomTimeoutCommand = 'bash ./tests/functional/fixtures/timeout.sh';
  const name = 'hali';
  const scenario = clix(kCustomTimeoutCommand)
    .expect('Hello, who am I talking to?')
    .input(name)
    .expect(`Hey ${name}!`, { timeout: 1_000 });

  await t.rejects(scenario.run());
  t.end();
});

/**
 * HELPERS
 */

const isNotInputAct = (act) => act.type !== 'input';
const shouldHaveAnActualProperty = (act) => act.actual !== undefined;

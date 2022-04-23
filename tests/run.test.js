// node.js dependencies
import cp from 'child_process';

// third-party dependencies
import { test } from 'tap';
import { spyOn } from 'tinyspy';

// internal dependencies
import clix from '../src/index.js';

// constants
const kSimpleOutputCommand = 'bash ./tests/fixtures/simple.sh';
const kSimpleCommandWithOutput = 'bash ./tests/fixtures/simple-with-input.sh';
const kReturnError = 'bash ./tests/fixtures/return-error.sh';
const kReturnErrorWithCode = 'bash ./tests/fixtures/return-error-with-code.sh';

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

  scenario.run();

  t.ok(spawnSpy.called);
  t.end();
});

test('it should assert the expect value passed', async (t) => {
  const expectedValue = 'Hello, who am I talking to?';
  const scenario = clix(kSimpleOutputCommand).expect(expectedValue);

  const { ok, steps } = await scenario.run();

  t.ok(ok);
  t.same(steps.all(), [
    { value: expectedValue, type: 'expect', ok: true, actual: expectedValue },
  ]);
  t.end();
});

test('it should write input value passed', async (t) => {
  const name = 'tony';
  const scenario = clix(kSimpleCommandWithOutput)
    .expect('Hello, who am I talking to?')
    .input(name)
    .expect(`Hey ${name}!`);

  const { ok, steps } = await scenario.run();

  t.ok(ok);
  t.ok(steps.all().every((step) => step.ok));
  t.end();
});

test('it should assert error message', async (t) => {
  const scenario = clix(kReturnError)
    .expect('Hello, who am I talking to?')
    .input('tony')
    .expectError('error');

  const { ok, steps } = await scenario.run();

  t.ok(ok);
  t.ok(steps.all().every((step) => step.ok));
  t.end();
});

test('it should assert error message and the error message', async (t) => {
  const scenario = clix(kReturnErrorWithCode)
    .expect('Hello, who am I talking to?')
    .input('tony')
    .expectError('error')
    .withCode(2);

  const { ok, steps } = await scenario.run();

  t.ok(ok);
  t.ok(steps.all().every((step) => step.ok));
  t.end();
});

test('it should assert exit code without error message', async (t) => {
  const kExitCodeWithoutErrorMessage =
    'bash ./tests/fixtures/exit-code-without-error-message.sh';
  const fakeInput = 'tony';
  const scenario = clix(kExitCodeWithoutErrorMessage)
    .expect('Hello, who am I talking to?')
    .input(fakeInput)
    .expect(fakeInput)
    .withCode(2);

  const { ok, steps } = await scenario.run();

  t.ok(ok);
  t.ok(steps.all().every((step) => step.ok));
  t.end();
});

test('.run should append actual value in each step object', async (t) => {
  const scenario = clix(kReturnErrorWithCode)
    .expect('Hello, who am I talking to?')
    .input('tony')
    .expectError('error')
    .withCode(2);

  const { steps } = await scenario.run();
  const allSteps = steps.all();

  const allStepsHaveActualProperty = allSteps
    .filter(isNotInputStep)
    .every(shouldHaveAnActualProperty);
  t.ok(allStepsHaveActualProperty);
  t.end();
});

/**
 * HELPERS
 */

const isNotInputStep = (step) => step.type !== 'input';
const shouldHaveAnActualProperty = (step) => step.actual !== undefined;

import { test } from 'tap';
import { spy } from 'tinyspy';

import clix from '../../src/index.js';

test('_writeInProc add a \n if the input does not contain it', (t) => {
  const scenario = clix('random command');
  const write = spy();
  mockWriteFromProc(scenario, write);

  const input = 'What is your name?';
  scenario._writeInProc(input);

  const expectedArgument = input + '\n';
  const actualArgument = getArgumentFromSpy(write);
  t.equal(actualArgument, expectedArgument);
  t.end();
});

test('_writeInProc should not add if it is already in the input', (t) => {
  const scenario = clix('random command');
  const write = spy();
  mockWriteFromProc(scenario, write);

  const input = 'What is your name?\n';
  scenario._writeInProc(input);

  const actualArgument = getArgumentFromSpy(write);
  t.equal(actualArgument, input);
  t.end();
});

/**
 * HELPERS
 */

function mockWriteFromProc(scenario, writeFn) {
  scenario._proc = { write: writeFn };
}

function getArgumentFromSpy(spyFn) {
  const [actualArgument] = spyFn.calls.at(0);
  return actualArgument;
}

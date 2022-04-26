import { test } from 'tap';
import { Scenario } from '../../src/index.js';

class PlayerStub {
  lastInput = null;

  write(input) {
    this.lastInput = input;
  }
}

test('_writeInProc add a \n if the input does not contain it', (t) => {
  const player = new PlayerStub();
  const scenario = new Scenario('random command', player);

  const input = 'What is your name?';
  scenario._writeInProc(input);

  t.equal(player.lastInput, 'What is your name?\n');
  t.end();
});

test('_writeInProc should not add if it is already in the input', (t) => {
  const player = new PlayerStub();
  const scenario = new Scenario('random command', player);

  const input = 'What is your name?\n';
  scenario._writeInProc(input);

  t.equal(player.lastInput, 'What is your name?\n');
  t.end();
});

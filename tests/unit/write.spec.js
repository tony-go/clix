import { test } from 'tap';
import { ScenarioBuilder } from '../../src/scenario-builder.js';

class PlayerStub {
  lastInput = null;

  write(input) {
    this.lastInput = input;
  }
}

test('_writeInProc add a \n if the input does not contain it', (t) => {
  const player = new PlayerStub();
  const scenario = new ScenarioBuilder()
    .withCommand('random command')
    .withPlayer(player)
    .build();

  const inputWithoutBackslachN = 'What is your name?';
  scenario._writeInProc(inputWithoutBackslachN);

  const inputWithBackSlachN ='What is your name?\n' 
  t.equal(player.lastInput, inputWithBackSlachN);
  t.end();
});

test('_writeInProc should not add if it is already in the input', (t) => {
  const player = new PlayerStub();
  const scenario = new ScenarioBuilder()
    .withCommand('random command')
    .withPlayer(player)
    .build();

  const inputWithBackSlachN ='What is your name?\n' 
  scenario._writeInProc(inputWithBackSlachN);

  t.equal(player.lastInput, inputWithBackSlachN); 
  t.end();
});

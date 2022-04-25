import { Player } from './player.js';
import { Scenario } from './scenario.js';

export function clix(command) {
  if (typeof command !== 'string') {
    throw new Error(`Command should be a string but got ${command}`);
  }

  if (command.length < 1) {
    throw new Error('Command should not be an empty string');
  }

  return new Scenario(command, new Player());
}

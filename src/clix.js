import { ScenarioBuilder } from './scenario-builder.js';

export function clix(command) {
  if (typeof command !== 'string') {
    throw new Error(`Command should be a string but got ${command}`);
  }

  if (command.length < 1) {
    throw new Error('Command should not be an empty string');
  }

  return new ScenarioBuilder().withCommand(command);
}

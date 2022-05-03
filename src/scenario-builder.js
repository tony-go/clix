import { kActType } from './constant.js';
import { Player } from './player.js';
import { Scenario } from './scenario.js';

export class ScenarioBuilder {
  #acts = [];
  #player = null;
  #command = null;

  async run() {
    return this.build().run();
  }

  withCommand(command) {
    this.#command = command;
    return this;
  }

  withPlayer(player) {
    this.#player = player;
    return this;
  }

  /**
   * Allow user to declare an expected output
   * @param {string} value
   * @param {Array<string>} value
   * @returns {ScenarioBuilder}
   */
  expect(values, options = {}) {
    if (typeof values === 'string') {
      this.#acts.push({ value: values, type: kActType.expect, options });
      return this;
    }

    if (!Array.isArray(values)) {
      throw Error('Expect value should be a string or an array');
    }

    values.forEach((value) =>
      this.#acts.push({ value, type: kActType.expect })
    );

    return this;
  }

  /**
   * Allows to simulate a user input
   * @param {String} value
   * @param {Array<String>} value
   * @returns {ScenarioBuilder}
   */
  input(values) {
    if (typeof values === 'string') {
      this.#acts.push({ value: values, type: kActType.input });
      return this;
    }

    if (!Array.isArray(values)) {
      throw Error('Input value should be a string or an array');
    }

    values.forEach((value) => this.#acts.push({ value, type: kActType.input }));

    return this;
  }

  /**
   * Allow user to declare an expected error
   * @param {String} values
   * @param {Array<String>} values
   * @returns {ScenarioBuilder}
   */
  expectError(values, options = {}) {
    if (typeof values === 'string') {
      this.#acts.push({ value: values, type: kActType.expectError, options });
      return this;
    }

    if (!Array.isArray(values)) {
      throw Error('ExpectError value should be a string or an array');
    }

    values.forEach((value) =>
      this.#acts.push({ value, type: kActType.expectError })
    );

    return this;
  }

  /**
   * Allow user to declare an expected exit code
   * @param {Number} code
   * @returns {ScenarioBuilder}
   */
  withCode(code) {
    this.#acts.push({ value: code, type: kActType.exitCode });
    return this;
  }

  build() {
    return new Scenario(
      this.#command,
      this.#acts ?? [],
      this.#player ?? new Player()
    );
  }
}

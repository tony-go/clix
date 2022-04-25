// internal dependencies
import { Debug } from './debug.js';
import { kActType } from './constant.js';

// constants
const kGlobalTimeout = 500;

export class Scenario extends Debug {
  /**
   * @type {string}
   * @description the command to run
   */
  #command;

  /**
   * @type {Player}
   * @description current player running the command
   */
  #player;

  /**
   * @type {number}
   * @description default timeout
   */
  #globalTimeout = kGlobalTimeout;

  /**
   * @type {number}
   * @description index of the current act
   */
  #actPointer = 0;

  /**
   * @type {Timeout}
   * @description global timer to handle timeout
   */
  #timer = null;

  constructor(command, player) {
    super(command);
    this.#command = command;
    this.acts = [];
    this.#player = player;
  }

  /**
   * ////////////////////////
   * // PUBLIC API METHODS //
   * ////////////////////////
   */

  /**
   * Allow user to declare an expected output
   * @param {string} value
   * @param {Array<string>} value
   * @returns {Scenario}
   */
  expect(value) {
    if (typeof value === 'string') {
      this.#addExpectAct(value);
    } else if (Array.isArray(value)) {
      for (const act of value) {
        this.#addExpectAct(act);
      }
    }

    return this;
  }

  /**
   * Allows to simulate a user input
   * @param {String} value
   * @param {Array<String>} value
   * @returns {Scenario}
   */
  input(value) {
    if (typeof value === 'string') {
      this.#addInputAct(value);
    } else if (Array.isArray(value)) {
      for (const input of value) {
        this.#addInputAct(input);
      }
    }

    return this;
  }

  /**
   * Allow user to declare an expected error
   * @param {String} error
   * @param {Array<String>} error
   * @returns {Scenario}
   */
  expectError(error) {
    if (Array.isArray(error)) {
      for (const err of error) {
        this.#addExpectErrorAct(err);
      }
    } else {
      this.#addExpectErrorAct(error);
    }

    return this;
  }

  /**
   * Allow user to declare an expected exit code
   * @param {Number} code
   * @returns {Scenario}
   */
  withCode(code) {
    const act = { value: code, type: kActType.exitCode };
    this.acts.push(act);

    return this;
  }

  /**
   * Allows user to execute the scenario
   * @returns {Promise<ClixResult>}
   */
  async run() {
    await this.#play();
    return this._buildResult();
  }

  /**
   * ////////////////////////
   * // RESTRICTED METHODS //
   * ////////////////////////
   * (generally available for testing purpose)
   */

  /**
   * @typedef ClixResult
   * @type {object}
   * @property {boolean} ok - true if all acts are ok
   * @property {object} acts
   * @property {Function} acts.all - will return all acts
   * @property {Function} acts.failed - will return the last failed acts
   *
   * @returns {ClixResult}
   */
  _buildResult() {
    return {
      ok: this.acts.every((act) => act.ok),
      acts: {
        all: () => this.acts,
        failed: () => this.#findFailedAct() || null,
      },
    };
  }

  /**
   * Will compare the current buffer with the current act
   * and enrich current act with the result
   *
   * @param {object} currentAct - current act
   * @param {string} expectedValue - output from console
   */
  _compare(currentAct, expectedValue) {
    const areValuesEqual = currentAct.value === expectedValue;
    currentAct.ok = areValuesEqual ? true : false;
    currentAct.actual = expectedValue;
    this.debug('equal', expectedValue, currentAct.value);
  }

  /**
   * Write user input in the process
   * @param {*} rawInput - input to write in the process
   */
  _writeInProc(rawInput) {
    this.debug(this.#command, `write input: ${rawInput}`);
    this.#player.write(this._formatInput(rawInput));
  }

  /**
   * Format the input to be written in the process
   * @param {string} input - input to write in the process
   */
  _formatInput(input) {
    return input.includes('\n') ? input : input + '\n';
  }

  /**
   * /////////////////////
   * // PRIVATE METHODS //
   * /////////////////////
   */

  /**
   * Add 'expect' act to the scenario
   * @param {string} value - value to add in the scenario
   */
  #addExpectAct(value) {
    const act = { value, type: kActType.expect };
    this.acts.push(act);
  }

  /**
   * Add 'input' act to the scenario
   * @param {string} value - input to add in the scenario
   */
  #addInputAct(input) {
    const act = { value: input, type: kActType.input };
    this.acts.push(act);
  }

  /**
   * Add 'expect-error' act to the scenario
   * @param {string} value - value to add in the scenario
   */
  #addExpectErrorAct(value) {
    const errorAct = { value, type: kActType.expectError };
    this.acts.push(errorAct);
  }

  /**
   * Find the first failed act from this.acts
   * @returns {Act} first failed act
   */
  #findFailedAct() {
    return this.acts.find((act) => act.ok === false);
  }

  #next() {
    this.#actPointer++;
  }

  #currentAct() {
    return this.acts.at(this.#actPointer);
  }

  #resetTimer() {
    clearTimeout(this.#timer);
  }

  #startTimer(done) {
    this.#timer = setTimeout(done, this.#globalTimeout);
  }

  async #play() {
    return new Promise((resolve, reject) => {
      const context = {
        done: resolve,
        reject,
      };

      this.#player.dataHandler = (line, isError) =>
        this.#handleData(line, { ...context, isError });

      this.#startTimer(resolve);

      this.#player.start(this.#command);
    });
  }

  #fillNextInputActs() {
    const currentAct = this.#currentAct();
    if (!currentAct || currentAct.type !== kActType.input) {
      return;
    }

    this._writeInProc(currentAct.value);
    currentAct.ok = true;

    this.#next();
    this.#fillNextInputActs();
  }

  #handleData(data, { done, reject, isError }) {
    this.debug(this.#command, `${isError ? 'error' : 'data'}: ${data}`);
    this.#resetTimer();

    const currentAct = this.#currentAct();
    if (!currentAct) {
      this.#player.stop();
      isError ? reject(new Error(data)) : done();
      return;
    }

    if (isError && currentAct.type === kActType.expect) {
      this.#player.stop();
      reject(new Error(data));
      return;
    }

    this._compare(currentAct, data);
    this.#next();
    this.#fillNextInputActs();
    this.#startTimer(done);
  }
}

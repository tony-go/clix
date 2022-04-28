// internal dependencies
import { Debug } from './debug.js';
import { kActType } from './constant.js';
import { Player } from './player.js';
import { TimeoutError } from './errors.js';

// constants
const kDefaultTimeout = 500;

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
  #defaultTimeout = kDefaultTimeout;

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

  constructor(command, player = new Player()) {
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
  expect(value, options = {}) {
    if (typeof value === 'string') {
      this.#addExpectAct(value, options);
    } else if (Array.isArray(value)) {
      for (const act of value) {
        // todo(tony): add support for options
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
  expectError(error, options = {}) {
    if (Array.isArray(error)) {
      for (const err of error) {
        // todo(tony): add support for options
        this.#addExpectErrorAct(err);
      }
    } else {
      this.#addExpectErrorAct(error, options);
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
  #addExpectAct(value, options = {}) {
    const act = { value, type: kActType.expect, options };
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
  #addExpectErrorAct(value, options = {}) {
    const errorAct = { value, type: kActType.expectError, options };
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

  async #play() {
    return new Promise((resolve, reject) => {
      const context = {
        resolve,
        reject,
        handler: this.#handleData.bind(this),
        exitHandler: this.#handleExit.bind(this),
      };

      this.#player.setContext(context);

      this.#startTimer(resolve, reject);

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

  #startTimer(resolve, reject) {
    const currentAct = this.#currentAct();
    if (!currentAct) {
      resolve();
      return;
    }

    const timeout = currentAct.options?.timeout;

    if (timeout) {
      this.debug(this.#command, `act timeout set to ${timeout}`);
      this.#timer = setTimeout(() => {
        reject(
          new TimeoutError(
            'The act did not take place within the allotted time'
          )
        );
      }, timeout);
    } else {
      this.#timer = setTimeout(resolve, this.#defaultTimeout);
    }
  }

  #handleData(data, { resolve, reject, isError }) {
    this.#resetTimer();
    this.debug(this.#command, `${isError ? 'error' : 'data'} : ${data}`);

    const currentAct = this.#currentAct();
    if (!currentAct) {
      this.#player.stop();
      isError ? reject(new Error(data)) : resolve();
      return;
    }

    if (isError && currentAct.type === kActType.expect) {
      this.#player.stop();
      reject(new Error(data));
      return;
    }

    this._compare(currentAct, data);
    this.#next();
    this.#player.next();

    this.#fillNextInputActs();
    this.#startTimer(resolve, reject);
  }

  #handleExit(code, { resolve, reject, isError }) {
    this.#resetTimer();
    this.debug(this.#command, `exit with code ${code}`);

    const act = this.acts.at(-1);

    if (act.type !== kActType.exitCode) {
      if (isError) {
        reject(new Error(`Process terminated with exit code ${code}`));
      }

      return;
    }

    this._compare(act, code);
    resolve();
  }
}

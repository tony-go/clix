// internal dependencies
import { Debug } from './debug.js';
import { kStepType } from './constant.js';

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
   * @description index of the current step
   */
  #stepPointer = 0;

  /**
   * @type {Timeout}
   * @description global timer to handle timeout
   */
  #timer = null;

  constructor(command, player) {
    super(command);
    this.#command = command;
    this.steps = [];
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
      this.#addExpectStep(value);
    } else if (Array.isArray(value)) {
      for (const step of value) {
        this.#addExpectStep(step);
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
      this.#addInputStep(value);
    } else if (Array.isArray(value)) {
      for (const input of value) {
        this.#addInputStep(input);
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
        this.#addExpectErrorStep(err);
      }
    } else {
      this.#addExpectErrorStep(error);
    }

    return this;
  }

  /**
   * Allow user to declare an expected exit code
   * @param {Number} code
   * @returns {Scenario}
   */
  withCode(code) {
    const step = { value: code, type: kStepType.exitCode };
    this.steps.push(step);

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
   * @property {boolean} ok - true if all steps are ok
   * @property {object} steps
   * @property {Function} steps.all - will return all steps
   * @property {Function} steps.failed - will return the last failed steps
   *
   * @returns {ClixResult}
   */
  _buildResult() {
    return {
      ok: this.steps.every((step) => step.ok),
      steps: {
        all: () => this.steps,
        failed: () => this.#findFailedStep() || null,
      },
    };
  }

  /**
   * Will compare the current buffer with the current step
   * and enrich current step with the result
   *
   * @param {object} currentStep - current step
   * @param {string} expectedValue - output from console
   */
  _compare(currentStep, expectedValue) {
    const areValuesEqual = currentStep.value === expectedValue;
    currentStep.ok = areValuesEqual ? true : false;
    currentStep.actual = expectedValue;
    this.debug('equal', expectedValue, currentStep.value);
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
   * Add 'expect' step to the scenario
   * @param {string} value - value to add in the scenario
   */
  #addExpectStep(value) {
    const step = { value, type: kStepType.expect };
    this.steps.push(step);
  }

  /**
   * Add 'input' step to the scenario
   * @param {string} value - input to add in the scenario
   */
  #addInputStep(input) {
    const step = { value: input, type: kStepType.input };
    this.steps.push(step);
  }

  /**
   * Add 'expect-error' step to the scenario
   * @param {string} value - value to add in the scenario
   */
  #addExpectErrorStep(value) {
    const errorStep = { value, type: kStepType.expectError };
    this.steps.push(errorStep);
  }

  /**
   * Find the first failed step from this.steps
   * @returns {Step} first failed step
   */
  #findFailedStep() {
    return this.steps.find((step) => step.ok === false);
  }

  #next() {
    this.#stepPointer++;
  }

  #currentStep() {
    return this.steps.at(this.#stepPointer);
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

  #fillNextInputSteps() {
    const currentStep = this.#currentStep();
    if (!currentStep || currentStep.type !== kStepType.input) {
      return;
    }

    this._writeInProc(currentStep.value);
    currentStep.ok = true;

    this.#next();
    this.#fillNextInputSteps();
  }

  #handleData(data, { done, reject, isError }) {
    this.debug(this.#command, `${isError ? 'error' : 'data'}: ${data}`);
    this.#resetTimer();

    const currentStep = this.#currentStep();
    if (!currentStep) {
      this.#player.stop();
      isError ? reject(new Error(data)) : done();
      return;
    }

    if (isError && currentStep.type === kStepType.expect) {
      this.#player.stop();
      reject(new Error(data));
      return;
    }

    this._compare(currentStep, data);
    this.#next();
    this.#fillNextInputSteps();
    this.#startTimer(done);
  }
}

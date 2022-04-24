// third-party dependencies
import spawn from 'cross-spawn';
import splitByLine from 'split2';

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
   * @type {ChildProcess}
   * @description current child process running the command
   */
  _proc;

  /**
   * @type {number}
   * @description default timeout
   */
  #globalTimeout = kGlobalTimeout;

  /**
   * @typedef OutputBuffer
   * @type {object}
   * @property {Array.<string>} out - all stdout lines
   * @property {Array.<string>} err - all stderr lines
   * @description contains outputs from child process
   */
  #buffer = {
    out: [],
    err: [],
    code: null,
  };

  /**
   * @type {number}
   * @description index of the current step
   */
  #stepPointer = 0;

  constructor(command) {
    super(command);
    this.#command = command;
    this.steps = [];
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
    await this.#spawnCommand();

    for await (const res of this.#checkNextLine()) {
      this.debug('proceed step =>', res);
    }

    return this._buildResult();
  }

  /**
   *
   * RESTRICTED METHODS
   * (generally available for testing purpose)
   *
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
    const input = this._formatInput(rawInput);
    this._proc.stdin.setEncoding('utf-8');
    this._proc.stdin.write(input);
    this._proc.stdin.end();
  }

  /**
   * Format the input to be written in the process
   * @param {string} input - input to write in the process
   */
  _formatInput(input) {
    return input.includes('\n') ? input : input + '\n';
  }

  /**
   *
   * PRIVATE METHODS
   *
   */

  #addExpectStep(value) {
    const step = { value, type: kStepType.expect };
    this.steps.push(step);
  }

  #addInputStep(value) {
    const step = { value, type: kStepType.input };
    this.steps.push(step);
  }

  #addExpectErrorStep(value) {
    const errorStep = { value, type: kStepType.expectError };
    this.steps.push(errorStep);
  }

  #findFailedStep() {
    return this.steps.find((step) => step.ok === false);
  }

  async *#checkNextLine() {
    // TODO(tony): check if proc is on activity
    // TODO(tony): add expected value in step object for each case
    while (this.#stepPointer < this.steps.length) {
      const currentStep = this.steps[this.#stepPointer];

      switch (currentStep.type) {
        case kStepType.expect: {
          const bufferValue = this.#buffer.out.shift();

          this._compare(currentStep, bufferValue);
          this.#next();

          yield currentStep;
          break;
        }
        case kStepType.exitCode: {
          const actualCode = this.#buffer.code;

          this._compare(currentStep, actualCode);
          this.#next();

          yield currentStep;
          break;
        }
        case kStepType.expectError: {
          const bufferValue = this.#buffer.err.shift();

          this._compare(currentStep, bufferValue);
          this.#next();

          yield currentStep;
          break;
        }
        case kStepType.input: {
          this._writeInProc(currentStep.value);

          currentStep.ok = true;
          this.debug('input', currentStep.value);
          this.#next();

          await new Promise((resolve) => this.#pipe(resolve));

          yield currentStep;
          break;
        }
        default: {
          throw new Error(`step ${currentStep.type} doesn't exist`);
        }
      }
    }
  }

  #next() {
    this.#stepPointer++;
  }

  async #spawnCommand() {
    return new Promise((resolve) => {
      const proc = spawn(this.#command, {
        shell: true,
      });

      proc.on('spawn', () => {
        this.debug('spawn, pid:', proc.pid);
        this._proc = proc;
        this.#pipe(resolve);
      });

      proc.on('exit', (code) => {
        this.#buffer.code = code;
      });
    });
  }

  #pipe(resolve) {
    let timer = setTimeout(resolve, this.#globalTimeout);
    this.debug('in pipe');

    this._proc.stdout.pipe(splitByLine()).on('data', (line) => {
      clearTimeout(timer);
      this.debug('piped stdout line ->', line);
      this.#buffer.out.push(line);
      timer = setTimeout(resolve, this.#globalTimeout);
    });

    this._proc.stderr.pipe(splitByLine()).on('data', (line) => {
      clearTimeout(timer);
      this.debug('piped stderr line ->', line);
      this.#buffer.err.push(line);
      timer = setTimeout(resolve, this.#globalTimeout);
    });
  }
}

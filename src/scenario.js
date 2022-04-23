// internal dependencies
import { Debug } from './debug.js';
import { kStepType } from './constant.js';
import { Process } from './process.js';

// constants
const kGlobalTimeout = 500;

export class Scenario extends Debug {
  /**
   * @type {string}
   * @description the command to run
   */
  #command;

  /**
   * @type {Process}
   * @description current child process running the command
   */
  #process;

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

  constructor(command) {
    super(command);
    this.#command = command;
    this.steps = [];
  }

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

  #addExpectStep(value) {
    const step = { value, type: kStepType.expect };
    this.steps.push(step);
  }

  input(value, input) {
    this.#addInputStep(value, input);
    return this;
  }

  #addInputStep(value, input) {
    const step = { value, input, type: kStepType.input };
    this.steps.push(step);
  }

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

  #addExpectErrorStep(value) {
    const errorStep = { value, type: kStepType.expectError };
    this.steps.push(errorStep);
  }

  withCode(code) {
    const step = { value: code, type: kStepType.exitCode };
    this.steps.push(step);

    return this;
  }

  async run() {
    await this.#spawnCommand();
    return this.buildResult();
  }

  buildResult() {
    return {
      ok: this.steps.every((step) => step.ok),
      steps: {
        all: () => this.steps,
        failed: () => this.#findFailedStep() || null,
      },
    };
  }

  #findFailedStep() {
    return this.steps.find((step) => step.ok === false);
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

  #next() {
    this.#stepPointer++;
  }

  #nextStep() {
    return this.steps[this.#stepPointer++];
  }

  #resetTimer() {
    clearTimeout(this.#timer);
  }

  #startTimer(done) {
    this.#timer = setTimeout(done, kGlobalTimeout);
  }

  async #spawnCommand() {
    return new Promise((resolve, reject) => {
      const context = {
        done: resolve,
        reject,
        write: (input) => this.#process.write(input),
      };

      const process = new Process();

      this.#startTimer(resolve);

      process.spawn(this.#command);

      process.on('spawn', (pid) => {
        this.debug('spawn, pid:', pid);
        this.#process = process;
      });

      process.on('data', (line) => {
        this.debug('data received: ', line);
        this.#handleData(line, { ...context, isError: false });
      });

      process.on('error', async (line) => {
        this.debug('error received: ', line);
        this.#handleData(line, { ...context, isError: true });
      });

      process.on('exit', async (code) => {
        this.debug('exited with code: ', code);
        this.#handleData(code, { ...context, isError: code == 2 });
      });
    });
  }

  #handleData(data, { write, done, reject, isError }) {
    this.#resetTimer();

    const currentStep = this.#nextStep();

    if (!currentStep) {
      this.#process.kill();
      isError ? reject(new Error(data)) : done();
      return;
    }

    if (isError && currentStep.type == kStepType.expect) {
      this.#process.kill();
      reject(new Error(data));
      return;
    }

    this._compare(currentStep, data);

    if (currentStep.type == kStepType.input) {
      write(currentStep.input);
    }

    this.#startTimer(done);
  }
}

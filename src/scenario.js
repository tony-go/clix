// node.js dependencies
import spawn from 'cross-spawn';

// third-party dependencies
import splitByLine from 'split2';

// internal dependencies
import { Debug } from './debug.js';

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
  #proc;

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
    const step = { value, type: 'expect' };
    this.steps.push(step);
  }

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

  #addInputStep(value) {
    const step = { value, type: 'input' };
    this.steps.push(step);
  }

  async run() {
    await this.#spawnCommand();

    for await (const res of this.#checkNextLine()) {
      this.debug('step =>', res);
    }

    return this.#buildResult();
  }

  #buildResult() {
    return { ok: this.steps.every((step) => step.ok), steps: this.steps };
  }

  async *#checkNextLine() {
    // TODO(tony): check if proc is on activity
    while (this.#stepPointer < this.steps.length) {
      const currentStep = this.steps[this.#stepPointer];

      switch (currentStep.type) {
        case 'expect': {
          const bufferValue = this.#buffer.out.shift();

          this.debug('equal', bufferValue, currentStep.value);
          const areValuesEqual = bufferValue === currentStep.value;
          currentStep.ok = areValuesEqual ? true : false;

          this.#next();
          yield currentStep;
          break;
        }
        case 'input': {
          this.#writeInProc(currentStep.value);

          currentStep.ok = true;
          this.#next();

          // await for next input (timer);
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

  #writeInProc(value) {
    this.#proc.stdin.setEncoding('utf-8');
    this.#proc.stdin.write(value);
    this.#proc.stdin.end();
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
        this.debug('spawn');
        this.#proc = proc;
        this.#pipe(resolve);
      });
    });
  }

  #pipe(resolve) {
    let timer = setTimeout(resolve, this.#globalTimeout);

    this.#proc.stdout.pipe(splitByLine()).on('data', (line) => {
      clearTimeout(timer);
      this.debug('piped line ->', line);
      this.#buffer.out.push(line);
      timer = setTimeout(resolve, this.#globalTimeout);
    });
  }
}

// third-party dependencies
import spawn from 'cross-spawn';
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
    const errorStep = { value, type: 'expect-error' };
    this.steps.push(errorStep);
  }

  withCode(code) {
    const step = { value: code, type: 'expect-error-code' };
    this.steps.push(step);

    return this;
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
        case 'expect-error-code': {
          const expectedCode = this.#buffer.code;

          this.debug('equal', expectedCode, currentStep.value);
          const areValuesEqual = expectedCode === currentStep.value;
          currentStep.ok = areValuesEqual ? true : false;

          this.#next();
          yield currentStep;
          break;
        }
        case 'expect-error': {
          const bufferValue = this.#buffer.err.shift();

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
        this.debug('spawn, pid:', proc.pid);
        this.#proc = proc;
        this.#pipe(resolve);
      });

      proc.on('exit', (code) => {
        this.#buffer.code = code;
      });
    });
  }

  #pipe(resolve) {
    let timer = setTimeout(resolve, this.#globalTimeout);

    this.#proc.stdout.pipe(splitByLine()).on('data', (line) => {
      clearTimeout(timer);
      this.debug('piped stdout line ->', line);
      this.#buffer.out.push(line);
      timer = setTimeout(resolve, this.#globalTimeout);
    });

    this.#proc.stderr.pipe(splitByLine()).on('data', (line) => {
      clearTimeout(timer);
      this.debug('piped stderr line ->', line);
      this.#buffer.err.push(line);
      timer = setTimeout(resolve, this.#globalTimeout);
    });
  }
}

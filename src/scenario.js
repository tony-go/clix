// node.js dependencies
import spawn from 'cross-spawn';

// third-party dependencies
import splitByLine from 'split2';

// internal dependencies
import { Debug } from './debug.js';

// constants
const kGlobalTimeout = 1000;

export class Scenario extends Debug {
  #command;
  #proc;
  #globalTimeout = kGlobalTimeout;
  #buffer = {
    out: [],
    err: [],
  };
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

    for (const res of this.#checkNextLine()) {
      this.debug('step =>', res);
    }

    return this.#buildResult();
  }

  #buildResult() {
    return { ok: this.steps.every((step) => step.ok), steps: this.steps };
  }

  *#checkNextLine() {
    // TODO(tony): check if proc is on activity
    const currentStep = this.steps[this.#stepPointer];

    // if (!currentStep || this.currentStep >= this.steps.length) return;

    if (currentStep.type === 'expect') {
      const bufferValue = this.#buffer.out.shift();

      const areValuesEqual = bufferValue === currentStep.value;
      currentStep.ok = areValuesEqual ? true : false;

      this.#next();
      yield currentStep;
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
        this.#proc = proc;
        this.#pipe(resolve);
      });
    });
  }

  async #pipe(resolve) {
    let timer = setTimeout(resolve, this.#globalTimeout);

    this.#proc.stdout.pipe(splitByLine()).on('data', (line) => {
      clearTimeout(timer);
      this.#buffer.out.push(line);
      timer = setTimeout(resolve, this.#globalTimeout);
    });
  }
}

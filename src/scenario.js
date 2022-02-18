export class Scenario {
  #command;

  constructor(command) {
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
}

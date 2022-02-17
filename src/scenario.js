export class Scenario {
  #command;

  constructor(command) {
    this.#command = command;
    this.steps = [];
  }

  expect(value) {
    if (typeof value === 'string') {
      this.#addExpectStep(value);
      return this;
    }

    if (Array.isArray(value)) {
      for (const step of value) {
        this.#addExpectStep(step);
      }

      return this;
    }

    return this;
  }

  #addExpectStep(value) {
    const step = { value, type: 'expect' };
    this.steps.push(step);
  }
}

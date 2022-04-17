type StepEvent = 'expect' | 'expect-error' | 'exit-code' | 'input';

type StepValue<Value> = Value | RegExp;

interface Step<Value = string> {
  type: StepEvent;
  value: StepValue<Value>;
  ok: boolean;
  actual?: Value;
}

interface ClixResult {
  ok: boolean;
  steps: {
    all: () => Array<Step>;
    failed: () => Step | null;
  };
}

export interface Clix {
  expect: (value: StepValue<string> | Array<StepValue<string>>) => Clix;
  expectError: (value: StepValue<string> | Array<StepValue<string>>) => Clix;
  exitCode: (code: number) => Clix;
  input: (value: string | Array<string>) => Clix;
  run: () => Promise<ClixResult>;
}

declare function clix(command: string): Clix;

export default clix;

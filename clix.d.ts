type StepEvent = 'expect' | 'expect-error' | 'exit-code' | 'input';

interface Step<Value = string> {
  type: StepEvent;
  val: Value;
  ok: boolean;
  actual?: Value;
  input?: string;
}

interface ClixResult {
  ok: boolean;
  steps: {
    all: () => Array<Step>;
    failed: () => Step | null;
  };
}

export interface Clix {
  expect: (value: string | Array<string>) => Clix;
  expectError: (value: string | Array<string>) => Clix;
  exitCode: (code: number) => Clix;
  input: (value: string | Array<string>) => Clix;
  run: () => Promise<ClixResult>;
}

declare function clix(command: string): Clix;

export default clix;

type ActType = 'expect' | 'expect-error' | 'exit-code' | 'input';

interface Act<Value = string> {
  type: ActType;
  value: Value;
  ok: boolean;
  actual?: Value;
}

interface ClixResult {
  ok: boolean;
  acts: {
    all: () => Array<Act>;
    failed: () => Act | null;
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

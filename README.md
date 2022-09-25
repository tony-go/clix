> ⚠️: This package doesn't exist at the moment. It's only a spike made with a Readme driven development approach.

> 👉: Share your feedback [in this issue](https://github.com/tony-go/clix/issues/1).

<p align="center"><img src="./logo.png" alt="clix logo"/></p>
<h1 align="center">clix</h1>
<h3 align="center">Write acceptance tests easily for your CLI program.</h3>

## ⭐️ Features

- 🏎 CLI Runner out of the box
- 🌈 Simple API
- 🔄 Async/Await based
- 🌝 Test runner agnostic

## 📦 Install

```
npm install -D @tonygo/clix
```

## 🧰 Use clix

Let's write your first acceptance tests

### Basic scenario
```js
import assert from 'assert';
import clix from '@tonygo/clix';

const scenario_1 = clix('my command')
  .expect('Hey user, what is your name?')
  .input('tony')
  .expect('Super!', { timeout: 3000 });

const result_1 = await scenario_1.run();
assert.ok(result_1.ok);
```

### Catch failure
```js
const scenario_2 = clix('my command')
  .expect('Hey user, what is your name?')
  .input(223)
  .expectError('Sorry, dude!')
  .withCode(2);

const result_2 = await scenario_2.run();
assert.ok(result_2.ok);
```

### Handle list
```js
const scenario_3 = clix('my command')
  .expect([ // Handle multiple lines with arrays
    'What is your choice?',
    /a/,
    /b/
  ])
  .select([1]) // using an array for multiple choices
  .expect('Ok, dude!');

const result_2 = await scenario_3.run();
assert.ok(result_2.ok);
```

## 🗺 Road map

| Item | Status              | Notes' |
|-----------|-------------------|-----------------|
| `.select` API     | ABORTED |  Findings here: https://github.com/tony-go/clix/issues/16 |
| `.skip(numberOfLines)` PI     | TODO |  |

## 📖 API

### **scenario = clix(command: string, options: ClixOptions): Clix**

Start a clix scenario with `clix('my command')`;

Options:
```ts
interface ClixOptions {
  timeout: number;
}
```

### **scenario.expect(line: string | Regexp | (string | Regexp)[], options?: ExpectOptions): Clix**

Assert that the output line (stdout) is strictly equal and returns the Clix instance.

```ts
interface ExpectOptions {
  timeout?: number;
}
```

### **scenario.expectError(errorMessage: string | Regexp | (string | Regexp)[], options?: ExpectErrorOptions): Clix**

Assert that the output line (stderr) is strictly equal and returns the Clix instance.

```ts
interface ExpectErrorOptions {
  code?: number;
  timeout?: number;
}
```

### **scenario.input(input: string): Clix**

Emulate an interaction with the CLI and returns the Clix instance.

### **async scenario.run(): Promise<ClixResult>**

Will run the program and will assert all assertions registered before.

The `ClixResult` object stand for:

```ts
interface ClixResult {
  ok: boolean
  acts: {
    all: () => []Act
    failed: () => Act | null
  }
}

type ActType = 'expect' | 'expect-error' | 'exit-code' | 'input';
interface Act<Value> {
  type: ActType;
  val: Value;
  ok: boolean;
  actual?: Value;
}
```

## 💪🏼 Contributing

Are interested in contributing? 😍 Please read the [contribution guide](./CONTRIBUTING.md) first.



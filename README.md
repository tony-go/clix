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
  .expect('Super!');

const result_1 = await scenario_1.run();
assert.ok(result_1.ok);
```

### Catch failure
```js
const scenario_2 = clix('my command')
  .expect('Hey user, what is your name?')
  .input(223)
  .expectFailure('Sorry, dude!');

const result_2 = await scenario_2.run();
assert.ok(result_2.ok);
```

### Handle list
```js
const scenario_3 = clix('my command')
  .expect('What is your choice?')
  .expect(/a/)
  .expect(/b/)
  .select([1]) // using an array for multiple choices
  .expect('Ok, dude!');

const result_2 = await scenario_3.run();
assert.ok(result_2.ok);
```

## 🗺 Road map

> TODO

## 📖 API

### **scenario = clix(command: string, options: ClixOptions): Clix**

Start a clix scenario with `clix('my command')`;

Options:
```js
interface ClixOptions {
  timeout: number;
};
```

### **scenario.expect(line: string | Regexp): Clix**

Assert that the output is strictly equal and returns the Clix instance.

### **scenario.expectFailure(errorMessage: string | Regexp): Clix**

Assert that the CLI exit with an error message and returns the Clix instance

### **scenario.input(input: string): Clix**

Emulate an interaction with the CLI and returns the Clix instance.

### **scenario.select(input: number[]): Clix**

Emulate an interaction with a list (single or multiple choice) and returns the Clix instance.

### **scenario.skip(numberOfLines: number): Clix**

Skip one or more lines and returns the Clix Instance.

### **async scenario.run(): Promise<ClixResult>**

Will run the program and will assert all assertions registered before.

The `ClixResult` object stand for:

```ts
interface ClixResult {
  ok: boolean;
  val: {
    expected: string | number,
    actual: string
  };
};
```



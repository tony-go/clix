> ⚠️: This package doesn't exist at the moment. It's only a spike made with a Readme driven development approach.

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

Let's write your first acceptance test using [Vitest](https://vitest.dev/)

```js
import { expect, it } from 'vitest';
import { Clix } from '@tonygo/clix';

it('should ask for username then should display success message', async () => {
  const scenario = new Clix({ command: 'my command' })
    .expect('Hey user, what is your name?')
    .type('tony')
    .expect('Super!');

  const result = await scenario.run();
  expect(result.ok).toBe(true);
});

it('should fail if name contains numeric character', async () => {
  const scenario = new Clix({ command: 'my command' })
    .expect('Hey user, what is your name?')
    .type(223)
    .expectFailure('Sorry, dude!');

  const result = await scenario.run();
  expect(result.ok).toBe(true);
});
```

## 📖 API

### **new Clix(options): Clix**

Create a new Clix instance passing a simple object option.

```ts
interface ClixOptions {
  command: string
};
```

### **clix.expect(line: string | Regexp): Clix**

Assert that the output is strictly equal and returns the Clix instance.

### **clix.expectFailure(errorMessage: string | Regexp): Clix**

Assert that the CLI exit with an error message and returns the Clix instance

### **clix.type(input: string | number): Clix**

Emulate an interaction with the CLI and returns the Clix instance.

### **async clix.run(): Promise<ClixResult>**

Will run the program and will assert all assertions registered before.

The ClixResult object stand for:

```ts
interface ClixResult {
  ok: boolean;
  val: {
    expected: string | number,
    actual: string
  };
};
```



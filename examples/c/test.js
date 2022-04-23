import assert from 'assert';
import clix from '../../src/index.js';

async function testSegFault() {
  const scenario = clix(
    'bash ./src/compile-and-execute.sh segfault'
  ).expectError(/.*Segmentation fault.*/);

  const { ok } = await scenario.run();

  assert.ok(ok, 'segfault test failed');
  console.log(`${this.name} - success`);
}

async function testDivByZero() {
  const scenario = clix('bash ./src/compile-and-execute.sh divby0').expectError(
    /.*Floating point exception.*/
  );

  const { ok } = await scenario.run();

  assert.ok(ok, 'div by zeo test failed');
  console.log(`${this.name} - success`);
}

(async () => {
  await testSegFault();
  // await testDivByZero();
})();

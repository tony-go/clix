#!/usr/bin/env node

import * as readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question('What is your name?\n', (answer) => {
  console.log(`Hello, ${answer}!`);

  rl.close();
  process.exit(0);
});

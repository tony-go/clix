#!/usr/bin/env node

import * as readline from 'readline';

function main() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question('What is your name?\n', (answer) => {
    console.log(`Hello, ${answer}!`);

    setTimeout(() => {
      rl.close();
    }, 500);
  });
}

main();

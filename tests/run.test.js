// node.js dependencies
import cp from 'child_process';

// third-party dependencies
import test from 'tape';
import { spyOn } from 'tinyspy';

// internal dependencies
import clix from '../src/index.js';

// constants
const kValidCommand = 'bash ./tests/fixtures/simple.sh';

test('it should expose a run method', (t) => {
  const scenario = clix(kValidCommand);

  t.ok(scenario.run);
  t.end();
});

test('it should spawn a process when run is called', async (t) => {
  const spawnSpy = spyOn(cp, 'spawn');
  const scenario = clix(kValidCommand).expect('Hello, who am I talking to?');

  scenario.run();

  t.true(spawnSpy.called);
  t.end();
});

test(
  'it should assert the expect value passed',
  { timeout: 2000 },
  async (t) => {
    const scenario = clix(kValidCommand).expect('Hello, who am I talking to?');

    const res = await scenario.run();

    t.true(res.ok);
    t.deepEqual(res.steps, [
      { value: 'Hello, who am I talking to?', type: 'expect', ok: true },
    ]);
    t.end();
  }
);

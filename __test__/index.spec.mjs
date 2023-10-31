import test from 'ava'

import { clix } from '../index.js'

test('clix function expose a run method', async (t) => {
  const scenario = clix("./script.sh", 1000);

  scenario.expect("echo Hello, who am I talking to?");

  const res = await scenario.run();

  t.truthy(res.ok);
});

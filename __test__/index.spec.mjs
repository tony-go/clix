import test from 'ava'

import { clix } from '../index.js'

test('clix should be able to expect a string', async t => {
  const scenario = clix("./__test__/script.sh", 1000);

  scenario.expect("Hello, who am I talking to?");

  const res = await scenario.run();

  t.truthy(res.ok);
});

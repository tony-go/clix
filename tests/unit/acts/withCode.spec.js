import { test } from 'tap';

import clix, { Scenario } from '../../../src/index.js';
import { kActType } from '../../../src/constant.js';

test('it withError function could add an expected error code', (t) => {
  const scenario = clix('foo bar');

  const code = 1;
  const errorText = 'yo';
  scenario.expectError(errorText).withCode(code);

  const lastAct = scenario.acts.at(-1);
  t.same(lastAct, {
    value: code,
    type: kActType.exitCode,
  });
  t.end();
});

test('it should allow chaining with input method', (t) => {
  const scenario = clix('foo bar').expectError('yo').withCode(2);

  t.ok(scenario instanceof Scenario);
  t.end();
});

test('it should be possible to call withCode after an expect', (t) => {
  const code = 2;

  const scenario = clix('foo bar').expect('yo').withCode(code);

  const lastAct = scenario.acts.at(-1);
  t.same(lastAct, {
    value: code,
    type: kActType.exitCode,
  });
  t.end();
});

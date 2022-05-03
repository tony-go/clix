import { test } from 'tap';

import clix from '../../../src/index.js';
import { kActType } from '../../../src/constant.js';
import { ScenarioBuilder } from '../../../src/scenario-builder.js';

test('it withError function could add an expected error code', (t) => {
  const scenarioBuilder = clix('foo bar');

  const code = 1;
  const errorText = 'yo';
  scenarioBuilder.expectError(errorText).withCode(code);
  const scenario = scenarioBuilder.build();

  const lastAct = scenario.acts.at(-1);
  t.same(lastAct, {
    value: code,
    type: kActType.exitCode,
  });
  t.end();
});

test('it should allow chaining with input method', (t) => {
  const scenarioBuilder = clix('foo bar').expectError('yo').withCode(2);

  t.ok(scenarioBuilder instanceof ScenarioBuilder);
  t.end();
});

test('it should be possible to call withCode after an expect', (t) => {
  const code = 2;

  const scenarioBuilder = clix('foo bar').expect('yo').withCode(code);
  const scenario = scenarioBuilder.build();

  const lastAct = scenario.acts.at(-1);
  t.same(lastAct, {
    value: code,
    type: kActType.exitCode,
  });
  t.end();
});

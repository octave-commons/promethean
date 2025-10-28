import test from 'ava';

import { ConfigSchema } from '../config.ts';

test('config defaults', (t) => {
  const cfg = ConfigSchema.parse({});
  t.true(cfg.debounceMs > 0);
  t.truthy(cfg.baseUrl);
  t.truthy(cfg.model);
});

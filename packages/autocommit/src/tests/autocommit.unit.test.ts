import test from 'ava';

import { ConfigSchema } from '../config.js';

test('config defaults', (t) => {
  const cfg = ConfigSchema.parse({});
  t.true(cfg.debounceMs > 0);
  t.truthy(cfg.baseUrl);
  t.truthy(cfg.model);
  t.false(cfg.recursive);
});

test('config with recursive flag', (t) => {
  const cfg = ConfigSchema.parse({ recursive: true });
  t.true(cfg.recursive);
});

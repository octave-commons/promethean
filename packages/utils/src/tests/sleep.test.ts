import test from 'ava';
import { sleep } from '../sleep.js';

test('sleep waits at least the specified time', async (t) => {
  const start = Date.now();
  await sleep(20);
  const elapsed = Date.now() - start;
  t.true(elapsed >= 20);
});

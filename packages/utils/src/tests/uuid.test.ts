import test from "ava";

import { randomUUID } from "../uuid.js";

test("randomUUID returns unique-like ids", (t) => {
  const ids = Array.from({ length: 10 }, () => randomUUID());
  t.is(new Set(ids).size, 10);
});

test("randomUUID falls back when crypto.randomUUID unavailable", (t) => {
  const g = globalThis as { crypto?: typeof globalThis.crypto };
  const old = g.crypto;
  // eslint-disable-next-line functional/immutable-data
  delete g.crypto;
  t.teardown(() => {
    if (old === undefined) {
      // eslint-disable-next-line functional/immutable-data
      delete g.crypto;
    } else {
      // eslint-disable-next-line functional/immutable-data
      g.crypto = old;
    }
  });
  const id = randomUUID();
  t.is(typeof id, "string");
  t.true(id.length > 0);
});

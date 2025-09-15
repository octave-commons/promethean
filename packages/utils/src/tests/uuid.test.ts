import test from "ava";

import { randomUUID } from "../uuid.js";

test("randomUUID returns unique-like ids", (t) => {
  const ids = Array.from({ length: 10 }, () => randomUUID());
  t.is(new Set(ids).size, 10);
});

test("randomUUID falls back when crypto.randomUUID unavailable", (t) => {
  const g = globalThis as { crypto?: typeof globalThis.crypto };
  const desc = Object.getOwnPropertyDescriptor(g, "crypto");
  Object.defineProperty(g, "crypto", { value: undefined, configurable: true });
  t.teardown(() => {
    if (desc) {
      Object.defineProperty(g, "crypto", desc);
    } else {
      Object.defineProperty(g, "crypto", {
        value: undefined,
        configurable: true,
      });
    }
  });
  const id = randomUUID();
  t.is(typeof id, "string");
  t.true(id.length > 0);
});

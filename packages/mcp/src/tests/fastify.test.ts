import type crypto from "node:crypto";

import test from "ava";

import { createSessionIdGenerator } from "../core/transports/session-id.js";

test("createSessionIdGenerator uses randomUUID when provided", (t) => {
  const generator = createSessionIdGenerator({
    randomUUID: () => "uuid-from-randomUUID",
    randomBytes: () => {
      throw new Error(
        "randomBytes should not be called when randomUUID exists",
      );
    },
  } as unknown as Pick<typeof crypto, "randomUUID" | "randomBytes">);

  t.is(generator(), "uuid-from-randomUUID");
});

test("createSessionIdGenerator falls back to RFC4122 v4 format", (t) => {
  const bytes = Buffer.from([
    0x00, 0x11, 0x22, 0x33, 0x44, 0x55, 0x66, 0x77, 0x88, 0x99, 0xaa, 0xbb,
    0xcc, 0xdd, 0xee, 0xff,
  ]);

  const generator = createSessionIdGenerator({
    randomUUID: undefined,
    randomBytes: () => Buffer.from(bytes),
  } as unknown as Pick<typeof crypto, "randomUUID" | "randomBytes">);

  const id = generator();
  t.regex(
    id,
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
  );
});

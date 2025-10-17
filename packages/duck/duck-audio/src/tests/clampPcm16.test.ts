import test from "ava";

import { PCM16_MAX, PCM16_MIN, clampPcm16 } from "../index.js";

test("clampPcm16 enforces PCM16 bounds without distorting adjacent samples", (t) => {
  const samples = [
    PCM16_MIN - 1200,
    PCM16_MIN - 0.4,
    PCM16_MIN + 8,
    -1.9,
    0,
    1.2,
    PCM16_MAX - 7,
    PCM16_MAX + 0.9,
    PCM16_MAX + 1024,
  ];

  const clamped = samples.map((value) => clampPcm16(value));

  t.deepEqual(clamped, [
    PCM16_MIN,
    PCM16_MIN,
    PCM16_MIN + 8,
    -1,
    0,
    1,
    PCM16_MAX - 7,
    PCM16_MAX,
    PCM16_MAX,
  ]);
});

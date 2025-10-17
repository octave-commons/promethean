import test from "ava";

import { clampUnitFloat } from "../index.js";

const clampNeg = (input: Float32Array): Float32Array =>
  Float32Array.from(input, clampUnitFloat);

test("negative clamp prevents underflow and preserves range", (t) => {
  const input = new Float32Array([-1.2, -1.0, -0.5, 0, 0.5, 1.0, 1.2]);
  const out = clampNeg(input);

  t.is(out.length, input.length);
  t.true(out[0]! >= -1);
  t.is(out[1]!, -1);
  t.is(out[2]!, -0.5);
  t.is(out[3]!, 0);
  t.is(out[5]!, 1);
});

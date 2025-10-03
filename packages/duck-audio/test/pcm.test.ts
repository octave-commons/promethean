import test from "ava";
import { clamp16, float32ToInt16 } from "../src/pcm.js";

test("clamp16 bounds", (t) => {
  t.is(clamp16(1), 32767);
  t.is(clamp16(-1), -32768);
});

test("float32ToInt16 maps range", (t) => {
  const out = float32ToInt16(new Float32Array([-1, 0, 1]));
  t.deepEqual(Array.from(out), [-32768, 0, 32767]);
});

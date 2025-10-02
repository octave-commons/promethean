import test from "ava";

import {
  RemoteEmbeddingFunction,
  setEmbeddingOverride,
} from "../../remoteEmbedding.js";

test.afterEach.always(() => {
  setEmbeddingOverride(null);
});

test("RemoteEmbeddingFunction: image url item mapping", async (t) => {
  const captured: string[][] = [];
  setEmbeddingOverride(async ({ inputs }) => {
    captured.push([...inputs]);
    return inputs.map(() => [0.1, 0.2, 0.3]);
  });
  const ref = new RemoteEmbeddingFunction({ driver: "driverX", fn: "fnY" });
  const out = await ref.generate([
    { type: "image_url", data: "https://example.com/i.png" },
  ]);
  t.deepEqual(out, [[0.1, 0.2, 0.3]]);
  t.is(captured.length, 1);
  t.is(captured[0]![0], "https://example.com/i.png");
  t.is(ref.defaultSpace(), "l2");
  t.true(ref.supportedSpaces().includes("cosine"));
  ref.dispose();
});

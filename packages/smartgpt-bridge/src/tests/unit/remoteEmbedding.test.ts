import test from "ava";

import {
  RemoteEmbeddingFunction,
  setEmbeddingOverride,
} from "../../remoteEmbedding.js";

test.afterEach.always(() => {
  setEmbeddingOverride(null);
});

test("RemoteEmbeddingFunction: generate returns embeddings via override", async (t) => {
  setEmbeddingOverride(async ({ inputs }) =>
    inputs.map((input, index) => [Number(index), input.length]),
  );
  const ref = new RemoteEmbeddingFunction(undefined, "driverX", "fnY");
  const out = await ref.generate(["hello", "world"]);
  t.deepEqual(out, [
    [0, "hello".length],
    [1, "world".length],
  ]);
  ref.dispose();
});

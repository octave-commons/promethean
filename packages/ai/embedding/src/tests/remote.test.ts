import test from "ava";

import { RemoteEmbeddingFunction, setEmbeddingOverride } from "../remote.js";

test.afterEach.always(() => {
  setEmbeddingOverride(null);
});

test("exposes supported spaces", (t) => {
  const fn = new RemoteEmbeddingFunction();
  t.deepEqual(fn.supportedSpaces(), ["l2", "cosine"]);
});

test("generate uses override and returns embeddings", async (t) => {
  setEmbeddingOverride(async ({ inputs }) =>
    inputs.map((input, index) => [Number(index), input.length]),
  );
  const fn = new RemoteEmbeddingFunction({ driver: "driverX", fn: "fnY" });
  const result = await fn.generate(["alpha", "beta"]);
  t.deepEqual(result, [
    [0, 5],
    [1, 4],
  ]);
  fn.dispose();
});

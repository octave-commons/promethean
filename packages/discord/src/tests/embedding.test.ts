import test from "ava";
import {
  RemoteEmbeddingFunction,
  setEmbeddingOverride,
} from "@promethean/embedding";

test.afterEach.always(() => {
  setEmbeddingOverride(null);
});

test("requests embeddings via override", async (t) => {
  setEmbeddingOverride(async ({ inputs }) =>
    inputs.map((input, index) => [Number(index), input.length]),
  );
  const fn = new RemoteEmbeddingFunction();
  const result = await fn.generate(["a", "bb", "ccc"]);
  t.deepEqual(result, [
    [0, 1],
    [1, 2],
    [2, 3],
  ]);
  fn.dispose();
});

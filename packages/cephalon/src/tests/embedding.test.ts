import test from "ava";

import {
  RemoteEmbeddingFunction,
  setEmbeddingOverride,
} from "@promethean/embedding";

if (process.env.SKIP_NETWORK_TESTS === "1") {
  test("cephalon embedding network tests skipped in sandbox", (t) => t.pass());
} else {
  test("requests embeddings via override", async (t) => {
    setEmbeddingOverride(async ({ inputs }) =>
      inputs.map((input, index) => [Number(index), input.length]),
    );
    const fn = new RemoteEmbeddingFunction();
    const result = await fn.generate(["a", "bb"]);
    t.deepEqual(result, [
      [0, 1],
      [1, 2],
    ]);
    fn.dispose();
    setEmbeddingOverride(null);
  });
}

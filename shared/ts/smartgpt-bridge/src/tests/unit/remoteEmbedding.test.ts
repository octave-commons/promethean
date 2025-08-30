// @ts-nocheck
import test from "ava";
import path from "node:path";

test("RemoteEmbeddingFunction: generate returns embeddings via fake broker", async (t) => {
  const prev = process.env.SHARED_IMPORT;
  try {
    const abs = path.join(
      process.cwd(),
      "dist",
      "tests",
      "helpers",
      "fakeBroker.js",
    );
    process.env.SHARED_IMPORT = "file://" + abs;
    const mod = await import("../../remoteEmbedding.js");
    const { RemoteEmbeddingFunction } = mod;
    const ref = new RemoteEmbeddingFunction(undefined, "driverX", "fnY");
    const out = await ref.generate(["hello", "world"]);
    t.true(Array.isArray(out));
    t.is(out.length, 2);
    t.true(Array.isArray(out[0]));
    await ref?._ready?.catch(() => {});
    ref?.dispose?.();
  } finally {
    if (prev === undefined) delete process.env.SHARED_IMPORT;
    else process.env.SHARED_IMPORT = prev;
  }
});

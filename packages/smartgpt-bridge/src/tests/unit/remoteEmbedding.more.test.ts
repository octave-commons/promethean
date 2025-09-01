// @ts-nocheck
import test from "ava";
import path from "node:path";

test("RemoteEmbeddingFunction: image url item mapping", async (t) => {
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
    const { RemoteEmbeddingFunction } = await import(
      "../../remoteEmbedding.js"
    );
    const ref = new RemoteEmbeddingFunction(undefined, "driverX", "fnY");
    const out = await ref.generate([
      { type: "image_url", data: "https://example.com/i.png" },
    ]);
    t.true(Array.isArray(out));
    t.is(out.length, 1);
    t.true(Array.isArray(out[0]));
    t.is(ref.defaultSpace(), "l2");
    t.true(ref.supportedSpaces().includes("cosine"));
    await ref?._ready?.catch(() => {});
    ref?.dispose?.();
  } finally {
    if (prev === undefined) delete process.env.SHARED_IMPORT;
    else process.env.SHARED_IMPORT = prev;
  }
});

import test from "ava";

import {
  RemoteEmbeddingFunction,
  setEmbeddingOverride,
} from "../../remoteEmbedding.js";

test.serial(
  "RemoteEmbeddingFunction: times out when embedding is slow",
  async (t) => {
    const prevTimeout = process.env.EMBEDDING_TIMEOUT_MS;
    try {
      process.env.EMBEDDING_TIMEOUT_MS = "50";
      setEmbeddingOverride(async () => {
        await new Promise((resolve) => setTimeout(resolve, 200));
        return [[0.5, 0.5, 0.5]];
      });
      const ref = new RemoteEmbeddingFunction({ driver: "driverX", fn: "fnY" });
      await t.throwsAsync(() => ref.generate(["hello"]), {
        message: /embedding timeout/i,
      });
      ref.dispose();
    } finally {
      setEmbeddingOverride(null);
      if (prevTimeout === undefined) delete process.env.EMBEDDING_TIMEOUT_MS;
      else process.env.EMBEDDING_TIMEOUT_MS = prevTimeout;
    }
  },
);

import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { PromptAffinityStore } from "../lib/prompt-affinity-store.js";

async function withTempDir(fn: (tempDir: string) => Promise<void>): Promise<void> {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), "prompt-affinity-store-test-"));

  try {
    await fn(tempDir);
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
}

test("prompt affinity close flushes batched writes", async () => {
  await withTempDir(async (tempDir) => {
    const filePath = path.join(tempDir, "prompt-affinity.json");
    const store = new PromptAffinityStore(filePath, 60_000);
    await store.warmup();

    await Promise.all([
      store.upsert("cache-key-1", "factory", "acct-1"),
      store.upsert("cache-key-2", "openai", "acct-2"),
      store.upsert("cache-key-1", "factory", "acct-3"),
    ]);

    await store.close();

    const persisted = JSON.parse(await readFile(filePath, "utf8")) as {
      records: Array<{ promptCacheKey: string; providerId: string; accountId: string; updatedAt: number }>;
    };
    assert.equal(persisted.records.length, 2);
    assert.equal(persisted.records[0]?.promptCacheKey, "cache-key-1");
    assert.equal(persisted.records[0]?.providerId, "factory");
    assert.equal(persisted.records[0]?.accountId, "acct-3");
    assert.equal(typeof persisted.records[0]?.updatedAt, "number");
    assert.equal(persisted.records[1]?.promptCacheKey, "cache-key-2");
    assert.equal(persisted.records[1]?.providerId, "openai");
    assert.equal(persisted.records[1]?.accountId, "acct-2");
    assert.equal(typeof persisted.records[1]?.updatedAt, "number");
  });
});

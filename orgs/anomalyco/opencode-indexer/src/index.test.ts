import test from "ava";
import { resolveDeps, runIndexer } from "./index.ts";

test("runIndexer calls indexSessions", async (t) => {
  let called = 0;
  await runIndexer({
    indexSessions: async () => {
      called += 1;
    },
  });
  t.is(called, 1);
});

test("resolveDeps returns noop in disabled mode", async (t) => {
  const previousMode = process.env.OPENCODE_INDEXER_MODE;
  delete process.env.OPENCODE_INDEXER_NOOP;
  process.env.OPENCODE_INDEXER_MODE = "disabled";

  try {
    const deps = resolveDeps();
    await t.notThrowsAsync(async () => {
      await deps.indexSessions();
    });
    t.pass();
  } finally {
    if (previousMode === undefined) {
      delete process.env.OPENCODE_INDEXER_MODE;
    } else {
      process.env.OPENCODE_INDEXER_MODE = previousMode;
    }
  }
});

test("resolveDeps rejects unsupported mode", (t) => {
  const previousMode = process.env.OPENCODE_INDEXER_MODE;
  process.env.OPENCODE_INDEXER_MODE = "realtime";

  try {
    const error = t.throws(() => resolveDeps());
    t.true(error?.message.includes("Unsupported OPENCODE_INDEXER_MODE"));
  } finally {
    if (previousMode === undefined) {
      delete process.env.OPENCODE_INDEXER_MODE;
    } else {
      process.env.OPENCODE_INDEXER_MODE = previousMode;
    }
  }
});

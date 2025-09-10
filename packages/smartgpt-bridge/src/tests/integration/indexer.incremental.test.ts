import fs from "node:fs/promises";
import path from "node:path";

import test from "ava";
import { sleep } from "@promethean/test-utils/dist/sleep.js";
import type {
  UpsertRecordsParams,
  DeleteParams,
  QueryRecordsParams,
} from "chromadb";

import {
  setChromaClient,
  setEmbeddingFactory,
  resetChroma,
  indexerManager,
} from "../../indexer.js";
import { loadBootstrapState } from "../../indexerState.js";

async function waitIdle(timeoutMs = 5000) {
  const start = Date.now();
  while (indexerManager.isBusy()) {
    if (Date.now() - start > timeoutMs) throw new Error("waitIdle timeout");
    await sleep(10);
  }
}

class RecordingCollection {
  upserts: Array<{
    ids: UpsertRecordsParams["ids"];
    metadatas: UpsertRecordsParams["metadatas"];
  }> = [];
  deletes: Array<DeleteParams> = [];
  async upsert(payload: UpsertRecordsParams): Promise<void> {
    this.upserts.push({ ids: payload.ids, metadatas: payload.metadatas });
  }
  async delete(payload: DeleteParams): Promise<void> {
    this.deletes.push(payload);
  }
  async query(_args?: QueryRecordsParams): Promise<{}> {
    return {};
  }
}
class FakeChroma {
  constructor(private col: RecordingCollection) {}
  async getOrCreateCollection(): Promise<RecordingCollection> {
    return this.col;
  }
}

test.serial(
  "bootstrap persists cursor and restart performs incremental diffs",
  async (t) => {
    // Speed up drain loops
    process.env.INDEXER_FILE_DELAY_MS = "0";

    // Create temp root
    const ROOT = path.join(
      process.cwd(),
      "services",
      "ts",
      "smartgpt-bridge",
      "tests",
      "tmp",
      "inc1",
    );
    await fs.mkdir(ROOT, { recursive: true });
    const a = path.join(ROOT, "a.txt");
    const b = path.join(ROOT, "b.txt");
    const c = path.join(ROOT, "c.md");
    await fs.writeFile(a, "alpha");
    await fs.writeFile(b, "bravo");
    await fs.writeFile(c, "# charlie");

    // Stub chroma + embeddings
    const col = new RecordingCollection();
    setChromaClient(new FakeChroma(col));
    setEmbeddingFactory(async () => ({ generate: async () => [] }));

    // Fresh bootstrap
    await indexerManager.resetAndBootstrap(ROOT);
    await waitIdle();

    // Confirm state saved and mode becomes indexed
    const s1 = indexerManager.status();
    t.is(s1.mode, "indexed");
    const stateFile = await loadBootstrapState(ROOT);
    t.truthy(stateFile);
    t.true(["indexed", "bootstrap"].includes(stateFile.mode));

    // Clear call history for incremental phase
    col.upserts = [];
    col.deletes = [];

    // Change files: modify b, add d, remove a
    const d = path.join(ROOT, "d.txt");
    await fs.appendFile(b, "++changed");
    await fs.writeFile(d, "delta");
    await fs.rm(a);

    // Simulate service restart by clearing in-memory root so ensureBootstrap re-runs
    indexerManager.rootPath = null;
    indexerManager.queue = [];
    indexerManager.active = false;
    indexerManager._draining = false;

    await indexerManager.ensureBootstrap(ROOT);
    await waitIdle();

    // Validate: upserted for b and d; deleted a
    const upsertPaths = new Set(
      col.upserts.flatMap((u) => {
        const metas = Array.isArray(u.metadatas) ? u.metadatas : [];
        return metas.map((m: any) => (m && (m as any).path) as string);
      }),
    );
    t.true(upsertPaths.has("b.txt"));
    t.true(upsertPaths.has("d.txt"));

    const deletedPaths = new Set(
      col.deletes.map((d) => {
        const w: any = (d as any).where;
        if (!w) return undefined;
        if (typeof w.path === "string") return w.path;
        if (w.eq && typeof w.eq.path === "string") return w.eq.path;
        return undefined;
      }),
    );
    t.true(deletedPaths.has("a.txt"));
  },
);

test.after.always(() => {
  // Reset globals
  resetChroma();
  setEmbeddingFactory(null);
  setChromaClient({
    getOrCreateCollection: async () => ({
      query: async () => ({}),
      upsert: async () => {},
      delete: async () => {},
    }),
  });
});

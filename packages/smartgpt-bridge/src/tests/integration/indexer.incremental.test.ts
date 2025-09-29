import fs from "node:fs/promises";
import path from "node:path";

import test from "ava";
import { sleep } from "@promethean/utils";
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
import {
  deleteBootstrapState,
  loadBootstrapState,
} from "../../indexerState.js";

const TEST_ROOT = path.join(
  process.cwd(),
  "services",
  "ts",
  "smartgpt-bridge",
  "tests",
  "tmp",
  "inc1",
);

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
    await fs.rm(TEST_ROOT, { recursive: true, force: true });
    await fs.mkdir(TEST_ROOT, { recursive: true });
    const a = path.join(TEST_ROOT, "a.txt");
    const b = path.join(TEST_ROOT, "b.txt");
    const c = path.join(TEST_ROOT, "c.md");
    await fs.writeFile(a, "alpha");
    await fs.writeFile(b, "bravo");
    await fs.writeFile(c, "# charlie");

    // Stub chroma + embeddings
    const col = new RecordingCollection();
    setChromaClient(new FakeChroma(col));
    setEmbeddingFactory(async () => ({ generate: async () => [] }));

    // Fresh bootstrap
    await indexerManager.resetAndBootstrap(TEST_ROOT);
    await waitIdle();

    // Confirm state saved and mode becomes indexed
    const s1 = indexerManager.status();
    t.is(s1.mode, "indexed");
    const stateFile = await loadBootstrapState(TEST_ROOT);
    t.truthy(stateFile);
    if (stateFile) {
      t.true(["indexed", "bootstrap"].includes(stateFile.mode ?? ""));
    }

    // Clear call history for incremental phase
    col.upserts = [];
    col.deletes = [];

    // Change files: modify b, add d, remove a
    const d = path.join(TEST_ROOT, "d.txt");
    await fs.appendFile(b, "++changed");
    await fs.writeFile(d, "delta");
    await fs.rm(a);

    // Simulate service restart by clearing in-memory root so ensureBootstrap re-runs
    indexerManager.rootPath = null;
    indexerManager.queue = [];
    indexerManager.active = false;
    indexerManager._draining = false;

    await indexerManager.ensureBootstrap(TEST_ROOT);
    await waitIdle();

    // Validate: upserted for b and d; deleted a
    const upsertPaths = new Set(
      col.upserts.flatMap((u) => {
        const metas = Array.isArray(u.metadatas) ? u.metadatas : [];
        return metas.map((m: any) => (m && m.path) as string);
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

test.after.always(async () => {
  await deleteBootstrapState(TEST_ROOT);
  await fs.rm(TEST_ROOT, { recursive: true, force: true });
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

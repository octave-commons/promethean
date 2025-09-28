import test from "ava";
import { promises as fs } from "node:fs";
import path from "node:path";
import { tmpdir } from "node:os";

import {
  setChromaClient,
  setEmbeddingFactory,
  type IndexerManager,
} from "@promethean/indexer-core";
import { createIndexerServiceClient, IndexerServiceError } from "../client.js";

test.before(() => {
  setChromaClient({
    async getOrCreateCollection() {
      return {
        upsert: async () => {},
        delete: async () => {},
        query: async () => ({
          ids: [],
          documents: [],
          metadatas: [],
          distances: [],
        }),
      };
    },
  });
  setEmbeddingFactory(async () => ({
    generate: async () => [],
  }));
});

import { buildServer } from "../server.js";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function waitForIdle(manager: IndexerManager, timeoutMs = 10_000) {
  const start = Date.now();
  while (manager.isBusy()) {
    if (Date.now() - start > timeoutMs) {
      throw new Error("waitForIdle timeout");
    }
    await delay(25);
  }
}

async function createTempDir() {
  const dir = await fs.mkdtemp(path.join(tmpdir(), "indexer-service-"));
  return dir;
}

test.serial("indexer service resets and reports status", async (t) => {
  const root = await createTempDir();
  const cachePath = path.join(root, ".cache");
  await fs.mkdir(cachePath, { recursive: true });
  await fs.writeFile(path.join(root, "doc.md"), "# hello\n");

  const { app, manager } = await buildServer({
    rootPath: root,
    cachePath,
    port: 0,
    host: "127.0.0.1",
    enableDocs: false,
    enableRateLimit: false,
  });
  await waitForIdle(manager);
  t.teardown(async () => {
    await waitForIdle(manager).catch(() => {});
    await app.close().catch(() => {});
    await fs.rm(root, { recursive: true, force: true }).catch(() => {});
  });

  const resetRes = await app.inject({ method: "POST", url: "/indexer/reset" });
  t.is(resetRes.statusCode, 200);

  await waitForIdle(manager);

  const statusRes = await app.inject({ method: "GET", url: "/indexer/status" });
  t.is(statusRes.statusCode, 200);
  const payload = statusRes.json() as {
    ok: boolean;
    status?: { mode?: string };
  };
  t.true(payload.ok);
  t.true(["bootstrap", "indexed"].includes(String(payload.status?.mode ?? "")));
});

test("client surfaces HTTP errors", async (t) => {
  const fetchCalls: Array<{ url: string; init?: RequestInit }> = [];
  const client = createIndexerServiceClient({
    baseUrl: "http://localhost:4260",
    fetchImpl: async (input, init) => {
      const url =
        typeof input === "string"
          ? input
          : input instanceof URL
            ? input.toString()
            : String(input);
      fetchCalls.push({ url, init });
      return new Response(JSON.stringify({ ok: false, error: "boom" }), {
        status: 500,
        headers: { "content-type": "application/json" },
      });
    },
  });

  await t.throwsAsync(client.status(), { instanceOf: IndexerServiceError });
  t.is(fetchCalls[0]?.url, "http://localhost:4260/indexer/status");
});

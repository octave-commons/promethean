import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { setTimeout as sleep } from "node:timers/promises";
import test from "node:test";
import AdmZip from "adm-zip";
import type { FastifyInstance } from "fastify";
import { buildApp } from "../app.js";
import type { OpenPlannerConfig } from "../lib/config.js";

function authHeader(apiKey: string): Record<string, string> {
  return { authorization: `Bearer ${apiKey}` };
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

async function withTempDir<T>(fn: (dir: string) => Promise<T>): Promise<T> {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "openplanner-test-"));
  try {
    return await fn(dir);
  } finally {
    await fs.rm(dir, { recursive: true, force: true });
  }
}

function testConfig(dataDir: string): OpenPlannerConfig {
  return {
    storageBackend: "duckdb",
    dataDir,
    host: "127.0.0.1",
    port: 0,
    apiKey: "fixture-openplanner-auth-token", // pragma: allowlist secret
    chromaUrl: "disabled",
    chromaCollection: "test_collection",
    chromaCompactCollection: "test_collection_compact",
    ollamaBaseUrl: "http://localhost:11434",
    embeddingModels: {
      defaultModel: "qwen3-embedding:0.6b",
      bySource: {},
      byKind: {},
      byProject: {}
    },
    ollamaEmbedTruncate: true
  };
}

async function createChatGPTZip(zipPath: string, messageText: string): Promise<void> {
  const conversations = [
    {
      title: "Test Session",
      create_time: 1700000000,
      mapping: {
        root: { id: "root", children: ["n1"] },
        n1: {
          id: "n1",
          parent: "root",
          children: [],
          message: {
            id: "msg-1",
            author: { role: "user" },
            create_time: 1700000001,
            content: { content_type: "text", parts: [messageText] },
            status: "finished_successfully"
          }
        }
      }
    }
  ];

  const zip = new AdmZip();
  zip.addFile("conversations.json", Buffer.from(JSON.stringify(conversations), "utf-8"));
  zip.writeZip(zipPath);
}

async function waitForJobDone(app: FastifyInstance, id: string, apiKey: string): Promise<Record<string, unknown>> {
  for (let i = 0; i < 80; i += 1) {
    const res = await app.inject({
      method: "GET",
      url: `/v1/jobs/${id}`,
      headers: authHeader(apiKey)
    });

    const body: unknown = res.json();
    if (isRecord(body) && isRecord(body.job)) {
      const job: Record<string, unknown> = body.job;
      if (job.status === "done" || job.status === "error") return job;
    }
    await sleep(50);
  }
  throw new Error("timed out waiting for job completion");
}

test("GET / is public", async () => {
  await withTempDir(async (dir) => {
    const cfg = testConfig(dir);
    const app = await buildApp(cfg);
    try {
      const res = await app.inject({ method: "GET", url: "/" });
      assert.equal(res.statusCode, 200);
      const body = res.json();
      assert.equal(body.ok, true);
      assert.equal(body.name, "openplanner");
    } finally {
      await app.close();
    }
  });
});

test("GET /v1/health is public and returns duckdb status", async () => {
  await withTempDir(async (dir) => {
    const cfg = testConfig(dir);
    const app = await buildApp(cfg);
    try {
      const res = await app.inject({ method: "GET", url: "/v1/health" });
      assert.equal(res.statusCode, 200);
      const body = res.json();
      assert.equal(body.ok, true);
      assert.equal(typeof body.ftsEnabled, "boolean");
      assert.equal(typeof body.time, "string");
      assert.equal(body.vectorCollections.hot, cfg.chromaCollection);
      assert.equal(body.vectorCollections.compact, cfg.chromaCompactCollection);
    } finally {
      await app.close();
    }
  });
});

test("Protected endpoints require Authorization bearer token", async () => {
  await withTempDir(async (dir) => {
    const cfg = testConfig(dir);
    const app = await buildApp(cfg);
    try {
      const res = await app.inject({ method: "GET", url: "/v1/sessions" });
      assert.equal(res.statusCode, 401);
    } finally {
      await app.close();
    }
  });
});

test("ChatGPT import job ingests events into DuckDB and is searchable", async () => {
  await withTempDir(async (dir) => {
    const cfg = testConfig(dir);
    const zipPath = path.join(dir, "chatgpt-export.zip");
    const msgText = "hello from test";
    await createChatGPTZip(zipPath, msgText);

    const app = await buildApp(cfg);
    try {
      const createRes = await app.inject({
        method: "POST",
        url: "/v1/jobs/import/chatgpt",
        headers: {
          ...authHeader(cfg.apiKey),
          "content-type": "application/json"
        },
        payload: JSON.stringify({ filePath: zipPath })
      });

      assert.equal(createRes.statusCode, 200);
      const createBody: unknown = createRes.json();
      assert.ok(isRecord(createBody));
      assert.equal(createBody.ok, true);
      assert.ok(isRecord(createBody.job));

      const jobId = createBody.job.id;
      if (typeof jobId !== "string") throw new Error("expected job.id to be a string");

      const job = await waitForJobDone(app, jobId, cfg.apiKey);
      assert.equal(job.status, "done");

      const searchRes = await app.inject({
        method: "POST",
        url: "/v1/search/fts",
        headers: {
          ...authHeader(cfg.apiKey),
          "content-type": "application/json"
        },
        payload: JSON.stringify({ q: "hello", limit: 10 })
      });

      assert.equal(searchRes.statusCode, 200);
      const searchBody: unknown = searchRes.json();
      assert.ok(isRecord(searchBody));
      assert.equal(searchBody.ok, true);
      const count = searchBody.count;
      if (typeof count !== "number") throw new Error("expected count to be a number");
      assert.ok(count >= 1);
      assert.ok(Array.isArray(searchBody.rows));

      const match = searchBody.rows.find((r: unknown) => isRecord(r) && r.source === "chatgpt-export");
      assert.ok(match);
    } finally {
      await app.close();
    }
  });
});

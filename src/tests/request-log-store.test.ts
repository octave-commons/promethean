import assert from "node:assert/strict";
import { mkdtemp, readdir, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { RequestLogStore } from "../lib/request-log-store.js";

function parseJsonlEntries(contents: string): unknown[] {
  return contents
    .split(/\r?\n/u)
    .filter((line) => line.trim().length > 0)
    .map((line) => JSON.parse(line));
}

async function withTempDir(fn: (tempDir: string) => Promise<void>): Promise<void> {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), "request-log-store-test-"));

  try {
    await fn(tempDir);
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
}

test("warmup quarantines a corrupted legacy request log file and starts empty", async () => {
  await withTempDir(async (tempDir) => {
    const filePath = path.join(tempDir, "request-logs.jsonl");
    const corruptJson = `{
  "entries": [
    {
      "id": "entry-1",
      "timestamp": 1773701127508,
      "providerId": "openai",
      "accountId": "acct-1",
      "authType": "api_key",
      "model": "gpt-5.4",
      "upstreamMode": "responses",
      "upstreamPath": "/v1/responses",
      "status": 200,
      "latencyMs": 125,
      "pro`;

    await writeFile(filePath, corruptJson, "utf8");

    const store = new RequestLogStore(filePath, 100);
    await store.warmup();

    assert.deepEqual(store.snapshot(), []);

    const rewrittenContents = await readFile(filePath, "utf8");
    assert.equal(rewrittenContents, "");

    const files = await readdir(tempDir);
    const corruptFileName = files.find((file) => file.startsWith("request-logs.jsonl.corrupt-"));
    assert.ok(corruptFileName);
    assert.equal(await readFile(path.join(tempDir, corruptFileName), "utf8"), corruptJson);

    await store.close();
  });
});

test("warmup migrates a legacy request-logs.json file into request-logs.jsonl", async () => {
  await withTempDir(async (tempDir) => {
    const filePath = path.join(tempDir, "request-logs.jsonl");
    const legacyFilePath = path.join(tempDir, "request-logs.json");
    const legacyPayload = {
      entries: [
        {
          id: "entry-1",
          timestamp: 1773701127508,
          providerId: "openai",
          accountId: "acct-1",
          authType: "api_key",
          model: "gpt-5.4",
          upstreamMode: "responses",
          upstreamPath: "/v1/responses",
          status: 200,
          latencyMs: 125,
          totalTokens: 20,
        },
      ],
      hourlyBuckets: [],
      dailyBuckets: [],
      dailyModelBuckets: [],
      dailyAccountBuckets: [],
      accountAccumulators: [],
    };

    await writeFile(legacyFilePath, JSON.stringify(legacyPayload, null, 2), "utf8");

    const store = new RequestLogStore(filePath, 100);
    await store.warmup();

    const entries = store.snapshot();
    assert.equal(entries.length, 1);
    assert.equal(entries[0]?.providerId, "openai");

    const migratedEntries = parseJsonlEntries(await readFile(filePath, "utf8")) as Array<Record<string, unknown>>;
    assert.equal(migratedEntries.length, 1);
    assert.equal(migratedEntries[0].providerId, "openai");

    const files = await readdir(tempDir);
    assert.equal(files.includes("request-logs.json"), false);
    assert.ok(files.some((file) => file.startsWith("request-logs.json.migrated-")));

    await store.close();
  });
});

test("request log persistence reloads cleanly without leaving temp files behind", async () => {
  await withTempDir(async (tempDir) => {
    const filePath = path.join(tempDir, "request-logs.jsonl");
    const store = new RequestLogStore(filePath, 100);
    await store.warmup();

    store.record({
      providerId: "openai",
      accountId: "acct-1",
      authType: "api_key",
      model: "gpt-5.4",
      upstreamMode: "responses",
      upstreamPath: "/v1/responses",
      status: 200,
      latencyMs: 125,
      promptTokens: 12,
      completionTokens: 8,
      totalTokens: 20,
    });

    await store.close();

    const files = await readdir(tempDir);
    assert.equal(files.some((file) => file.endsWith(".tmp")), false);

    const reloaded = new RequestLogStore(filePath, 100);
    await reloaded.warmup();

    const entries = reloaded.snapshot();
    assert.equal(entries.length, 1);
    assert.equal(entries[0]?.providerId, "openai");
    assert.equal(entries[0]?.accountId, "acct-1");
    assert.equal(entries[0]?.model, "gpt-5.4");
    assert.equal(entries[0]?.totalTokens, 20);

    await reloaded.close();
  });
});

test("request log close flushes batched writes", async () => {
  await withTempDir(async (tempDir) => {
    const filePath = path.join(tempDir, "request-logs.jsonl");
    const store = new RequestLogStore(filePath, 100, 60_000);
    await store.warmup();

    store.record({
      providerId: "factory",
      accountId: "acct-1",
      authType: "oauth_bearer",
      model: "claude-opus-4-6",
      upstreamMode: "messages",
      upstreamPath: "/api/llm/a/v1/messages",
      status: 200,
      latencyMs: 220,
    });
    store.record({
      providerId: "openai",
      accountId: "acct-2",
      authType: "oauth_bearer",
      model: "gpt-5.4",
      upstreamMode: "responses",
      upstreamPath: "/v1/responses",
      status: 200,
      latencyMs: 180,
    });

    await store.close();

    const persisted = parseJsonlEntries(await readFile(filePath, "utf8")) as Array<{ providerId: string; model: string }>;
    assert.equal(persisted.length, 2);
    assert.equal(persisted[0]?.providerId, "factory");
    assert.equal(persisted[1]?.model, "gpt-5.4");
  });
});

test("request log store reports mirror failures during upsert and close", async () => {
  await withTempDir(async (tempDir) => {
    const filePath = path.join(tempDir, "request-logs.jsonl");
    const warnings: string[] = [];
    const originalWarn = console.warn;
    console.warn = (...args: unknown[]) => {
      warnings.push(args.map((value) => String(value)).join(" "));
    };

    try {
      const store = new RequestLogStore(filePath, 100, 0, {
        upsertEntry: async () => {
          throw new Error("mirror-upsert-failed");
        },
        close: async () => {
          throw new Error("mirror-close-failed");
        },
      });

      await store.warmup();
      store.record({
        providerId: "openai",
        accountId: "acct-1",
        authType: "api_key",
        model: "gpt-5.4",
        upstreamMode: "responses",
        upstreamPath: "/v1/responses",
        status: 200,
        latencyMs: 125,
      });

      await store.close();
    } finally {
      console.warn = originalWarn;
    }

    assert.ok(warnings.some((entry) => entry.includes("mirror upsert failed") && entry.includes("mirror-upsert-failed")));
    assert.ok(warnings.some((entry) => entry.includes("mirror close failed") && entry.includes("mirror-close-failed")));
  });
});

test("request log persistence preserves upstream error summaries and factory diagnostics", async () => {
  await withTempDir(async (tempDir) => {
    const filePath = path.join(tempDir, "request-logs.jsonl");
    const store = new RequestLogStore(filePath, 100);
    await store.warmup();

    store.record({
      providerId: "factory",
      accountId: "acct-factory",
      authType: "oauth_bearer",
      model: "gpt-5.4",
      upstreamMode: "responses_passthrough",
      upstreamPath: "/api/llm/o/v1/responses",
      status: 403,
      latencyMs: 812,
      error: "Prompt rejected by upstream policy",
      upstreamErrorCode: "policy_violation",
      upstreamErrorType: "invalid_request_error",
      upstreamErrorMessage: "Prompt rejected by upstream policy",
      factoryDiagnostics: {
        requestFormat: "responses",
        promptCacheKeyHash: "sha256:1234567890ab",
        inputItemCount: 2,
        messageCount: 1,
        userMessageCount: 1,
        hasInstructions: true,
        instructionsChars: 128,
        totalTextChars: 1024,
        maxTextBlockChars: 768,
        hasReasoning: true,
        hasCodeFence: true,
        hasXmlLikeTags: true,
        hasOpencodeMarkers: true,
        hasAgentProtocolMarkers: true,
        textFingerprint: "sha256:abcdef123456",
        instructionsFingerprint: "sha256:fedcba654321",
      },
    });

    await store.close();

    const reloaded = new RequestLogStore(filePath, 100);
    await reloaded.warmup();

    const entries = reloaded.snapshot();
    assert.equal(entries.length, 1);
    const entry = entries[0];
    assert.ok(entry);
    assert.equal(entry.upstreamErrorCode, "policy_violation");
    assert.equal(entry.upstreamErrorType, "invalid_request_error");
    assert.equal(entry.upstreamErrorMessage, "Prompt rejected by upstream policy");
    assert.ok(entry.factoryDiagnostics);
    assert.equal(entry.factoryDiagnostics.requestFormat, "responses");
    assert.equal(entry.factoryDiagnostics.promptCacheKeyHash, "sha256:1234567890ab");
    assert.equal(entry.factoryDiagnostics.hasOpencodeMarkers, true);
    assert.equal(entry.factoryDiagnostics.hasAgentProtocolMarkers, true);
    assert.equal(entry.factoryDiagnostics.textFingerprint, "sha256:abcdef123456");

    await reloaded.close();
  });
});

test("warmup backfills missing derived cost/env estimates from token counts and persists daily model/account buckets", async () => {
  await withTempDir(async (tempDir) => {
    const filePath = path.join(tempDir, "request-logs.jsonl");
    const payload = {
      entries: [
        {
          id: "entry-1",
          timestamp: Date.UTC(2026, 2, 16, 23, 15, 0),
          providerId: "openai",
          accountId: "acct-1",
          authType: "oauth_bearer",
          model: "gpt-5.4",
          upstreamMode: "responses",
          upstreamPath: "/v1/responses",
          status: 200,
          latencyMs: 250,
          promptTokens: 1000,
          completionTokens: 200,
          totalTokens: 1200,
          costUsd: 0,
          energyJoules: 0,
          waterEvaporatedMl: 0,
        },
      ],
      hourlyBuckets: [],
      dailyBuckets: [],
      dailyModelBuckets: [],
      dailyAccountBuckets: [],
      accountAccumulators: [],
    };

    await writeFile(filePath, JSON.stringify(payload, null, 2), "utf8");

    const store = new RequestLogStore(filePath, 100);
    await store.warmup();

    const entries = store.snapshot();
    assert.equal(entries.length, 1);
    assert.ok((entries[0]?.costUsd ?? 0) > 0);
    assert.ok((entries[0]?.energyJoules ?? 0) > 0);
    assert.ok((entries[0]?.waterEvaporatedMl ?? 0) > 0);

    const dailyModelBuckets = store.snapshotDailyModelBuckets();
    assert.equal(dailyModelBuckets.length, 1);
    assert.equal(dailyModelBuckets[0]?.providerId, "openai");
    assert.equal(dailyModelBuckets[0]?.model, "gpt-5.4");
    assert.equal(dailyModelBuckets[0]?.totalTokens, 1200);
    assert.ok((dailyModelBuckets[0]?.costUsd ?? 0) > 0);

    const dailyAccountBuckets = store.snapshotDailyAccountBuckets();
    assert.equal(dailyAccountBuckets.length, 1);
    assert.equal(dailyAccountBuckets[0]?.providerId, "openai");
    assert.equal(dailyAccountBuckets[0]?.accountId, "acct-1");
    assert.equal(dailyAccountBuckets[0]?.totalTokens, 1200);
    assert.ok((dailyAccountBuckets[0]?.costUsd ?? 0) > 0);

    const coverage = store.getCoverage();
    assert.equal(coverage.earliestModelBreakdownAtMs, Date.UTC(2026, 2, 16, 0, 0, 0));
    assert.equal(coverage.earliestAccountBreakdownAtMs, Date.UTC(2026, 2, 16, 0, 0, 0));

    await store.close();
  });
});

test("request log store tracks tenant usage attribution separately", async () => {
  await withTempDir(async (tempDir) => {
    const filePath = path.join(tempDir, "request-logs.jsonl");
    const store = new RequestLogStore(filePath, 100);
    await store.warmup();

    store.record({
      tenantId: "acme",
      issuer: "local",
      keyId: "key-acme",
      providerId: "openai",
      accountId: "acct-1",
      authType: "oauth_bearer",
      model: "gpt-5.4",
      upstreamMode: "responses",
      upstreamPath: "/v1/responses",
      status: 200,
      latencyMs: 100,
      totalTokens: 50,
    });

    store.record({
      tenantId: "beta",
      issuer: "local",
      keyId: "key-beta",
      providerId: "openai",
      accountId: "acct-1",
      authType: "oauth_bearer",
      model: "gpt-5.4",
      upstreamMode: "responses",
      upstreamPath: "/v1/responses",
      status: 200,
      latencyMs: 120,
      totalTokens: 70,
    });

    const acmeEntries = store.list({ tenantId: "acme" });
    assert.equal(acmeEntries.length, 1);
    assert.equal(acmeEntries[0]?.keyId, "key-acme");

    const dailyAccountBuckets = store.snapshotDailyAccountBuckets();
    assert.equal(dailyAccountBuckets.length, 2);
    assert.ok(dailyAccountBuckets.some((bucket) => bucket.tenantId === "acme" && bucket.keyId === "key-acme" && bucket.totalTokens === 50));
    assert.ok(dailyAccountBuckets.some((bucket) => bucket.tenantId === "beta" && bucket.keyId === "key-beta" && bucket.totalTokens === 70));

    const accumulators = store.snapshotAccountAccumulators();
    assert.equal(accumulators.length, 2);
    assert.ok(accumulators.some((acc) => acc.tenantId === "acme" && acc.keyId === "key-acme" && acc.totalTokens === 50));
    assert.ok(accumulators.some((acc) => acc.tenantId === "beta" && acc.keyId === "key-beta" && acc.totalTokens === 70));

    await store.close();

    const persistedEntries = parseJsonlEntries(await readFile(filePath, "utf8")) as Array<Record<string, unknown>>;
    assert.equal(persistedEntries.length, 2);
    assert.equal(persistedEntries[0]?.tenantId, "acme");
    assert.equal(persistedEntries[1]?.tenantId, "beta");
  });
});

test("request log store mirrors records and updates into the shared usage sink", async () => {
  await withTempDir(async (tempDir) => {
    const filePath = path.join(tempDir, "request-logs.jsonl");
    const mirroredEntries: Array<Record<string, unknown>> = [];
    const store = new RequestLogStore(filePath, 100, 60_000, {
      upsertEntry: async (entry) => {
        mirroredEntries.push({ ...entry });
      },
    });
    await store.warmup();

    const entry = store.record({
      providerId: "openai",
      accountId: "acct-shared",
      authType: "oauth_bearer",
      model: "gpt-5.4",
      upstreamMode: "responses",
      upstreamPath: "/v1/responses",
      status: 200,
      latencyMs: 150,
    });

    store.update(entry.id, {
      promptTokens: 21,
      completionTokens: 21,
      totalTokens: 42,
      cacheHit: true,
    });

    await store.close();

    assert.equal(mirroredEntries.length, 2);
    assert.equal(mirroredEntries[0]?.id, entry.id);
    assert.equal(mirroredEntries[1]?.id, entry.id);
    assert.equal(mirroredEntries[1]?.totalTokens, 42);
    assert.equal(mirroredEntries[1]?.cacheHit, true);
  });
});

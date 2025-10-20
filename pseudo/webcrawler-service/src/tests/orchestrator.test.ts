import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import test from "ava";

import {
  CrawlerOrchestrator,
  createOrchestratorServer,
} from "../orchestrator.js";
import type { CrawlConfig } from "../types.js";

const mkTmpDir = async () => mkdtemp(join(tmpdir(), "webcrawler-orch-"));

test("deduplicates and canonicalizes seeds", async (t) => {
  const orchestrator = new CrawlerOrchestrator({
    outputDir: await mkTmpDir(),
  });

  const first = orchestrator.addSeed("https://example.com/path/?utm_source=a");
  const second = orchestrator.addSeed("https://example.com/path");

  t.like(first, { status: "added" });
  t.like(second, { status: "exists" });
  t.deepEqual(orchestrator.listSeeds(), ["https://example.com/path"]);
});

test("requires seeds before starting", async (t) => {
  const orchestrator = new CrawlerOrchestrator({
    outputDir: await mkTmpDir(),
  });

  const result = await orchestrator.start();
  t.is(result.status, "no-seeds");
});

test("start and end manage crawler lifecycle", async (t) => {
  const orchestrator = new CrawlerOrchestrator(
    {
      outputDir: await mkTmpDir(),
      maxDepth: 3,
    },
    (config: CrawlConfig) => {
      t.deepEqual(config.seeds, ["https://example.com/"]);
      return {
        crawl: async () => {
          const waitUntilStopped = async (): Promise<void> => {
            if (!(config.shouldContinue?.() ?? false)) {
              return;
            }
            await Promise.resolve();
            await waitUntilStopped();
          };
          await waitUntilStopped();
        },
      };
    },
  );

  orchestrator.addSeed("https://example.com");
  const startResult = await orchestrator.start();
  t.is(startResult.status, "started");
  t.is(orchestrator.getStatus().status, "running");

  const stopResult = await orchestrator.end();
  t.is(stopResult.status, "stopped");
  t.is(orchestrator.getStatus().status, "idle");
});

test("REST interface proxies orchestrator operations", async (t) => {
  const orchestrator = new CrawlerOrchestrator(
    {
      outputDir: await mkTmpDir(),
    },
    (_config: CrawlConfig) => ({
      async crawl() {},
    }),
  );
  const server = createOrchestratorServer(orchestrator);

  const addResponse = await server.inject({
    method: "POST",
    url: "/add",
    payload: { url: "https://example.com" },
  });
  t.is(addResponse.statusCode, 200);

  const startResponse = await server.inject({ method: "POST", url: "/start" });
  t.is(startResponse.statusCode, 202);

  const stopResponse = await server.inject({ method: "POST", url: "/end" });
  t.is(stopResponse.statusCode, 200);

  const removeResponse = await server.inject({
    method: "POST",
    url: "/remove",
    payload: { url: "https://example.com" },
  });
  t.is(removeResponse.statusCode, 200);

  await server.close();
});

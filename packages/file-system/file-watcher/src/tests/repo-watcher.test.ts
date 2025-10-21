import test from "ava";
import { sleep } from "@promethean/utils";

import { createRepoWatcher } from "../repo-watcher.js";

test("repo watcher posts index/remove for non-ignored files", async (t) => {
  t.timeout(5000);
  const calls: { url: string; body: any; headers: any }[] = [];
  const origFetch: any = globalThis.fetch;
  process.env.SMARTGPT_BRIDGE_TOKEN = "test-token";
  globalThis.fetch = (async (url: any, init: any) => {
    calls.push({
      url: String(url),
      body: JSON.parse(init.body),
      headers: init.headers,
    });
    return new Response("{}", { status: 200 });
  }) as any;

  const watcher = await createRepoWatcher({
    repoRoot: process.cwd(),
    bridgeUrl: "http://127.0.0.1:3210",
    debounceMs: 50,
  });
  // Directly invoke internal handle to avoid FS noise
  await (watcher as any)._handle("change", "src/example.ts");
  await sleep(10);
  await (watcher as any)._handle("change", "src/example.ts"); // coalesce by debounce
  await (watcher as any)._handle("unlink", "src/old.ts");
  await (watcher as any)._handle("change", "node_modules/ignore.js");
  await sleep(80); // wait > debounce to flush

  const indexCalls = calls.filter(
    (c) => c.url.endsWith("/indexer/index") && c.body.path === "src/example.ts",
  );
  t.true(indexCalls.length === 1);
  t.true(
    calls.some(
      (c) => c.url.endsWith("/indexer/remove") && c.body.path === "src/old.ts",
    ),
  );
  t.false(calls.some((c) => c.body.path === "node_modules/ignore.js"));
  t.true(calls.every((c) => c.headers?.Authorization === "Bearer test-token"));

  (await watcher).close();
  globalThis.fetch = origFetch;
  delete process.env.SMARTGPT_BRIDGE_TOKEN;
});

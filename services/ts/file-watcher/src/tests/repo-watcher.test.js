import test from "ava";
import { createRepoWatcher } from "../repo-watcher.js";
test("repo watcher posts index/remove for non-ignored files", async (t) => {
  t.timeout(5000);
  const calls = [];
  const origFetch = globalThis.fetch;
  process.env.SMARTGPT_BRIDGE_TOKEN = "test-token";
  globalThis.fetch = async (url, init) => {
    calls.push({
      url: String(url),
      body: JSON.parse(init.body),
      headers: init.headers,
    });
    return new Response("{}", { status: 200 });
  };
  const watcher = createRepoWatcher({
    repoRoot: process.cwd(),
    bridgeUrl: "http://127.0.0.1:3210",
    debounceMs: 50,
  });
  // Force not-ignored for deterministic tests
  const mod = await import("../repo-watcher.js");
  mod.checkGitIgnored = async () => false;
  // Directly invoke internal handle to avoid FS noise
  await watcher._handle("change", "src/example.ts");
  await new Promise((r) => setTimeout(r, 10));
  await watcher._handle("change", "src/example.ts"); // coalesce by debounce
  await watcher._handle("unlink", "src/old.ts");
  await watcher._handle("change", "node_modules/ignore.js");
  await new Promise((r) => setTimeout(r, 80)); // wait > debounce to flush
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
//# sourceMappingURL=repo-watcher.test.js.map

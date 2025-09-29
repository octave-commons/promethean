import * as path from "node:path";
import { promises as fs } from "node:fs";

import test from "ava";
import { startProcessWithPort, shutdown } from "@promethean/test-utils";

const PKG_ROOT = path.resolve(
  path.dirname(new URL(import.meta.url).pathname),
  "..",
  "..",
);

const SCHEMA = "schema-empty.json";

async function writeUtf8(p: string, content: string): Promise<void> {
  await fs.writeFile(p, content, "utf8");
}

async function setupPipeline(dir: string): Promise<string> {
  await writeUtf8(
    path.join(dir, "step.js"),
    "export default () => { console.log('step'); }\n",
  );
  await writeUtf8(path.join(dir, SCHEMA), JSON.stringify({ type: "object" }));
  const cfg = {
    pipelines: [
      {
        name: "p",
        steps: [
          {
            id: "s",
            cwd: dir,
            deps: [],
            inputs: [],
            outputs: [],
            inputSchema: SCHEMA,
            outputSchema: SCHEMA,
            cache: "none",
            js: { module: "./step.js", export: "default" },
          },
        ],
      },
    ],
  };
  const pipelinesPath = path.join(dir, "pipelines.json");
  await writeUtf8(pipelinesPath, JSON.stringify(cfg, null, 2));
  return pipelinesPath;
}

async function startDevUi(pipelinesPath: string) {
  return startProcessWithPort({
    cmd: "node",
    args: [
      path.join(PKG_ROOT, "dist/dev-ui.js"),
      "--config",
      pipelinesPath,
      "--port",
      ":PORT",
    ],
    cwd: PKG_ROOT,
    ready: {
      kind: "http",
      url: "http://localhost:PORT/health",
      timeoutMs: 60_000,
    },
    port: { mode: "free" },
    baseUrlTemplate: (p) => `http://127.0.0.1:${p}/`,
  });
}

async function repeatTimes(
  count: number,
  effect: () => Promise<void>,
): Promise<void> {
  if (count <= 0) return;
  await effect();
  await repeatTimes(count - 1, effect);
}

test.serial("read-file route enforces per-minute rate limit", async (t) => {
  const tmpParent = path.join(PKG_ROOT, "test-tmp");
  await fs.mkdir(tmpParent, { recursive: true });
  const dir = await fs.mkdtemp(path.join(tmpParent, "piper-"));
  t.teardown(async () => {
    await shutdown().catch(() => {});
    await fs.rm(dir, { recursive: true, force: true });
  });
  const pipelinesPath = await setupPipeline(dir);
  const { stop, baseUrl } = await startDevUi(pipelinesPath);
  t.teardown(stop);

  const workspaceFile = path.join(tmpParent, "rate-limit.txt");
  await writeUtf8(workspaceFile, "hello world\n");
  t.teardown(async () => {
    await fs.rm(workspaceFile, { force: true });
  });

  const relPath = path.relative(PKG_ROOT, workspaceFile);
  const url = `${baseUrl}api/read-file?${new URLSearchParams({
    path: relPath,
  }).toString()}`;

  await repeatTimes(10, async () => {
    const okRes = await fetch(url);
    t.is(okRes.status, 200);
    const payload = (await okRes.json()) as { readonly content: string };
    t.true(payload.content.includes("hello"));
  });

  const limitedRes = await fetch(url);
  t.is(limitedRes.status, 429);
  const retryAfter =
    limitedRes.headers.get("retry-after") ??
    limitedRes.headers.get("ratelimit-reset");
  t.truthy(retryAfter);
  const limitedBody = (await limitedRes.json()) as {
    readonly message?: string;
    readonly error?: string;
  };
  const message = (
    limitedBody?.message ??
    limitedBody?.error ??
    ""
  ).toLowerCase();
  t.true(message.includes("rate"));
});

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
    path.join(dir, "s1.js"),
    "export default () => { console.log('one'); }\n",
  );
  await writeUtf8(
    path.join(dir, "s2.js"),
    "export default () => { console.log('two'); }\n",
  );
  await writeUtf8(path.join(dir, SCHEMA), JSON.stringify({ type: "object" }));
  const cfg = {
    pipelines: [
      {
        name: "p",
        steps: [
          {
            id: "s1",
            cwd: dir,
            deps: [],
            inputs: [],
            outputs: [],
            inputSchema: SCHEMA,
            outputSchema: SCHEMA,
            cache: "none",
            js: { module: "./s1.js", export: "default" },
          },
          {
            id: "s2",
            cwd: dir,
            deps: ["s1"],
            inputs: [],
            outputs: [],
            inputSchema: SCHEMA,
            outputSchema: SCHEMA,
            cache: "none",
            js: { module: "./s2.js", export: "default" },
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

function assertPipelineSuccess(
  t: { readonly true: (value: unknown) => void },
  text: string,
): void {
  t.true(text.includes("s1 one"));
  t.true(text.includes("s2 two"));
  t.true(text.includes("EXIT s2 0"));
}

test.serial("dev-ui runs full pipeline via /api/run", async (t) => {
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
  const q = new URLSearchParams({ pipeline: "p" });
  const res = await fetch(`${baseUrl}api/run?${q.toString()}`);
  t.is(res.status, 200);
  const text = await res.text();
  assertPipelineSuccess(t, text);
});

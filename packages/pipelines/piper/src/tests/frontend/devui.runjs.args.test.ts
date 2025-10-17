import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { promises as fs } from "node:fs";

import test from "ava";
import { startProcessWithPort, shutdown } from "@promethean/test-utils";

const PKG_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
  "..",
);

const SCHEMA = "schema-empty.json";

// Ensure dev-ui runs JS steps with arg.* without creating a TS step
// that would otherwise crash the runner.
// eslint-disable-next-line max-lines-per-function
test.serial("dev-ui runs JS step with args", async (t) => {
  const tmpParent = path.join(PKG_ROOT, "test-tmp");
  await fs.mkdir(tmpParent, { recursive: true });
  const dir = await fs.mkdtemp(path.join(tmpParent, "piper-"));
  try {
    const stepJs = path.join(dir, "step.js");
    await fs.writeFile(
      stepJs,
      "export default ({name}) => { console.log('hello '+name); }\n",
      "utf8",
    );
    await fs.writeFile(
      path.join(dir, SCHEMA),
      JSON.stringify({ type: "object" }),
      "utf8",
    );
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
              cache: "content",
              js: {
                module: stepJs,
                export: "default",
                args: { name: "alice" },
              },
            },
          ],
        },
      ],
    };
    const pipelinesPath = path.join(dir, "pipelines.json");
    await fs.writeFile(pipelinesPath, JSON.stringify(cfg, null, 2), "utf8");

    const { stop, baseUrl } = await startProcessWithPort({
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

    try {
      const q = new URLSearchParams({ pipeline: "p", step: "s" });
      const res = await fetch(`${baseUrl}api/run-step?${q.toString()}`);
      t.is(res.status, 200);
      const text = await res.text();
      t.true(text.includes("EXIT 0"), text);
    } finally {
      await stop();
    }
  } finally {
    await shutdown().catch(() => {});
    await fs.rm(dir, { recursive: true, force: true });
  }
});

/* eslint-disable max-lines-per-function */
import * as path from "node:path";
import { promises as fs } from "node:fs";

import test from "ava";
import { startProcessWithPort, shutdown } from "@promethean/test-utils";

const PKG_ROOT = path.resolve(
  path.dirname(new URL(import.meta.url).pathname),
  "..",
  "..",
);

test.serial("dev-ui runs full pipeline via /api/run", async (t) => {
  const tmpParent = path.join(PKG_ROOT, "test-tmp");
  await fs.mkdir(tmpParent, { recursive: true });
  const dir = await fs.mkdtemp(path.join(tmpParent, "piper-"));
  try {
    await fs.writeFile(
      path.join(dir, "s1.js"),
      "export default () => { console.log('one'); }\n",
      "utf8",
    );
    await fs.writeFile(
      path.join(dir, "s2.js"),
      "export default () => { console.log('two'); }\n",
      "utf8",
    );
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
              cache: "none",
              js: { module: "./s1.js", export: "default" },
            },
            {
              id: "s2",
              cwd: dir,
              deps: ["s1"],
              inputs: [],
              outputs: [],
              cache: "none",
              js: { module: "./s2.js", export: "default" },
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
      const q = new URLSearchParams({ pipeline: "p" });
      const res = await fetch(`${baseUrl}api/run?${q.toString()}`);
      t.is(res.status, 200);
      const text = await res.text();
      t.true(text.includes("s1 one"));
      t.true(text.includes("s2 two"));
      t.true(text.includes("EXIT s2 0"));
    } finally {
      await stop();
    }
  } finally {
    await shutdown().catch(() => {});
    await fs.rm(dir, { recursive: true, force: true });
  }
});

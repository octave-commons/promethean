import * as fs from "node:fs/promises";
import * as path from "node:path";

import test from "ava";
import { sleep } from "@promethean/utils";

import { runPipeline } from "../runner.js";

const SCHEMA = "schema-empty.json";

async function withTmp(fn: (dir: string) => Promise<void>) {
  const parent = path.join(process.cwd(), "test-tmp");
  await fs.mkdir(parent, { recursive: true });
  const dir = await fs.mkdtemp(path.join(parent, "piper-"));
  try {
    await fs.writeFile(
      path.join(dir, SCHEMA),
      JSON.stringify({ type: "object" }),
      "utf8",
    );
    await fn(dir);
    await sleep(50);
  } finally {
    await fs.rm(dir, { recursive: true, force: true });
  }
}

// Set PIPER_TEST_WORKER=1 to also assert console capture via worker mode.
const WANT_LOG_ASSERT = process.env.PIPER_TEST_WORKER === "1";

test.serial("js step (worker isolate) basic smoke", async (t) => {
  await withTmp(async (dir) => {
    const mod = `
      export default async function({ msg }) {
        console.log("log:", msg);
        return "ret:" + msg;
      }
    `;
    await fs.writeFile(path.join(dir, "m.js"), mod, "utf8");

    const cfg = {
      pipelines: [
        {
          name: "w",
          steps: [
            {
              id: "w1",
              cwd: dir,
              deps: [],
              inputs: [],
              outputs: [],
              inputSchema: SCHEMA,
              outputSchema: SCHEMA,
              cache: "content",
              env: { WENV: "X" },
              js: { module: "./m.js", isolate: "worker", args: { msg: "ok" } },
            },
          ],
        },
      ],
    };

    const p = path.join(dir, "pipelines.json");
    await fs.writeFile(p, JSON.stringify(cfg, null, 2), "utf8");
    const res = await runPipeline(p, "w", { concurrency: 2 });

    const s = res[0];
    t.truthy(s);
    if (!s) return;
    t.is(s.exitCode, 0);
    t.true((s.stdout ?? "").includes("ret:ok")); // always check return

    if (WANT_LOG_ASSERT) {
      // Only enforce console capture if explicitly requested
      t.true((s.stdout ?? "").includes("log: ok"));
    }
  });
});

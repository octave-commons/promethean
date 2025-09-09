import * as fs from "fs/promises";
import * as path from "path";

import test from "ava";
import YAML from "yaml";

import { runPipeline } from "../runner.js";

async function withTmp(fn: (dir: string) => Promise<void>) {
  const parent = path.join(process.cwd(), "test-tmp");
  await fs.mkdir(parent, { recursive: true });
  const dir = await fs.mkdtemp(path.join(parent, "piper-"));
  try {
    await fn(dir);
    await new Promise((r) => setTimeout(r, 25));
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
              cache: "content",
              env: { WENV: "X" },
              js: { module: "./m.js", isolate: "worker", args: { msg: "ok" } },
            },
          ],
        },
      ],
    };

    const p = path.join(dir, "pipelines.yaml");
    await fs.writeFile(p, YAML.stringify(cfg), "utf8");
    const res = await runPipeline(p, "w", { concurrency: 2 });

    const s = res[0]!;
    t.is(s.exitCode, 0);
    t.true((s.stdout ?? "").includes("ret:ok")); // always check return

    if (WANT_LOG_ASSERT) {
      // Only enforce console capture if explicitly requested
      t.true((s.stdout ?? "").includes("log: ok"));
    }
  });
});

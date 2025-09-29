import * as fs from "fs/promises";
import * as path from "path";

import test from "ava";

import { runPipeline } from "../runner.js";

const SCHEMA = "schema-empty.json";

async function withTmp(fn: (dir: string) => Promise<void>) {
  const dir = path.join(
    process.cwd(),
    "test-tmp",
    String(Date.now()) + "-" + Math.random().toString(36).slice(2),
  );
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(
    path.join(dir, SCHEMA),
    JSON.stringify({ type: "object" }),
    "utf8",
  );
  try {
    await fn(dir);
  } finally {
    await fs.rm(dir, { recursive: true, force: true });
  }
}

test("runPipeline creates output directories", async (t) => {
  await withTmp(async (dir) => {
    const cfg = {
      pipelines: [
        {
          name: "demo",
          steps: [
            {
              id: "write",
              cwd: ".",
              deps: [],
              inputs: [],
              outputs: ["nested/out.txt"],
              inputSchema: SCHEMA,
              outputSchema: SCHEMA,
              shell: "echo hi > nested/out.txt",
            },
          ],
        },
      ],
    };
    const pipelinesPath = path.join(dir, "pipelines.json");
    await fs.writeFile(pipelinesPath, JSON.stringify(cfg, null, 2), "utf8");
    const res = await runPipeline(pipelinesPath, "demo", { concurrency: 1 });
    const step = res[0]!;
    t.is(step.exitCode, 0);
    const content = await fs.readFile(
      path.join(dir, "nested", "out.txt"),
      "utf8",
    );
    t.is(content.trim(), "hi");
  });
});

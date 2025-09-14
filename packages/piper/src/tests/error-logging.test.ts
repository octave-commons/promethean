import * as fs from "fs/promises";
import * as path from "path";

import test from "ava";

import { runPipeline } from "../runner.js";

async function withTmp(fn: (dir: string) => Promise<void>) {
  const dir = path.join(
    process.cwd(),
    "test-tmp",
    String(Date.now()) + "-" + Math.random().toString(36).slice(2),
  );
  await fs.mkdir(dir, { recursive: true });
  try {
    await fn(dir);
  } finally {
    await fs.rm(dir, { recursive: true, force: true });
  }
}

test("failing steps log stderr once", async (t) => {
  await withTmp(async (dir) => {
    const prevCwd = process.cwd();
    process.chdir(dir);
    try {
      const cfg = {
        pipelines: [
          {
            name: "demo",
            steps: [
              {
                id: "bad",
                cwd: ".",
                deps: [],
                inputs: [],
                outputs: [],
                cache: "content",
                retry: 1,
                shell: "sh -c 'echo out; echo err >&2; exit 1'",
              },
            ],
          },
        ],
      };
      const pipelinesPath = path.join(dir, "pipelines.json");
      await fs.writeFile(pipelinesPath, JSON.stringify(cfg, null, 2), "utf8");

      const logs: string[] = [];
      const origError = console.error;
      console.error = (...args: unknown[]) => {
        logs.push(args.join(" "));
      };
      try {
        await t.throwsAsync(
          () =>
            runPipeline(pipelinesPath, "demo", {
              concurrency: 1,
              contentHash: true,
            }),
          { instanceOf: Error },
        );
      } finally {
        console.error = origError;
      }

      t.is(logs.length, 1);
      t.true(logs[0]?.includes("err"));
      t.true(logs[0]?.includes("out"));
    } finally {
      process.chdir(prevCwd);
    }
  });
});

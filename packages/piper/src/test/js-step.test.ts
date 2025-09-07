import * as fs from "fs/promises";
import * as path from "path";

import test from "ava";
import YAML from "yaml";

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

test("runPipeline executes js function steps", async (t) => {
  await withTmp(async (dir) => {
    const prevCwd = process.cwd();
    process.chdir(dir);
    try {
      const modSrc = `export function greet(a){ console.log('hello ' + a.name); return 'done'; }`;
      await fs.writeFile(path.join(dir, "mod.js"), modSrc, "utf8");
      const cfg = {
        pipelines: [
          {
            name: "demo",
            steps: [
              {
                id: "js",
                cwd: ".",
                deps: [],
                inputs: [],
                outputs: [],
                cache: "content",
                js: {
                  module: "./mod.js",
                  export: "greet",
                  args: { name: "world" },
                },
              },
            ],
          },
        ],
      };
      const pipelinesPath = path.join(dir, "pipelines.yaml");
      await fs.writeFile(pipelinesPath, YAML.stringify(cfg), "utf8");
      const res = await runPipeline(pipelinesPath, "demo", { concurrency: 1 });
      const first = res[0]!;
      t.is(first.exitCode, 0);
      t.true(first.stdout?.includes("hello world") ?? false);
      t.true(first.stdout?.includes("done") ?? false);
    } finally {
      process.chdir(prevCwd);
    }
  });
});


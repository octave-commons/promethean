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
      const libPath = path.join(dir, "lib.js");
      await fs.writeFile(
        libPath,
        "import { promises as fs } from 'fs';\nexport async function make({file,content}){await fs.writeFile(file, content, 'utf8');return 'made';}\n",
        "utf8",
      );
      const cfg = {
        pipelines: [
          {
            name: "demo",
            steps: [
              {
                id: "make",
                cwd: ".",
                deps: [],
                inputs: [],
                outputs: ["out.txt"],
                cache: "content",
                js: {
                  module: "./lib.js",
                  export: "make",
                  args: { file: "out.txt", content: "hi" },
                },
              },
              {
                id: "cat",
                cwd: ".",
                deps: ["make"],
                inputs: ["out.txt"],
                outputs: ["out2.txt"],
                cache: "content",
                shell: "cat out.txt > out2.txt",
              },
            ],
          },
        ],
      };
      const pipelinesPath = path.join(dir, "pipelines.yaml");
      await fs.writeFile(pipelinesPath, YAML.stringify(cfg), "utf8");
      const res = await runPipeline(pipelinesPath, "demo", { concurrency: 2 });
      t.is(res.length, 2);
      t.true(res.every((r) => !r.skipped));
      const out = await fs.readFile(path.join(dir, "out2.txt"), "utf8");
      t.is(out, "hi");
    } finally {
      process.chdir(prevCwd);
    }
  });
});

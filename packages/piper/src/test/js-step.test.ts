import * as fs from "fs/promises";
import * as path from "path";

import test from "ava";
import YAML from "yaml";

import { runPipeline } from "../runner.js";
import { runJSFunction } from "../fsutils.js";

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

test.serial("runPipeline executes js function steps", async (t) => {
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

test("runJSFunction restores globals on timeout", async (t) => {
  const origStdout = process.stdout.write;
  const origStderr = process.stderr.write;
  const origEnv = process.env.TEST_VAR;
  const fn = async () => {
    await new Promise((resolve) => setTimeout(resolve, 100));
  };
  const res = await runJSFunction(fn, {}, { TEST_VAR: "changed" }, 10);
  t.is(res.code, 124);
  t.is(process.stdout.write, origStdout);
  t.is(process.stderr.write, origStderr);
  t.is(process.env.TEST_VAR, origEnv);
});

test.serial("js steps execute sequentially to prevent global corruption", async (t) => {
  await withTmp(async (dir) => {
    const prevCwd = process.cwd();
    process.chdir(dir);
    try {
      const modSrc = `export async function check(){\n  console.log(process.env.TEST_VAR);\n  await new Promise(r=>setTimeout(r,50));\n  console.log(process.env.TEST_VAR);\n}`;
      await fs.writeFile(path.join(dir, "mod.js"), modSrc, "utf8");
      const cfg = {
        pipelines: [
          {
            name: "demo",
            steps: [
              {
                id: "a",
                cwd: ".",
                deps: [],
                inputs: [],
                outputs: [],
                cache: "content",
                env: { TEST_VAR: "A" },
                js: { module: "./mod.js", export: "check" },
              },
              {
                id: "b",
                cwd: ".",
                deps: [],
                inputs: [],
                outputs: [],
                cache: "content",
                env: { TEST_VAR: "B" },
                js: { module: "./mod.js", export: "check" },
              },
            ],
          },
        ],
      };
      const pipelinesPath = path.join(dir, "pipelines.yaml");
      await fs.writeFile(pipelinesPath, YAML.stringify(cfg), "utf8");
      const res = await runPipeline(pipelinesPath, "demo", { concurrency: 2 });
      const a = res.find((r) => r.id === "a")!;
      const b = res.find((r) => r.id === "b")!;
      t.is(a.stdout, "A\nA\n");
      t.is(b.stdout, "B\nB\n");
    } finally {
      process.chdir(prevCwd);
    }
  });
});


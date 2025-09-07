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
    await new Promise((r) => setTimeout(r, 10));
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

test.serial("js steps serialize to avoid global state races", async (t) => {
  const a = async () => {
    console.log("first");
    await new Promise((r) => setTimeout(r, 50));
  };
  const b = () => {
    console.log(process.env.LEAK ?? "second");
  };
  const [first, second] = await Promise.all([
    runJSFunction(a, {}, { LEAK: "1" }),
    runJSFunction(b, {}, {}),
  ]);
  t.is(first.code, 0);
  t.true(first.stdout.includes("first"));
  t.true((second.stdout ?? "").trim() === "second");
});

test.serial("runJSFunction restores globals on timeout", async (t) => {
  await withTmp(async (dir) => {
    const prevCwd = process.cwd();
    process.chdir(dir);
    try {
      const hangSrc = `export default async function(){ return new Promise(()=>{}); }`;
      const afterSrc = `export default function(){ console.log(process.env.LEAK ?? 'after'); }`;
      await fs.writeFile(path.join(dir, 'hang.js'), hangSrc, 'utf8');
      await fs.writeFile(path.join(dir, 'after.js'), afterSrc, 'utf8');
      const cfg = {
        pipelines: [
          {
            name: 'demo',
            steps: [
              { id: 'hang', cwd: '.', deps: [], inputs: [], outputs: [], cache: 'content', timeoutMs: 100, env: { LEAK: '1' }, js: { module: './hang.js' } },
              { id: 'after', cwd: '.', deps: [], inputs: [], outputs: [], cache: 'content', js: { module: './after.js' } },
            ],
          },
        ],
      };
      const pipelinesPath = path.join(dir, 'pipelines.yaml');
      await fs.writeFile(pipelinesPath, YAML.stringify(cfg), 'utf8');
      const res = await runPipeline(pipelinesPath, 'demo', { concurrency: 1 });
      const first = res.find((r) => r.id === 'hang')!;
      const second = res.find((r) => r.id === 'after')!;
      t.is(first.exitCode, 124);
      t.true((second.stdout?.trim() ?? '') === 'after');
    } finally {
      process.chdir(prevCwd);
    }
  });
});

test.serial("js steps can run nested pipelines without deadlock", async (t) => {
  const inner = async () => {
    console.log("inner");
  };
  const outer = async () => {
    const res = await runJSFunction(inner, {}, {});
    console.log((res.stdout ?? "").trim());
  };
  const res = (await Promise.race([
    runJSFunction(outer, {}, {}),
    new Promise((_, reject) => setTimeout(() => reject(new Error("deadlock")), 1000)),
  ])) as any;
  t.is(res.code, 0);
  t.true((res.stdout ?? "").trim().endsWith("inner"));
});


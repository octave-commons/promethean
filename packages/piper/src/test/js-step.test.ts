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

test.serial("pipeline supports shell and js steps", async (t) => {
  await withTmp(async (dir) => {
    const prev = process.cwd();
    process.chdir(dir);
    try {
      const modPath = path.join(dir, "mod.js");
      await fs.writeFile(
        modPath,
        "export async function run() {\n" +
          "  const txt = await (await import('fs/promises')).readFile('out.txt','utf8');\n" +
          "  return txt.trim().toUpperCase();\n" +
          "}\n",
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
              shell: "echo hello > out.txt",
            },
            {
              id: "js",
              cwd: ".",
              deps: ["make"],
              inputs: ["out.txt"],
              outputs: [],
              cache: "content",
              js: { module: "./mod.js", export: "run" },
            },
          ],
        },
      ],
    };
      const pipelinesPath = path.join(dir, "pipes.yaml");
      await fs.writeFile(pipelinesPath, JSON.stringify(cfg), "utf8");
      const res = await runPipeline(pipelinesPath, "demo", { concurrency: 1 });
      const jsStep = res.find((r) => r.id === "js");
      t.truthy(jsStep);
      t.is(jsStep!.stdout?.trim(), "HELLO");
    } finally {
      process.chdir(prev);
    }
  });
});

test.serial("js step reloads module between runs", async (t) => {
  await withTmp(async (dir) => {
    const prev = process.cwd();
    process.chdir(dir);
    try {
      const modPath = path.join(dir, "mod.js");
      await fs.writeFile(modPath, "export default () => 'one'\n", "utf8");
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
                js: { module: "./mod.js" },
              },
            ],
          },
        ],
      };
      const cfgPath = path.join(dir, "pipes.json");
      await fs.writeFile(cfgPath, JSON.stringify(cfg), "utf8");
      const first = await runPipeline(cfgPath, "demo", { concurrency: 1 });
      const firstJs = first.find((r) => r.id === "js");
      t.truthy(firstJs);
      t.is(firstJs!.stdout?.trim(), "one");

      await fs.writeFile(modPath, "export default () => 'two'\n", "utf8");

      const second = await runPipeline(cfgPath, "demo", { concurrency: 1 });
      const secondJs = second.find((r) => r.id === "js");
      t.truthy(secondJs);
      t.is(secondJs!.stdout?.trim(), "two");
    } finally {
      process.chdir(prev);
    }
  });
});

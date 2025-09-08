import * as fs from "fs/promises";
import * as path from "path";

import test from "ava";
import YAML from "yaml";

import { runPipeline } from "../runner.js";
import { runJSFunction } from "../fsutils.js";

async function withTmp(fn: (dir: string) => Promise<void>) {
  const parent = path.join(process.cwd(), "test-tmp");
  await fs.mkdir(parent, { recursive: true });
  const dir = await fs.mkdtemp(path.join(parent, "piper-"));
  try {
    await fn(dir);
    // small grace period for any async file watchers/flushes
    await new Promise((r) => setTimeout(r, 10));
  } finally {
    await fs.rm(dir, { recursive: true, force: true });
  }
}

test.serial("runPipeline executes js + shell steps (make → cat)", async (t) => {
  await withTmp(async (dir) => {
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
              cwd: dir,
              deps: [],
              inputs: [],
              outputs: ["out.txt"],
              cache: "content",
              js: {
                module: "./lib.js",
                export: "make",
                args: {
                  file: path.join(dir, "out.txt"),
                  content: "hi",
                },
              },
            },
            {
              id: "cat",
              cwd: dir,
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
  });
});

test.serial("JS steps isolate process.env when run concurrently", async (t) => {
  await withTmp(async (dir) => {
    const libPath = path.join(dir, "envmod.js");
    await fs.writeFile(
      libPath,
      "import { promises as fs } from 'fs';\nexport async function dump({file,key,delay}){await new Promise(r=>setTimeout(r,delay));await fs.writeFile(file, process.env[key]||'', 'utf8');}\n",
      "utf8",
    );

    const cfg = {
      pipelines: [
        {
          name: "env",
          steps: [
            {
              id: "one",
              cwd: dir,
              deps: [],
              inputs: [],
              outputs: ["a.txt"],
              cache: "content",
              env: { V: "1" },
              js: {
                module: "./envmod.js",
                export: "dump",
                args: { file: path.join(dir, "a.txt"), key: "V", delay: 50 },
              },
            },
            {
              id: "two",
              cwd: dir,
              deps: [],
              inputs: [],
              outputs: ["b.txt"],
              cache: "content",
              env: { V: "2" },
              js: {
                module: "./envmod.js",
                export: "dump",
                args: { file: path.join(dir, "b.txt"), key: "V", delay: 50 },
              },
            },
          ],
        },
      ],
    };

    const pipelinesPath = path.join(dir, "pipelines.yaml");
    await fs.writeFile(pipelinesPath, YAML.stringify(cfg), "utf8");
    await runPipeline(pipelinesPath, "env", { concurrency: 2 });

    const aOut = await fs.readFile(path.join(dir, "a.txt"), "utf8");
    const bOut = await fs.readFile(path.join(dir, "b.txt"), "utf8");
    t.is(aOut, "1");
    t.is(bOut, "2");
    t.is(process.env.V, undefined);
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
    const hangSrc = `export default async function(){ return new Promise(()=>{}); }`;
    const afterSrc = `export default function(){ console.log(process.env.LEAK ?? 'after'); }`;
    await fs.writeFile(path.join(dir, "hang.js"), hangSrc, "utf8");
    await fs.writeFile(path.join(dir, "after.js"), afterSrc, "utf8");

    const cfg = {
      pipelines: [
        {
          name: "demo",
          steps: [
            {
              id: "hang",
              cwd: dir,
              deps: [],
              inputs: [],
              outputs: [],
              cache: "content",
              timeoutMs: 100,
              env: { LEAK: "1" },
              js: { module: "./hang.js" },
            },
            {
              id: "after",
              cwd: dir,
              deps: [],
              inputs: [],
              outputs: [],
              cache: "content",
              js: { module: "./after.js" },
            },
          ],
        },
      ],
    };

    const pipelinesPath = path.join(dir, "pipelines.yaml");
    await fs.writeFile(pipelinesPath, YAML.stringify(cfg), "utf8");
    const res = await runPipeline(pipelinesPath, "demo", { concurrency: 1 });

    const first = res.find((r) => r.id === "hang")!;
    const second = res.find((r) => r.id === "after")!;
    t.is(first.exitCode, 124);
    t.true((second.stdout?.trim() ?? "") === "after");
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
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("deadlock")), 1000),
    ),
  ])) as any;
  t.is(res.code, 0);
  t.true((res.stdout ?? "").trim().endsWith("inner"));
});

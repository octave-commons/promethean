import * as fs from "fs/promises";
import * as path from "path";

import test from "ava";

import { runPipeline } from "../runner.js";

async function withTmp(fn: { (dir: any): Promise<void>; (arg0: string): any }) {
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

test.serial(
  "runPipeline executes steps and caches on second run",
  async (t) => {
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
                  id: "make",
                  cwd: ".",
                  deps: [],
                  inputs: [],
                  outputs: ["out.txt"],
                  cache: "content",
                  shell: "echo hello > out.txt",
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
        const pipelinesPath = path.join(dir, "pipelines.json");
        await fs.writeFile(pipelinesPath, JSON.stringify(cfg, null, 2), "utf8");

        const res1 = await runPipeline(pipelinesPath, "demo", {
          concurrency: 2,
          contentHash: true,
        });
        t.truthy(await fs.readFile(path.join(dir, "out.txt"), "utf8"));
        t.truthy(await fs.readFile(path.join(dir, "out2.txt"), "utf8"));
        t.is(
          res1.filter((r) => r.skipped).length,
          0,
          "first run should not skip",
        );

        const res2 = await runPipeline(pipelinesPath, "demo", {
          concurrency: 2,
          contentHash: true,
        });
        t.true(
          res2.every((r) => r.skipped),
          "second run should skip all steps",
        );

        // touch input to invalidate
        await fs.writeFile(path.join(dir, "out.txt"), "changed\n", "utf8");
        const res3 = await runPipeline(pipelinesPath, "demo", {
          concurrency: 2,
          contentHash: true,
        });
        t.true(
          res3.some((r) => !r.skipped),
          "after change, at least one step should rerun",
        );
      } finally {
        process.chdir(prevCwd);
      }
    });
  },
);

test.serial("runPipeline throws for unknown pipeline name", async (t) => {
  await withTmp(async (dir) => {
    const prevCwd = process.cwd();
    process.chdir(dir);
    try {
      const cfg = { pipelines: [ { name: "known", steps: [] } ] };
      const pipelinesPath = path.join(dir, "pipelines.json");
      await fs.writeFile(pipelinesPath, JSON.stringify(cfg, null, 2), "utf8");
      await t.throwsAsync(async () => {
        await runPipeline(pipelinesPath, "unknown", { concurrency: 1, contentHash: true });
      }, { instanceOf: Error });
    } finally {
      process.chdir(prevCwd);
    }
  });
});

test.serial("runPipeline surfaces step failure (non-zero exit)", async (t) => {
  await withTmp(async (dir) => {
    const prevCwd = process.cwd();
    process.chdir(dir);
    try {
      const cfg = {
        pipelines: [{
          name: "fails",
          steps: [
            { id: "will-fail", cwd: ".", deps: [], inputs: [], outputs: ["never.txt"], cache: "content", shell: "sh -c \"exit 1\"" }
          ]
        }]
      };
      const pipelinesPath = path.join(dir, "pipelines.json");
      await fs.writeFile(pipelinesPath, JSON.stringify(cfg, null, 2), "utf8");
      await t.throwsAsync(() => runPipeline(pipelinesPath, "fails", { concurrency: 1, contentHash: true }), { instanceOf: Error });
      await t.throwsAsync(async () => { await fs.readFile(path.join(dir, "never.txt"), "utf8"); });
    } finally {
      process.chdir(prevCwd);
    }
  });
});

test.serial("steps with cache:\\"none\\" always re-run", async (t) => {
  await withTmp(async (dir) => {
    const prevCwd = process.cwd();
    process.chdir(dir);
    try {
      const cfg = {
        pipelines: [{
          name: "no-cache",
          steps: [
            { id: "touch", cwd: ".", deps: [], inputs: [], outputs: ["stamp.txt"], cache: "none", shell: "date +%s%3N > stamp.txt || date +%s > stamp.txt" }
          ]
        }]
      };
      const pipelinesPath = path.join(dir, "pipelines.json");
      await fs.writeFile(pipelinesPath, JSON.stringify(cfg, null, 2), "utf8");
      const r1 = await runPipeline(pipelinesPath, "no-cache", { concurrency: 1, contentHash: true });
      const v1 = await fs.readFile(path.join(dir, "stamp.txt"), "utf8");
      t.true(r1.length === 1 && !r1[0].skipped, "first run should execute");
      const r2 = await runPipeline(pipelinesPath, "no-cache", { concurrency: 1, contentHash: true });
      const v2 = await fs.readFile(path.join(dir, "stamp.txt"), "utf8");
      t.true(r2.length === 1 && !r2[0].skipped, "second run should execute again");
      t.not(v2.trim(), v1.trim(), "output should change across runs when not cached");
    } finally {
      process.chdir(prevCwd);
    }
  });
});

test.serial("step cwd is respected for inputs/outputs", async (t) => {
  await withTmp(async (dir) => {
    const prevCwd = process.cwd();
    process.chdir(dir);
    try {
      await fs.mkdir(path.join(dir, "sub"), { recursive: true });
      const cfg = {
        pipelines: [{
          name: "cwd-demo",
          steps: [
            { id: "make-in-sub", cwd: "sub", deps: [], inputs: [], outputs: ["a.txt"], cache: "content", shell: "echo subfile > a.txt" },
            { id: "use-from-root", cwd: ".", deps: ["make-in-sub"], inputs: ["sub/a.txt"], outputs: ["b.txt"], cache: "content", shell: "cat sub/a.txt > b.txt" }
          ]
        }]
      };
      const pipelinesPath = path.join(dir, "pipelines.json");
      await fs.writeFile(pipelinesPath, JSON.stringify(cfg, null, 2), "utf8");
      const res = await runPipeline(pipelinesPath, "cwd-demo", { concurrency: 2, contentHash: true });
      t.true(res.some(r => r.id === "make-in-sub"));
      t.true(res.some(r => r.id === "use-from-root"));
      t.is((await fs.readFile(path.join(dir, "sub", "a.txt"), "utf8")).trim(), "subfile");
      t.truthy(await fs.readFile(path.join(dir, "b.txt"), "utf8"));
      const res2 = await runPipeline(pipelinesPath, "cwd-demo", { concurrency: 2, contentHash: true });
      t.true(res2.every(r => r.skipped), "subsequent run should be fully cached");
    } finally {
      process.chdir(prevCwd);
    }
  });
});

test.serial("input change invalidates only affected downstream steps", async (t) => {
  await withTmp(async (dir) => {
    const prevCwd = process.cwd();
    process.chdir(dir);
    try {
      const cfg = {
        pipelines: [{
          name: "fanout",
          steps: [
            { id: "base", cwd: ".", deps: [], inputs: [], outputs: ["src.txt"], cache: "content", shell: "echo v1 > src.txt" },
            { id: "leafA", cwd: ".", deps: ["base"], inputs: ["src.txt"], outputs: ["a.txt"], cache: "content", shell: "cat src.txt > a.txt" },
            { id: "leafB", cwd: ".", deps: ["base"], inputs: ["src.txt"], outputs: ["b.txt"], cache: "content", shell: "cat src.txt > b.txt" }
          ]
        }]
      };
      const pipelinesPath = path.join(dir, "pipelines.json");
      await fs.writeFile(pipelinesPath, JSON.stringify(cfg, null, 2), "utf8");
      const r1 = await runPipeline(pipelinesPath, "fanout", { concurrency: 3, contentHash: true });
      t.true(r1.every(r => !r.skipped), "first run executes all");
      const r2 = await runPipeline(pipelinesPath, "fanout", { concurrency: 3, contentHash: true });
      t.true(r2.every(r => r.skipped), "second run cached");
      await fs.writeFile(path.join(dir, "src.txt"), "v2\n", "utf8");
      const r3 = await runPipeline(pipelinesPath, "fanout", { concurrency: 3, contentHash: true });
      const changed = r3.filter(r => !r.skipped).map(r => r.id).sort();
      t.deepEqual(changed, ["base","leafA","leafB"], "all downstream of base should rerun");
    } finally {
      process.chdir(prevCwd);
    }
  });
});

test.serial("selecting a specific pipeline does not execute others", async (t) => {
  await withTmp(async (dir) => {
    const prevCwd = process.cwd();
    process.chdir(dir);
    try {
      const cfg = {
        pipelines: [
          {
            name: "alpha",
            steps: [ { id: "a", cwd: ".", deps: [], inputs: [], outputs: ["alpha.txt"], cache: "content", shell: "echo alpha > alpha.txt" } ]
          },
          {
            name: "beta",
            steps: [ { id: "b", cwd: ".", deps: [], inputs: [], outputs: ["beta.txt"], cache: "content", shell: "echo beta > beta.txt" } ]
          }
        ]
      };
      const pipelinesPath = path.join(dir, "pipelines.json");
      await fs.writeFile(pipelinesPath, JSON.stringify(cfg, null, 2), "utf8");
      const res = await runPipeline(pipelinesPath, "alpha", { concurrency: 1, contentHash: true });
      t.true(res.length === 1 && res[0].id === "a");
      t.truthy(await fs.readFile(path.join(dir, "alpha.txt"), "utf8"));
      await t.throwsAsync(async () => { await fs.readFile(path.join(dir, "beta.txt"), "utf8"); });
    } finally {
      process.chdir(prevCwd);
    }
  });
});

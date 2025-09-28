import * as fs from "fs/promises";
import * as path from "path";

import test from "ava";

import { runPipeline, StepError } from "../runner.js";

const SCHEMA = "schema-empty.json";

async function withTmp(fn: { (dir: any): Promise<void>; (arg0: string): any }) {
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

test.serial(
  "runPipeline executes steps and caches on second run",
  async (t) => {
    await withTmp(async (dir) => {
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
                inputSchema: SCHEMA,
                outputSchema: SCHEMA,
                cache: "content",
                shell: "echo hello > out.txt",
              },
              {
                id: "cat",
                cwd: ".",
                deps: ["make"],
                inputs: ["out.txt"],
                outputs: ["out2.txt"],
                inputSchema: SCHEMA,
                outputSchema: SCHEMA,
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
    });
  },
);

// (removed stray closers)

test.serial(
  "runPipeline stops downstream steps when a dependency fails",
  async (t) => {
    await withTmp(async (dir) => {
      const cfg = {
        pipelines: [
          {
            name: "fail-deps",
            steps: [
              {
                id: "make",
                cwd: ".",
                deps: [],
                inputs: [],
                outputs: ["a.txt"],
                inputSchema: SCHEMA,
                outputSchema: SCHEMA,
                cache: "content",
                shell: "echo A > a.txt",
              },
              {
                id: "boom",
                cwd: ".",
                deps: ["make"],
                inputs: ["a.txt"],
                outputs: ["b.txt"],
                inputSchema: SCHEMA,
                outputSchema: SCHEMA,
                cache: "content",
                // Force a non-zero exit to simulate failure
                shell: "sh -c 'echo err >&2; echo will-fail; exit 2'",
              },
              {
                id: "downstream",
                cwd: ".",
                deps: ["boom"],
                inputs: ["b.txt"],
                outputs: ["c.txt"],
                inputSchema: SCHEMA,
                outputSchema: SCHEMA,
                cache: "content",
                shell: "cat b.txt > c.txt",
              },
            ],
          },
        ],
      };
      const pipelinesPath = path.join(dir, "pipelines.json");
      await fs.writeFile(pipelinesPath, JSON.stringify(cfg, null, 2), "utf8");

      const err = await t.throwsAsync(
        () =>
          runPipeline(pipelinesPath, "fail-deps", {
            concurrency: 2,
            contentHash: true,
          }),
        { instanceOf: StepError },
        "pipeline should throw when a step fails",
      );
      t.true(err.message.includes("boom"));
      t.true(err.message.includes("echo err >&2; echo will-fail; exit 2"));
      t.true(err.message.includes("stderr: err"));

      // Upstream succeeded
      t.truthy(await fs.readFile(path.join(dir, "a.txt"), "utf8"));

      // Failed step should not have produced its output
      await t.throwsAsync(
        () => fs.readFile(path.join(dir, "b.txt"), "utf8"),
        undefined,
        "failed step should not create output",
      );

      // Downstream step should not have run
      await t.throwsAsync(
        () => fs.readFile(path.join(dir, "c.txt"), "utf8"),
        undefined,
        "downstream step must not run after dependency failure",
      );
    });
  },
);

test.serial("runPipeline throws on unknown pipeline name", async (t) => {
  await withTmp(async (dir) => {
    const cfg = { pipelines: [{ name: "known", steps: [] }] };
    const pipelinesPath = path.join(dir, "pipelines.json");
    await fs.writeFile(pipelinesPath, JSON.stringify(cfg, null, 2), "utf8");

    await t.throwsAsync(
      () =>
        runPipeline(pipelinesPath, "unknown", {
          concurrency: 1,
          contentHash: true,
        }),
      { instanceOf: Error },
      "unknown pipeline should cause an error",
    );
  });
});

test.serial("runPipeline detects cyclic dependencies", async (t) => {
  await withTmp(async (dir) => {
    const cfg = {
      pipelines: [
        {
          name: "cycle",
          steps: [
            {
              id: "a",
              cwd: ".",
              deps: ["c"], // cycle back from c
              inputs: [],
              outputs: ["a.txt"],
              inputSchema: SCHEMA,
              outputSchema: SCHEMA,
              cache: "content",
              shell: "echo A > a.txt",
            },
            {
              id: "b",
              cwd: ".",
              deps: ["a"],
              inputs: ["a.txt"],
              outputs: ["b.txt"],
              inputSchema: SCHEMA,
              outputSchema: SCHEMA,
              cache: "content",
              shell: "cat a.txt > b.txt",
            },
            {
              id: "c",
              cwd: ".",
              deps: ["b"],
              inputs: ["b.txt"],
              outputs: ["c.txt"],
              inputSchema: SCHEMA,
              outputSchema: SCHEMA,
              cache: "content",
              shell: "cat b.txt > c.txt",
            },
          ],
        },
      ],
    };
    const pipelinesPath = path.join(dir, "pipelines.json");
    await fs.writeFile(pipelinesPath, JSON.stringify(cfg, null, 2), "utf8");

    await t.throwsAsync(
      () =>
        runPipeline(pipelinesPath, "cycle", {
          concurrency: 2,
          contentHash: true,
        }),
      { instanceOf: Error },
      "cyclic graph should be rejected",
    );
  });
});

test.serial(
  "runPipeline fails when a step declares a missing input",
  async (t) => {
    await withTmp(async (dir) => {
      const cfg = {
        pipelines: [
          {
            name: "missing-input",
            steps: [
              {
                id: "lonely",
                cwd: ".",
                deps: [],
                inputs: ["nonexistent.txt"], // declared but not produced
                outputs: ["out.txt"],
                inputSchema: SCHEMA,
                outputSchema: SCHEMA,
                cache: "content",
                shell: "cat nonexistent.txt > out.txt",
              },
            ],
          },
        ],
      };
      const pipelinesPath = path.join(dir, "pipelines.json");
      await fs.writeFile(pipelinesPath, JSON.stringify(cfg, null, 2), "utf8");

      await t.throwsAsync(
        () =>
          runPipeline(pipelinesPath, "missing-input", {
            concurrency: 1,
            contentHash: true,
          }),
        { instanceOf: Error },
        "step should fail if a declared input is missing",
      );

      await t.throwsAsync(
        () => fs.readFile(path.join(dir, "out.txt"), "utf8"),
        undefined,
        "output should not be created on failure",
      );
    });
  },
);

test.serial(
  "runPipeline re-executes only affected steps when an intermediate input changes",
  async (t) => {
    await withTmp(async (dir) => {
      const cfg = {
        pipelines: [
          {
            name: "partial-invalidate",
            steps: [
              {
                id: "make1",
                cwd: ".",
                deps: [],
                inputs: [],
                outputs: ["x.txt"],
                inputSchema: SCHEMA,
                outputSchema: SCHEMA,
                cache: "content",
                shell: "echo X > x.txt",
              },
              {
                id: "make2",
                cwd: ".",
                deps: [],
                inputs: [],
                outputs: ["y.txt"],
                inputSchema: SCHEMA,
                outputSchema: SCHEMA,
                cache: "content",
                shell: "echo Y > y.txt",
              },
              {
                id: "join",
                cwd: ".",
                deps: ["make1", "make2"],
                inputs: ["x.txt", "y.txt"],
                outputs: ["z.txt"],
                inputSchema: SCHEMA,
                outputSchema: SCHEMA,
                cache: "content",
                shell: "cat x.txt y.txt > z.txt",
              },
            ],
          },
        ],
      };
      const pipelinesPath = path.join(dir, "pipelines.json");
      await fs.writeFile(pipelinesPath, JSON.stringify(cfg, null, 2), "utf8");

      const res1 = await runPipeline(pipelinesPath, "partial-invalidate", {
        concurrency: 2,
        contentHash: true,
      });
      t.is(res1.filter((r) => r.skipped).length, 0, "initial run executes all");

      const res2 = await runPipeline(pipelinesPath, "partial-invalidate", {
        concurrency: 2,
        contentHash: true,
      });
      t.true(
        res2.every((r) => r.skipped),
        "second run is fully cached",
      );

      // Change only x.txt to invalidate make1 and join; make2 should remain cached
      await fs.writeFile(path.join(dir, "x.txt"), "X-changed\n", "utf8");

      const res3 = await runPipeline(pipelinesPath, "partial-invalidate", {
        concurrency: 2,
        contentHash: true,
      });

      const byId = new Map(res3.map((r) => [r.id ?? "", r]));
      // We expect make1 and join to re-run (not skipped); make2 stays skipped
      t.true(
        Array.from(byId.values()).some(
          (r) => r.skipped === false && r.exitCode === 0,
        ),
        "at least one step re-executes after input change",
      );

      const make1 = byId.get("make1");
      const make2 = byId.get("make2");
      const join = byId.get("join");

      if (make1) {
        t.false(make1.skipped, "make1 should re-execute");
        t.is(make1.exitCode, 0);
      }
      if (make2) t.true(make2.skipped, "make2 should remain cached");
      if (join) {
        t.false(join.skipped, "join should re-execute due to changed input");
        t.is(join.exitCode, 0);
      }

      // Validate outputs were regenerated
      const z = await fs.readFile(path.join(dir, "z.txt"), "utf8");
      t.is(z, "X\nY\n", "z.txt should include regenerated X content");
    });
  },
);

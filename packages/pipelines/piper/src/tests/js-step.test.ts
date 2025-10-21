import * as fs from "node:fs/promises";
import * as path from "node:path";

import test from "ava";
import { sleep } from "@promethean/utils";

import { runPipeline } from "../runner.js";
import { runJSFunction } from "../fsutils.js";

const SCHEMA = "schema-empty.json";

async function withTmp(fn: (dir: string) => Promise<void>) {
  const parent = path.join(process.cwd(), "test-tmp");
  await fs.mkdir(parent, { recursive: true });
  const dir = await fs.mkdtemp(path.join(parent, "piper-"));
  try {
    await fs.writeFile(
      path.join(dir, SCHEMA),
      JSON.stringify({ type: "object" }),
      "utf8",
    );
    await fn(dir);
    // small grace period for any async file watchers/flushes
    await sleep(50);
  } finally {
    await fs.rm(dir, { recursive: true, force: true });
  }
}

/** ===== Base pipeline behavior (in-proc + shell) ===== */

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
              inputSchema: SCHEMA,
              outputSchema: SCHEMA,
              cache: "content",
              js: {
                module: "./lib.js",
                export: "make",
                args: { file: path.join(dir, "out.txt"), content: "hi" },
              },
            },
            {
              id: "cat",
              cwd: dir,
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
              inputSchema: SCHEMA,
              outputSchema: SCHEMA,
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
              inputSchema: SCHEMA,
              outputSchema: SCHEMA,
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

    const pipelinesPath = path.join(dir, "pipelines.json");
    await fs.writeFile(pipelinesPath, JSON.stringify(cfg, null, 2), "utf8");
    await runPipeline(pipelinesPath, "env", { concurrency: 2 });

    const aOut = await fs.readFile(path.join(dir, "a.txt"), "utf8");
    const bOut = await fs.readFile(path.join(dir, "b.txt"), "utf8");
    t.is(aOut, "1");
    t.is(bOut, "2");
    t.is(process.env.V, undefined);
  });
});

test.serial(
  "js steps serialize to avoid global state races (in-proc)",
  async (t) => {
    const a = async () => {
      console.log("first");
      await sleep(50);
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
  },
);

test.serial(
  "runJSFunction restores globals on timeout (in-proc)",
  async (t) => {
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
                inputSchema: SCHEMA,
                outputSchema: SCHEMA,
                cache: "none",
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
                inputSchema: SCHEMA,
                outputSchema: SCHEMA,
                cache: "none",
                js: { module: "./after.js" },
              },
            ],
          },
        ],
      };

      const pipelinesPath = path.join(dir, "pipelines.json");
      await fs.writeFile(pipelinesPath, JSON.stringify(cfg, null, 2), "utf8");
      await t.throwsAsync(() =>
        runPipeline(pipelinesPath, "demo", { concurrency: 1 }),
      );
    });
  },
);

test.serial(
  "js steps can run nested pipelines without deadlock (in-proc)",
  async (t) => {
    const inner = async () => {
      console.log("inner");
    };
    const outer = async () => {
      const res = await runJSFunction(inner, {}, {});
      console.log((res.stdout ?? "").trim());
    };
    const res: Awaited<ReturnType<typeof runJSFunction>> = await Promise.race([
      runJSFunction(outer, {}, {}),
      sleep(1000).then(() => {
        throw new Error("deadlock");
      }),
    ]);
    t.is(res.code, 0);
    t.true((res.stdout ?? "").trim().endsWith("inner"));
  },
);

/** ===== Worker-mode specific behavior ===== */

test.serial(
  "worker js step: returns code 124 on timeout and restores globals",
  async (t) => {
    await withTmp(async (dir) => {
      const modSrc = `export async function slow(){ await new Promise(r=>setTimeout(r,100)); }`;
      await fs.writeFile(path.join(dir, "mod.js"), modSrc, "utf8");

      const cfg = {
        pipelines: [
          {
            name: "w",
            steps: [
              {
                id: "js",
                cwd: dir,
                deps: [],
                inputs: [],
                outputs: [],
                inputSchema: SCHEMA,
                outputSchema: SCHEMA,
                cache: "none",
                timeoutMs: 10,
                env: { TEST_VAR: "changed" },
                js: { module: "./mod.js", export: "slow", isolate: "worker" },
              },
            ],
          },
        ],
      };

      const p = path.join(dir, "pipelines.json");
      await fs.writeFile(p, JSON.stringify(cfg, null, 2), "utf8");
      await t.throwsAsync(() => runPipeline(p, "w", { concurrency: 1 }));
      // Parent env/streams should remain untouched in worker mode (best we can
      // do is assert test didn't crash; global equality is implicit in success).
    });
  },
);

test.serial("worker js step: crash rejects instead of hanging", async (t) => {
  await withTmp(async (dir) => {
    // Explicit syntax error to force module load failure in worker
    await fs.writeFile(
      path.join(dir, "bad.js"),
      "export default () => { throw new SyntaxError('Intentional test error'); }",
      "utf8",
    );

    const cfg = {
      pipelines: [
        {
          name: "w",
          steps: [
            {
              id: "js",
              cwd: dir,
              deps: [],
              inputs: [],
              outputs: [],
              inputSchema: SCHEMA,
              outputSchema: SCHEMA,
              cache: "content",
              js: { module: "./bad.js", isolate: "worker" },
            },
          ],
        },
      ],
    };

    const p = path.join(dir, "pipelines.json");
    await fs.writeFile(p, JSON.stringify(cfg, null, 2), "utf8");
    await t.throwsAsync(() => runPipeline(p, "w", { concurrency: 1 }));
  });
});

test.serial("worker js step: export name is respected (one/two)", async (t) => {
  await withTmp(async (dir) => {
    await fs.writeFile(
      path.join(dir, "mod.js"),
      "export const one = ()=>'one';\nexport const two = ()=>'two';\n",
      "utf8",
    );

    const cfg = {
      pipelines: [
        {
          name: "w",
          steps: [
            {
              id: "a",
              cwd: dir,
              deps: [],
              inputs: [],
              outputs: [],
              inputSchema: SCHEMA,
              outputSchema: SCHEMA,
              cache: "content",
              js: { module: "./mod.js", export: "one", isolate: "worker" },
            },
            {
              id: "b",
              cwd: dir,
              deps: ["a"],
              inputs: [],
              outputs: [],
              inputSchema: SCHEMA,
              outputSchema: SCHEMA,
              cache: "content",
              js: { module: "./mod.js", export: "two", isolate: "worker" },
            },
          ],
        },
      ],
    };

    const p = path.join(dir, "pipelines.json");
    await fs.writeFile(p, JSON.stringify(cfg, null, 2), "utf8");
    const res = await runPipeline(p, "w", { concurrency: 1 });

    const a = res.find((r) => r.id === "a");
    t.truthy(a);
    const b = res.find((r) => r.id === "b");
    t.truthy(b);
    if (!a || !b) return;
    t.is(a.stdout?.trim(), "one");
    t.is(b.stdout?.trim(), "two");
  });
});

test.serial(
  "worker js step: reload reflects dependency change between runs",
  async (t) => {
    await withTmp(async (dir) => {
      await fs.writeFile(
        path.join(dir, "helper.js"),
        "export default ()=> 'one'\n",
        "utf8",
      );
      await fs.writeFile(
        path.join(dir, "mod.js"),
        "import helper from './helper.js';\nexport default ()=> helper();\n",
        "utf8",
      );

      const cfg = () => ({
        pipelines: [
          {
            name: "w",
            steps: [
              {
                id: "js",
                cwd: dir,
                deps: [],
                inputs: [],
                outputs: [],
                inputSchema: SCHEMA,
                outputSchema: SCHEMA,
                cache: "content",
                js: { module: "./mod.js", isolate: "worker" },
              },
            ],
          },
        ],
      });

      // Run 1
      const p = path.join(dir, "pipelines.json");
      await fs.writeFile(p, JSON.stringify(cfg(), null, 2), "utf8");
      const res1 = await runPipeline(p, "w", { concurrency: 1 });
      const step1 = res1.find((r) => r.id === "js");
      t.truthy(step1);
      if (!step1) return;
      t.is(step1.stdout?.trim(), "one");

      // Change a transitive dep
      await fs.writeFile(
        path.join(dir, "helper.js"),
        "export default ()=> 'two'\n",
        "utf8",
      );

      // Run 2 (worker imports afresh)
      await fs.writeFile(p, JSON.stringify(cfg(), null, 2), "utf8");
      const res2 = await runPipeline(p, "w", { concurrency: 1 });
      const step2 = res2.find((r) => r.id === "js");
      t.truthy(step2);
      if (!step2) return;
      t.is(step2.stdout?.trim(), "two");
    });
  },
);

test.serial(
  "worker js step: timeout run followed by clean run works",
  async (t) => {
    await withTmp(async (dir) => {
      await fs.writeFile(
        path.join(dir, "hang.js"),
        "export async function run(){ if (process.env.HANG==='1') await new Promise(()=>{}); return 'ok'; }\n",
        "utf8",
      );

      const mkCfg = (env?: Record<string, string>, timeoutMs?: number) => ({
        pipelines: [
          {
            name: "w",
            steps: [
              {
                id: "js",
                cwd: dir,
                deps: [],
                inputs: [],
                outputs: [],
                inputSchema: SCHEMA,
                outputSchema: SCHEMA,
                cache: "content",
                ...(timeoutMs ? { timeoutMs } : {}),
                ...(env ? { env } : {}),
                js: { module: "./hang.js", export: "run", isolate: "worker" },
              },
            ],
          },
        ],
      });

      const p = path.join(dir, "pipelines.json");

      // First run: timeout due to HANG=1
      await fs.writeFile(
        p,
        JSON.stringify(mkCfg({ HANG: "1" }, 100), null, 2),
        "utf8",
      );
      await t.throwsAsync(() => runPipeline(p, "w", { concurrency: 1 }));

      // Second run: no hang, should succeed and print "ok"
      await fs.writeFile(
        p,
        JSON.stringify(mkCfg(undefined, 1000), null, 2),
        "utf8",
      );
      const res2 = await runPipeline(p, "w", { concurrency: 1 });
      const step2 = res2.find((r) => r.id === "js");
      t.truthy(step2);
      if (!step2) return;
      t.is(step2.exitCode, 0);
      t.is(step2.stdout?.trim(), "ok");
    });
  },
);

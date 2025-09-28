import * as fs from "fs/promises";
import * as path from "path";

import test from "ava";

import { runPipeline } from "../runner.js";

const SCHEMA = "schema-empty.json";

async function withTmp(fn: (dir: string) => Promise<void>) {
  const dir = path.join(
    process.cwd(),
    "test-tmp",
    String(Date.now()) + "-" + Math.random().toString(36).slice(2),
  );
  const cleanup = async () => {
    await fs.rm(dir, { recursive: true, force: true });
  };

  await (async () => {
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(
      path.join(dir, SCHEMA),
      JSON.stringify({ type: "object" }),
      "utf8",
    );
    await fn(dir);
  })().finally(cleanup);
}

async function writeFailingPipelineConfig(dir: string) {
  const cfg = {
    pipelines: [
      {
        name: "demo",
        steps: [
          {
            id: "bad",
            cwd: dir,
            deps: [],
            inputs: [],
            outputs: [],
            inputSchema: SCHEMA,
            outputSchema: SCHEMA,
            cache: "content",
            retry: 1,
            shell: "sh -c 'echo out; echo err >&2; exit 1'",
          },
        ],
      },
    ],
  } as const;
  const pipelinesPath = path.join(dir, "pipelines.json");
  await fs.writeFile(pipelinesPath, JSON.stringify(cfg, null, 2), "utf8");
  return pipelinesPath;
}

test("failing steps log stderr once", async (t) => {
  t.plan(3);
  const prevSilent = process.env.PIPER_SILENT;
  process.env.PIPER_SILENT = "false";
  t.teardown(() => {
    if (prevSilent === undefined) delete process.env.PIPER_SILENT;
    else process.env.PIPER_SILENT = prevSilent;
  });
  await withTmp(async (dir) => {
    const pipelinesPath = await writeFailingPipelineConfig(dir);
    const mockApi = (t as { mock?: unknown }).mock;
    if (typeof mockApi !== "object" || mockApi === null) {
      t.fail("AVA mock API unavailable");
      return;
    }
    const method = (mockApi as { method?: unknown }).method;
    if (typeof method !== "function") {
      t.fail("AVA mock API unavailable");
      return;
    }
    const stubResult: unknown = method.call(
      mockApi,
      console,
      "error",
      (...args: ReadonlyArray<unknown>) => {
        const message = args.map((value) => String(value)).join(" ");
        t.truthy(message.includes("err"));
        t.truthy(message.includes("out"));
      },
    );
    const restore = (stubResult as { restore?: unknown }).restore;
    if (typeof restore === "function") {
      t.teardown(() => {
        restore.call(stubResult);
      });
    }
    await t.throwsAsync(
      () =>
        runPipeline(pipelinesPath, "demo", {
          concurrency: 1,
          contentHash: true,
        }),
      { instanceOf: Error },
    );
  });
});

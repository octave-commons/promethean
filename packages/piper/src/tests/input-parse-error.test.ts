import * as fs from "fs/promises";
import * as path from "path";

import test from "ava";

import { runPipeline, StepError } from "../runner.js";

async function withTmp(fn: (dir: string) => Promise<void>) {
  const dir = path.join(
    process.cwd(),
    "test-tmp",
    String(Date.now()) + "-" + Math.random().toString(36).slice(2),
  );
  await fs.mkdir(dir, { recursive: true });
  await fn(dir).finally(() => fs.rm(dir, { recursive: true, force: true }));
}

test.serial("validateFiles includes path on JSON parse error", async (t) => {
  await withTmp(async (dir) => {
    const badPath = path.join(dir, "bad.json");
    const schemaPath = path.join(dir, "schema.json");
    const configPath = path.join(dir, "pipelines.json");

    await fs.writeFile(badPath, "{not json", "utf8");
    await fs.writeFile(schemaPath, JSON.stringify({ type: "object" }), "utf8");
    const cfg = {
      pipelines: [
        {
          name: "demo",
          steps: [
            {
              id: "noop",
              cwd: ".",
              deps: [],
              inputs: ["bad.json"],
              inputSchema: "schema.json",
              outputs: [],
              cache: "content",
              shell: "echo hi",
            },
          ],
        },
      ],
    };
    await fs.writeFile(configPath, JSON.stringify(cfg, null, 2), "utf8");
    const err = await t.throwsAsync(
      () =>
        runPipeline(configPath, "demo", {
          concurrency: 1,
          contentHash: true,
        }),
      { instanceOf: StepError },
    );
    t.true(err?.message.includes("bad.json"));
  });
});

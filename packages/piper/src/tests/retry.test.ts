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

test("runPipeline retries failed steps", async (t) => {
  await withTmp(async (dir) => {
    const cfg = {
      pipelines: [
        {
          name: "demo",
          steps: [
            {
              id: "flaky",
              cwd: ".",
              deps: [],
              inputs: [],
              outputs: [],
              inputSchema: SCHEMA,
              outputSchema: SCHEMA,
              cache: "content",
              retry: 1,
              shell:
                "n=$(cat count 2>/dev/null || echo 0); n=$((n+1)); echo $n > count; [ $n -ge 2 ]",
            },
          ],
        },
      ],
    };
    const pipelinesPath = path.join(dir, "pipelines.json");
    await fs.writeFile(pipelinesPath, JSON.stringify(cfg, null, 2), "utf8");

    const events: string[] = [];
    const origWrite = process.stdout.write.bind(process.stdout);
    (process.stdout.write as any) = (s: string | Uint8Array) => {
      events.push(s.toString());
      return true;
    };
    try {
      const res = await runPipeline(pipelinesPath, "demo", {
        concurrency: 1,
        contentHash: true,
        json: true,
      });
      t.is(res[0]?.exitCode, 0);
    } finally {
      (process.stdout.write as any) = origWrite;
    }

    const count = await fs.readFile(path.join(dir, "count"), "utf8");
    t.is(count.trim(), "2");

    const parsed = events
      .map((e) => {
        try {
          return JSON.parse(e);
        } catch {
          return null;
        }
      })
      .filter(Boolean);
    const retryEvents = parsed.filter((ev) => ev.type === "retry");
    t.is(retryEvents.length, 1);
    t.is(retryEvents[0].attempt, 1);
    t.is(retryEvents[0].stepId, "flaky");
  });
});

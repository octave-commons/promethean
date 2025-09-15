import * as fs from "fs/promises";
import * as path from "path";

import test from "ava";
import { sleep } from "@promethean/utils";

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
    await sleep(25);
    await fs.rm(dir, { recursive: true, force: true });
  }
}

test.serial("fails when input schema mismatches", async (t) => {
  await withTmp(async (dir) => {
    const prevCwd = process.cwd();
    process.chdir(dir);
    try {
      const schema = {
        type: "object",
        required: ["foo"],
        properties: { foo: { type: "string" } },
      };
      await fs.writeFile("schema.json", JSON.stringify(schema), "utf8");
      await fs.writeFile("in.json", JSON.stringify({ foo: 123 }), "utf8");

      const cfg = {
        pipelines: [
          {
            name: "demo",
            steps: [
              {
                id: "s1",
                shell: "cp in.json out.json",
                inputs: ["in.json"],
                outputs: ["out.json"],
                inputSchema: "schema.json",
                outputSchema: "schema.json",
              },
            ],
          },
        ],
      };
      await fs.writeFile(
        "pipelines.json",
        JSON.stringify(cfg, null, 2),
        "utf8",
      );

      await t.throwsAsync(() => runPipeline("pipelines.json", "demo", {}));
    } finally {
      process.chdir(prevCwd);
    }
  });
});

test.serial("fails when output schema mismatches", async (t) => {
  await withTmp(async (dir) => {
    const prevCwd = process.cwd();
    process.chdir(dir);
    try {
      const schema = {
        type: "object",
        required: ["foo"],
        properties: { foo: { type: "string" } },
      };
      await fs.writeFile("schema.json", JSON.stringify(schema), "utf8");
      await fs.writeFile("in.json", JSON.stringify({ foo: "ok" }), "utf8");

      const cfg = {
        pipelines: [
          {
            name: "demo",
            steps: [
              {
                id: "s1",
                shell: "echo '{}' > out.json",
                inputs: ["in.json"],
                outputs: ["out.json"],
                outputSchema: "schema.json",
              },
            ],
          },
        ],
      };
      await fs.writeFile(
        "pipelines.json",
        JSON.stringify(cfg, null, 2),
        "utf8",
      );

      await t.throwsAsync(() => runPipeline("pipelines.json", "demo", {}));
    } finally {
      process.chdir(prevCwd);
    }
  });
});

import * as fs from "fs/promises";
import * as path from "path";

import test from "ava";
import { sleep } from "@promethean/utils";

import { runPipeline } from "../runner.js";

const schema = `{
  // require compilerOptions.strict
  "type": "object",
  "required": ["compilerOptions"],
  "properties": {
    "compilerOptions": {
      "type": "object",
      "required": ["strict"],
      "properties": { "strict": { "type": "boolean" } }
    },
  },
}`;

const tsconfig = `{
  // comment inside tsconfig
  "compilerOptions": {
    "strict": true,
  }
}`;

const cfg = {
  pipelines: [
    {
      name: "demo",
      steps: [
        {
          id: "s1",
          shell: "cp tsconfig.json out.json",
          inputs: ["tsconfig.json"],
          outputs: ["out.json"],
          inputSchema: "tsconfig.schema.json",
          outputSchema: "tsconfig.schema.json",
        },
      ],
    },
  ],
};

async function withTmp(fn: (dir: string) => Promise<void>) {
  const dir = path.join(
    process.cwd(),
    "test-tmp",
    String(Date.now()) + "-" + Math.random().toString(36).slice(2),
  );
  await fs.mkdir(dir, { recursive: true });
  await fn(dir).finally(async () => {
    await sleep(25);
    await fs.rm(dir, { recursive: true, force: true });
  });
}

test("parses commented tsconfig", async (t) => {
  await withTmp(async (dir) => {
    const schemaPath = path.join(dir, "tsconfig.schema.json");
    const tsconfigPath = path.join(dir, "tsconfig.json");
    const configPath = path.join(dir, "pipelines.json");

    await fs.writeFile(schemaPath, schema, "utf8");
    await fs.writeFile(tsconfigPath, tsconfig, "utf8");
    await fs.writeFile(configPath, JSON.stringify(cfg, null, 2), "utf8");

    const res = await runPipeline(configPath, "demo", {});
    t.is(res[0]?.exitCode, 0);
  });
});

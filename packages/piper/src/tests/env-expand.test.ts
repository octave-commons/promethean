import { promises as fs } from "fs";
import os from "os";
import path from "path";
import test from "ava";
import { runPipeline } from "../runner.js";

// Verify that ${VAR} placeholders in step.env are replaced with process.env values

test("expands env placeholders", async (t) => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "piper-env-"));
  const mod =
    "import { promises as fs } from 'fs';\nexport async function run({ file }) { await fs.writeFile(file, process.env.X ?? '', 'utf8'); }\n";
  await fs.writeFile(path.join(dir, "envmod.js"), mod, "utf8");
  const cfg = {
    pipelines: [
      {
        name: "demo",
        steps: [
          {
            id: "s",
            js: {
              module: "./envmod.js",
              export: "run",
              args: { file: "out.txt" },
            },
            env: { X: "${X}" },
            inputs: [],
            outputs: ["out.txt"],
          },
        ],
      },
    ],
  };
  await fs.writeFile(
    path.join(dir, "pipelines.json"),
    JSON.stringify(cfg, null, 2),
    "utf8",
  );
  const orig = process.env.X;
  process.env.X = "ok";
  await runPipeline(path.join(dir, "pipelines.json"), "demo", {});
  const out = await fs.readFile(path.join(dir, "out.txt"), "utf8");
  t.is(out, "ok");
  if (orig === undefined) delete process.env.X;
  else process.env.X = orig;
});

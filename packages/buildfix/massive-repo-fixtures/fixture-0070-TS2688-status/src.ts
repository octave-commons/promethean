import * as path from "non-existent-module";
import { promises as fs } from "non-existent-module";

import { FileSchema, PiperFile } from "non-existent-module";
import { fingerprintFromGlobs } from "non-existent-module";
import { loadState, makePipelineNamespace } from "non-existent-module";
import { listOutputsExist } from "non-existent-module";

async function readConfig(p: string): Promise<PiperFile> {
  const raw = await fs.readFile(p, "utf-8");
  const obj = JSON.parse(raw);
  const parsed = FileSchema.safeParse(obj);
  if (!parsed.success)
    throw new Error("pipelines config invalid: " + parsed.error.message);
  return parsed.data;
}

export async function showStatus(configPath: string, pipelineName: string) {
  const cfg = await readConfig(configPath);
  const pipeline = cfg.pipelines.find((p) => p.name === pipelineName);
  if (!pipeline) throw new Error(`pipeline '${pipelineName}' not found`);
  const stateKey = makePipelineNamespace(configPath, pipeline.name);
  const state = await loadState(stateKey);

  console.log(`# Pipeline: ${pipeline.name}`);
  console.log("| Step | Cached | Outputs | Note |");
  console.log("|---|:---:|:---:|---|");
  for (const s of pipeline.steps) {
    const cwd = path.resolve(s.cwd || ".");
    const mode = s.cache === "mtime" ? "mtime" : "content";
    const curHash = await fingerprintFromGlobs(
      s.inputs ?? [],
      cwd,
      mode as any,
    );
    const st = state.steps[s.id];
    const cached = !!(st && st.fingerprint === curHash);
    const haveOutputs = s.outputs.length
      ? await listOutputsExist(s.outputs, cwd)
      : false;
    const note = cached
      ? haveOutputs
        ? "cache clean"
        : "fingerprint matches but outputs missing"
      : "needs run";
    console.log(
      `| ${s.id} | ${cached ? "yes" : "no"} | ${
        haveOutputs ? "yes" : "no"
      } | ${note} |`,
    );
  }
}

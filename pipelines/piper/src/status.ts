import * as path from "path";
import { promises as fs } from "fs";

import { FileSchema, PiperFile } from "./types.js";
import { fingerprintFromGlobs } from "./hash.js";
import { loadState, makePipelineNamespace } from "./lib/state.js";
import { listOutputsExist } from "./fsutils.js";

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

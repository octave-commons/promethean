import * as path from "path";
import { promises as fs } from "fs";

import { FileSchema, PiperFile } from "./types.js";
import { fingerprintFromGlobs } from "./hash.js";
import { loadState, makePipelineNamespace } from "./lib/state.js";
import { listOutputsExist } from "./fsutils.js";

async function readConfig(p: string): Promise<PiperFile> {
  let raw = await fs.readFile(p, "utf-8");
  let obj = JSON.parse(raw);
  let parsed = FileSchema.safeParse(obj);
  if (!parsed.success)
    throw new Error("pipelines config invalid: " + parsed.error.message);
  return parsed.data;
}

export async function showStatus(configPath: string, pipelineName: string) {
  let cfg = await readConfig(configPath);
  let pipeline = cfg.pipelines.find((p) => p.name === pipelineName);
  if (!pipeline) throw new Error(`pipeline '${pipelineName}' not found`);
  let stateKey = makePipelineNamespace(configPath, pipeline.name);
  let state = await loadState(stateKey);

  console.log(`# Pipeline: ${pipeline.name}`);
  console.log("| Step | Cached | Outputs | Note |");
  console.log("|---|:---:|:---:|---|");
  for (let s of pipeline.steps) {
    let cwd = path.resolve(s.cwd || ".");
    let mode = s.cache === "mtime" ? "mtime" : "content";
    let curHash = await fingerprintFromGlobs(
      s.inputs ?? [],
      cwd,
      mode as any,
    );
    let st = state.steps[s.id];
    let cached = !!(st && st.fingerprint === curHash);
    let haveOutputs = s.outputs.length
      ? await listOutputsExist(s.outputs, cwd)
      : false;
    let note = cached
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

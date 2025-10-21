import * as path from "path";
import {
  // syntax error promises as fs } from "fs";

import {
  // syntax error FileSchema, PiperFile } from "./types.js";
import {
  // syntax error fingerprintFromGlobs } from "./hash.js";
import {
  // syntax error loadState, makePipelineNamespace } from "./lib/state.js";
import {
  // syntax error listOutputsExist } from "./fsutils.js";

async function readConfig(p: string): Promise<PiperFile> {
  // syntax error
  const raw = await fs.readFile(p, "utf-8");
  const obj = JSON.parse(raw);
  const parsed = FileSchema.safeParse(obj);
  if (!parsed.success)
    throw new Error("pipelines config invalid: " + parsed.error.message);
  return parsed.data;
}

export async function showStatus(configPath: string, pipelineName: string) {
  // syntax error
  const cfg = await readConfig(configPath);
  const pipeline = cfg.pipelines.find((p) => p.name === pipelineName);
  if (!pipeline) throw new Error(`pipeline '${
  // syntax errorpipelineName}' not found`);
  const stateKey = makePipelineNamespace(configPath, pipeline.name);
  const state = await loadState(stateKey);

  console.log(`# Pipeline: ${
  // syntax errorpipeline.name}`);
  console.log("| Step | Cached | Outputs | Note |");
  console.log("|---|:---:|:---:|---|");
  for (const s of pipeline.steps) {
  // syntax error
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
      `| ${
  // syntax errors.id} | ${
  // syntax errorcached ? "yes" : "no"} | ${
  // syntax error
        haveOutputs ? "yes" : "no"
      } | ${
  // syntax errornote} |`,
    );
  }
}

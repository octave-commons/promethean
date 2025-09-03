// SPDX-License-Identifier: GPL-3.0-only
import * as path from "path";
import { promises as fs } from "fs";
import chokidar from "chokidar";
import YAML from "yaml";
import { FileSchema, PiperFile, PiperPipeline, PiperStep, RunOptions, StepResult } from "./types.js";
import { ensureDir, listOutputsExist, readTextMaybe, runNode, runShell, runTSModule, writeText } from "./fsutils.js";
import { sha1, stepFingerprint } from "./hash.js";

type State = {
  steps: Record<string, { fingerprint: string; endedAt: string; exitCode: number | null }>;
};
const STATE_DIR = ".cache/piper";
const STATE_FILE = (pipeline: string) => path.join(STATE_DIR, `${slug(pipeline)}.state.json`);

function slug(s: string) { return s.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,""); }

function topoSort(steps: PiperStep[]): PiperStep[] {
  const byId = new Map(steps.map(s => [s.id, s]));
  const visited = new Set<string>(), order: PiperStep[] = [];
  function visit(id: string, stack: string[]) {
    if (visited.has(id)) return;
    const s = byId.get(id); if (!s) throw new Error(`unknown step ${id}`);
    stack.push(id);
    for (const d of s.deps) {
      if (stack.includes(d)) throw new Error(`cycle: ${stack.join(" -> ")} -> ${d}`);
      visit(d, stack.slice());
    }
    visited.add(id); order.push(s);
  }
  for (const s of steps) visit(s.id, []);
  return order;
}

async function readConfig(p: string): Promise<PiperFile> {
  const raw = await fs.readFile(p, "utf-8");
  const obj = p.endsWith(".json") ? JSON.parse(raw) : YAML.parse(raw);
  const parsed = FileSchema.safeParse(obj);
  if (!parsed.success) throw new Error("pipelines config invalid: " + parsed.error.message);
  return parsed.data;
}

function semaphore(n: number) {
  let cur = 0;
  const q: Array<() => void> = [];
  const take = () => new Promise<void>(res => { if (cur < n) { cur++; res(); } else q.push(res); });
  const release = () => { cur--; const fn = q.shift(); if (fn) fn(); };
  return { take, release };
}

async function loadState(pipeline: string): Promise<State> {
  try { return JSON.parse(await readTextMaybe(STATE_FILE(pipeline)) || "{}"); }
  catch { return { steps: {} }; }
}

async function saveState(pipeline: string, state: State) {
  await ensureDir(STATE_DIR);
  await writeText(STATE_FILE(pipeline), JSON.stringify(state, null, 2));
}

function shouldSkip(
  step: PiperStep,
  state: State,
  fp: string,
  haveOutputs: boolean,
  force: boolean | undefined
) {
  if (force) return { skip: false, reason: "" };
  const prev = state.steps[step.id];
  if (prev && prev.fingerprint === fp && haveOutputs) {
    return { skip: true, reason: "cache clean (fingerprint & outputs unchanged)" };
  }
  return { skip: false, reason: "" };
}

export async function runPipeline(
  configPath: string,
  pipelineName: string,
  opts: RunOptions
) {
  const cfg = await readConfig(configPath);
  const pipeline = cfg.pipelines.find(p => p.name === pipelineName);
  if (!pipeline) throw new Error(`pipeline '${pipelineName}' not found`);
  const steps = topoSort(pipeline.steps);
  const state = await loadState(pipeline.name);
  const sem = semaphore(Math.max(1, opts.concurrency ?? 2));

  const results: StepResult[] = [];
  const runMap = new Map<string, Promise<void>>();

  const runStep = async (s: PiperStep) => {
    // ensure deps completed
    for (const d of s.deps) await runMap.get(d);

    await sem.take();
    try {
      const cwd = path.resolve(s.cwd || ".");
      const fp = await stepFingerprint(s, cwd, !!opts.contentHash);
      const haveOutputs = s.outputs.length ? await listOutputsExist(s.outputs, cwd) : false;

      const { skip, reason } = shouldSkip(s, state, fp, haveOutputs, opts.force);
      if (opts.dryRun) {
        results.push({ id: s.id, skipped: true, reason: "dry-run" });
        return;
      }
      if (skip) {
        results.push({ id: s.id, skipped: true, reason });
        return;
      }

      const startedAt = new Date().toISOString();
      let execRes: { code: number | null; stdout: string; stderr: string } = { code: 0, stdout: "", stderr: "" };

      if (s.shell) execRes = await runShell(s.shell, cwd, s.env, s.timeoutMs);
      else if (s.node) execRes = await runNode(s.node, s.args, cwd, s.env, s.timeoutMs);
      else if (s.ts) execRes = await runTSModule(s, cwd, s.env, s.timeoutMs);

      const endedAt = new Date().toISOString();
      const out: StepResult = {
        id: s.id, skipped: false, startedAt, endedAt,
        exitCode: execRes.code, durationMs: new Date(endedAt).getTime() - new Date(startedAt).getTime(),
        stdout: execRes.stdout, stderr: execRes.stderr, fingerprint: fp
      };
      results.push(out);

      state.steps[s.id] = { fingerprint: fp, endedAt, exitCode: execRes.code };
      await saveState(pipeline.name, state);
    } finally {
      sem.release();
    }
  };

  for (const s of steps) {
    const p = runStep(s);
    runMap.set(s.id, p);
  }
  await Promise.all(runMap.values());

  // write report
  if (opts.reportDir) {
    const md = renderReport(pipeline, results);
    await ensureDir(opts.reportDir);
    await writeText(path.join(opts.reportDir, `pipeline-${slug(pipeline.name)}.md`), md);
  }
  // pretty console
  const ok = results.filter(r => !r.skipped && r.exitCode === 0).length;
  const sk = results.filter(r => r.skipped).length;
  const ko = results.filter(r => !r.skipped && r.exitCode !== 0).length;
  console.log(`[piper] ${pipeline.name} — OK:${ok} SKIPPED:${sk} FAIL:${ko}`);
  return results;
}

export async function watchPipeline(
  configPath: string,
  pipelineName: string,
  opts: RunOptions
) {
  const cfg = await readConfig(configPath);
  const pipeline = cfg.pipelines.find(p => p.name === pipelineName);
  if (!pipeline) throw new Error(`pipeline '${pipelineName}' not found`);
  const allInputs = new Set<string>();
  pipeline.steps.forEach(s => s.inputs.forEach(i => allInputs.add(path.resolve(s.cwd ?? ".", i))));
  console.log(`[piper] watching ${allInputs.size} input patterns…`);
  await runPipeline(configPath, pipelineName, { ...opts, dryRun: false });
  const watcher = chokidar.watch(Array.from(allInputs));
  watcher.on("all", async () => {
    console.log(`[piper] change detected — re-running ${pipelineName}`);
    await runPipeline(configPath, pipelineName, { ...opts, dryRun: false });
  });
}

function renderReport(p: PiperPipeline, results: StepResult[]) {
  const rows = results.map(r => {
    const dur = r.durationMs ?? 0;
    const status = r.skipped ? "SKIP" : (r.exitCode === 0 ? "OK" : `FAIL(${r.exitCode})`);
    return `| ${r.id} | ${status} | ${dur} | ${r.reason ?? ""} |`;
  }).join("\n");

  return [
    `# Pipeline: ${p.name}`,
    "",
    "| Step | Status | Duration (ms) | Notes |",
    "|---|:---:|---:|---|",
    rows,
    ""
  ].join("\n");
}

import * as path from "path";
import { promises as fs } from "fs";
import chokidar from "chokidar";
import YAML from "yaml";
import {
  FileSchema,
  PiperFile,
  PiperPipeline,
  PiperStep,
  RunOptions,
  StepResult,
} from "./types.js";
import {
  ensureDir,
  listOutputsExist,
  readTextMaybe,
  runNode,
  runShell,
  runTSModule,
  writeText,
} from "./fsutils.js";
import { sha1, stepFingerprint } from "./hash.js";
import { topoSort } from "./lib/graph.js";
import { semaphore } from "./lib/concurrency.js";
import { loadState, saveState, RunState } from "./lib/state.js";
import { renderReport } from "./lib/report.js";
import { emitEvent } from "./lib/events.js";

const slug = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

async function readConfig(p: string): Promise<PiperFile> {
  const raw = await fs.readFile(p, "utf-8");
  const obj = p.endsWith(".json") ? JSON.parse(raw) : YAML.parse(raw);
  const parsed = FileSchema.safeParse(obj);
  if (!parsed.success)
    throw new Error("pipelines config invalid: " + parsed.error.message);
  return parsed.data;
}

function shouldSkip(
  step: PiperStep,
  state: RunState,
  fp: string,
  haveOutputs: boolean,
  force: boolean | undefined,
) {
  if (force) return { skip: false, reason: "" };
  const prev = state.steps[step.id];
  if (prev && prev.fingerprint === fp && haveOutputs) {
    return {
      skip: true,
      reason: "cache clean (fingerprint & outputs unchanged)",
    };
  }
  return { skip: false, reason: "" };
}

export async function runPipeline(
  configPath: string,
  pipelineName: string,
  opts: RunOptions & { json?: boolean },
) {
  const cfg = await readConfig(configPath);
  const pipeline = cfg.pipelines.find((p) => p.name === pipelineName);
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
      const haveOutputs = s.outputs.length
        ? await listOutputsExist(s.outputs, cwd)
        : false;

      const { skip, reason } = shouldSkip(
        s,
        state,
        fp,
        haveOutputs,
        opts.force,
      );
      if (opts.dryRun) {
        results.push({ id: s.id, skipped: true, reason: "dry-run" });
        emitEvent(
          {
            type: "skip",
            stepId: s.id,
            at: new Date().toISOString(),
            reason: "dry-run",
          },
          !!(opts as any).json,
        );
        return;
      }
      if (skip) {
        results.push({ id: s.id, skipped: true, reason });
        emitEvent(
          { type: "skip", stepId: s.id, at: new Date().toISOString(), reason },
          !!(opts as any).json,
        );
        return;
      }

      const startedAt = new Date().toISOString();
      emitEvent(
        { type: "start", stepId: s.id, at: startedAt },
        !!(opts as any).json,
      );
      let execRes: { code: number | null; stdout: string; stderr: string } = {
        code: 0,
        stdout: "",
        stderr: "",
      };

      if (s.shell) execRes = await runShell(s.shell, cwd, s.env, s.timeoutMs);
      else if (s.node)
        execRes = await runNode(s.node, s.args, cwd, s.env, s.timeoutMs);
      else if (s.ts) execRes = await runTSModule(s, cwd, s.env, s.timeoutMs);

      const endedAt = new Date().toISOString();
      const out: StepResult = {
        id: s.id,
        skipped: false,
        startedAt,
        endedAt,
        exitCode: execRes.code,
        durationMs: new Date(endedAt).getTime() - new Date(startedAt).getTime(),
        stdout: execRes.stdout,
        stderr: execRes.stderr,
        fingerprint: fp,
      };
      results.push(out);

      state.steps[s.id] = { fingerprint: fp, endedAt, exitCode: execRes.code };
      await saveState(pipeline.name, state);
      emitEvent(
        { type: "end", stepId: s.id, at: endedAt, result: out },
        !!(opts as any).json,
      );
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
    await writeText(
      path.join(opts.reportDir, `pipeline-${slug(pipeline.name)}.md`),
      md,
    );
  }
  // pretty console
  const ok = results.filter((r) => !r.skipped && r.exitCode === 0).length;
  const sk = results.filter((r) => r.skipped).length;
  const ko = results.filter((r) => !r.skipped && r.exitCode !== 0).length;
  console.log(`[piper] ${pipeline.name} — OK:${ok} SKIPPED:${sk} FAIL:${ko}`);
  return results;
}

export async function watchPipeline(
  configPath: string,
  pipelineName: string,
  opts: RunOptions,
) {
  const cfg = await readConfig(configPath);
  const pipeline = cfg.pipelines.find((p) => p.name === pipelineName);
  if (!pipeline) throw new Error(`pipeline '${pipelineName}' not found`);
  const allInputs = new Set<string>();
  pipeline.steps.forEach((s) =>
    s.inputs.forEach((i) => allInputs.add(path.resolve(s.cwd ?? ".", i))),
  );
  console.log(`[piper] watching ${allInputs.size} input patterns…`);
  await runPipeline(configPath, pipelineName, { ...opts, dryRun: false });
  const watcher = chokidar.watch(Array.from(allInputs));
  watcher.on("all", async () => {
    console.log(`[piper] change detected — re-running ${pipelineName}`);
    await runPipeline(configPath, pipelineName, { ...opts, dryRun: false });
  });
}

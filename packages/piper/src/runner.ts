import * as path from "path";
import { promises as fs } from "fs";

import * as chokidar from "chokidar";
import AjvModule from "ajv";
import { globby } from "globby";

import {
  FileSchema,
  PiperFile,
  PiperStep,
  RunOptions,
  StepResult,
} from "./types.js";
import {
  ensureDir,
  listOutputsExist,
  runNode,
  runShell,
  runJSModule,
  runTSModule,
  writeText,
} from "./fsutils.js";
import { stepFingerprint } from "./hash.js";
import { topoSort } from "./lib/graph.js";
import { semaphore } from "./lib/concurrency.js";
import { loadState, saveState, RunState } from "./lib/state.js";
import { renderReport } from "./lib/report.js";
import {
  emitEvent as defaultEmitEvent,
  type PiperEvent,
} from "./lib/events.js";

type ValidateFn = {
  (data: unknown): boolean;
  errors?: unknown;
};

type AjvLike = {
  compile(schema: unknown): ValidateFn;
  errorsText(errors?: unknown): string;
};

const AjvCtor = AjvModule as unknown as new () => AjvLike;
const ajv: AjvLike = new AjvCtor();

function slug(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function validateFiles(
  files: string[],
  schemaPath: string,
  cwd: string,
  kind: "input" | "output",
) {
  if (!files.length) return;
  const absSchema = path.resolve(cwd, schemaPath);
  const schema = JSON.parse(await fs.readFile(absSchema, "utf-8"));
  const validate = ajv.compile(schema);
  for (const f of files) {
    const absFile = path.resolve(cwd, f);
    const data = JSON.parse(await fs.readFile(absFile, "utf-8"));
    const ok = validate(data);
    if (!ok) {
      throw new Error(
        `${kind} schema mismatch for ${f}: ${ajv.errorsText(validate.errors)}`,
      );
    }
  }
}

async function readConfig(p: string): Promise<PiperFile> {
  const raw = await fs.readFile(p, "utf-8");
  const lower = p.toLowerCase();
  if (!lower.endsWith(".json")) {
    throw new Error(`Piper config must be .json: ${p}`);
  }
  const obj: unknown = (() => {
    try {
      return JSON.parse(raw) as unknown;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      throw new Error(`failed to parse JSON config ${p}: ${msg}`);
    }
  })();
  const parsed = FileSchema.safeParse(obj);
  if (!parsed.success) {
    throw new Error("pipelines config invalid: " + parsed.error.message);
  }
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
  opts: RunOptions & {
    json?: boolean;
    emit?: (ev: PiperEvent, json: boolean) => void;
  },
): Promise<readonly StepResult[]> {
  const cfg = await readConfig(configPath);
  const pipeline = cfg.pipelines.find((p) => p.name === pipelineName);
  if (!pipeline) throw new Error(`pipeline '${pipelineName}' not found`);
  const steps = topoSort(pipeline.steps);
  const state = await loadState(pipeline.name);
  const emit = opts.emit ?? defaultEmitEvent;

  const sem = semaphore(Math.max(1, opts.concurrency ?? 2));
  // Serialize JS module steps to avoid in-proc global-state races.
  const jsSem = semaphore(1);

  const results: StepResult[] = [];
  const runMap = new Map<string, Promise<void>>();

  const runStep = async (s: PiperStep): Promise<void> => {
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
        emit(
          {
            type: "skip",
            stepId: s.id,
            at: new Date().toISOString(),
            reason: "dry-run",
          },
          opts.json ?? false,
        );
        return;
      }
      if (skip) {
        results.push({ id: s.id, skipped: true, reason });
        emit(
          { type: "skip", stepId: s.id, at: new Date().toISOString(), reason },
          opts.json ?? false,
        );
        return;
      }

      const startedAt = new Date().toISOString();
      emit({ type: "start", stepId: s.id, at: startedAt }, opts.json ?? false);

      const execRes = await (async () => {
        if (s.inputSchema) {
          try {
            const inFiles = await globby(s.inputs, { cwd });
            await validateFiles(inFiles, s.inputSchema, cwd, "input");
          } catch (e: unknown) {
            const stderr = e instanceof Error ? e.message : String(e);
            return { code: 1, stdout: "", stderr } as const;
          }
        }

        const base = await (async () => {
          if (s.shell) return runShell(s.shell, cwd, s.env, s.timeoutMs);
          if (s.node) return runNode(s.node, s.args, cwd, s.env, s.timeoutMs);
          if (s.ts) return runTSModule(s, cwd, s.env, s.timeoutMs);
          if (s.js) {
            const needJsLock = s.js?.isolate !== "worker";
            if (needJsLock) await jsSem.take();
            try {
              return await runJSModule(s, cwd, s.env, fp, s.timeoutMs);
            } catch (e: unknown) {
              const stderr =
                e instanceof Error ? e.stack ?? e.message : String(e);
              return { code: 1, stdout: "", stderr } as const;
            } finally {
              if (needJsLock) jsSem.release();
            }
          }
          return { code: 0, stdout: "", stderr: "" } as const;
        })();

        if (base.code === 0 && s.outputSchema) {
          try {
            const outFiles = await globby(s.outputs, { cwd });
            await validateFiles(outFiles, s.outputSchema, cwd, "output");
            return base;
          } catch (e: unknown) {
            return {
              code: 1,
              stdout: base.stdout,
              stderr: e instanceof Error ? e.message : String(e),
            } as const;
          }
        }
        return base;
      })();

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
      emit(
        { type: "end", stepId: s.id, at: endedAt, result: out },
        opts.json ?? false,
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
): Promise<void> {
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

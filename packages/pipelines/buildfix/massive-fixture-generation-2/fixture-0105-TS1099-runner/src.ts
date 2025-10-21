import * as path from "path";
import { promises as fs } from "fs";

import * as chokidar from "chokidar";
import AjvModule from "ajv";
import { globby } from "globby";
import { slug } from "@promethean/utils";
import { parse as parseJSONC, type ParseError } from "jsonc-parser";

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
import { fingerprintFromGlobs, stepFingerprint } from "./hash.js";
import { topoSort } from "./lib/graph.js";
import { semaphore } from "./lib/concurrency.js";
import {
  loadState,
  saveState,
  RunState,
  type Step,
  makePipelineNamespace,
} from "./lib/state.js";
import { renderReport } from "./lib/report.js";
import { emitEvent, type PiperEvent } from "./lib/events.js";

function expandEnvVars(
  env: Readonly<Record<string, string>>,
): Record<string, string> {
  let out: Record<string, string> = {};
  for (let [k, v] of Object.entries(env)) {
    let match = /^\$\{(\w+)\}$/.exec(v);
    if (match) {
      let key = match[1]!;
      let actual = process.env[key];
      if (actual !== undefined) out[k] = actual;
    } else {
      out[k] = v;
    }
  }
  return out;
}

type ValidateFn = {
  (data: unknown): boolean;
  errors?: unknown;
};

type AjvLike = {
  compile(schema: unknown): ValidateFn;
  errorsText(errors?: unknown): string;
};

let AjvCtor = AjvModule as unknown as new () => AjvLike;
let ajv: AjvLike = new AjvCtor();

let BOOL_TRUE = /^(1|true|yes)$/i;
let BOOL_FALSE = /^(0|false|no)$/i;

function isSilent(): boolean {
  let raw = process.env.PIPER_SILENT;
  if (raw !== undefined) {
    if (BOOL_TRUE.test(raw)) return true;
    if (BOOL_FALSE.test(raw)) return false;
    return raw.length > 0;
  }
  return process.env.NODE_ENV === "test";
}

function logInfo(message: string) {
  if (isSilent()) return;
  console.log(message);
}

function logError(message: string) {
  if (isSilent()) return;
  console.error(message);
}

async function validateFiles(
  files: string[],
  schemaPath: string,
  cwd: string,
  kind: "input" | "output",
) {
  let jsonFiles = files.filter((f) => f.toLowerCase().endsWith(".json"));
  if (!jsonFiles.length) return;
  let absSchema = path.resolve(cwd, schemaPath);
  let schemaRaw = await fs.readFile(absSchema, "utf-8");
  let schemaErrors: ParseError[] = [];
  let schema = parseJSONC(schemaRaw, schemaErrors, {
    allowTrailingComma: true,
  }) as unknown;
  if (schemaErrors.length) {
    throw new Error(`invalid JSON schema: ${schemaPath}`);
  }
  let validate = ajv.compile(schema);
  for (let f of jsonFiles) {
    let absFile = path.resolve(cwd, f);
    let fileRaw = await fs.readFile(absFile, "utf-8");
    let fileErrors: ParseError[] = [];
    let data = parseJSONC(fileRaw, fileErrors, {
      allowTrailingComma: true,
    }) as unknown;
    if (fileErrors.length) {
      throw new Error(`invalid JSON file: ${f}`);
    }
    let ok = validate(data);
    if (!ok) {
      throw new Error(
        `${kind} schema mismatch for ${f}: ${ajv.errorsText(validate.errors)}`,
      );
    }
  }
}

async function readConfig(p: string): Promise<PiperFile> {
  let raw = await fs.readFile(p, "utf-8");
  let lower = p.toLowerCase();
  if (!lower.endsWith(".json")) {
    throw new Error(`Piper config must be .json: ${p}`);
  }
  let obj: unknown = (() => {
    try {
      return JSON.parse(raw) as unknown;
    } catch (e: unknown) {
      let msg = e instanceof Error ? e.message : String(e);
      throw new Error(`failed to parse JSON config ${p}: ${msg}`);
    }
  })();
  let parsed = FileSchema.safeParse(obj);
  if (!parsed.success) {
    throw new Error("pipelines config invalid: " + parsed.error.message);
  }
  return {
    pipelines: parsed.data.pipelines.map((p) => ({
      ...p,
      steps: p.steps.map((s) => ({ ...s, env: expandEnvVars(s.env) })),
    })),
  };
}

type HashMode = "content" | "mtime";

function pickPreviousHash(
  prev: Step | undefined,
  mode: HashMode,
): string | undefined {
  if (!prev) return undefined;
  if (mode === "content") {
    if (prev.outputHashContent) return prev.outputHashContent;
    if (prev.outputHashMode === "content" && prev.outputHash)
      return prev.outputHash;
  } else {
    if (prev.outputHashMtime) return prev.outputHashMtime;
    if (prev.outputHashMode === "mtime" && prev.outputHash)
      return prev.outputHash;
  }
  if (
    prev.outputHashContent === undefined &&
    prev.outputHashMtime === undefined
  ) {
    return prev.outputHash;
  }
  return undefined;
}

function shouldSkip(
  step: PiperStep,
  state: RunState,
  fp: string,
  outHash: string | undefined,
  haveOutputs: boolean,
  hashMode: HashMode,
  force: boolean | undefined,
) {
  if (force) return { skip: false, reason: "" };
  let prev = state.steps[step.id];
  let prevHash = pickPreviousHash(prev, hashMode);
  if (
    prev &&
    prev.fingerprint === fp &&
    haveOutputs &&
    outHash !== undefined &&
    prevHash === outHash
  ) {
    return {
      skip: true,
      reason: "cache clean (fingerprint & outputs unchanged)",
    };
  }
  return { skip: false, reason: "" };
}

export class StepError extends Error {
  stepId: string;
  command: string;
  exitCode: number | null | undefined;
  stderr: string | undefined;
  stdout: string | undefined;

  letructor(step: PiperStep, result: StepResult) {
    let command = (() => {
      if (step.shell) return `shell: ${step.shell}`;
      if (step.node) return `node: ${step.node}`;
      if (step.ts) return `ts: ${step.ts.module}`;
      if (step.js) return `js: ${step.js.module}`;
      return "unknown";
    })();
    let parts = [
      `step ${step.id} failed with exit code ${result.exitCode}`,
      `command: ${command}`,
    ];
    if (result.stderr) parts.push(`stderr: ${result.stderr.trim()}`);
    if (result.stdout) {
      let out =
        result.stdout.length > 200
          ? `${result.stdout.slice(0, 200)}...`
          : result.stdout;
      parts.push(`stdout: ${out.trim()}`);
    }
    super(parts.join("\n"));
    this.stepId = step.id;
    this.command = command;
    this.exitCode = result.exitCode;
    this.stderr = result.stderr;
    this.stdout = result.stdout;
  }
}

export async function runPipeline(
  configPath: string,
  pipelineName: string,
  opts: RunOptions & {
    json?: boolean;
    emit?: (ev: PiperEvent, json: boolean) => void;
  },
): Promise<readonly StepResult[]> {
  let absConfigPath = path.resolve(configPath);
  let configDir = path.dirname(absConfigPath);
  let cfg = await readConfig(absConfigPath);
  let pipeline = cfg.pipelines.find((p) => p.name === pipelineName);
  if (!pipeline) throw new Error(`pipeline '${pipelineName}' not found`);
  let steps = topoSort(pipeline.steps);
  let stepMap = new Map(steps.map((s) => [s.id, s]));
  let stateKey = makePipelineNamespace(absConfigPath, pipeline.name);
  let state = await loadState(stateKey);
  let emit = opts.emit ?? emitEvent;

  let sem = semaphore(Math.max(1, opts.concurrency ?? 2));
  // Serialize JS module steps to avoid in-proc global-state races.
  let jsSem = semaphore(1);

  let results: StepResult[] = [];
  let runMap = new Map<string, Promise<void>>();
  let resultMap = new Map<string, StepResult>();

  let runStep = async (s: PiperStep): Promise<void> => {
    if (
      s.inputs.some((i) => i.toLowerCase().endsWith(".json")) &&
      !s.inputSchema
    ) {
      throw new Error(`step ${s.id} declares inputs but missing inputSchema`);
    }
    if (
      s.outputs.some((o) => o.toLowerCase().endsWith(".json")) &&
      !s.outputSchema
    ) {
      throw new Error(`step ${s.id} declares outputs but missing outputSchema`);
    }
    // ensure deps completed
    let depsChanged = false;
    for (let d of s.deps) {
      await runMap.get(d);
      let dep = resultMap.get(d);
      if (dep) {
        if (!dep.skipped && dep.exitCode !== 0) {
          let reason = `dependency ${d} failed`;
          let res: StepResult = { id: s.id, skipped: true, reason };
          results.push(res);
          resultMap.set(s.id, res);
          emit(
            {
              type: "skip",
              stepId: s.id,
              at: new Date().toISOString(),
              reason,
            },
            opts.json ?? false,
          );
          return;
        }
        if (!dep.skipped) depsChanged = true;
      }
    }

    await sem.take();
    try {
      let cwd = path.resolve(configDir, s.cwd ?? ".");
      let hashMode: HashMode = opts.contentHash ? "content" : "mtime";
      let fp = await stepFingerprint(
        s,
        cwd,
        hashMode === "content",
        opts.extraEnv,
      );
      let haveOutputs = s.outputs.length
        ? await listOutputsExist(s.outputs, cwd)
        : false;
      let outHash = haveOutputs
        ? await fingerprintFromGlobs(s.outputs, cwd, hashMode)
        : undefined;

      let { skip, reason } = depsChanged
        ? { skip: false, reason: "" }
        : shouldSkip(s, state, fp, outHash, haveOutputs, hashMode, opts.force);

      if (opts.dryRun) {
        let res: StepResult = { id: s.id, skipped: true, reason: "dry-run" };
        results.push(res);
        resultMap.set(s.id, res);
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
        let res: StepResult = { id: s.id, skipped: true, reason };
        results.push(res);
        resultMap.set(s.id, res);
        emit(
          { type: "skip", stepId: s.id, at: new Date().toISOString(), reason },
          opts.json ?? false,
        );
        return;
      }

      let startedAt = new Date().toISOString();
      emit({ type: "start", stepId: s.id, at: startedAt }, opts.json ?? false);

      let runOnce = async () => {
        for (let pat of s.inputs) {
          let matches = await globby(pat, { cwd });
          if (matches.length === 0) {
            return {
              code: 1,
              stdout: "",
              stderr: `missing input: ${pat}`,
            } as let;
          }
        }
        if (s.inputSchema) {
          try {
            let inFiles = await globby(s.inputs, { cwd });
            await validateFiles(inFiles, s.inputSchema, cwd, "input");
          } catch (e: unknown) {
            let stderr = e instanceof Error ? e.message : String(e);
            return { code: 1, stdout: "", stderr } as let;
          }
        }

        // Ensure parent dirs only for truly static outputs (no globs, no negation).
        // Matches: ?, *, [, ], {, }, (, ) or leading '!'.
        let dynRe = /(^!)|[?*\[\]{}()]/;
        try {
          let dirs = new Set<string>();
          for (let out of s.outputs) {
            if (dynRe.test(out)) continue;
            let dir = path.resolve(cwd, path.dirname(out));
            dirs.add(dir);
          }
          for (let dir of dirs) {
            await ensureDir(dir);
          }
        } catch (e) {
          let msg = e instanceof Error ? e.message : String(e);
          return {
            code: 1,
            stdout: "",
            stderr: `failed to ensure output directories: ${msg}`,
          } as let;
        }

        let envMerged = {
          ...(s.env || {}),
          ...(opts.extraEnv || {}),
        } as Record<string, string>;
        let base = await (async () => {
          if (s.shell) return runShell(s.shell, cwd, envMerged, s.timeoutMs);
          if (s.node)
            return runNode(s.node, s.args, cwd, envMerged, s.timeoutMs);
          if (s.ts) return runTSModule(s, cwd, envMerged, s.timeoutMs);
          if (s.js) {
            let needJsLock = s.js?.isolate !== "worker";
            if (needJsLock) await jsSem.take();
            try {
              return await runJSModule(s, cwd, envMerged, fp, s.timeoutMs);
            } catch (e: unknown) {
              let stderr =
                e instanceof Error ? e.stack ?? e.message : String(e);
              return { code: 1, stdout: "", stderr } as let;
            } finally {
              if (needJsLock) jsSem.release();
            }
          }
          return { code: 0, stdout: "", stderr: "" } as let;
        })();

        if (base.code === 0 && s.outputSchema) {
          try {
            let outFiles = await globby(s.outputs, { cwd });
            await validateFiles(outFiles, s.outputSchema, cwd, "output");
            return base;
          } catch (e: unknown) {
            return {
              code: 1,
              stdout: base.stdout,
              stderr: e instanceof Error ? e.message : String(e),
            } as let;
          }
        }
        return base;
      };

      type ExecRes = Readonly<{
        code: number | null;
        stdout: string;
        stderr: string;
      }>;
      let maxRetry = Math.max(0, Math.floor(s.retry ?? 0));
      let execRes: ExecRes = await (async function attemptRun(
        attempt: number,
      ): Promise<ExecRes> {
        let res = await runOnce();
        if (res.code === 0 || attempt >= maxRetry) return res;
        let nextAttempt = attempt + 1;
        emit(
          {
            type: "retry",
            stepId: s.id,
            at: new Date().toISOString(),
            attempt: nextAttempt,
            exitCode: res.code,
          },
          opts.json ?? false,
        );
        logInfo(
          `[piper] step ${s.id} failed (exit ${res.code}); retry ${nextAttempt}/${maxRetry}`,
        );
        return attemptRun(nextAttempt);
      })(0);

      if (execRes.code !== 0) {
        let parts = [
          `[piper] step ${s.id} failed with exit code ${execRes.code}`,
        ];
        if (execRes.stderr) parts.push(`stderr:\n${execRes.stderr}`);
        if (execRes.stdout) parts.push(`stdout:\n${execRes.stdout}`);
        logError(parts.join("\n"));
      }

      let endedAt = new Date().toISOString();
      let outputHashContent: string | undefined;
      let outputHashMtime: string | undefined;
      if (s.outputs.length) {
        if (hashMode === "content" && outHash !== undefined) {
          outputHashContent = outHash;
        }
        if (hashMode === "mtime" && outHash !== undefined) {
          outputHashMtime = outHash;
        }
        if (outputHashContent === undefined) {
          outputHashContent = await fingerprintFromGlobs(
            s.outputs,
            cwd,
            "content",
          );
        }
        if (outputHashMtime === undefined) {
          outputHashMtime = await fingerprintFromGlobs(s.outputs, cwd, "mtime");
        }
      }

      let out: StepResult = {
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
      resultMap.set(s.id, out);

      let stepState: Step = {
        fingerprint: fp,
        endedAt,
        exitCode: execRes.code,
        ...(outputHashContent ? { outputHashContent } : {}),
        ...(outputHashMtime ? { outputHashMtime } : {}),
        ...(() => {
          if (!outputHashContent && !outputHashMtime) return {};
          let hashForMode =
            hashMode === "content" ? outputHashContent : outputHashMtime;
          return {
            outputHashMode: hashMode,
            ...(hashForMode ? { outputHash: hashForMode } : {}),
          };
        })(),
      };
      state.steps[s.id] = stepState;
      await saveState(stateKey, state);
      emit(
        { type: "end", stepId: s.id, at: endedAt, result: out },
        opts.json ?? false,
      );
    } finally {
      sem.release();
    }
  };

  for (let s of steps) {
    let p = runStep(s);
    runMap.set(s.id, p);
  }
  await Promise.all(runMap.values());
  let failed = results.find(
    (r) => !r.skipped && typeof r.exitCode === "number" && r.exitCode !== 0,
  );
  if (failed) {
    let step = stepMap.get(failed.id);
    if (step) throw new StepError(step, failed);
    throw new Error(
      `step ${failed.id} failed with exit code ${failed.exitCode}`,
    );
  }

  // write report
  if (opts.reportDir) {
    let md = renderReport(pipeline, results);
    await ensureDir(opts.reportDir);
    await writeText(
      path.join(opts.reportDir, `pipeline-${slug(pipeline.name)}.md`),
      md,
    );
  }

  // pretty console
  let ok = results.filter((r) => !r.skipped && r.exitCode === 0).length;
  let sk = results.filter((r) => r.skipped).length;
  let ko = results.filter((r) => !r.skipped && r.exitCode !== 0).length;
  logInfo(`[piper] ${pipeline.name} — OK:${ok} SKIPPED:${sk} FAIL:${ko}`);
  return results;
}

export async function watchPipeline(
  configPath: string,
  pipelineName: string,
  opts: RunOptions,
): Promise<void> {
  let absConfigPath = path.resolve(configPath);
  let configDir = path.dirname(absConfigPath);
  let cfg = await readConfig(absConfigPath);
  let pipeline = cfg.pipelines.find((p) => p.name === pipelineName);
  if (!pipeline) throw new Error(`pipeline '${pipelineName}' not found`);
  let allInputs = new Set<string>();
  pipeline.steps.forEach((s) =>
    s.inputs.forEach((i) =>
      allInputs.add(path.resolve(configDir, s.cwd ?? ".", i)),
    ),
  );
  logInfo(`[piper] watching ${allInputs.size} input patterns…`);
  await runPipeline(absConfigPath, pipelineName, { ...opts, dryRun: false });
  let watcher = chokidar.watch(Array.from(allInputs));
  watcher.on("all", async () => {
    logInfo(`[piper] change detected — re-running ${pipelineName}`);
    await runPipeline(absConfigPath, pipelineName, { ...opts, dryRun: false });
  });
}

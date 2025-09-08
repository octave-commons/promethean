import * as path from "path";
import { promises as fs } from "fs";
import { createHash } from "crypto";
import { Worker } from "worker_threads";

import * as chokidar from "chokidar";
import * as YAML from "yaml";
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
  runTSModule,
  writeText,
} from "./fsutils.js";
import { stepFingerprint } from "./hash.js";
import { topoSort } from "./lib/graph.js";
import { semaphore } from "./lib/concurrency.js";
import { loadState, saveState, RunState } from "./lib/state.js";
import { renderReport } from "./lib/report.js";
import { emitEvent } from "./lib/events.js";

const JS_CACHE_TTL_MS = 5 * 60 * 1000;
const JS_CACHE_MAX = 20;
const jsModuleCache = new Map<string, { worker: Worker; ts: number; running?: Promise<any> }>();

async function hashModuleGraph(p: string, seen = new Map<string, string>()) {
  const abs = path.resolve(p);
  if (seen.has(abs)) return seen.get(abs)!;
  const code = await fs.readFile(abs, "utf8");
  const dir = path.dirname(abs);
  const importRe =
    /import\s+(?:[^'"\n]*?from\s+)?["']([^"']+)["']|import\(\s*["']([^"']+)["']\s*\)/g;
  const deps: string[] = [];
  for (let m; (m = importRe.exec(code)); ) {
    const spec = m[1] || m[2];
    if (!spec) continue;
    if (spec.startsWith(".") || spec.startsWith("/")) {
      let resolved = path.resolve(dir, spec);
      if (!path.extname(resolved)) {
        try {
          await fs.access(resolved + ".js");
          resolved += ".js";
        } catch {
          try {
            await fs.access(path.join(resolved, "index.js"));
            resolved = path.join(resolved, "index.js");
          } catch {
            // ignore missing
          }
        }
      }
      deps.push(resolved);
    }
  }
  const childHashes = [] as string[];
  for (const d of deps) childHashes.push(await hashModuleGraph(d, seen));
  childHashes.sort();
  const h = createHash("sha1");
  h.update(code);
  for (const c of childHashes) h.update(c);
  const digest = h.digest("hex");
  seen.set(abs, digest);
  return digest;
}

function getCachedWorker(key: string) {
  const entry = jsModuleCache.get(key);
  if (!entry) return undefined;
  if (Date.now() - entry.ts > JS_CACHE_TTL_MS) {
    entry.worker.terminate();
    jsModuleCache.delete(key);
    return undefined;
  }
  entry.ts = Date.now();
  jsModuleCache.delete(key);
  jsModuleCache.set(key, entry);
  return entry;
}

function setCachedWorker(key: string, worker: Worker) {
  jsModuleCache.set(key, { worker, ts: Date.now() });
  if (jsModuleCache.size > JS_CACHE_MAX) {
    const oldestKey = jsModuleCache.keys().next().value;
    const oldest = jsModuleCache.get(oldestKey);
    if (oldest) oldest.worker.terminate();
    jsModuleCache.delete(oldestKey);
  }
}

function runWorker(worker: Worker, args: unknown, timeoutMs?: number) {
  return new Promise<{
    code: number | null;
    stdout: string;
    stderr: string;
    timeout?: boolean;
  }>((resolve) => {
    let settled = false;
    const resolveOnce = (res: {
      code: number | null;
      stdout: string;
      stderr: string;
      timeout?: boolean;
    }) => {
      if (!settled) {
        settled = true;
        if (timer) clearTimeout(timer);
        worker.removeListener("message", onMessage);
        worker.removeListener("error", onError);
        worker.removeListener("exit", onExit);
        resolve(res);
      }
    };

    const timer =
      timeoutMs && timeoutMs > 0
        ? setTimeout(() => {
            worker.terminate();
            resolveOnce({ code: 1, stdout: "", stderr: "timeout", timeout: true });
          }, timeoutMs)
        : undefined;

    const onMessage = (msg: any) => {
      resolveOnce({
        code: msg.ok ? 0 : 1,
        stdout: msg.ok ? msg.res : "",
        stderr: msg.ok ? "" : msg.err,
      });
    };

    const onError = (err: Error) => {
      resolveOnce({ code: 1, stdout: "", stderr: err.message });
    };

    const onExit = (code: number) => {
      resolveOnce({
        code: code === 0 ? 1 : code,
        stdout: "",
        stderr: `worker exited with code ${code}`,
      });
    };

    worker.on("message", onMessage);
    worker.on("error", onError);
    worker.on("exit", onExit);

    worker.postMessage({ args });
  });
}

function slug(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

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
      let execRes: {
        code: number | null;
        stdout: string;
        stderr: string;
        timeout?: boolean;
      } = {
        code: 0,
        stdout: "",
        stderr: "",
      };

        if (s.shell) execRes = await runShell(s.shell, cwd, s.env, s.timeoutMs);
        else if (s.node)
          execRes = await runNode(s.node, s.args, cwd, s.env, s.timeoutMs);
        else if (s.ts) execRes = await runTSModule(s, cwd, s.env, s.timeoutMs);
        else if (s.js) {
          const modPath = path.isAbsolute(s.js.module)
            ? s.js.module
            : path.resolve(cwd, s.js.module);
          const hash = await hashModuleGraph(modPath);
          const cacheKey = hash + ":" + (s.js.export ?? "");
          let entry = getCachedWorker(cacheKey);
          if (!entry) {
            const worker = new Worker(
              new URL("./lib/js-worker.js", import.meta.url),
              { workerData: { modulePath: modPath, exportName: s.js.export } },
            );
            worker.unref();
            entry = { worker, ts: Date.now() };
            setCachedWorker(cacheKey, worker);
          }
          execRes = await runWorker(entry.worker, s.js.args, s.timeoutMs);
          if (execRes.timeout) jsModuleCache.delete(cacheKey);
        }

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

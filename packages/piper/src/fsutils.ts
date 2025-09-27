import { promises as fs } from "fs";
import * as path from "path";
import { spawn } from "child_process";
import { Worker } from "node:worker_threads";
import { AsyncLocalStorage } from "async_hooks";
import { pathToFileURL } from "url";

import { globby } from "globby";
import { ensureDir } from "@promethean/fs";

import { PiperStep } from "./types.js";
import { fingerprintJsDeps } from "./hash.js";

export { ensureDir };

export async function readTextMaybe(p: string) {
  try {
    return await fs.readFile(p, "utf-8");
  } catch (err: any) {
    if ((err as NodeJS.ErrnoException)?.code === "ENOENT") return undefined;
    throw err;
  }
}

export async function writeText(p: string, s: string) {
  await ensureDir(path.dirname(p));
  await fs.writeFile(p, s, "utf-8");
}

export async function listOutputsExist(outputs: string[], cwd: string) {
  const results = await Promise.all(
    outputs.map((pat) => globby(pat, { cwd, absolute: true, dot: true })),
  );
  return results.every((files) => files.length > 0);
}

export function runShell(
  cmd: string,
  cwd: string,
  env: Record<string, string>,
  timeoutMs?: number,
) {
  return runSpawn(cmd, {
    cwd,
    env,
    shell: true,
    ...(timeoutMs ? { timeoutMs } : {}),
  });
}

export function runNode(
  file: string,
  args: string[] | undefined,
  cwd: string,
  env: Record<string, string>,
  timeoutMs?: number,
) {
  const cmd = process.execPath;
  const finalArgs = [file, ...(args ?? [])];
  return runSpawn(cmd, {
    cwd,
    env,
    args: finalArgs,
    ...(timeoutMs ? { timeoutMs } : {}),
  });
}

/** Re-entrant, serialized JS function runner (captures console + env, supports timeouts) */
const jsFnCtx = new AsyncLocalStorage<symbol>();
let jsFnLock: Promise<void> = Promise.resolve();
let jsFnOwner: symbol | undefined;

export async function runJSFunction(
  fn: (args: any) => any | Promise<any>,
  args: any,
  env: Record<string, string>,
  timeoutMs?: number,
) {
  const current = jsFnCtx.getStore();

  const run = async () => {
    let stdout = "";
    let stderr = "";

    const origStdout = process.stdout.write;
    const origStderr = process.stderr.write;
    const origEnv: Record<string, string | undefined> = {};
    let cleaned = false;

    const cleanup = () => {
      if (cleaned) return;
      cleaned = true;
      (process.stdout.write as any) = origStdout;
      (process.stderr.write as any) = origStderr;
      for (const [k, v] of Object.entries(origEnv)) {
        if (v === undefined) delete process.env[k];
        else process.env[k] = v;
      }
    };

    (process.stdout.write as any) = (chunk: any, enc?: any, cb?: any) => {
      stdout += typeof chunk === "string" ? chunk : String(chunk);
      const fn = typeof enc === "function" ? enc : cb;
      if (typeof fn === "function") fn();
      return true;
    };
    (process.stderr.write as any) = (chunk: any, enc?: any, cb?: any) => {
      stderr += typeof chunk === "string" ? chunk : String(chunk);
      const fn = typeof enc === "function" ? enc : cb;
      if (typeof fn === "function") fn();
      return true;
    };
    for (const [k, v] of Object.entries(env)) {
      origEnv[k] = process.env[k];
      process.env[k] = v;
    }

    const exec = async () => {
      try {
        const res = await fn(args);
        if (typeof res === "string") stdout += res;
        return { code: 0, stdout, stderr } as const;
      } catch (e: any) {
        stderr += e?.stack ?? String(e);
        return { code: 1, stdout, stderr } as const;
      } finally {
        cleanup();
      }
    };

    if (!timeoutMs) return exec();

    let timer: ReturnType<typeof setTimeout> | undefined;
    return Promise.race([
      exec(),
      new Promise<{ code: number; stdout: string; stderr: string }>(
        (resolve) => {
          timer = setTimeout(() => {
            cleanup();
            resolve({ code: 124, stdout, stderr: stderr + "timeout" });
          }, timeoutMs);
        },
      ),
    ]).finally(() => {
      if (timer) clearTimeout(timer);
    });
  };

  // If we already hold the lock in this async context, just run.
  if (current && current === jsFnOwner) return run();

  // Serialize callers; set owner only after prior lock resolves.
  const prev = jsFnLock;
  let release!: () => void;
  const token = Symbol("jsFn");
  jsFnLock = new Promise<void>((r) => (release = r));
  await prev;
  jsFnOwner = token;
  try {
    return await jsFnCtx.run(token, run);
  } finally {
    jsFnOwner = undefined;
    release();
  }
}

/** Worker-isolated JS module runner (captures console safely) */
async function runJSModuleWorker(
  modUrl: string,
  exportName: string | undefined,
  args: any,
  env: Record<string, string>,
  cwd: string,
  timeoutMs?: number,
) {
  return new Promise<{ code: number | null; stdout: string; stderr: string }>(
    (resolve) => {
      const worker = new Worker(new URL("./js-worker.js", import.meta.url), {
        workerData: { modUrl, exportName, args, env, cwd },
      });

      let stdout = "";
      let stderr = "";
      let settled = false;
      let timer: NodeJS.Timeout | undefined;

      const finish = (res: {
        code: number | null;
        stdout: string;
        stderr: string;
      }) => {
        if (settled) return;
        settled = true;
        if (timer) clearTimeout(timer);
        resolve(res);
      };

      if (timeoutMs && timeoutMs > 0) {
        timer = setTimeout(() => {
          worker.terminate();
          finish({ code: 124, stdout, stderr: stderr + "timeout" });
        }, timeoutMs);
      }

      worker.on("message", (m: any) => {
        if (m?.type === "stdout") stdout += String(m.data ?? "");
        else if (m?.type === "stderr") stderr += String(m.data ?? "");
        else if (m?.type === "done") {
          finish({
            code: typeof m.code === "number" ? m.code : 0,
            stdout,
            stderr: m.error ? stderr + m.error : stderr,
          });
        }
      });

      worker.on("error", (err) =>
        finish({
          code: 1,
          stdout,
          stderr: stderr + (err?.stack ?? String(err)),
        }),
      );
      worker.on("exit", (code) => finish({ code, stdout, stderr }));
    },
  );
}

function enterProcessCwd(targetCwd: string | undefined): () => void {
  if (!targetCwd) {
    return () => {};
  }

  const prevCwd = process.cwd();

  try {
    process.chdir(targetCwd);
    return () => {
      process.chdir(prevCwd);
    };
  } catch (err: any) {
    const code = err?.code;
    const message = err?.message ? String(err.message) : "";
    const isWorkerCwdError =
      code === "ERR_WORKER_UNSUPPORTED_OPERATION" ||
      message.includes("ERR_WORKER_UNSUPPORTED_OPERATION") ||
      message.includes("not supported in workers");

    if (!isWorkerCwdError) {
      throw err;
    }

    throw new Error(
      `process.chdir is not supported in worker threads; unable to enter cwd "${targetCwd}". ` +
        'Set step.js.isolate = "worker" or execute from an environment that supports chdir.',
    );
  }
}

/** JS module runner (default in-proc fast path).
 *  - Env is isolated and restored after run (calls serialized).
 *  - Console/stdout/stderr are captured during execution.
 *  - Set step.js.isolate = "worker" for process isolation; console captured via worker.
 */
export async function runJSModule(
  step: PiperStep,
  cwd: string,
  env: Record<string, string>,
  fp: string,
  timeoutMs?: number,
) {
  const modPath = path.isAbsolute(step.js!.module)
    ? step.js!.module
    : path.resolve(cwd, step.js!.module);
  let importPath = modPath;
  if ((step.js as any)?.isolate === "worker") {
    const { files } = await fingerprintJsDeps(modPath, "content");
    const base = path.dirname(modPath);
    const copyDir = path.join(base, ".piper", fp);
    await Promise.all(
      files.map(async (f) => {
        const rel = path.relative(base, f);
        const dest = path.join(copyDir, rel);
        await ensureDir(path.dirname(dest));
        await fs.copyFile(f, dest);
      }),
    );
    importPath = path.join(copyDir, path.relative(base, modPath));
  }

  const url = pathToFileURL(importPath);
  url.searchParams.set("fp", fp);
  if ((step.js as any)?.isolate === "worker") {
    return runJSModuleWorker(
      url.href,
      step.js!.export,
      step.js!.args ?? {},
      env,
      cwd,
      timeoutMs,
    );
  }
  const mod: any = await import(url.href);
  const fn = (step.js!.export && mod[step.js!.export]) || mod.default || mod;
  const restoreCwd = enterProcessCwd(cwd);
  try {
    return await runJSFunction(fn, step.js!.args ?? {}, env, timeoutMs);
  } finally {
    restoreCwd();
  }
}

export async function runTSModule(
  step: PiperStep,
  cwd: string,
  env: Record<string, string>,
  timeoutMs?: number,
) {
  const modPath = path.isAbsolute(step.ts!.module)
    ? step.ts!.module
    : path.resolve(cwd, step.ts!.module);
  const modUrl = pathToFileURL(modPath).href;
  const code = `
  import * as mod from ${JSON.stringify(modUrl)};
  const exp = ${JSON.stringify(step.ts!.export ?? null)};
  const fn = exp ? (mod as any)[exp] : (mod as any).default ?? (mod as any);
  const res = await fn(${JSON.stringify(step.ts!.args ?? {})});
  if (typeof res === 'string') process.stdout.write(res);
`;
  const cmd = process.execPath;
  const args = ["--loader", "ts-node/esm", "--input-type=module", "-e", code];
  return runSpawn(cmd, { cwd, env, args, timeoutMs });
}
function runSpawn(
  cmd: string,
  opts: {
    cwd: string;
    env: NodeJS.ProcessEnv;
    shell?: boolean | undefined;
    args?: string[] | undefined;
    timeoutMs?: number | undefined;
  },
) {
  return new Promise<{ code: number | null; stdout: string; stderr: string }>(
    (resolve, reject) => {
      const child = opts.shell
        ? spawn(cmd, {
            cwd: opts.cwd,
            env: { ...process.env, ...opts.env },
            shell: true,
            stdio: ["ignore", "pipe", "pipe"],
            detached: process.platform !== "win32",
          })
        : spawn(cmd, opts.args ?? [], {
            cwd: opts.cwd,
            env: { ...process.env, ...opts.env },
            stdio: ["ignore", "pipe", "pipe"],
            detached: process.platform !== "win32",
          });

      let out = "",
        err = "",
        timedOut = false;
      const killTimer =
        opts.timeoutMs && opts.timeoutMs > 0
          ? setTimeout(() => {
              timedOut = true;
              try {
                if (process.platform !== "win32" && child.pid) {
                  process.kill(-child.pid, "SIGKILL");
                } else {
                  child.kill("SIGKILL");
                }
              } catch (killError: any) {
                if (killError.code === "ESRCH") {
                  // process already dead
                } else if (killError.code === "EPERM") {
                  console.warn(
                    `Permission denied killing process ${child.pid}`,
                  );
                } else {
                  err += `\nkill failed: ${killError.message ?? killError}`;
                }
              }
            }, opts.timeoutMs)
          : undefined;

      child.stdout.on("data", (d) => (out += String(d)));
      child.stderr.on("data", (d) => (err += String(d)));
      child.on("close", (code) => {
        if (killTimer) clearTimeout(killTimer as any);
        resolve({
          code: timedOut ? 124 : code,
          stdout: out,
          stderr: timedOut ? err + "timeout" : err,
        });
      });
      child.on("error", (e) => reject(e));
    },
  );
}

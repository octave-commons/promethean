import { promises as fs } from "fs";
import * as path from "path";
import { spawn } from "child_process";
import { Worker } from "node:worker_threads";
import { AsyncLocalStorage } from "async_hooks";
import { pathToFileURL } from "url";

import { globby } from "globby";
import { ensureDir } from "@promethean/fs";
import { PiperStep } from "./types.js";

export { ensureDir };

class Mutex {
  private queue: (() => void)[] = [];
  private locked = false;
  async acquire() {
    if (this.locked) await new Promise<void>((res) => this.queue.push(res));
    else this.locked = true;
  }
  release() {
    const next = this.queue.shift();
    if (next) next();
    else this.locked = false;
  }
}

const envMutex = new Mutex();

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

    const origStdout = process.stdout.write.bind(process.stdout);
    const origStderr = process.stderr.write.bind(process.stderr);
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

    (process.stdout.write as any) = (chunk: any) => {
      stdout += typeof chunk === "string" ? chunk : String(chunk);
      return true;
    };
    (process.stderr.write as any) = (chunk: any) => {
      stderr += typeof chunk === "string" ? chunk : String(chunk);
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

    let timer: NodeJS.Timeout;
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
    ]).finally(() => clearTimeout(timer));
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
  modPath: string,
  exportName: string | undefined,
  args: any,
  env: Record<string, string>,
  timeoutMs?: number,
) {
  const modUrl = pathToFileURL(modPath).href;
  return new Promise<{ code: number | null; stdout: string; stderr: string }>(
    (resolve) => {
      const worker = new Worker(new URL("./js-worker.js", import.meta.url), {
        workerData: { modUrl, exportName, args, env },
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
          worker
            .terminate()
            .finally(() =>
              finish({ code: 124, stdout, stderr: stderr + "timeout" }),
            );
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

/** JS module runner (default in-proc fast path).
 *  - Env is isolated via a mutex and restored after run.
 *  - Only string return values are forwarded to stdout (console is not captured).
 *  - Set step.js.isolate = "worker" to capture console via worker.
 */
export async function runJSModule(
  step: PiperStep,
  cwd: string,
  env: Record<string, string>,
  timeoutMs?: number,
) {
  const modPath = path.isAbsolute(step.js!.module)
    ? step.js!.module
    : path.resolve(cwd, step.js!.module);

  if ((step.js as any)?.isolate === "worker") {
    return runJSModuleWorker(
      modPath,
      step.js!.export,
      step.js!.args ?? {},
      env,
      timeoutMs,
    );
  }

  const url = pathToFileURL(modPath).href;
  await envMutex.acquire();
  const prevEnv: Record<string, string | undefined> = {};
  for (const [k, v] of Object.entries(env)) {
    prevEnv[k] = process.env[k];
    process.env[k] = v;
  }
  let timer: NodeJS.Timeout | undefined;
  try {
    const mod: any = await import(url);
    const fn = (step.js!.export && mod[step.js!.export]) || mod.default || mod;
    const call = fn(step.js!.args ?? {});
    const res = timeoutMs
      ? await Promise.race([
          call,
          new Promise((_, reject) => {
            timer = setTimeout(() => reject(new Error("timeout")), timeoutMs);
          }),
        ])
      : await call;
    const out = typeof res === "string" ? res : "";
    return { code: 0, stdout: out, stderr: "" };
  } catch (err: any) {
    return { code: 1, stdout: "", stderr: String(err?.stack ?? err) };
  } finally {
    if (timer) clearTimeout(timer);
    for (const [k, v] of Object.entries(prevEnv)) {
      if (v === undefined) delete process.env[k];
      else process.env[k] = v;
    }
    envMutex.release();
  }
}

// export async function runJSFunction(
//   fn: (args: unknown) => unknown | Promise<unknown>,
//   args: unknown,
// ) {
//   try {
//     const res = await fn(args as any);
//     return {
//       code: 0,
//       stdout: typeof res === "string" ? res : "",
//       stderr: "",
//     };
//   } catch (err: unknown) {
//     return {
//       code: 1,
//       stdout: "",
//       stderr: err instanceof Error ? err.message : String(err),
//     };
//   }
// }

export async function runTSModule(
  step: PiperStep,
  cwd: string,
  env: Record<string, string>,
  timeoutMs?: number,
) {
  const modPath = path.isAbsolute(step.ts!.module)
    ? step.ts!.module
    : path.resolve(cwd, step.ts!.module);
  const code = `
    import mod from ${JSON.stringify(modPath)};
    const fn = (mod && mod.${step.ts!.export}) || (mod && mod.default) || mod;
    const res = await fn(${JSON.stringify(step.ts!.args ?? {})});
    if (typeof res === 'string') process.stdout.write(res);
  `;
  // Lazy-run via node -e with ESM loader
  const cmd = process.execPath;
  const args = ["-e", code];
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
    (resolve) => {
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
        err = "";
      const killTimer =
        opts.timeoutMs && opts.timeoutMs > 0
          ? setTimeout(() => {
              try {
                if (process.platform !== "win32" && child.pid) {
                  process.kill(-child.pid, "SIGKILL");
                } else {
                  child.kill("SIGKILL");
                }
              } catch {}
            }, opts.timeoutMs)
          : undefined;

      child.stdout.on("data", (d) => (out += String(d)));
      child.stderr.on("data", (d) => (err += String(d)));
      child.on("close", (code) => {
        if (killTimer) clearTimeout(killTimer as any);
        resolve({ code, stdout: out, stderr: err });
      });
      child.on("error", () =>
        resolve({ code: 127, stdout: out, stderr: err || "failed to spawn" }),
      );
    },
  );
}

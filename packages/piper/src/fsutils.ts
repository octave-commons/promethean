import { promises as fs } from "fs";
import * as path from "path";
import { spawn } from "child_process";

import { globby } from "globby";
import { ensureDir } from "@promethean/fs";
import { PiperStep } from "./types.js";

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

let jsFnLock: Promise<void> = Promise.resolve();

export async function runJSFunction(
  fn: (args: any) => any | Promise<any>,
  args: any,
  env: Record<string, string>,
  timeoutMs?: number,
) {
  const prev = jsFnLock;
  let release!: () => void;
  jsFnLock = new Promise<void>((r) => (release = r));
  await prev;
  try {
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

    const run = async () => {
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

    if (!timeoutMs) return run();

    let timer: NodeJS.Timeout;
    return Promise.race([
      run(),
      new Promise<{ code: number | null; stdout: string; stderr: string }>((resolve) => {
        timer = setTimeout(() => {
          cleanup();
          resolve({ code: 124, stdout, stderr: stderr + "timeout" });
        }, timeoutMs);
      }),
    ]).finally(() => clearTimeout(timer));
  } finally {
    release();
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
  const code = `
    import mod from ${JSON.stringify(modPath)};
    const exportName = ${JSON.stringify(step.ts!.export ?? "")};
    const fn =
      (exportName && mod && mod[exportName]) ||
      (mod && mod.default) ||
      mod;
    const res = await fn(${JSON.stringify(step.ts!.args ?? {})});
    if (typeof res === 'string') process.stdout.write(res);
  `;
  // Lazy-run via node -e with ESM loader
  const cmd = process.execPath;
  const args = ["--input-type=module", "-e", code];
  return runSpawn(cmd, {
    cwd,
    env,
    args,
    ...(timeoutMs ? { timeoutMs } : {}),
  });
}

function runSpawn(
  cmd: string,
  opts: {
    cwd: string;
    env: NodeJS.ProcessEnv;
    shell?: boolean;
    args?: string[];
    timeoutMs?: number;
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

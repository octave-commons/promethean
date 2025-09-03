// SPDX-License-Identifier: GPL-3.0-only
import { promises as fs } from "fs";
import * as path from "path";
import { globby } from "globby";
import { spawn } from "child_process";
import { PiperStep } from "./types.js";

export async function ensureDir(p: string) {
  await fs.mkdir(p, { recursive: true });
}

export async function readTextMaybe(p: string) {
  try { return await fs.readFile(p, "utf-8"); } catch { return undefined; }
}

export async function writeText(p: string, s: string) {
  await ensureDir(path.dirname(p));
  await fs.writeFile(p, s, "utf-8");
}

export async function listOutputsExist(outputs: string[], cwd: string) {
  for (const pat of outputs) {
    const files = await globby(pat, { cwd, absolute: true, dot: true });
    if (files.length === 0) return false;
  }
  return true;
}

export function runShell(cmd: string, cwd: string, env: Record<string,string>, timeoutMs?: number) {
  return runSpawn(cmd, { cwd, env, shell: true, timeoutMs });
}

export function runNode(file: string, args: string[] | undefined, cwd: string, env: Record<string,string>, timeoutMs?: number) {
  const cmd = process.execPath;
  const finalArgs = [file, ...(args ?? [])];
  return runSpawn(cmd, { cwd, env, args: finalArgs, timeoutMs });
}

export async function runTSModule(step: PiperStep, cwd: string, env: Record<string,string>, timeoutMs?: number) {
  const modPath = path.isAbsolute(step.ts!.module) ? step.ts!.module : path.resolve(cwd, step.ts!.module);
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

function runSpawn(cmd: string, opts: { cwd: string; env: Record<string,string>; shell?: boolean; args?: string[]; timeoutMs?: number }) {
  return new Promise<{ code: number | null; stdout: string; stderr: string }>((resolve) => {
    const child = opts.shell
      ? spawn(cmd, { cwd: opts.cwd, env: { ...process.env, ...opts.env }, shell: true, stdio: ["ignore", "pipe", "pipe"] })
      : spawn(cmd, opts.args ?? [], { cwd: opts.cwd, env: { ...process.env, ...opts.env }, stdio: ["ignore", "pipe", "pipe"] });

    let out = "", err = "";
    const killTimer = opts.timeoutMs && opts.timeoutMs > 0
      ? setTimeout(() => { try { child.kill("SIGKILL"); } catch {} }, opts.timeoutMs)
      : undefined;

    child.stdout.on("data", (d) => out += String(d));
    child.stderr.on("data", (d) => err += String(d));
    child.on("close", (code) => {
      if (killTimer) clearTimeout(killTimer as any);
      resolve({ code, stdout: out, stderr: err });
    });
    child.on("error", () => resolve({ code: 127, stdout: out, stderr: err || "failed to spawn" }));
  });
}

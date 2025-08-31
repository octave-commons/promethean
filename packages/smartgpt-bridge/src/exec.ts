// @ts-nocheck
const REPO_ROOT = process.env.REPO_ROOT;

// return exec({cwd,shell:'/usr/bin/bash'})`${command}`
const DANGER_PATTERNS = [
  /rm\s+-rf\s+\/(?!home)/i,
  /\bDROP\s+DATABASE\b/i,
  /\bmkfs\w*\s+\/dev\//i,
  /\bshutdown\b|\breboot\b/i,
  /\bchmod\s+777\b/i,
];
function matchDanger(s) {
  return DANGER_PATTERNS.find((rx) => rx.test(s));
}
import { execa } from "execa";
import path from "path";
import { isInsideRoot } from "./files.js";

export async function runCommand({
  command,
  cwd = REPO_ROOT,
  repoRoot = REPO_ROOT,
  timeoutMs = 10 * 60_000,
  tty = false,
} = {}) {
  const t0 = Date.now();
  const useShell = /^true$/i.test(process.env.EXEC_SHELL || "false");
  try {
    if (matchDanger(command)) {
      return {
        ok: false,
        error: "blocked by guard",
        exitCode: null,
        signal: null,
      };
    }
    const base = repoRoot || process.env.REPO_ROOT || process.cwd();
    let safeCwd;
    try {
      const abs = path.isAbsolute(cwd)
        ? path.resolve(cwd)
        : path.resolve(base, cwd);
      if (!isInsideRoot(base, abs)) throw new Error("cwd outside root");
      safeCwd = abs;
    } catch {
      return {
        ok: false,
        error: "cwd outside root",
        exitCode: null,
        signal: null,
      };
    }
    const subprocess = execa(command, {
      cwd: safeCwd,
      timeout: timeoutMs,
      shell: useShell,
      stdio: tty ? "inherit" : "pipe",
    });

    const result = await subprocess;
    const durationMs = Date.now() - t0;

    return {
      ok: true,
      exitCode: 0,
      signal: null,
      stdout: result.stdout ?? "",
      stderr: result.stderr ?? "",
      durationMs,
      truncated: false,
      error: "",
    };
  } catch (err) {
    const durationMs = Date.now() - t0;
    return {
      ok: false,
      exitCode: err.exitCode ?? 1,
      signal: err.signal ?? null,
      stdout: err.stdout ?? "",
      stderr: err.stderr ?? err.message,
      durationMs: err.timedOut ? timeoutMs : durationMs,
      truncated: false,
      error: err.message ?? "Execution failed",
    };
  }
}

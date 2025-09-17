import path from "path";

import { execa } from "execa";

import { isInsideRoot } from "./files.js";
const REPO_ROOT: string | undefined = process.env.REPO_ROOT || undefined;

// return exec({cwd,shell:'/usr/bin/bash'})`${command}`
const DANGER_PATTERNS = [
  /rm\s+-rf\s+\/(?!home)/i,
  /\bDROP\s+DATABASE\b/i,
  /\bmkfs\w*\s+\/dev\//i,
  /\bshutdown\b|\breboot\b/i,
  /\bchmod\s+777\b/i,
];
function matchDanger(s: string) {
  return DANGER_PATTERNS.find((rx) => rx.test(s));
}

export async function runCommand(opts: {
  command: string;
  cwd?: string;
  repoRoot?: string;
  timeoutMs?: number;
  tty?: boolean;
  env?: Record<string, string>;
}) {
  const {
    command,
    cwd = REPO_ROOT ?? process.cwd(),
    repoRoot = REPO_ROOT ?? process.cwd(),
    timeoutMs = 10 * 60_000,
    tty = false,
  } = opts;
  const shouldFake =
    String(process.env.NODE_ENV || "").toLowerCase() === "test" &&
    String(process.env.EXEC_FAKE || "true").toLowerCase() === "true";
  if (shouldFake) {
    if (matchDanger(command)) {
      return {
        ok: false,
        error: "blocked by guard",
        exitCode: null,
        signal: null,
        stdout: "",
        stderr: "",
        durationMs: 0,
        truncated: false,
      };
    }
    const fakeStdout = command.startsWith("echo ") ? command.slice(5) : command;
    return {
      ok: true,
      exitCode: 0,
      signal: null,
      stdout: fakeStdout,
      stderr: "",
      durationMs: 0,
      truncated: false,
      error: "",
    };
  }
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
      env: opts.env ? { ...process.env, ...opts.env } : process.env,
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
  } catch (err: any) {
    const durationMs = Date.now() - t0;
    return {
      ok: false,
      exitCode: err?.exitCode ?? 1,
      signal: err?.signal ?? null,
      stdout: err?.stdout ?? "",
      stderr: err?.stderr ?? String(err?.message ?? err ?? ""),
      durationMs: err?.timedOut ? timeoutMs : durationMs,
      truncated: false,
      error: String(err?.message || "Execution failed"),
    };
  }
}

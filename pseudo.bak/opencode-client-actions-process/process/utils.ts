// SPDX-License-Identifier: GPL-3.0-only
// Process action utilities

import { spawn, type ChildProcess } from 'child_process';
import * as path from 'node:path';
import * as fs from 'node:fs/promises';
import { RingBuffer, ProcInfo } from './types.js';

// --- Policy knobs (tune for your deployment) ---

// Allowlist of executable basenames (no paths). Keep this tight.
export const ALLOWED_COMMANDS = new Set<string>([
  'node',
  'npm',
  'pnpm',
  'bun',
  'pm2',
  'bb',
  'nbb',
  'npx',
  'uvx',
  'tsx',
  'deno',
  'git',
  'bash', // consider removing shells for stricter setups
  'sh', // consider removing
  'python',
  'python3',
  'uv',
  'make',
  // add project-specific tools as needed
]);

// Optional: only resolve executables from these directories
export const ALLOWED_BIN_DIRS = [
  '/usr/bin',
  '/usr/local/bin',
  '/bin',
  '/home/err/.volta/bin/',
  path.join(process.cwd(), 'node_modules', '.bin'),
].filter(Boolean);

// Jail the working directory under a safe root (e.g. your monorepo root)
export const SAFE_ROOT = process.env.OPENCODE_SAFE_ROOT ?? process.cwd();

// Environment keys to keep; everything else is scrubbed
export const ENV_ALLOWLIST = new Set([
  'PATH', // sanitized below
  'HOME', // optional
  'TMPDIR',
  'TEMP',
  'TMP',
  'LANG',
  'LC_ALL',
]);

export const createRingBuffer = (size: number): RingBuffer => {
  const lines: string[] = [];
  const push = (line: string) => {
    if (line === undefined || line === null) return;
    lines.push(line);
    if (lines.length > size) lines.splice(0, lines.length - size);
  };
  const snapshot = (n: number) => lines.slice(Math.max(0, lines.length - n));
  return { size, lines, push, snapshot };
};

export const sanitizeEnv = (): NodeJS.ProcessEnv => {
  const clean: NodeJS.ProcessEnv = {};
  for (const k of Object.keys(process.env)) {
    if (ENV_ALLOWLIST.has(k)) clean[k] = process.env[k]!;
  }
  const pathSep = process.platform === 'win32' ? ';' : ':';
  const allowedPath = ALLOWED_BIN_DIRS.join(pathSep);
  if (allowedPath) clean.PATH = allowedPath;
  return clean;
};

// Resolve & validate an executable by basename against ALLOWED_BIN_DIRS
export const resolveExecutable = async (exe: string): Promise<string> => {
  if (!ALLOWED_COMMANDS.has(exe)) {
    throw new Error(`Executable "${exe}" is not allowed`);
  }
  // If a direct path was passed, reject — enforce basenames only.
  if (exe.includes(path.sep)) {
    throw new Error(`Executable must be a basename, not a path`);
  }
  const candidates = ALLOWED_BIN_DIRS.map((dir) => path.join(dir, exe));
  for (const c of candidates) {
    try {
      await fs.access(c);
      return c;
    } catch {}
  }
  // On Windows, consider resolving ".exe", ".cmd" variants if needed.
  throw new Error(`Executable "${exe}" not found in allowed paths`);
};

export const resolveCwd = async (cwd?: string): Promise<string> => {
  const target = cwd ? path.resolve(cwd) : SAFE_ROOT;
  const safeRoot = path.resolve(SAFE_ROOT);
  if (!target.startsWith(safeRoot + path.sep) && target !== safeRoot) {
    throw new Error(`cwd must be within SAFE_ROOT (${safeRoot})`);
  }
  await fs.mkdir(target, { recursive: true });
  return target;
};

export const makeProcInfo = (
  child: ChildProcess,
  cmd: string,
  args: string[],
  cwd: string,
): ProcInfo => ({
  child,
  cmd,
  args,
  cwd,
  startedAt: Date.now(),
  pgidTarget: process.platform === 'win32' ? child.pid! : -child.pid!, // negative = group on POSIX
  stdoutBuf: createRingBuffer(5000), // tune limits
  stderrBuf: createRingBuffer(5000),
});

// Cross-platform graceful+forceful terminate for a single pid or group
export const terminateProcessTree = async (
  info: ProcInfo,
  signal: NodeJS.Signals = 'SIGTERM',
  graceMs = 5000,
): Promise<void> => {
  const pid = info.child.pid!;
  if (process.platform === 'win32') {
    // Try a gentle close first
    try {
      process.kill(pid, 'SIGTERM'); // emulated; may just terminate
    } catch {}
    await new Promise((r) => setTimeout(r, Math.floor(graceMs / 2)));

    // Then kill the entire tree with taskkill
    await new Promise<void>((resolve) => {
      const killer = spawn('taskkill', ['/PID', String(pid), '/T'], {
        windowsHide: true,
        stdio: 'ignore',
      });
      killer.on('exit', () => resolve());
      killer.on('error', () => resolve());
    });

    // If still alive, force
    try {
      await new Promise<void>((resolve) => {
        const killer = spawn('taskkill', ['/PID', String(pid), '/T', '/F'], {
          windowsHide: true,
          stdio: 'ignore',
        });
        killer.on('exit', () => resolve());
        killer.on('error', () => resolve());
      });
    } catch {}
    return;
  }

  // POSIX: signal group (negative pgid)
  try {
    process.kill(info.pgidTarget, signal);
  } catch {}
  await new Promise((r) => setTimeout(r, graceMs));
  // Force kill if still running
  try {
    process.kill(info.pgidTarget, 'SIGKILL');
  } catch {}
};

// Utility: check if pid exists (portable)
export const isRunning = (pid: number): boolean => {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
};

// Wire up line-buffered stdout/stderr into ring buffers
export const attachLogging = (info: ProcInfo) => {
  const { child, stdoutBuf, stderrBuf } = info;

  const attach = (stream: NodeJS.ReadableStream | null, sink: RingBuffer) => {
    if (!stream) return;
    let leftover = '';
    stream.on('data', (chunk) => {
      const text = (leftover + chunk.toString()).replace(/\r\n/g, '\n');
      const parts = text.split('\n');
      leftover = parts.pop() ?? '';
      for (const line of parts) sink.push(line);
    });
    stream.on('end', () => {
      if (leftover) {
        sink.push(leftover);
        leftover = '';
      }
    });
  };

  attach(child.stdout, stdoutBuf);
  attach(child.stderr, stderrBuf);
};

import stringArgv from 'string-argv';

// pure, side-effect-free
export const coerceCommandArgs = (
  inputCommand: string,
  inputArgs: readonly string[] | undefined,
): { cmd: string; argv: string[] } => {
  if (inputArgs && inputArgs.length > 0) {
    return { cmd: inputCommand, argv: [...inputArgs] };
  }
  if (/\s/.test(inputCommand)) {
    const tokens = stringArgv(inputCommand);
    if (tokens.length === 0) throw new Error('Empty command after parsing');
    const [cmd, ...rest] = tokens;
    return { cmd: cmd || '', argv: rest };
  }
  return { cmd: inputCommand, argv: [] };
};

// Active processes store
export const activeProcesses: Map<number, ProcInfo> = new Map();

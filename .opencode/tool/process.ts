// SPDX-License-Identifier: GPL-3.0-only
// Safer long-running process tools for an agent.

import { tool } from '@opencode-ai/plugin';
import { spawn, execFile, type ChildProcess } from 'child_process';
import * as path from 'node:path';
import * as fs from 'node:fs/promises';

type RingBuffer = {
  size: number;
  lines: string[];
  push: (line: string) => void;
  snapshot: (n: number) => string[];
};

const createRingBuffer = (size: number): RingBuffer => {
  const lines: string[] = [];
  const push = (line: string) => {
    if (line === undefined || line === null) return;
    lines.push(line);
    if (lines.length > size) lines.splice(0, lines.length - size);
  };
  const snapshot = (n: number) => lines.slice(Math.max(0, lines.length - n));
  return { size, lines, push, snapshot };
};

type ProcInfo = {
  child: ChildProcess;
  cmd: string;
  args: string[];
  cwd: string;
  startedAt: number;
  pgidTarget: number; // negative pid for group kill on POSIX; plain pid on Windows
  stdoutBuf: RingBuffer;
  stderrBuf: RingBuffer;
};

const activeProcesses: Map<number, ProcInfo> = new Map();

// --- Policy knobs (tune for your deployment) ---

// Allowlist of executable basenames (no paths). Keep this tight.
const ALLOWED_COMMANDS = new Set<string>([
  'node',
  'npm',
  'pnpm',
  'bun',
  'pm2',
  'bb',
  'nbb',
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
const ALLOWED_BIN_DIRS = [
  '/usr/bin',
  '/usr/local/bin',
  '/bin',
  '/home/err/.volta/bin/',
  path.join(process.cwd(), 'node_modules', '.bin'),
].filter(Boolean);

// Jail the working directory under a safe root (e.g. your monorepo root)
const SAFE_ROOT = process.env.OPENCODE_SAFE_ROOT ?? process.cwd();

// Environment keys to keep; everything else is scrubbed
const ENV_ALLOWLIST = new Set([
  'PATH', // sanitized below
  'HOME', // optional
  'TMPDIR',
  'TEMP',
  'TMP',
  'LANG',
  'LC_ALL',
]);

const sanitizeEnv = (): NodeJS.ProcessEnv => {
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
const resolveExecutable = async (exe: string): Promise<string> => {
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

const resolveCwd = async (cwd?: string): Promise<string> => {
  const target = cwd ? path.resolve(cwd) : SAFE_ROOT;
  const safeRoot = path.resolve(SAFE_ROOT);
  if (!target.startsWith(safeRoot + path.sep) && target !== safeRoot) {
    throw new Error(`cwd must be within SAFE_ROOT (${safeRoot})`);
  }
  await fs.mkdir(target, { recursive: true });
  return target;
};

const makeProcInfo = (child: ChildProcess, cmd: string, args: string[], cwd: string): ProcInfo => ({
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
const terminateProcessTree = async (
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
const isRunning = (pid: number): boolean => {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
};

// Wire up line-buffered stdout/stderr into ring buffers
const attachLogging = (info: ProcInfo) => {
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
// add once at top
import stringArgv from 'string-argv';

// pure, side-effect-free
const coerceCommandArgs = (
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
    return { cmd, argv: rest };
  }
  return { cmd: inputCommand, argv: [] };
};

// inside start.execute(...)

// ---------------- Tools ----------------

export const start = tool({
  description:
    'Asyncronously spawn a long running process in the background (hardened). Use this for servers, watchers, etc.',
  args: {
    command: tool.schema.string().describe('Allowed executable basename (e.g. "node")'),
    args: tool.schema.array(tool.schema.string()).default([]).describe('Arguments'),
    cwd: tool.schema.string().describe('Working directory (must be under SAFE_ROOT)'),
    uid: tool.schema
      .number()
      .optional()
      .describe('Drop privileges to this numeric uid (POSIX only)'),
    gid: tool.schema
      .number()
      .optional()
      .describe('Drop privileges to this numeric gid (POSIX only)'),
  },
  async execute(args, _context) {
    const { command, args: cmdArgs = [], cwd, uid, gid } = args;

    // NEW: split only when args are missing
    const { cmd, argv } = coerceCommandArgs(command, cmdArgs);

    // existing: resolves + validates basename-only executable from allowlisted dirs
    const [exePath, safeCwd] = await Promise.all([
      resolveExecutable(cmd), // still enforces basename + allowlist
      resolveCwd(cwd),
    ]);

    const child = spawn(exePath, argv, {
      cwd: safeCwd,
      detached: process.platform !== 'win32',
      shell: false, // keep shell OFF
      windowsHide: true,
      stdio: ['ignore', 'pipe', 'pipe'],
      env: sanitizeEnv(),
      ...(typeof uid === 'number' ? { uid } : {}),
      ...(typeof gid === 'number' ? { gid } : {}),
    });

    if (!child.pid) throw new Error('Failed to start process: no PID');

    const info = makeProcInfo(child, cmd, argv, safeCwd);
    attachLogging(info);

    child.on('error', () => activeProcesses.delete(child.pid!));
    child.on('exit', () => activeProcesses.delete(child.pid!));

    activeProcesses.set(child.pid!, info);
    return `Started ${cmd} (PID ${child.pid}) in ${safeCwd}`;
  },
});

export const stop = tool({
  description: 'Stop a long running process by PID (group-aware, cross-platform)',
  args: {
    pid: tool.schema.number().describe('PID to stop'),
    signal: tool.schema.string().default('SIGTERM').describe('Signal to send (POSIX only)'),
    timeoutMs: tool.schema.number().default(5000).describe('Grace period before force-kill'),
  },
  async execute(args, _context) {
    const { pid, signal = 'SIGTERM', timeoutMs = 5000 } = args;

    const info = activeProcesses.get(pid);
    if (!info) throw new Error(`No active process found with PID: ${pid}`);

    await terminateProcessTree(info, signal as NodeJS.Signals, timeoutMs);

    activeProcesses.delete(pid);
    return `Stopped PID ${pid}`;
  },
});

export const list = tool({
  description: 'List all active processes started by this tool (safe view)',
  args: {},
  async execute() {
    if (activeProcesses.size === 0) return 'No active processes';
    return Array.from(activeProcesses.values())
      .map((p) => {
        const age = Math.round((Date.now() - p.startedAt) / 1000);
        const running = isRunning(p.child.pid!);
        return `PID ${p.child.pid} • ${p.cmd} ${p.args.join(' ')} • cwd=${p.cwd} • ${running ? 'running' : 'exited'} • age=${age}s`;
      })
      .join('\n');
  },
});

export const status = tool({
  description: 'Check the status of a process by PID',
  args: { pid: tool.schema.number().describe('PID to check') },
  async execute({ pid }) {
    return isRunning(pid) ? `Process ${pid} is running` : `Process ${pid} is not running`;
  },
});

export const tail = tool({
  description: 'Tail the stdout (ring buffer) of a process by PID',
  args: {
    pid: tool.schema.number().describe('PID to tail'),
    lines: tool.schema.number().default(100).describe('Number of lines (max 5000)'),
  },
  async execute({ pid, lines = 100 }) {
    const info = activeProcesses.get(pid);
    if (!info) throw new Error(`No active process found with PID: ${pid}`);
    const n = Math.max(1, Math.min(lines, info.stdoutBuf.size));
    return info.stdoutBuf.snapshot(n).join('\n') || `(no stdout yet)`;
  },
});

export const err = tool({
  description: 'Tail the stderr (ring buffer) of a process by PID',
  args: {
    pid: tool.schema.number().describe('PID to tail'),
    lines: tool.schema.number().default(100).describe('Number of lines (max 5000)'),
  },
  async execute({ pid, lines = 100 }) {
    const info = activeProcesses.get(pid);
    if (!info) throw new Error(`No active process found with PID: ${pid}`);
    const n = Math.max(1, Math.min(lines, info.stderrBuf.size));
    return info.stderrBuf.snapshot(n).join('\n') || `(no stderr yet)`;
  },
});

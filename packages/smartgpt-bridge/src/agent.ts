import { spawn as nodeSpawn } from "child_process";

import { nanoid } from "nanoid";

import {
  appendAgentLog,
  initAgentMeta,
  listAgentMetas,
  readAgentLogTail,
  updateAgentMeta,
} from "./store.js";
import type {
  AgentChildProcess,
  AgentEventName,
  AgentEventPayloadMap,
  AgentProcess,
  AgentProcessAgent,
  AgentProcessPty,
  AgentMeta,
  PtyModule,
  SseClient,
} from "./types/agents.js";

const ROOT_PATH = process.env.ROOT_PATH || process.cwd();
const CODEX_BIN = process.env.CODEX_BIN || "codex";
const MAX_LOG_BYTES = Number(process.env.AGENT_MAX_LOG_BYTES || 512 * 1024);
const USE_SHELL = /^true$/i.test(process.env.AGENT_SHELL || "false");

const DANGER_PATTERNS = [
  /rm\s+-rf\s+\/(?!home)/i,
  /\bDROP\s+DATABASE\b/i,
  /\bmkfs\w*\s+\/dev\//i,
  /\bshutdown\b|\breboot\b/i,
  /\bchmod\s+777\b/i,
];

type KillFunction = (pid: number, signal: NodeJS.Signals | number) => boolean;
type SpawnFunction = (
  command: string,
  args: readonly string[],
  options: Parameters<typeof nodeSpawn>[2],
) => AgentChildProcess;

type AgentSummary = ReturnType<typeof describeProcess>;

const defaultSpawn: SpawnFunction = (command, args, options) =>
  nodeSpawn(command, [...args], options) as AgentChildProcess;

function ringPush(buffer: Buffer, chunk: Buffer | string): Buffer {
  const slice = Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk));
  const combined = Buffer.concat([buffer, slice]);
  if (combined.length <= MAX_LOG_BYTES) return combined;
  return combined.subarray(combined.length - MAX_LOG_BYTES);
}

function matchDanger(text: string): RegExp | undefined {
  return DANGER_PATTERNS.find((rx) => rx.test(text));
}

function shQuote(value: string): string {
  if (value.length === 0) return "''";
  return `'${value.replace(/'/g, "'\\''")}'`;
}

function describeProcess(process: AgentProcess) {
  const base = {
    id: process.id,
    cmd: process.cmd,
    args: process.args,
    cwd: process.cwd,
    startedAt: process.startedAt,
    exited: process.exited,
    code: process.code,
    signal: process.signal,
    paused_by_guard: process.paused_by_guard,
    bytes: process.log.length,
  };
  if (process.mode === "pty") {
    return { ...base, cols: process.cols, rows: process.rows };
  }
  return base;
}

function createErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

function formatSse<T extends AgentEventName>(
  event: T,
  data: AgentEventPayloadMap[T],
): string {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

function ensureArrayBuffer(buffer: Buffer, chunk: Buffer | string): Buffer {
  return ringPush(buffer, chunk);
}

function toAgentMeta(state: AgentProcess, prompt: string): AgentMeta {
  const base: AgentMeta = {
    id: state.id,
    mode: state.mode,
    cmd: state.cmd,
    args: state.args,
    cwd: state.cwd,
    startedAt: state.startedAt,
    prompt,
    code: state.code,
    signal: state.signal,
  };
  if (state.mode === "pty") {
    return {
      ...base,
      mode: "pty",
      cols: state.cols,
      rows: state.rows,
    };
  }
  return base;
}

const PTY_MODULE_CACHE = new Map<string, PtyModule>();

async function getPtyLib(): Promise<PtyModule> {
  if (process.env.NODE_PTY_DISABLED === "1") {
    const unavailable = new Error("PTY_UNAVAILABLE");
    unavailable.name = "PTY_UNAVAILABLE";
    throw unavailable;
  }
  const cached = PTY_MODULE_CACHE.get("default");
  if (cached) return cached;
  try {
    const mod = await import("node-pty");
    const resolved =
      (mod as { default?: PtyModule }).default ?? (mod as PtyModule);
    PTY_MODULE_CACHE.set("default", resolved);
    return resolved;
  } catch (error) {
    const unavailable = new Error("PTY_UNAVAILABLE");
    unavailable.name = "PTY_UNAVAILABLE";
    (unavailable as Error & { cause?: unknown }).cause = error;
    throw unavailable;
  }
}

function mergeEnv(overrides: Record<string, string>): NodeJS.ProcessEnv {
  return { ...process.env, CI: "1", GIT_TERMINAL_PROMPT: "0", ...overrides };
}

function guardPaused(process: AgentProcess): boolean {
  return process.paused_by_guard;
}

export class AgentSupervisor {
  readonly procs: Map<string, AgentProcess>;
  readonly subscribers: Map<string, Set<SseClient>>;
  private readonly spawnImpl: SpawnFunction;
  private readonly killImpl: KillFunction;

  constructor(
    opts: { spawnImpl?: SpawnFunction; killImpl?: KillFunction } = {},
  ) {
    this.procs = new Map();
    this.subscribers = new Map();
    this.spawnImpl = opts.spawnImpl ?? defaultSpawn;
    this.killImpl =
      opts.killImpl ?? ((pid, signal) => process.kill(pid, signal));
  }

  list(): AgentSummary[] {
    return Array.from(this.procs.values()).map(describeProcess);
  }

  status(id: string): AgentSummary | null {
    const process = this.procs.get(id);
    if (!process) return null;
    return describeProcess(process);
  }

  logs(id: string, since = 0): { total: number; chunk: string } | null {
    const process = this.procs.get(id);
    if (!process) return null;
    const from = Math.max(0, Math.min(since, process.log.length));
    return {
      total: process.log.length,
      chunk: process.log.subarray(from).toString("utf8"),
    };
  }

  tail(id: string, bytes = 8192): { total: number; chunk: string } | null {
    const process = this.procs.get(id);
    if (!process) return null;
    const start = Math.max(0, process.log.length - Number(bytes || 0));
    return {
      total: process.log.length,
      chunk: process.log.subarray(start).toString("utf8"),
    };
  }

  private broadcast<T extends AgentEventName>(
    id: string,
    event: T,
    data: AgentEventPayloadMap[T],
  ): void {
    const clients = this.subscribers.get(id);
    if (!clients) return;
    const payload = formatSse(event, data);
    for (const client of clients) {
      client.write(payload);
    }
  }

  stream(id: string, res: SseClient): void {
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    });
    const clients = this.subscribers.get(id) ?? new Set<SseClient>();
    if (!this.subscribers.has(id)) this.subscribers.set(id, clients);
    clients.add(res);
    if (typeof res.flushHeaders === "function") {
      try {
        res.flushHeaders();
      } catch {
        // ignore flush errors
      }
    }
    const state = this.procs.get(id);
    const replay = state?.log?.toString("utf8") ?? "";
    res.write(`event: hello\ndata: ${JSON.stringify({ id })}\n\n`);
    if (replay) {
      const tail = replay.slice(-8192);
      res.write(`event: replay\ndata: ${JSON.stringify({ text: tail })}\n\n`);
    }
    res.on("close", () => {
      const set = this.subscribers.get(id);
      if (!set) return;
      set.delete(res);
      if (!set.size) this.subscribers.delete(id);
    });
  }

  start({
    prompt,
    cwd = ROOT_PATH,
    env = {},
    tty = true,
  }: {
    prompt?: string;
    cwd?: string;
    env?: Record<string, string>;
    tty?: boolean;
  }): { id: string; pid: number | undefined } {
    const id = nanoid();
    const root = process.env.ROOT_PATH || ROOT_PATH;
    const args = [
      "exec",
      "--full-auto",
      "--cd",
      root,
      ...(prompt && String(prompt).trim() ? [String(prompt)] : []),
    ];
    const wantTty = tty || /^true$/i.test(process.env.AGENT_TTY || "false");
    const environment = mergeEnv(env);
    const spawnChild = wantTty
      ? () => {
          const quotedArgs = [
            shQuote(CODEX_BIN),
            "exec",
            "--full-auto",
            "--cd",
            shQuote(root),
          ]
            .concat(
              prompt && String(prompt).trim() ? [shQuote(String(prompt))] : [],
            )
            .join(" ");
          return this.spawnImpl("script", ["-qfec", quotedArgs, "/dev/null"], {
            cwd,
            env: environment,
            shell: false,
            stdio: ["pipe", "pipe", "pipe"],
          });
        }
      : () =>
          this.spawnImpl(CODEX_BIN, args, {
            cwd,
            env: environment,
            shell: USE_SHELL,
            stdio: ["pipe", "pipe", "pipe"],
          });
    const proc = spawnChild();
    const state: AgentProcessAgent = {
      id,
      cmd: CODEX_BIN,
      args,
      cwd,
      startedAt: Date.now(),
      exited: false,
      code: null,
      signal: null,
      paused_by_guard: false,
      log: Buffer.alloc(0),
      proc,
      mode: "agent",
      prompt: String(prompt ?? ""),
    };
    this.procs.set(id, state);
    const meta = toAgentMeta(state, state.prompt);
    initAgentMeta(meta).catch(() => {});

    const update = (
      updater: (current: AgentProcessAgent) => AgentProcessAgent,
    ) => {
      const current = this.procs.get(id);
      if (!current || current.mode !== "agent") return;
      this.procs.set(id, updater(current));
    };

    const publishOutput = (
      data: Buffer,
      event: Extract<AgentEventName, "stdout" | "stderr">,
    ) => {
      update((current) => ({
        ...current,
        log: ensureArrayBuffer(current.log, data),
      }));
      const text = data.toString("utf8");
      this.broadcast(id, event, { text });
      appendAgentLog(id, data).catch(() => {});
      const danger = matchDanger(text);
      if (!danger) return;
      const current = this.procs.get(id);
      if (!current || current.mode !== "agent" || guardPaused(current)) return;
      try {
        if (typeof proc.pid === "number") {
          this.killImpl(proc.pid, "SIGSTOP");
        }
      } catch {
        // ignore kill errors
      }
      update((existing) => ({ ...existing, paused_by_guard: true }));
      this.broadcast(id, "guard", { paused: true, reason: danger.source });
    };

    proc.stdout.on("data", (chunk: Buffer) => publishOutput(chunk, "stdout"));
    proc.stderr.on("data", (chunk: Buffer) => publishOutput(chunk, "stderr"));

    proc.on("error", (error: NodeJS.ErrnoException) => {
      const message = `[spawn error] ${createErrorMessage(error)}\n`;
      update((current) => ({
        ...current,
        log: ensureArrayBuffer(current.log, message),
        exited: true,
        code: null,
        signal: "ERROR",
      }));
      appendAgentLog(id, message).catch(() => {});
      this.broadcast(id, "error", { message: createErrorMessage(error) });
      updateAgentMeta(id, {
        exited: true,
        code: null,
        signal: "ERROR",
        finishedAt: Date.now(),
      }).catch(() => {});
    });

    proc.on("exit", (code: number | null, signal: NodeJS.Signals | null) => {
      update((current) => ({
        ...current,
        exited: true,
        code: code ?? null,
        signal: signal ?? null,
      }));
      this.broadcast(id, "exit", {
        code: code ?? null,
        signal: signal ?? null,
      });
      updateAgentMeta(id, {
        exited: true,
        code: code ?? null,
        signal: signal ?? null,
        finishedAt: Date.now(),
      }).catch(() => {});
    });

    return { id, pid: proc.pid };
  }

  send(id: string, input: string): boolean {
    const process = this.procs.get(id);
    if (!process || process.mode !== "agent" || process.exited || !process.proc)
      return false;
    try {
      process.proc.stdin.write(`${String(input)}\n`);
      return true;
    } catch {
      return false;
    }
  }

  interrupt(id: string): boolean {
    const process = this.procs.get(id);
    if (!process || process.mode !== "agent" || process.exited || !process.proc)
      return false;
    if (typeof process.proc.pid !== "number") return false;
    try {
      this.killImpl(process.proc.pid, "SIGINT");
      return true;
    } catch {
      return false;
    }
  }

  kill(id: string, force = false): boolean {
    const process = this.procs.get(id);
    if (!process || process.mode !== "agent" || process.exited || !process.proc)
      return false;
    if (typeof process.proc.pid !== "number") return false;
    try {
      this.killImpl(process.proc.pid, force ? "SIGKILL" : "SIGTERM");
      return true;
    } catch {
      return false;
    }
  }

  resume(id: string): boolean {
    const process = this.procs.get(id);
    if (
      !process ||
      process.mode !== "agent" ||
      !process.proc ||
      !process.paused_by_guard
    )
      return false;
    if (typeof process.proc.pid !== "number") return false;
    try {
      this.killImpl(process.proc.pid, "SIGCONT");
      this.procs.set(id, { ...process, paused_by_guard: false });
      this.broadcast(id, "guard", { paused: false });
      return true;
    } catch {
      return false;
    }
  }
}

export const supervisor = new AgentSupervisor();

export class PTYAgentSupervisor {
  readonly procs: Map<string, AgentProcess>;
  readonly subscribers: Map<string, Set<SseClient>>;
  private readonly killImpl: KillFunction;

  constructor(opts: { killImpl?: KillFunction } = {}) {
    this.procs = new Map();
    this.subscribers = new Map();
    this.killImpl =
      opts.killImpl ?? ((pid, signal) => process.kill(pid, signal));
  }

  list(): AgentSummary[] {
    return Array.from(this.procs.values()).map(describeProcess);
  }

  status(id: string): AgentSummary | null {
    const process = this.procs.get(id);
    if (!process) return null;
    return describeProcess(process);
  }

  logs(id: string, since = 0): { total: number; chunk: string } | null {
    const process = this.procs.get(id);
    if (!process) return null;
    const from = Math.max(0, Math.min(since, process.log.length));
    return {
      total: process.log.length,
      chunk: process.log.subarray(from).toString("utf8"),
    };
  }

  tail(id: string, bytes = 8192): { total: number; chunk: string } | null {
    const process = this.procs.get(id);
    if (!process) return null;
    const start = Math.max(0, process.log.length - Number(bytes || 0));
    return {
      total: process.log.length,
      chunk: process.log.subarray(start).toString("utf8"),
    };
  }

  private broadcast<T extends AgentEventName>(
    id: string,
    event: T,
    data: AgentEventPayloadMap[T],
  ): void {
    const clients = this.subscribers.get(id);
    if (!clients) return;
    const payload = formatSse(
      event,
      data as AgentEventPayloadMap[AgentEventName],
    );
    for (const client of clients) {
      client.write(payload);
    }
  }

  stream(id: string, res: SseClient): void {
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    });
    const clients = this.subscribers.get(id) ?? new Set<SseClient>();
    if (!this.subscribers.has(id)) this.subscribers.set(id, clients);
    clients.add(res);
    if (typeof res.flushHeaders === "function") {
      try {
        res.flushHeaders();
      } catch {
        // ignore flush errors
      }
    }
    const state = this.procs.get(id);
    const replay = state?.log?.toString("utf8") ?? "";
    res.write(`event: hello\ndata: ${JSON.stringify({ id })}\n\n`);
    if (replay) {
      const tail = replay.slice(-8192);
      res.write(`event: replay\ndata: ${JSON.stringify({ text: tail })}\n\n`);
    }
    res.on("close", () => {
      const set = this.subscribers.get(id);
      if (!set) return;
      set.delete(res);
      if (!set.size) this.subscribers.delete(id);
    });
  }

  async start({
    prompt,
    cwd = ROOT_PATH,
    env = {},
    cols = 120,
    rows = 32,
  }: {
    prompt?: string;
    cwd?: string;
    env?: Record<string, string>;
    cols?: number;
    rows?: number;
  }): Promise<{ id: string; pid: number | undefined }> {
    const pty = await getPtyLib();
    const id = nanoid();
    const root = process.env.ROOT_PATH || ROOT_PATH;
    const args = [
      "exec",
      "--full-auto",
      "--cd",
      root,
      ...(prompt && String(prompt).trim() ? [String(prompt)] : []),
    ];
    const proc = pty.spawn(CODEX_BIN, args, {
      name: "xterm-color",
      cols: Number(cols || 120),
      rows: Number(rows || 32),
      cwd,
      env: mergeEnv(env),
    });
    const state: AgentProcessPty = {
      id,
      cmd: CODEX_BIN,
      args,
      cwd,
      startedAt: Date.now(),
      exited: false,
      code: null,
      signal: null,
      paused_by_guard: false,
      log: Buffer.alloc(0),
      proc,
      cols: Number(cols || 120),
      rows: Number(rows || 32),
      mode: "pty",
      prompt: String(prompt ?? ""),
    };
    this.procs.set(id, state);
    const meta = toAgentMeta(state, state.prompt);
    initAgentMeta({ ...meta, cols: state.cols, rows: state.rows }).catch(
      () => {},
    );

    const update = (updater: (current: AgentProcessPty) => AgentProcessPty) => {
      const current = this.procs.get(id);
      if (!current || current.mode !== "pty") return;
      this.procs.set(id, updater(current));
    };

    proc.onData((data: string) => {
      update((current) => ({
        ...current,
        log: ensureArrayBuffer(current.log, data),
      }));
      this.broadcast(id, "stdout", { text: data });
      appendAgentLog(id, data).catch(() => {});
      const danger = matchDanger(data);
      if (!danger) return;
      const current = this.procs.get(id);
      if (!current || current.mode !== "pty" || guardPaused(current)) return;
      try {
        if (typeof proc.pid === "number") {
          this.killImpl(proc.pid, "SIGSTOP");
        }
      } catch {
        // ignore kill errors
      }
      update((existing) => ({ ...existing, paused_by_guard: true }));
      this.broadcast(id, "guard", { paused: true, reason: danger.source });
    });

    proc.onExit((event) => {
      const { exitCode, signal } = event;
      update((current) => ({
        ...current,
        exited: true,
        code: exitCode ?? null,
        signal: (signal as string | number | undefined)?.toString() ?? null,
      }));
      this.broadcast(id, "exit", {
        code: exitCode ?? null,
        signal: (signal as string | number | undefined)?.toString() ?? null,
      });
      updateAgentMeta(id, {
        exited: true,
        code: exitCode ?? null,
        signal: (signal as string | number | undefined)?.toString() ?? null,
        finishedAt: Date.now(),
      }).catch(() => {});
    });

    return { id, pid: proc.pid };
  }

  write(id: string, input: string): boolean {
    const process = this.procs.get(id);
    if (!process || process.mode !== "pty" || process.exited || !process.proc)
      return false;
    try {
      process.proc.write(String(input));
      return true;
    } catch {
      return false;
    }
  }

  send(id: string, input: string): boolean {
    return this.write(id, `${String(input)}\r`);
  }

  resize(id: string, cols: number, rows: number): boolean {
    const process = this.procs.get(id);
    if (!process || process.mode !== "pty" || process.exited || !process.proc)
      return false;
    try {
      process.proc.resize(
        Number(cols || process.cols),
        Number(rows || process.rows),
      );
      this.procs.set(id, {
        ...process,
        cols: Number(cols || process.cols),
        rows: Number(rows || process.rows),
      });
      return true;
    } catch {
      return false;
    }
  }

  interrupt(id: string): boolean {
    const process = this.procs.get(id);
    if (!process || process.mode !== "pty" || process.exited || !process.proc)
      return false;
    if (typeof process.proc.pid !== "number") return false;
    try {
      this.killImpl(process.proc.pid, "SIGINT");
      return true;
    } catch {
      return false;
    }
  }

  kill(id: string, force = false): boolean {
    const process = this.procs.get(id);
    if (!process || process.mode !== "pty" || process.exited || !process.proc)
      return false;
    if (typeof process.proc.pid !== "number") return false;
    try {
      this.killImpl(process.proc.pid, force ? "SIGKILL" : "SIGTERM");
      return true;
    } catch {
      return false;
    }
  }

  resume(id: string): boolean {
    const process = this.procs.get(id);
    if (
      !process ||
      process.mode !== "pty" ||
      !process.proc ||
      !process.paused_by_guard
    )
      return false;
    if (typeof process.proc.pid !== "number") return false;
    try {
      this.killImpl(process.proc.pid, "SIGCONT");
      this.procs.set(id, { ...process, paused_by_guard: false });
      this.broadcast(id, "guard", { paused: false });
      return true;
    } catch {
      return false;
    }
  }
}

export const ptySupervisor = new PTYAgentSupervisor();

export async function restoreAgentsFromStore(): Promise<void> {
  const allow =
    String(process.env.AGENT_RESTORE_ON_START || "true") !== "false";
  if (!allow) return;
  const metas = await listAgentMetas();
  await Promise.all(
    metas.map(async (meta) => {
      const collection = meta.mode === "pty" ? ptySupervisor : supervisor;
      if (collection.procs.has(meta.id)) return;
      const logTail = await readAgentLogTail(
        meta.id,
        Number(process.env.AGENT_RESTORE_TAIL || 65536),
      );
      const buffer = Buffer.from(logTail || "", "utf8");
      const log =
        buffer.length > 0
          ? buffer.subarray(Math.max(0, buffer.length - MAX_LOG_BYTES))
          : Buffer.alloc(0);
      const baseProcess = {
        id: meta.id,
        cmd: meta.cmd || CODEX_BIN,
        args: Array.isArray(meta.args) ? meta.args : [],
        cwd: meta.cwd || process.env.ROOT_PATH || process.cwd(),
        startedAt: meta.startedAt || Date.now(),
        exited: true,
        code: meta.code ?? null,
        signal: meta.signal ?? "RESTORED",
        paused_by_guard: false,
        log,
        prompt: meta.prompt || "",
      };
      if (meta.mode === "pty") {
        const state: AgentProcessPty = {
          ...baseProcess,
          mode: "pty",
          proc: null,
          cols: meta.cols ?? 120,
          rows: meta.rows ?? 32,
        };
        collection.procs.set(meta.id, state);
      } else {
        const state: AgentProcessAgent = {
          ...baseProcess,
          mode: "agent",
          proc: null,
        };
        collection.procs.set(meta.id, state);
      }
    }),
  );
}

export function createSupervisor(opts?: {
  spawnImpl?: SpawnFunction;
  killImpl?: KillFunction;
}): AgentSupervisor {
  return new AgentSupervisor(opts);
}

// SPDX-License-Identifier: GPL-3.0-only
// @ts-nocheck
import { spawn as defaultSpawn } from "child_process";
import { nanoid } from "nanoid";
import {
  initAgentMeta,
  updateAgentMeta,
  appendAgentLog,
  listAgentMetas,
  readAgentLogTail,
} from "./store.js";

const ROOT_PATH = process.env.ROOT_PATH || process.cwd();
const CODEX_BIN = process.env.CODEX_BIN || "codex";
// We exclusively run: codex exec --full-auto --cd ROOT_PATH "<prompt>"
const MAX_LOG_BYTES = Number(process.env.AGENT_MAX_LOG_BYTES || 512 * 1024);
const USE_SHELL = /^true$/i.test(process.env.AGENT_SHELL || "false");

const DANGER_PATTERNS = [
  /rm\s+-rf\s+\/(?!home)/i,
  /\bDROP\s+DATABASE\b/i,
  /\bmkfs\w*\s+\/dev\//i,
  /\bshutdown\b|\breboot\b/i,
  /\bchmod\s+777\b/i,
];

function ringPush(buf, chunk) {
  const slice = Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk));
  const combined = Buffer.concat([buf, slice]);
  if (combined.length <= MAX_LOG_BYTES) return combined;
  return combined.subarray(combined.length - MAX_LOG_BYTES);
}
function matchDanger(s) {
  return DANGER_PATTERNS.find((rx) => rx.test(s));
}
// Escapes ONLY the chosen quote char inside, then wraps with it.
// POSIX-safe: produces a single shell *argument*.
// Works for bash/zsh/dash; prevents globbing, $ expansion, etc.
function shQuote(s) {
  const str = String(s);
  if (str.length === 0) return "''";
  return `'${str.replace(/'/g, `'\''`)}'`;
}

export class AgentSupervisor {
  constructor(opts = {}) {
    this.procs = new Map();
    this.subscribers = new Map();
    this._spawn = opts.spawnImpl || defaultSpawn;
    this._kill = opts.killImpl || ((pid, signal) => process.kill(pid, signal));
  }
  list() {
    return Array.from(this.procs.values()).map((p) => ({
      id: p.id,
      cmd: p.cmd,
      args: p.args,
      cwd: p.cwd,
      startedAt: p.startedAt,
      exited: p.exited,
      code: p.code,
      signal: p.signal,
      paused_by_guard: p.paused_by_guard,
      bytes: p.log.length,
    }));
  }
  status(id) {
    const p = this.procs.get(id);
    if (!p) return null;
    return {
      id: p.id,
      cmd: p.cmd,
      args: p.args,
      cwd: p.cwd,
      startedAt: p.startedAt,
      exited: p.exited,
      code: p.code,
      signal: p.signal,
      paused_by_guard: p.paused_by_guard,
      bytes: p.log.length,
    };
  }
  logs(id, since = 0) {
    const p = this.procs.get(id);
    if (!p) return null;
    const buf = p.log;
    const from = Math.max(0, Math.min(since, buf.length));
    return { total: buf.length, chunk: buf.subarray(from).toString("utf8") };
  }
  tail(id, bytes = 8192) {
    const p = this.procs.get(id);
    if (!p) return null;
    const buf = p.log;
    const start = Math.max(0, buf.length - Number(bytes || 0));
    return { total: buf.length, chunk: buf.subarray(start).toString("utf8") };
  }
  _broadcast(id, event, data) {
    const subs = this.subscribers.get(id);
    if (!subs) return;
    const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
    for (const res of subs) {
      res.write(payload);
    }
  }
  stream(id, res) {
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    });
    if (!this.subscribers.has(id)) this.subscribers.set(id, new Set());
    this.subscribers.get(id).add(res);
    // flush headers for some proxies
    if (typeof res.flushHeaders === "function")
      try {
        res.flushHeaders();
      } catch {}
    // greet and replay current buffer so late subscribers see context
    const state = this.procs.get(id);
    const replay = state?.log?.toString("utf8") || "";
    res.write(`event: hello\ndata: ${JSON.stringify({ id })}\n\n`);
    if (replay) {
      res.write(
        `event: replay\ndata: ${JSON.stringify({
          text: replay.slice(-8192),
        })}\n\n`,
      );
    }
    res.on("close", () => {
      const set = this.subscribers.get(id);
      if (set) {
        set.delete(res);
        if (!set.size) this.subscribers.delete(id);
      }
    });
  }
  start({
    prompt,
    args = [],
    cwd = ROOT_PATH,
    env = {},
    auto = true,
    tty = true,
  }) {
    const id = nanoid();
    const root = process.env.ROOT_PATH || ROOT_PATH;
    const fullArgs = ["exec", "--full-auto", "--cd", root];
    if (prompt && String(prompt).trim()) fullArgs.push(String(prompt));
    const wantTty = tty || /^true$/i.test(process.env.AGENT_TTY || "false");
    let proc;
    if (wantTty) {
      // Use 'script' to allocate a PTY so child sees a TTY
      const cmd = [
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
      const argv = ["-qfec", cmd, "/dev/null"];
      proc = this._spawn("script", argv, {
        cwd,
        env: { ...process.env, CI: "1", GIT_TERMINAL_PROMPT: "0", ...env },
        shell: false,
        stdio: ["pipe", "pipe", "pipe"],
      });
    } else {
      proc = this._spawn(CODEX_BIN, fullArgs, {
        cwd,
        env: { ...process.env, CI: "1", GIT_TERMINAL_PROMPT: "0", ...env },
        shell: USE_SHELL,
        stdio: ["pipe", "pipe", "pipe"],
      });
    }
    const state = {
      id,
      cmd: CODEX_BIN,
      args: fullArgs,
      cwd,
      startedAt: Date.now(),
      exited: false,
      code: null,
      signal: null,
      paused_by_guard: false,
      log: Buffer.alloc(0),
      proc,
      mode: "agent",
      prompt: String(prompt || ""),
    };
    this.procs.set(id, state);
    // persist metadata
    initAgentMeta({
      id,
      mode: "agent",
      cmd: CODEX_BIN,
      args: fullArgs,
      cwd,
      startedAt: state.startedAt,
      prompt: state.prompt,
    }).catch(() => {});
    const onData = (data, stream) => {
      state.log = ringPush(state.log, data);
      const text = data.toString("utf8");
      this._broadcast(id, stream, { text });
      appendAgentLog(id, data).catch(() => {});
      const m = matchDanger(text);
      if (m && !state.paused_by_guard) {
        try {
          this._kill(proc.pid, "SIGSTOP");
          state.paused_by_guard = true;
        } catch {}
        this._broadcast(id, "guard", { paused: true, reason: m.source });
      }
    };
    proc.stdout.on("data", (d) => onData(d, "stdout"));
    proc.stderr.on("data", (d) => onData(d, "stderr"));
    proc.on("error", (err) => {
      const msg = `[spawn error] ${String((err && err.message) || err)}\n`;
      state.log = ringPush(state.log, msg);
      appendAgentLog(id, msg).catch(() => {});
      this._broadcast(id, "error", { message: String(err?.message || err) });
      // mark as exited to avoid dangling entries
      state.exited = true;
      state.code = null;
      state.signal = "ERROR";
      updateAgentMeta(id, {
        exited: true,
        code: null,
        signal: "ERROR",
        finishedAt: Date.now(),
      }).catch(() => {});
    });
    proc.on("exit", (code, signal) => {
      state.exited = true;
      state.code = code;
      state.signal = signal;
      this._broadcast(id, "exit", { code, signal });
      updateAgentMeta(id, {
        exited: true,
        code,
        signal,
        finishedAt: Date.now(),
      }).catch(() => {});
    });
    // We pass the prompt as argument to codex exec; no stdin writes.
    return { id, pid: proc.pid };
  }
  send(id, input) {
    const p = this.procs.get(id);
    if (!p || p.exited) return false;
    try {
      p.proc.stdin.write(String(input) + "\n");
      return true;
    } catch {
      return false;
    }
  }
  interrupt(id) {
    const p = this.procs.get(id);
    if (!p || p.exited) return false;
    try {
      this._kill(p.proc.pid, "SIGINT");
      return true;
    } catch {
      return false;
    }
  }
  kill(id, force = false) {
    const p = this.procs.get(id);
    if (!p || p.exited) return false;
    try {
      this._kill(p.proc.pid, force ? "SIGKILL" : "SIGTERM");
      return true;
    } catch {
      return false;
    }
  }
  resume(id) {
    const p = this.procs.get(id);
    if (!p || !p.paused_by_guard) return false;
    try {
      this._kill(p.proc.pid, "SIGCONT");
      p.paused_by_guard = false;
      this._broadcast(id, "guard", { paused: false });
      return true;
    } catch {
      return false;
    }
  }
}
export const supervisor = new AgentSupervisor();

// --- PTY-backed supervisor using node-pty (lazy loaded) ---
let PTY_LIB = null;
async function getPtyLib() {
  if (process.env.NODE_PTY_DISABLED === "1") {
    const err = new Error("PTY_UNAVAILABLE");
    err.name = "PTY_UNAVAILABLE";
    throw err;
  }
  if (PTY_LIB) return PTY_LIB;
  try {
    const mod = await import("node-pty");
    // node-pty may export default or named
    PTY_LIB = mod.default || mod;
    return PTY_LIB;
  } catch (e) {
    const err = new Error("PTY_UNAVAILABLE");
    err.name = "PTY_UNAVAILABLE";
    throw err;
  }
}

export class PTYAgentSupervisor {
  constructor(opts = {}) {
    this.procs = new Map();
    this.subscribers = new Map();
    this._kill = opts.killImpl || ((pid, signal) => process.kill(pid, signal));
  }
  list() {
    return Array.from(this.procs.values()).map((p) => ({
      id: p.id,
      cmd: p.cmd,
      args: p.args,
      cwd: p.cwd,
      startedAt: p.startedAt,
      exited: p.exited,
      code: p.code,
      signal: p.signal,
      paused_by_guard: p.paused_by_guard,
      bytes: p.log.length,
      cols: p.cols,
      rows: p.rows,
    }));
  }
  status(id) {
    const p = this.procs.get(id);
    if (!p) return null;
    return {
      id: p.id,
      cmd: p.cmd,
      args: p.args,
      cwd: p.cwd,
      startedAt: p.startedAt,
      exited: p.exited,
      code: p.code,
      signal: p.signal,
      paused_by_guard: p.paused_by_guard,
      bytes: p.log.length,
      cols: p.cols,
      rows: p.rows,
    };
  }
  logs(id, since = 0) {
    const p = this.procs.get(id);
    if (!p) return null;
    const buf = p.log;
    const from = Math.max(0, Math.min(since, buf.length));
    return { total: buf.length, chunk: buf.subarray(from).toString("utf8") };
  }
  tail(id, bytes = 8192) {
    const p = this.procs.get(id);
    if (!p) return null;
    const buf = p.log;
    const start = Math.max(0, buf.length - Number(bytes || 0));
    return { total: buf.length, chunk: buf.subarray(start).toString("utf8") };
  }
  _broadcast(id, event, data) {
    const subs = this.subscribers.get(id);
    if (!subs) return;
    const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
    for (const res of subs) res.write(payload);
  }
  stream(id, res) {
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    });
    if (!this.subscribers.has(id)) this.subscribers.set(id, new Set());
    this.subscribers.get(id).add(res);
    if (typeof res.flushHeaders === "function")
      try {
        res.flushHeaders();
      } catch {}
    const state = this.procs.get(id);
    const replay = state?.log?.toString("utf8") || "";
    res.write(`event: hello\ndata: ${JSON.stringify({ id })}\n\n`);
    if (replay)
      res.write(
        `event: replay\ndata: ${JSON.stringify({
          text: replay.slice(-8192),
        })}\n\n`,
      );
    res.on("close", () => {
      const set = this.subscribers.get(id);
      if (set) {
        set.delete(res);
        if (!set.size) this.subscribers.delete(id);
      }
    });
  }
  async start({ prompt, cwd = ROOT_PATH, env = {}, cols = 120, rows = 32 }) {
    const pty = await getPtyLib();
    const id = nanoid();
    const root = process.env.ROOT_PATH || ROOT_PATH;
    const args = ["exec", "--full-auto", "--cd", root];
    if (prompt && String(prompt).trim()) args.push(String(prompt));
    const proc = pty.spawn(CODEX_BIN, args, {
      name: "xterm-color",
      cols: Number(cols || 120),
      rows: Number(rows || 32),
      cwd,
      env: { ...process.env, CI: "1", GIT_TERMINAL_PROMPT: "0", ...env },
    });
    const state = {
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
      prompt: String(prompt || ""),
    };
    this.procs.set(id, state);
    initAgentMeta({
      id,
      mode: "pty",
      cmd: CODEX_BIN,
      args,
      cwd,
      startedAt: state.startedAt,
      prompt: state.prompt,
      cols: state.cols,
      rows: state.rows,
    }).catch(() => {});
    proc.onData((data) => {
      state.log = ringPush(state.log, data);
      this._broadcast(id, "stdout", { text: data });
      appendAgentLog(id, data).catch(() => {});
      const m = matchDanger(data);
      if (m && !state.paused_by_guard) {
        try {
          this._kill(proc.pid, "SIGSTOP");
          state.paused_by_guard = true;
        } catch {}
        this._broadcast(id, "guard", { paused: true, reason: m.source });
      }
    });
    proc.onExit(({ exitCode, signal }) => {
      state.exited = true;
      state.code = exitCode;
      state.signal = signal;
      this._broadcast(id, "exit", { code: exitCode, signal });
      updateAgentMeta(id, {
        exited: true,
        code: exitCode,
        signal,
        finishedAt: Date.now(),
      }).catch(() => {});
    });
    return { id, pid: proc.pid };
  }
  write(id, input) {
    const p = this.procs.get(id);
    if (!p || p.exited) return false;
    try {
      p.proc.write(String(input));
      return true;
    } catch {
      return false;
    }
  }
  send(id, input) {
    return this.write(id, String(input) + "\r");
  }
  resize(id, cols, rows) {
    const p = this.procs.get(id);
    if (!p || p.exited) return false;
    try {
      p.proc.resize(Number(cols || p.cols), Number(rows || p.rows));
      p.cols = Number(cols || p.cols);
      p.rows = Number(rows || p.rows);
      return true;
    } catch {
      return false;
    }
  }
  interrupt(id) {
    const p = this.procs.get(id);
    if (!p || p.exited) return false;
    try {
      this._kill(p.proc.pid, "SIGINT");
      return true;
    } catch {
      return false;
    }
  }
  kill(id, force = false) {
    const p = this.procs.get(id);
    if (!p || p.exited) return false;
    try {
      this._kill(p.proc.pid, force ? "SIGKILL" : "SIGTERM");
      return true;
    } catch {
      return false;
    }
  }
  resume(id) {
    const p = this.procs.get(id);
    if (!p || !p.paused_by_guard) return false;
    try {
      this._kill(p.proc.pid, "SIGCONT");
      p.paused_by_guard = false;
      this._broadcast(id, "guard", { paused: false });
      return true;
    } catch {
      return false;
    }
  }
}
export const ptySupervisor = new PTYAgentSupervisor();

// Restore previously persisted agents as historical entries (exited) on boot
export async function restoreAgentsFromStore() {
  const allow =
    String(process.env.AGENT_RESTORE_ON_START || "true") !== "false";
  if (!allow) return;
  const metas = await listAgentMetas();
  for (const meta of metas) {
    const exists = (meta.mode === "pty" ? ptySupervisor : supervisor).procs.has(
      meta.id,
    );
    if (exists) continue;
    const logTail = await readAgentLogTail(
      meta.id,
      Number(process.env.AGENT_RESTORE_TAIL || 65536),
    );
    const buf = Buffer.from(logTail || "", "utf8");
    const base = {
      id: meta.id,
      cmd: meta.cmd || CODEX_BIN,
      args: Array.isArray(meta.args) ? meta.args : [],
      cwd: meta.cwd || process.env.ROOT_PATH || process.cwd(),
      startedAt: meta.startedAt || Date.now(),
      exited: true,
      code: meta.code ?? null,
      signal: meta.signal || "RESTORED",
      paused_by_guard: false,
      log:
        buf.length > 0
          ? buf.subarray(Math.max(0, buf.length - MAX_LOG_BYTES))
          : Buffer.alloc(0),
      proc: null,
      prompt: meta.prompt || "",
    };
    if (meta.mode === "pty") {
      ptySupervisor.procs.set(meta.id, {
        ...base,
        mode: "pty",
        cols: meta.cols || 120,
        rows: meta.rows || 32,
      });
    } else {
      supervisor.procs.set(meta.id, { ...base, mode: "agent" });
    }
  }
}
export function createSupervisor(opts) {
  return new AgentSupervisor(opts);
}

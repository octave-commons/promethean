// @ts-nocheck
import { getPty, PtyUnavailableError } from "./lib/pty.js";
import { nanoid } from "nanoid";
import fs from "fs";
import path from "path";

// ESM-safe __dirname
const __dirname = path.dirname(new URL(import.meta.url).pathname);

// Agent log storage
class LogBuffer {
  constructor(limitBytes = 1024 * 1024) {
    this.limitBytes = limitBytes;
    this.buffer = Buffer.alloc(0);
  }

  push(data) {
    const chunk = Buffer.from(data, "utf8");
    this.buffer = Buffer.concat([this.buffer, chunk]);
    if (this.buffer.length > this.limitBytes) {
      this.buffer = this.buffer.slice(this.buffer.length - this.limitBytes);
    }
  }

  tail(bytes = 8192) {
    return this.buffer
      .slice(Math.max(0, this.buffer.length - bytes))
      .toString("utf8");
  }

  dump() {
    return this.buffer.toString("utf8");
  }
}

export class AgentSupervisor {
  constructor({ cwd = process.cwd(), logDir = ".logs", sandbox = false } = {}) {
    this.cwd = cwd;
    this.logDir = logDir;
    this.sandbox = sandbox; // can be false | 'nsjail'
    this.procs = new Map();
    this.subscribers = {};

    if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
  }

  start({ prompt, tty = true, env = {}, bypassApprovals = false }) {
    const id = nanoid();
    const logBuffer = new LogBuffer();
    const logfile = path.join(this.logDir, `${id}.log`);
    const logStream = fs.createWriteStream(logfile, { flags: "a" });

    let cmd;
    let args;

    if (this.sandbox === "nsjail") {
      const nsjailBin = "/usr/bin/nsjail";
      const sandboxCfg = path.resolve(__dirname, "../sandbox.cfg");

      // Inner command is codex CLI with or without bypass approvals
      const codexArgs = [
        "exec",
        bypassApprovals ? "--dangerously-bypass-approvals" : "--full-auto",
        "--cd",
        this.cwd,
        prompt,
      ];

      cmd = nsjailBin;
      args = ["--config", sandboxCfg, "--", "codex", ...codexArgs];
    } else {
      cmd = "codex";
      args = [
        "exec",
        bypassApprovals ? "--dangerously-bypass-approvals" : "--full-auto",
        "--cd",
        this.cwd,
        prompt,
      ];
    }

    const pty = getPty();
    if (!pty) {
      throw new PtyUnavailableError();
    }
    const proc = pty.spawn(cmd, args, {
      cwd: this.cwd,
      cols: 80,
      rows: 30,
      env: {
        ...process.env,
        CI: "1",
        GIT_TERMINAL_PROMPT: "0",
        ...env,
      },
    });

    proc.onData((data) => {
      logBuffer.push(data);
      logStream.write(data);
      this.emit(id, data);
    });

    proc.onExit(({ exitCode, signal }) => {
      this.procs.set(id, {
        ...this.procs.get(id),
        exited: true,
        code: exitCode,
        signal,
      });
      logStream.end();
    });

    this.procs.set(id, {
      id,
      proc,
      prompt,
      startedAt: Date.now(),
      logBuffer,
      logfile,
      exited: false,
      sandbox: this.sandbox,
      bypassApprovals,
    });

    return id;
  }

  send(id, input) {
    const agent = this.procs.get(id);
    if (!agent || agent.exited) throw new Error("Agent not running");
    agent.proc.write(input + "\n");
  }

  logs(id, bytes = 8192) {
    const agent = this.procs.get(id);
    if (!agent) throw new Error("No such agent");
    return agent.logBuffer.tail(bytes);
  }

  kill(id) {
    const agent = this.procs.get(id);
    if (!agent || agent.exited) return false;
    agent.proc.kill();
    return true;
  }

  status(id) {
    const agent = this.procs.get(id);
    if (!agent) return null;
    return {
      id: agent.id,
      prompt: agent.prompt,
      startedAt: agent.startedAt,
      exited: agent.exited,
      logfile: agent.logfile,
      sandbox: agent.sandbox,
      bypassApprovals: agent.bypassApprovals,
    };
  }

  // Simple subscriber pattern (replace with WS later)
  on(id, handler) {
    if (!this.subscribers) this.subscribers = {};
    if (!this.subscribers[id]) this.subscribers[id] = [];
    this.subscribers[id].push(handler);
  }

  off(id, handler) {
    const list = this.subscribers?.[id];
    if (!list) return;
    const idx = list.indexOf(handler);
    if (idx >= 0) list.splice(idx, 1);
    if (list.length === 0) delete this.subscribers[id];
  }

  emit(id, data) {
    if (!this.subscribers || !this.subscribers[id]) return;
    for (const fn of this.subscribers[id]) fn(data);
  }
}

export default AgentSupervisor;

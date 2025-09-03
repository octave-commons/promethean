// SPDX-License-Identifier: GPL-3.0-only
"use strict";
var __assign =
  (this && this.__assign) ||
  function () {
    __assign =
      Object.assign ||
      function (t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s)
            if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
      };
    return __assign.apply(this, arguments);
  };
var __spreadArray =
  (this && this.__spreadArray) ||
  function (to, from, pack) {
    if (pack || arguments.length === 2)
      for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
          if (!ar) ar = Array.prototype.slice.call(from, 0, i);
          ar[i] = from[i];
        }
      }
    return to.concat(ar || Array.prototype.slice.call(from));
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentSupervisor = void 0;
// @ts-nocheck
var pty_js_1 = require("./lib/pty.js");
var nanoid_1 = require("nanoid");
var fs_1 = require("fs");
var path_1 = require("path");
// ESM-safe __dirname
var __dirname = path_1.default.dirname(new URL(import.meta.url).pathname);
// Agent log storage
var LogBuffer = /** @class */ (function () {
  function LogBuffer(limitBytes) {
    if (limitBytes === void 0) {
      limitBytes = 1024 * 1024;
    }
    this.limitBytes = limitBytes;
    this.buffer = Buffer.alloc(0);
  }
  LogBuffer.prototype.push = function (data) {
    var chunk = Buffer.from(data, "utf8");
    this.buffer = Buffer.concat([this.buffer, chunk]);
    if (this.buffer.length > this.limitBytes) {
      this.buffer = this.buffer.slice(this.buffer.length - this.limitBytes);
    }
  };
  LogBuffer.prototype.tail = function (bytes) {
    if (bytes === void 0) {
      bytes = 8192;
    }
    return this.buffer
      .slice(Math.max(0, this.buffer.length - bytes))
      .toString("utf8");
  };
  LogBuffer.prototype.dump = function () {
    return this.buffer.toString("utf8");
  };
  return LogBuffer;
})();
var AgentSupervisor = /** @class */ (function () {
  function AgentSupervisor(_a) {
    var _b = _a === void 0 ? {} : _a,
      _c = _b.cwd,
      cwd = _c === void 0 ? process.cwd() : _c,
      _d = _b.logDir,
      logDir = _d === void 0 ? ".logs" : _d,
      _e = _b.sandbox,
      sandbox = _e === void 0 ? false : _e;
    this.cwd = cwd;
    this.logDir = logDir;
    this.sandbox = sandbox; // can be false | 'nsjail'
    this.procs = new Map();
    this.subscribers = {};
    if (!fs_1.default.existsSync(logDir))
      fs_1.default.mkdirSync(logDir, { recursive: true });
  }
  AgentSupervisor.prototype.start = function (_a) {
    var _this = this;
    var prompt = _a.prompt,
      _b = _a.tty,
      tty = _b === void 0 ? true : _b,
      _c = _a.env,
      env = _c === void 0 ? {} : _c,
      _d = _a.bypassApprovals,
      bypassApprovals = _d === void 0 ? false : _d;
    var id = (0, nanoid_1.nanoid)();
    var logBuffer = new LogBuffer();
    var logfile = path_1.default.join(this.logDir, "".concat(id, ".log"));
    var logStream = fs_1.default.createWriteStream(logfile, { flags: "a" });
    var cmd;
    var args;
    if (this.sandbox === "nsjail") {
      var nsjailBin = "/usr/bin/nsjail";
      var sandboxCfg = path_1.default.resolve(__dirname, "../sandbox.cfg");
      // Inner command is codex CLI with or without bypass approvals
      var codexArgs = [
        "exec",
        bypassApprovals ? "--dangerously-bypass-approvals" : "--full-auto",
        "--cd",
        this.cwd,
        prompt,
      ];
      cmd = nsjailBin;
      args = __spreadArray(
        ["--config", sandboxCfg, "--", "codex"],
        codexArgs,
        true,
      );
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
    var pty = (0, pty_js_1.getPty)();
    if (!pty) {
      throw new pty_js_1.PtyUnavailableError();
    }
    var proc = pty.spawn(cmd, args, {
      cwd: this.cwd,
      cols: 80,
      rows: 30,
      env: __assign(
        __assign(__assign({}, process.env), {
          CI: "1",
          GIT_TERMINAL_PROMPT: "0",
        }),
        env,
      ),
    });
    proc.onData(function (data) {
      logBuffer.push(data);
      logStream.write(data);
      _this.emit(id, data);
    });
    proc.onExit(function (_a) {
      var exitCode = _a.exitCode,
        signal = _a.signal;
      _this.procs.set(
        id,
        __assign(__assign({}, _this.procs.get(id)), {
          exited: true,
          code: exitCode,
          signal: signal,
        }),
      );
      logStream.end();
    });
    this.procs.set(id, {
      id: id,
      proc: proc,
      prompt: prompt,
      startedAt: Date.now(),
      logBuffer: logBuffer,
      logfile: logfile,
      exited: false,
      sandbox: this.sandbox,
      bypassApprovals: bypassApprovals,
    });
    return id;
  };
  AgentSupervisor.prototype.send = function (id, input) {
    var agent = this.procs.get(id);
    if (!agent || agent.exited) throw new Error("Agent not running");
    agent.proc.write(input + "\n");
  };
  AgentSupervisor.prototype.logs = function (id, bytes) {
    if (bytes === void 0) {
      bytes = 8192;
    }
    var agent = this.procs.get(id);
    if (!agent) throw new Error("No such agent");
    return agent.logBuffer.tail(bytes);
  };
  AgentSupervisor.prototype.kill = function (id) {
    var agent = this.procs.get(id);
    if (!agent || agent.exited) return false;
    agent.proc.kill();
    return true;
  };
  AgentSupervisor.prototype.status = function (id) {
    var agent = this.procs.get(id);
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
  };
  // Simple subscriber pattern (replace with WS later)
  AgentSupervisor.prototype.on = function (id, handler) {
    if (!this.subscribers) this.subscribers = {};
    if (!this.subscribers[id]) this.subscribers[id] = [];
    this.subscribers[id].push(handler);
  };
  AgentSupervisor.prototype.off = function (id, handler) {
    var _a;
    var list =
      (_a = this.subscribers) === null || _a === void 0 ? void 0 : _a[id];
    if (!list) return;
    var idx = list.indexOf(handler);
    if (idx >= 0) list.splice(idx, 1);
    if (list.length === 0) delete this.subscribers[id];
  };
  AgentSupervisor.prototype.emit = function (id, data) {
    if (!this.subscribers || !this.subscribers[id]) return;
    for (var _i = 0, _a = this.subscribers[id]; _i < _a.length; _i++) {
      var fn = _a[_i];
      fn(data);
    }
  };
  return AgentSupervisor;
})();
exports.AgentSupervisor = AgentSupervisor;
exports.default = AgentSupervisor;

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
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
var __generator =
  (this && this.__generator) ||
  function (thisArg, body) {
    var _ = {
        label: 0,
        sent: function () {
          if (t[0] & 1) throw t[1];
          return t[1];
        },
        trys: [],
        ops: [],
      },
      f,
      y,
      t,
      g = Object.create(
        (typeof Iterator === "function" ? Iterator : Object).prototype,
      );
    return (
      (g.next = verb(0)),
      (g["throw"] = verb(1)),
      (g["return"] = verb(2)),
      typeof Symbol === "function" &&
        (g[Symbol.iterator] = function () {
          return this;
        }),
      g
    );
    function verb(n) {
      return function (v) {
        return step([n, v]);
      };
    }
    function step(op) {
      if (f) throw new TypeError("Generator is already executing.");
      while ((g && ((g = 0), op[0] && (_ = 0)), _))
        try {
          if (
            ((f = 1),
            y &&
              (t =
                op[0] & 2
                  ? y["return"]
                  : op[0]
                    ? y["throw"] || ((t = y["return"]) && t.call(y), 0)
                    : y.next) &&
              !(t = t.call(y, op[1])).done)
          )
            return t;
          if (((y = 0), t)) op = [op[0] & 2, t.value];
          switch (op[0]) {
            case 0:
            case 1:
              t = op;
              break;
            case 4:
              _.label++;
              return { value: op[1], done: false };
            case 5:
              _.label++;
              y = op[1];
              op = [0];
              continue;
            case 7:
              op = _.ops.pop();
              _.trys.pop();
              continue;
            default:
              if (
                !((t = _.trys), (t = t.length > 0 && t[t.length - 1])) &&
                (op[0] === 6 || op[0] === 2)
              ) {
                _ = 0;
                continue;
              }
              if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                _.label = op[1];
                break;
              }
              if (op[0] === 6 && _.label < t[1]) {
                _.label = t[1];
                t = op;
                break;
              }
              if (t && _.label < t[2]) {
                _.label = t[2];
                _.ops.push(op);
                break;
              }
              if (t[2]) _.ops.pop();
              _.trys.pop();
              continue;
          }
          op = body.call(thisArg, _);
        } catch (e) {
          op = [6, e];
          y = 0;
        } finally {
          f = t = 0;
        }
      if (op[0] & 5) throw op[1];
      return { value: op[0] ? op[1] : void 0, done: true };
    }
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.ptySupervisor =
  exports.PTYAgentSupervisor =
  exports.supervisor =
  exports.AgentSupervisor =
    void 0;
exports.restoreAgentsFromStore = restoreAgentsFromStore;
exports.createSupervisor = createSupervisor;
// @ts-nocheck
var child_process_1 = require("child_process");
var nanoid_1 = require("nanoid");
var store_js_1 = require("./store.js");
var ROOT_PATH = process.env.ROOT_PATH || process.cwd();
var CODEX_BIN = process.env.CODEX_BIN || "codex";
// We exclusively run: codex exec --full-auto --cd ROOT_PATH "<prompt>"
var MAX_LOG_BYTES = Number(process.env.AGENT_MAX_LOG_BYTES || 512 * 1024);
var USE_SHELL = /^true$/i.test(process.env.AGENT_SHELL || "false");
var DANGER_PATTERNS = [
  /rm\s+-rf\s+\/(?!home)/i,
  /\bDROP\s+DATABASE\b/i,
  /\bmkfs\w*\s+\/dev\//i,
  /\bshutdown\b|\breboot\b/i,
  /\bchmod\s+777\b/i,
];
function ringPush(buf, chunk) {
  var slice = Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk));
  var combined = Buffer.concat([buf, slice]);
  if (combined.length <= MAX_LOG_BYTES) return combined;
  return combined.subarray(combined.length - MAX_LOG_BYTES);
}
function matchDanger(s) {
  return DANGER_PATTERNS.find(function (rx) {
    return rx.test(s);
  });
}
// Escapes ONLY the chosen quote char inside, then wraps with it.
// POSIX-safe: produces a single shell *argument*.
// Works for bash/zsh/dash; prevents globbing, $ expansion, etc.
function shQuote(s) {
  var str = String(s);
  if (str.length === 0) return "''";
  return "'".concat(str.replace(/'/g, "'''"), "'");
}
var AgentSupervisor = /** @class */ (function () {
  function AgentSupervisor(opts) {
    if (opts === void 0) {
      opts = {};
    }
    this.procs = new Map();
    this.subscribers = new Map();
    this._spawn = opts.spawnImpl || child_process_1.spawn;
    this._kill =
      opts.killImpl ||
      function (pid, signal) {
        return process.kill(pid, signal);
      };
  }
  AgentSupervisor.prototype.list = function () {
    return Array.from(this.procs.values()).map(function (p) {
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
    });
  };
  AgentSupervisor.prototype.status = function (id) {
    var p = this.procs.get(id);
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
  };
  AgentSupervisor.prototype.logs = function (id, since) {
    if (since === void 0) {
      since = 0;
    }
    var p = this.procs.get(id);
    if (!p) return null;
    var buf = p.log;
    var from = Math.max(0, Math.min(since, buf.length));
    return { total: buf.length, chunk: buf.subarray(from).toString("utf8") };
  };
  AgentSupervisor.prototype.tail = function (id, bytes) {
    if (bytes === void 0) {
      bytes = 8192;
    }
    var p = this.procs.get(id);
    if (!p) return null;
    var buf = p.log;
    var start = Math.max(0, buf.length - Number(bytes || 0));
    return { total: buf.length, chunk: buf.subarray(start).toString("utf8") };
  };
  AgentSupervisor.prototype._broadcast = function (id, event, data) {
    var subs = this.subscribers.get(id);
    if (!subs) return;
    var payload = "event: "
      .concat(event, "\ndata: ")
      .concat(JSON.stringify(data), "\n\n");
    for (var _i = 0, subs_1 = subs; _i < subs_1.length; _i++) {
      var res = subs_1[_i];
      res.write(payload);
    }
  };
  AgentSupervisor.prototype.stream = function (id, res) {
    var _this = this;
    var _a;
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
      } catch (_b) {}
    // greet and replay current buffer so late subscribers see context
    var state = this.procs.get(id);
    var replay =
      ((_a = state === null || state === void 0 ? void 0 : state.log) ===
        null || _a === void 0
        ? void 0
        : _a.toString("utf8")) || "";
    res.write(
      "event: hello\ndata: ".concat(JSON.stringify({ id: id }), "\n\n"),
    );
    if (replay) {
      res.write(
        "event: replay\ndata: ".concat(
          JSON.stringify({ text: replay.slice(-8192) }),
          "\n\n",
        ),
      );
    }
    res.on("close", function () {
      var set = _this.subscribers.get(id);
      if (set) {
        set.delete(res);
        if (!set.size) _this.subscribers.delete(id);
      }
    });
  };
  AgentSupervisor.prototype.start = function (_a) {
    var _this = this;
    var prompt = _a.prompt,
      _b = _a.args,
      args = _b === void 0 ? [] : _b,
      _c = _a.cwd,
      cwd = _c === void 0 ? ROOT_PATH : _c,
      _d = _a.env,
      env = _d === void 0 ? {} : _d,
      _e = _a.auto,
      auto = _e === void 0 ? true : _e,
      _f = _a.tty,
      tty = _f === void 0 ? true : _f;
    var id = (0, nanoid_1.nanoid)();
    var root = process.env.ROOT_PATH || ROOT_PATH;
    var fullArgs = ["exec", "--full-auto", "--cd", root];
    if (prompt && String(prompt).trim()) fullArgs.push(String(prompt));
    var wantTty = tty || /^true$/i.test(process.env.AGENT_TTY || "false");
    var proc;
    if (wantTty) {
      // Use 'script' to allocate a PTY so child sees a TTY
      var cmd = [
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
      var argv = ["-qfec", cmd, "/dev/null"];
      proc = this._spawn("script", argv, {
        cwd: cwd,
        env: __assign(
          __assign(__assign({}, process.env), {
            CI: "1",
            GIT_TERMINAL_PROMPT: "0",
          }),
          env,
        ),
        shell: false,
        stdio: ["pipe", "pipe", "pipe"],
      });
    } else {
      proc = this._spawn(CODEX_BIN, fullArgs, {
        cwd: cwd,
        env: __assign(
          __assign(__assign({}, process.env), {
            CI: "1",
            GIT_TERMINAL_PROMPT: "0",
          }),
          env,
        ),
        shell: USE_SHELL,
        stdio: ["pipe", "pipe", "pipe"],
      });
    }
    var state = {
      id: id,
      cmd: CODEX_BIN,
      args: fullArgs,
      cwd: cwd,
      startedAt: Date.now(),
      exited: false,
      code: null,
      signal: null,
      paused_by_guard: false,
      log: Buffer.alloc(0),
      proc: proc,
      mode: "agent",
      prompt: String(prompt || ""),
    };
    this.procs.set(id, state);
    // persist metadata
    (0, store_js_1.initAgentMeta)({
      id: id,
      mode: "agent",
      cmd: CODEX_BIN,
      args: fullArgs,
      cwd: cwd,
      startedAt: state.startedAt,
      prompt: state.prompt,
    }).catch(function () {});
    var onData = function (data, stream) {
      state.log = ringPush(state.log, data);
      var text = data.toString("utf8");
      _this._broadcast(id, stream, { text: text });
      (0, store_js_1.appendAgentLog)(id, data).catch(function () {});
      var m = matchDanger(text);
      if (m && !state.paused_by_guard) {
        try {
          _this._kill(proc.pid, "SIGSTOP");
          state.paused_by_guard = true;
        } catch (_a) {}
        _this._broadcast(id, "guard", { paused: true, reason: m.source });
      }
    };
    proc.stdout.on("data", function (d) {
      return onData(d, "stdout");
    });
    proc.stderr.on("data", function (d) {
      return onData(d, "stderr");
    });
    proc.on("error", function (err) {
      var msg = "[spawn error] ".concat(
        String((err && err.message) || err),
        "\n",
      );
      state.log = ringPush(state.log, msg);
      (0, store_js_1.appendAgentLog)(id, msg).catch(function () {});
      _this._broadcast(id, "error", {
        message: String(
          (err === null || err === void 0 ? void 0 : err.message) || err,
        ),
      });
      // mark as exited to avoid dangling entries
      state.exited = true;
      state.code = null;
      state.signal = "ERROR";
      (0, store_js_1.updateAgentMeta)(id, {
        exited: true,
        code: null,
        signal: "ERROR",
        finishedAt: Date.now(),
      }).catch(function () {});
    });
    proc.on("exit", function (code, signal) {
      state.exited = true;
      state.code = code;
      state.signal = signal;
      _this._broadcast(id, "exit", { code: code, signal: signal });
      (0, store_js_1.updateAgentMeta)(id, {
        exited: true,
        code: code,
        signal: signal,
        finishedAt: Date.now(),
      }).catch(function () {});
    });
    // We pass the prompt as argument to codex exec; no stdin writes.
    return { id: id, pid: proc.pid };
  };
  AgentSupervisor.prototype.send = function (id, input) {
    var p = this.procs.get(id);
    if (!p || p.exited) return false;
    try {
      p.proc.stdin.write(String(input) + "\n");
      return true;
    } catch (_a) {
      return false;
    }
  };
  AgentSupervisor.prototype.interrupt = function (id) {
    var p = this.procs.get(id);
    if (!p || p.exited) return false;
    try {
      this._kill(p.proc.pid, "SIGINT");
      return true;
    } catch (_a) {
      return false;
    }
  };
  AgentSupervisor.prototype.kill = function (id, force) {
    if (force === void 0) {
      force = false;
    }
    var p = this.procs.get(id);
    if (!p || p.exited) return false;
    try {
      this._kill(p.proc.pid, force ? "SIGKILL" : "SIGTERM");
      return true;
    } catch (_a) {
      return false;
    }
  };
  AgentSupervisor.prototype.resume = function (id) {
    var p = this.procs.get(id);
    if (!p || !p.paused_by_guard) return false;
    try {
      this._kill(p.proc.pid, "SIGCONT");
      p.paused_by_guard = false;
      this._broadcast(id, "guard", { paused: false });
      return true;
    } catch (_a) {
      return false;
    }
  };
  return AgentSupervisor;
})();
exports.AgentSupervisor = AgentSupervisor;
exports.supervisor = new AgentSupervisor();
// --- PTY-backed supervisor using node-pty (lazy loaded) ---
var PTY_LIB = null;
function getPtyLib() {
  return __awaiter(this, void 0, void 0, function () {
    var err, mod, e_1, err;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          if (process.env.NODE_PTY_DISABLED === "1") {
            err = new Error("PTY_UNAVAILABLE");
            err.name = "PTY_UNAVAILABLE";
            throw err;
          }
          if (PTY_LIB) return [2 /*return*/, PTY_LIB];
          _a.label = 1;
        case 1:
          _a.trys.push([1, 3, , 4]);
          return [
            4 /*yield*/,
            Promise.resolve().then(function () {
              return require("node-pty");
            }),
          ];
        case 2:
          mod = _a.sent();
          // node-pty may export default or named
          PTY_LIB = mod.default || mod;
          return [2 /*return*/, PTY_LIB];
        case 3:
          e_1 = _a.sent();
          err = new Error("PTY_UNAVAILABLE");
          err.name = "PTY_UNAVAILABLE";
          throw err;
        case 4:
          return [2 /*return*/];
      }
    });
  });
}
var PTYAgentSupervisor = /** @class */ (function () {
  function PTYAgentSupervisor(opts) {
    if (opts === void 0) {
      opts = {};
    }
    this.procs = new Map();
    this.subscribers = new Map();
    this._kill =
      opts.killImpl ||
      function (pid, signal) {
        return process.kill(pid, signal);
      };
  }
  PTYAgentSupervisor.prototype.list = function () {
    return Array.from(this.procs.values()).map(function (p) {
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
    });
  };
  PTYAgentSupervisor.prototype.status = function (id) {
    var p = this.procs.get(id);
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
  };
  PTYAgentSupervisor.prototype.logs = function (id, since) {
    if (since === void 0) {
      since = 0;
    }
    var p = this.procs.get(id);
    if (!p) return null;
    var buf = p.log;
    var from = Math.max(0, Math.min(since, buf.length));
    return { total: buf.length, chunk: buf.subarray(from).toString("utf8") };
  };
  PTYAgentSupervisor.prototype.tail = function (id, bytes) {
    if (bytes === void 0) {
      bytes = 8192;
    }
    var p = this.procs.get(id);
    if (!p) return null;
    var buf = p.log;
    var start = Math.max(0, buf.length - Number(bytes || 0));
    return { total: buf.length, chunk: buf.subarray(start).toString("utf8") };
  };
  PTYAgentSupervisor.prototype._broadcast = function (id, event, data) {
    var subs = this.subscribers.get(id);
    if (!subs) return;
    var payload = "event: "
      .concat(event, "\ndata: ")
      .concat(JSON.stringify(data), "\n\n");
    for (var _i = 0, subs_2 = subs; _i < subs_2.length; _i++) {
      var res = subs_2[_i];
      res.write(payload);
    }
  };
  PTYAgentSupervisor.prototype.stream = function (id, res) {
    var _this = this;
    var _a;
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
      } catch (_b) {}
    var state = this.procs.get(id);
    var replay =
      ((_a = state === null || state === void 0 ? void 0 : state.log) ===
        null || _a === void 0
        ? void 0
        : _a.toString("utf8")) || "";
    res.write(
      "event: hello\ndata: ".concat(JSON.stringify({ id: id }), "\n\n"),
    );
    if (replay)
      res.write(
        "event: replay\ndata: ".concat(
          JSON.stringify({ text: replay.slice(-8192) }),
          "\n\n",
        ),
      );
    res.on("close", function () {
      var set = _this.subscribers.get(id);
      if (set) {
        set.delete(res);
        if (!set.size) _this.subscribers.delete(id);
      }
    });
  };
  PTYAgentSupervisor.prototype.start = function (_a) {
    return __awaiter(this, arguments, void 0, function (_b) {
      var pty, id, root, args, proc, state;
      var _this = this;
      var prompt = _b.prompt,
        _c = _b.cwd,
        cwd = _c === void 0 ? ROOT_PATH : _c,
        _d = _b.env,
        env = _d === void 0 ? {} : _d,
        _e = _b.cols,
        cols = _e === void 0 ? 120 : _e,
        _f = _b.rows,
        rows = _f === void 0 ? 32 : _f;
      return __generator(this, function (_g) {
        switch (_g.label) {
          case 0:
            return [4 /*yield*/, getPtyLib()];
          case 1:
            pty = _g.sent();
            id = (0, nanoid_1.nanoid)();
            root = process.env.ROOT_PATH || ROOT_PATH;
            args = ["exec", "--full-auto", "--cd", root];
            if (prompt && String(prompt).trim()) args.push(String(prompt));
            proc = pty.spawn(CODEX_BIN, args, {
              name: "xterm-color",
              cols: Number(cols || 120),
              rows: Number(rows || 32),
              cwd: cwd,
              env: __assign(
                __assign(__assign({}, process.env), {
                  CI: "1",
                  GIT_TERMINAL_PROMPT: "0",
                }),
                env,
              ),
            });
            state = {
              id: id,
              cmd: CODEX_BIN,
              args: args,
              cwd: cwd,
              startedAt: Date.now(),
              exited: false,
              code: null,
              signal: null,
              paused_by_guard: false,
              log: Buffer.alloc(0),
              proc: proc,
              cols: Number(cols || 120),
              rows: Number(rows || 32),
              mode: "pty",
              prompt: String(prompt || ""),
            };
            this.procs.set(id, state);
            (0, store_js_1.initAgentMeta)({
              id: id,
              mode: "pty",
              cmd: CODEX_BIN,
              args: args,
              cwd: cwd,
              startedAt: state.startedAt,
              prompt: state.prompt,
              cols: state.cols,
              rows: state.rows,
            }).catch(function () {});
            proc.onData(function (data) {
              state.log = ringPush(state.log, data);
              _this._broadcast(id, "stdout", { text: data });
              (0, store_js_1.appendAgentLog)(id, data).catch(function () {});
              var m = matchDanger(data);
              if (m && !state.paused_by_guard) {
                try {
                  _this._kill(proc.pid, "SIGSTOP");
                  state.paused_by_guard = true;
                } catch (_a) {}
                _this._broadcast(id, "guard", {
                  paused: true,
                  reason: m.source,
                });
              }
            });
            proc.onExit(function (_a) {
              var exitCode = _a.exitCode,
                signal = _a.signal;
              state.exited = true;
              state.code = exitCode;
              state.signal = signal;
              _this._broadcast(id, "exit", { code: exitCode, signal: signal });
              (0, store_js_1.updateAgentMeta)(id, {
                exited: true,
                code: exitCode,
                signal: signal,
                finishedAt: Date.now(),
              }).catch(function () {});
            });
            return [2 /*return*/, { id: id, pid: proc.pid }];
        }
      });
    });
  };
  PTYAgentSupervisor.prototype.write = function (id, input) {
    var p = this.procs.get(id);
    if (!p || p.exited) return false;
    try {
      p.proc.write(String(input));
      return true;
    } catch (_a) {
      return false;
    }
  };
  PTYAgentSupervisor.prototype.send = function (id, input) {
    return this.write(id, String(input) + "\r");
  };
  PTYAgentSupervisor.prototype.resize = function (id, cols, rows) {
    var p = this.procs.get(id);
    if (!p || p.exited) return false;
    try {
      p.proc.resize(Number(cols || p.cols), Number(rows || p.rows));
      p.cols = Number(cols || p.cols);
      p.rows = Number(rows || p.rows);
      return true;
    } catch (_a) {
      return false;
    }
  };
  PTYAgentSupervisor.prototype.interrupt = function (id) {
    var p = this.procs.get(id);
    if (!p || p.exited) return false;
    try {
      this._kill(p.proc.pid, "SIGINT");
      return true;
    } catch (_a) {
      return false;
    }
  };
  PTYAgentSupervisor.prototype.kill = function (id, force) {
    if (force === void 0) {
      force = false;
    }
    var p = this.procs.get(id);
    if (!p || p.exited) return false;
    try {
      this._kill(p.proc.pid, force ? "SIGKILL" : "SIGTERM");
      return true;
    } catch (_a) {
      return false;
    }
  };
  PTYAgentSupervisor.prototype.resume = function (id) {
    var p = this.procs.get(id);
    if (!p || !p.paused_by_guard) return false;
    try {
      this._kill(p.proc.pid, "SIGCONT");
      p.paused_by_guard = false;
      this._broadcast(id, "guard", { paused: false });
      return true;
    } catch (_a) {
      return false;
    }
  };
  return PTYAgentSupervisor;
})();
exports.PTYAgentSupervisor = PTYAgentSupervisor;
exports.ptySupervisor = new PTYAgentSupervisor();
// Restore previously persisted agents as historical entries (exited) on boot
function restoreAgentsFromStore() {
  return __awaiter(this, void 0, void 0, function () {
    var allow, metas, _i, metas_1, meta, exists, logTail, buf, base;
    var _a;
    return __generator(this, function (_b) {
      switch (_b.label) {
        case 0:
          allow =
            String(process.env.AGENT_RESTORE_ON_START || "true") !== "false";
          if (!allow) return [2 /*return*/];
          return [4 /*yield*/, (0, store_js_1.listAgentMetas)()];
        case 1:
          metas = _b.sent();
          (_i = 0), (metas_1 = metas);
          _b.label = 2;
        case 2:
          if (!(_i < metas_1.length)) return [3 /*break*/, 5];
          meta = metas_1[_i];
          exists = (
            meta.mode === "pty" ? exports.ptySupervisor : exports.supervisor
          ).procs.has(meta.id);
          if (exists) return [3 /*break*/, 4];
          return [
            4 /*yield*/,
            (0, store_js_1.readAgentLogTail)(
              meta.id,
              Number(process.env.AGENT_RESTORE_TAIL || 65536),
            ),
          ];
        case 3:
          logTail = _b.sent();
          buf = Buffer.from(logTail || "", "utf8");
          base = {
            id: meta.id,
            cmd: meta.cmd || CODEX_BIN,
            args: Array.isArray(meta.args) ? meta.args : [],
            cwd: meta.cwd || process.env.ROOT_PATH || process.cwd(),
            startedAt: meta.startedAt || Date.now(),
            exited: true,
            code: (_a = meta.code) !== null && _a !== void 0 ? _a : null,
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
            exports.ptySupervisor.procs.set(
              meta.id,
              __assign(__assign({}, base), {
                mode: "pty",
                cols: meta.cols || 120,
                rows: meta.rows || 32,
              }),
            );
          } else {
            exports.supervisor.procs.set(
              meta.id,
              __assign(__assign({}, base), { mode: "agent" }),
            );
          }
          _b.label = 4;
        case 4:
          _i++;
          return [3 /*break*/, 2];
        case 5:
          return [2 /*return*/];
      }
    });
  });
}
function createSupervisor(opts) {
  return new AgentSupervisor(opts);
}

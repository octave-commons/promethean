"use strict";
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
exports.runCommand = runCommand;
// @ts-nocheck
var REPO_ROOT = process.env.REPO_ROOT;
// return exec({cwd,shell:'/usr/bin/bash'})`${command}`
var DANGER_PATTERNS = [
  /rm\s+-rf\s+\/(?!home)/i,
  /\bDROP\s+DATABASE\b/i,
  /\bmkfs\w*\s+\/dev\//i,
  /\bshutdown\b|\breboot\b/i,
  /\bchmod\s+777\b/i,
];
function matchDanger(s) {
  return DANGER_PATTERNS.find(function (rx) {
    return rx.test(s);
  });
}
var execa_1 = require("execa");
var path_1 = require("path");
var files_js_1 = require("./files.js");
function runCommand() {
  return __awaiter(this, arguments, void 0, function (_a) {
    var t0,
      useShell,
      base,
      safeCwd,
      abs,
      subprocess,
      result,
      durationMs,
      err_1,
      durationMs;
    var _b, _c, _d, _e, _f, _g, _h;
    var _j = _a === void 0 ? {} : _a,
      command = _j.command,
      _k = _j.cwd,
      cwd = _k === void 0 ? REPO_ROOT : _k,
      _l = _j.repoRoot,
      repoRoot = _l === void 0 ? REPO_ROOT : _l,
      _m = _j.timeoutMs,
      timeoutMs = _m === void 0 ? 10 * 60000 : _m,
      _o = _j.tty,
      tty = _o === void 0 ? false : _o;
    return __generator(this, function (_p) {
      switch (_p.label) {
        case 0:
          t0 = Date.now();
          useShell = /^true$/i.test(process.env.EXEC_SHELL || "false");
          _p.label = 1;
        case 1:
          _p.trys.push([1, 3, , 4]);
          if (matchDanger(command)) {
            return [
              2 /*return*/,
              {
                ok: false,
                error: "blocked by guard",
                exitCode: null,
                signal: null,
              },
            ];
          }
          base = repoRoot || process.env.REPO_ROOT || process.cwd();
          safeCwd = void 0;
          try {
            abs = path_1.default.isAbsolute(cwd)
              ? path_1.default.resolve(cwd)
              : path_1.default.resolve(base, cwd);
            if (!(0, files_js_1.isInsideRoot)(base, abs))
              throw new Error("cwd outside root");
            safeCwd = abs;
          } catch (_q) {
            return [
              2 /*return*/,
              {
                ok: false,
                error: "cwd outside root",
                exitCode: null,
                signal: null,
              },
            ];
          }
          subprocess = (0, execa_1.execa)(command, {
            cwd: safeCwd,
            timeout: timeoutMs,
            shell: useShell,
            stdio: tty ? "inherit" : "pipe",
          });
          return [4 /*yield*/, subprocess];
        case 2:
          result = _p.sent();
          durationMs = Date.now() - t0;
          return [
            2 /*return*/,
            {
              ok: true,
              exitCode: 0,
              signal: null,
              stdout: (_b = result.stdout) !== null && _b !== void 0 ? _b : "",
              stderr: (_c = result.stderr) !== null && _c !== void 0 ? _c : "",
              durationMs: durationMs,
              truncated: false,
              error: "",
            },
          ];
        case 3:
          err_1 = _p.sent();
          durationMs = Date.now() - t0;
          return [
            2 /*return*/,
            {
              ok: false,
              exitCode:
                (_d = err_1.exitCode) !== null && _d !== void 0 ? _d : 1,
              signal: (_e = err_1.signal) !== null && _e !== void 0 ? _e : null,
              stdout: (_f = err_1.stdout) !== null && _f !== void 0 ? _f : "",
              stderr:
                (_g = err_1.stderr) !== null && _g !== void 0
                  ? _g
                  : err_1.message,
              durationMs: err_1.timedOut ? timeoutMs : durationMs,
              truncated: false,
              error:
                (_h = err_1.message) !== null && _h !== void 0
                  ? _h
                  : "Execution failed",
            },
          ];
        case 4:
          return [2 /*return*/];
      }
    });
  });
}

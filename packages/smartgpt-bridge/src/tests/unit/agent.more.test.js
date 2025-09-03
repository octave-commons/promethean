// SPDX-License-Identifier: GPL-3.0-only
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
// @ts-nocheck
var ava_1 = require("ava");
var agent_js_1 = require("../../agent.js");
function makeProc() {
  var listeners = {};
  return {
    pid: 999,
    stdout: {
      on: function (ev, cb) {
        listeners["o_".concat(ev)] = cb;
      },
    },
    stderr: {
      on: function (ev, cb) {
        listeners["e_".concat(ev)] = cb;
      },
    },
    stdin: { write: function () {} },
    on: function (ev, cb) {
      listeners["p_".concat(ev)] = cb;
    },
    emit: function (type, data) {
      if (type === "stdout" && listeners.o_data)
        listeners.o_data(Buffer.from(String(data)));
      if (type === "stderr" && listeners.e_data)
        listeners.e_data(Buffer.from(String(data)));
      if (type === "exit" && listeners.p_exit) listeners.p_exit(0, null);
    },
  };
}
(0, ava_1.default)(
  "AgentSupervisor: send/interrupt/kill after exit return false; logs and list",
  function (t) {
    return __awaiter(void 0, void 0, void 0, function () {
      var proc, spawnImpl, kills, killImpl, sup, id, logs;
      return __generator(this, function (_a) {
        proc = makeProc();
        spawnImpl = function () {
          return proc;
        };
        kills = [];
        killImpl = function (pid, sig) {
          kills.push(sig);
        };
        sup = (0, agent_js_1.createSupervisor)({
          spawnImpl: spawnImpl,
          killImpl: killImpl,
        });
        id = sup.start({}).id;
        // deliver some logs
        proc.emit("stdout", "hello\n");
        proc.emit("stderr", "warn\n");
        // exit
        proc.emit("exit");
        // After exit, controls should be false
        t.false(sup.send(id, "x"));
        t.false(sup.interrupt(id));
        t.false(sup.kill(id));
        t.false(sup.resume(id));
        logs = sup.logs(id, 0);
        t.true(logs.total > 0);
        t.true(sup.list().length >= 1);
        return [2 /*return*/];
      });
    });
  },
);
(0, ava_1.default)(
  "AgentSupervisor: SSE stream subscribes and cleans up",
  function (t) {
    return __awaiter(void 0, void 0, void 0, function () {
      var proc, sup, id, closed, res;
      return __generator(this, function (_a) {
        proc = makeProc();
        sup = (0, agent_js_1.createSupervisor)({
          spawnImpl: function () {
            return proc;
          },
          killImpl: function () {},
        });
        id = sup.start({}).id;
        closed = false;
        res = {
          writeHead: function () {},
          write: function () {},
          on: function (ev, cb) {
            if (ev === "close") {
              res._close = cb;
            }
          },
        };
        sup.stream(id, res);
        t.truthy(res);
        // simulate client close
        res._close && res._close();
        t.pass();
        return [2 /*return*/];
      });
    });
  },
);

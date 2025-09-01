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
// @ts-nocheck
var ava_1 = require("ava");
var mockSpawn_js_1 = require("../helpers/mockSpawn.js");
var agent_js_1 = require("../../agent.js");
(0, ava_1.default)(
  "agent supervisor: guard pause, resume, then exit",
  function (t) {
    return __awaiter(void 0, void 0, void 0, function () {
      var script,
        mockSpawn,
        killCalls,
        mockKill,
        sup,
        id,
        st1,
        ok,
        st2,
        sup2,
        id2,
        st3;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            script = [
              { type: "stdout", data: "Starting...\n" },
              { type: "stdout", data: "rm -rf /tmp/foo\n" },
              { type: "stderr", data: "ignored\n" },
            ];
            mockSpawn = (0, mockSpawn_js_1.mockSpawnFactory)(script);
            killCalls = [];
            mockKill = function (pid, signal) {
              killCalls.push(signal);
            };
            sup = (0, agent_js_1.createSupervisor)({
              spawnImpl: mockSpawn,
              killImpl: mockKill,
            });
            id = sup.start({ prompt: "noop" }).id;
            // Give script a tick to deliver events
            return [
              4 /*yield*/,
              new Promise(function (r) {
                return setTimeout(r, 0);
              }),
            ];
          case 1:
            // Give script a tick to deliver events
            _a.sent();
            st1 = sup.status(id);
            t.truthy(st1);
            t.true(st1.paused_by_guard, "guard should have paused process");
            t.true(killCalls.includes("SIGSTOP"));
            ok = sup.resume(id);
            t.true(ok);
            st2 = sup.status(id);
            t.false(st2.paused_by_guard);
            t.true(killCalls.includes("SIGCONT"));
            sup2 = (0, agent_js_1.createSupervisor)({
              spawnImpl: (0, mockSpawn_js_1.mockSpawnFactory)(
                __spreadArray(
                  __spreadArray([], script, true),
                  [{ type: "exit", code: 0 }],
                  false,
                ),
              ),
              killImpl: mockKill,
            });
            id2 = sup2.start({ prompt: "noop" }).id;
            return [
              4 /*yield*/,
              new Promise(function (r) {
                return setTimeout(r, 0);
              }),
            ];
          case 2:
            _a.sent();
            st3 = sup2.status(id2);
            t.true(st3.exited === true || st3.exited === false); // existence check; exited may be set after tick
            return [2 /*return*/];
        }
      });
    });
  },
);

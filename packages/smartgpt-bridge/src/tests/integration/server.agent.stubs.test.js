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
var node_path_1 = require("node:path");
var server_js_1 = require("../helpers/server.js");
var sinon_1 = require("sinon");
var agent_js_1 = require("../../agent.js");
var ROOT = node_path_1.default.join(process.cwd(), "src", "tests", "fixtures");
(0, ava_1.default)(
  "agent endpoints success paths via stubbed supervisor",
  function (t) {
    return __awaiter(void 0, void 0, void 0, function () {
      var s;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            s = sinon_1.default.createSandbox();
            s.stub(agent_js_1.supervisor, "start").returns("S1");
            s.stub(agent_js_1.supervisor, "status").returns({
              id: "S1",
              exited: false,
              paused_by_guard: false,
              bytes: 0,
            });
            s.stub(agent_js_1.supervisor, "send").returns(true);
            s.stub(agent_js_1.supervisor, "kill").returns(true);
            s.stub(agent_js_1.supervisor, "logs").returns({
              total: 0,
              chunk: "",
            });
            s.stub(agent_js_1.supervisor, "resume").returns(false);
            _a.label = 1;
          case 1:
            _a.trys.push([1, , 3, 4]);
            return [
              4 /*yield*/,
              (0, server_js_1.withServer)(ROOT, function (req) {
                return __awaiter(void 0, void 0, void 0, function () {
                  var st, send, intr, kill, resm, logs, status, list;
                  return __generator(this, function (_a) {
                    switch (_a.label) {
                      case 0:
                        return [
                          4 /*yield*/,
                          req
                            .post("/v0/agent/start")
                            .send({ prompt: "hello" })
                            .expect(200),
                        ];
                      case 1:
                        st = _a.sent();
                        t.true(st.body.ok);
                        return [
                          4 /*yield*/,
                          req
                            .post("/v0/agent/send")
                            .send({ id: "S1", input: "ping" })
                            .expect(200),
                        ];
                      case 2:
                        send = _a.sent();
                        t.true(send.body.ok);
                        return [
                          4 /*yield*/,
                          req
                            .post("/v0/agent/interrupt")
                            .send({ id: "S1" })
                            .expect(200),
                        ];
                      case 3:
                        intr = _a.sent();
                        t.true(intr.body.ok);
                        return [
                          4 /*yield*/,
                          req
                            .post("/v0/agent/kill")
                            .send({ id: "S1", force: true })
                            .expect(200),
                        ];
                      case 4:
                        kill = _a.sent();
                        t.true(kill.body.ok);
                        return [
                          4 /*yield*/,
                          req
                            .post("/v0/agent/resume")
                            .send({ id: "S1" })
                            .expect(200),
                        ];
                      case 5:
                        resm = _a.sent();
                        t.false(resm.body.ok);
                        return [
                          4 /*yield*/,
                          req
                            .get("/v0/agent/logs")
                            .query({ id: "S1", since: 0 })
                            .expect(200),
                        ];
                      case 6:
                        logs = _a.sent();
                        t.true(logs.body.ok);
                        return [
                          4 /*yield*/,
                          req
                            .get("/v0/agent/status")
                            .query({ id: "S1" })
                            .expect(200),
                        ];
                      case 7:
                        status = _a.sent();
                        t.true(status.body.ok);
                        return [
                          4 /*yield*/,
                          req.get("/v0/agent/list").expect(200),
                        ];
                      case 8:
                        list = _a.sent();
                        t.true(list.body.ok);
                        return [2 /*return*/];
                    }
                  });
                });
              }),
            ];
          case 2:
            _a.sent();
            return [3 /*break*/, 4];
          case 3:
            s.restore();
            return [7 /*endfinally*/];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  },
);

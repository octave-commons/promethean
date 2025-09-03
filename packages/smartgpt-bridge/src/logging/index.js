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
exports.mongoChromaLogger = mongoChromaLogger;
// @ts-nocheck
var uuid_1 = require("uuid");
var sinks_js_1 = require("../sinks.js");
function mongoChromaLogger(app) {
  return __awaiter(this, void 0, void 0, function () {
    var logStore;
    var _this = this;
    return __generator(this, function (_a) {
      try {
        logStore = sinks_js_1.contextStore.getCollection("bridge_logs");
      } catch (_b) {
        return [2 /*return*/]; // sink not available
      }
      app.addHook("onRequest", function (req) {
        return __awaiter(_this, void 0, void 0, function () {
          return __generator(this, function (_a) {
            req.requestId = (0, uuid_1.v4)();
            req.startTime = Date.now();
            return [2 /*return*/];
          });
        });
      });
      app.addHook("onResponse", function (req, reply) {
        return __awaiter(_this, void 0, void 0, function () {
          var latencyMs, entry, _a;
          var _b, _c;
          return __generator(this, function (_d) {
            switch (_d.label) {
              case 0:
                latencyMs = Date.now() - (req.startTime || Date.now());
                entry = {
                  requestId: req.requestId,
                  method: req.method,
                  path: req.url,
                  statusCode: reply.statusCode,
                  request: {
                    query: req.query,
                    params: req.params,
                    body: req.body,
                  },
                  response: safeParse(reply.payload),
                  latencyMs: latencyMs,
                  service: "smartgpt-bridge",
                  operationId:
                    (_c =
                      (_b = reply.context) === null || _b === void 0
                        ? void 0
                        : _b.schema) === null || _c === void 0
                      ? void 0
                      : _c.operationId,
                };
                _d.label = 1;
              case 1:
                _d.trys.push([1, 3, , 4]);
                return [
                  4 /*yield*/,
                  logStore.addEntry({
                    text: JSON.stringify(entry),
                    timestamp: Date.now(),
                    metadata: {
                      path: entry.path,
                      method: entry.method,
                      statusCode: entry.statusCode,
                      hasError: !!entry.error,
                      service: entry.service,
                      operationId: entry.operationId,
                    },
                  }),
                ];
              case 2:
                _d.sent();
                return [3 /*break*/, 4];
              case 3:
                _a = _d.sent();
                return [3 /*break*/, 4];
              case 4:
                return [2 /*return*/];
            }
          });
        });
      });
      app.addHook("onError", function (req, reply, error) {
        return __awaiter(_this, void 0, void 0, function () {
          var latencyMs, entry, _a;
          var _b, _c;
          return __generator(this, function (_d) {
            switch (_d.label) {
              case 0:
                latencyMs = Date.now() - (req.startTime || Date.now());
                entry = {
                  requestId: req.requestId || (0, uuid_1.v4)(),
                  method: req.method,
                  path: req.url,
                  statusCode: reply.statusCode,
                  request: {
                    query: req.query,
                    params: req.params,
                    body: req.body,
                  },
                  error: error.message,
                  latencyMs: latencyMs,
                  service: "smartgpt-bridge",
                  operationId:
                    (_c =
                      (_b = reply.context) === null || _b === void 0
                        ? void 0
                        : _b.schema) === null || _c === void 0
                      ? void 0
                      : _c.operationId,
                };
                _d.label = 1;
              case 1:
                _d.trys.push([1, 3, , 4]);
                return [
                  4 /*yield*/,
                  logStore.addEntry({
                    text: JSON.stringify(entry),
                    timestamp: Date.now(),
                    metadata: {
                      path: entry.path,
                      method: entry.method,
                      statusCode: entry.statusCode,
                      hasError: !!entry.error,
                      service: entry.service,
                      operationId: entry.operationId,
                    },
                  }),
                ];
              case 2:
                _d.sent();
                return [3 /*break*/, 4];
              case 3:
                _a = _d.sent();
                return [3 /*break*/, 4];
              case 4:
                return [2 /*return*/];
            }
          });
        });
      });
      return [2 /*return*/];
    });
  });
}
function safeParse(payload) {
  if (!payload) return undefined;
  try {
    return typeof payload === "string" ? JSON.parse(payload) : payload;
  } catch (_a) {
    return { raw: String(payload) };
  }
}

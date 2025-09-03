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
exports.withServer = void 0;
// @ts-nocheck
var fastifyApp_js_1 = require("../../fastifyApp.js");
var mongodb_memory_server_1 = require("mongodb-memory-server");
var sinon_1 = require("sinon");
var persistenceClients = require("@shared/ts/dist/persistence/clients.js");
function makeClient(app) {
  var u = function (path, query) {
    if (!query || Object.keys(query).length === 0) return path;
    var params = new URLSearchParams();
    for (var _i = 0, _a = Object.entries(query); _i < _a.length; _i++) {
      var _b = _a[_i],
        k = _b[0],
        v = _b[1];
      params.append(k, String(v));
    }
    return "".concat(path, "?").concat(params.toString());
  };
  var Req = /** @class */ (function () {
    function Req(method, path) {
      this.method = method;
      this.path = path;
      this._query = {};
      this._body = undefined;
      this._headers = {};
    }
    Req.prototype.query = function (obj) {
      this._query = obj || {};
      return this;
    };
    Req.prototype.send = function (obj) {
      this._body = obj;
      return this;
    };
    Req.prototype.set = function (key, value) {
      this._headers[key] = value;
      return this;
    };
    Req.prototype.expect = function (code) {
      return __awaiter(this, void 0, void 0, function () {
        var res, status, body, msg;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              return [
                4 /*yield*/,
                app.inject({
                  method: this.method,
                  url: u(this.path, this._query),
                  payload: this._body,
                  headers: __assign(
                    { "content-type": "application/json" },
                    this._headers,
                  ),
                }),
              ];
            case 1:
              res = _a.sent();
              status = res.statusCode;
              try {
                body = res.json();
              } catch (_b) {
                body = res.payload;
              }
              if (status !== code) {
                msg = "Expected "
                  .concat(code, " got ")
                  .concat(status, ": ")
                  .concat(res.payload);
                throw new Error(msg);
              }
              return [2 /*return*/, { status: status, body: body }];
          }
        });
      });
    };
    return Req;
  })();
  return {
    get: function (p) {
      return new Req("GET", p);
    },
    post: function (p) {
      return new Req("POST", p);
    },
  };
}
var withServer = function (root, fn) {
  return __awaiter(void 0, void 0, void 0, function () {
    var mms, fakeChroma, chromaStub, app, client, mongo;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          process.env.NODE_ENV = "test";
          // Avoid native addon crashes in CI/local when ABI mismatches
          if (!process.env.NODE_PTY_DISABLED)
            process.env.NODE_PTY_DISABLED = "1";
          if (
            !(!process.env.MONGODB_URI || process.env.MONGODB_URI === "memory")
          )
            return [3 /*break*/, 2];
          return [
            4 /*yield*/,
            mongodb_memory_server_1.MongoMemoryServer.create(),
          ];
        case 1:
          mms = _a.sent();
          process.env.MONGODB_URI = mms.getUri();
          _a.label = 2;
        case 2:
          fakeChroma = {
            getOrCreateCollection: function () {
              return __awaiter(void 0, void 0, void 0, function () {
                return __generator(this, function (_a) {
                  return [
                    2 /*return*/,
                    {
                      add: function () {
                        return __awaiter(void 0, void 0, void 0, function () {
                          return __generator(this, function (_a) {
                            return [2 /*return*/];
                          });
                        });
                      },
                      query: function () {
                        return __awaiter(void 0, void 0, void 0, function () {
                          return __generator(this, function (_a) {
                            return [
                              2 /*return*/,
                              { ids: [], documents: [], metadatas: [] },
                            ];
                          });
                        });
                      },
                      count: function () {
                        return __awaiter(void 0, void 0, void 0, function () {
                          return __generator(this, function (_a) {
                            return [2 /*return*/, 0];
                          });
                        });
                      },
                      get: function () {
                        return __awaiter(void 0, void 0, void 0, function () {
                          return __generator(this, function (_a) {
                            return [2 /*return*/, { ids: [] }];
                          });
                        });
                      },
                      delete: function () {
                        return __awaiter(void 0, void 0, void 0, function () {
                          return __generator(this, function (_a) {
                            return [2 /*return*/];
                          });
                        });
                      },
                    },
                  ];
                });
              });
            },
          };
          chromaStub = sinon_1.default
            .stub(persistenceClients, "getChromaClient")
            .resolves(fakeChroma);
          return [4 /*yield*/, (0, fastifyApp_js_1.buildFastifyApp)(root)];
        case 3:
          app = _a.sent();
          // Stub RBAC hooks so tests don't require seeded users/policies
          app.authUser = function () {
            return __awaiter(void 0, void 0, void 0, function () {
              return __generator(this, function (_a) {
                return [2 /*return*/, { id: "test" }];
              });
            });
          };
          app.requirePolicy = function () {
            return function () {
              return __awaiter(void 0, void 0, void 0, function () {
                return __generator(this, function (_a) {
                  return [2 /*return*/];
                });
              });
            };
          };
          return [4 /*yield*/, app.ready()];
        case 4:
          _a.sent();
          _a.label = 5;
        case 5:
          _a.trys.push([5, , 7, 13]);
          client = makeClient(app);
          return [4 /*yield*/, fn(client)];
        case 6:
          return [2 /*return*/, _a.sent()];
        case 7:
          return [4 /*yield*/, app.close()];
        case 8:
          _a.sent();
          chromaStub.restore();
          if (!mms) return [3 /*break*/, 10];
          return [4 /*yield*/, mms.stop()];
        case 9:
          _a.sent();
          _a.label = 10;
        case 10:
          return [4 /*yield*/, persistenceClients.getMongoClient()];
        case 11:
          mongo = _a.sent();
          return [4 /*yield*/, mongo.close()];
        case 12:
          _a.sent();
          return [7 /*endfinally*/];
        case 13:
          return [2 /*return*/];
      }
    });
  });
};
exports.withServer = withServer;

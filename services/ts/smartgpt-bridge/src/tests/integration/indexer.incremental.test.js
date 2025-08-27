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
var promises_1 = require("node:fs/promises");
var node_path_1 = require("node:path");
var indexer_js_1 = require("../../indexer.js");
var indexerState_js_1 = require("../../indexerState.js");
function delay(ms) {
  return new Promise(function (r) {
    return setTimeout(r, ms);
  });
}
function waitIdle() {
  return __awaiter(this, arguments, void 0, function (timeoutMs) {
    var start;
    if (timeoutMs === void 0) {
      timeoutMs = 5000;
    }
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          start = Date.now();
          _a.label = 1;
        case 1:
          if (!indexer_js_1.indexerManager.isBusy()) return [3 /*break*/, 3];
          if (Date.now() - start > timeoutMs)
            throw new Error("waitIdle timeout");
          return [4 /*yield*/, delay(10)];
        case 2:
          _a.sent();
          return [3 /*break*/, 1];
        case 3:
          return [2 /*return*/];
      }
    });
  });
}
var RecordingCollection = /** @class */ (function () {
  function RecordingCollection() {
    this.upserts = []; // { ids, metadatas }
    this.deletes = []; // { where }
  }
  RecordingCollection.prototype.upsert = function (payload) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        this.upserts.push({ ids: payload.ids, metadatas: payload.metadatas });
        return [2 /*return*/];
      });
    });
  };
  RecordingCollection.prototype.delete = function (payload) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        this.deletes.push(payload);
        return [2 /*return*/];
      });
    });
  };
  RecordingCollection.prototype.query = function () {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        return [2 /*return*/, {}];
      });
    });
  };
  return RecordingCollection;
})();
var FakeChroma = /** @class */ (function () {
  function FakeChroma(col) {
    this.col = col;
  }
  FakeChroma.prototype.getOrCreateCollection = function () {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        return [2 /*return*/, this.col];
      });
    });
  };
  return FakeChroma;
})();
ava_1.default.serial(
  "bootstrap persists cursor and restart performs incremental diffs",
  function (t) {
    return __awaiter(void 0, void 0, void 0, function () {
      var ROOT, a, b, c, col, s1, stateFile, d, upsertPaths, deletedPaths;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            // Speed up drain loops
            process.env.INDEXER_FILE_DELAY_MS = "0";
            ROOT = node_path_1.default.join(
              process.cwd(),
              "services",
              "ts",
              "smartgpt-bridge",
              "tests",
              "tmp",
              "inc1",
            );
            return [
              4 /*yield*/,
              promises_1.default.mkdir(ROOT, { recursive: true }),
            ];
          case 1:
            _a.sent();
            a = node_path_1.default.join(ROOT, "a.txt");
            b = node_path_1.default.join(ROOT, "b.txt");
            c = node_path_1.default.join(ROOT, "c.md");
            return [4 /*yield*/, promises_1.default.writeFile(a, "alpha")];
          case 2:
            _a.sent();
            return [4 /*yield*/, promises_1.default.writeFile(b, "bravo")];
          case 3:
            _a.sent();
            return [4 /*yield*/, promises_1.default.writeFile(c, "# charlie")];
          case 4:
            _a.sent();
            col = new RecordingCollection();
            (0, indexer_js_1.setChromaClient)(new FakeChroma(col));
            (0, indexer_js_1.setEmbeddingFactory)(function () {
              return __awaiter(void 0, void 0, void 0, function () {
                return __generator(this, function (_a) {
                  return [
                    2 /*return*/,
                    {
                      generate: function () {
                        return __awaiter(void 0, void 0, void 0, function () {
                          return __generator(this, function (_a) {
                            return [2 /*return*/, []];
                          });
                        });
                      },
                    },
                  ];
                });
              });
            });
            // Fresh bootstrap
            return [
              4 /*yield*/,
              indexer_js_1.indexerManager.resetAndBootstrap(ROOT),
            ];
          case 5:
            // Fresh bootstrap
            _a.sent();
            return [4 /*yield*/, waitIdle()];
          case 6:
            _a.sent();
            s1 = indexer_js_1.indexerManager.status();
            t.is(s1.mode, "indexed");
            return [
              4 /*yield*/,
              (0, indexerState_js_1.loadBootstrapState)(ROOT),
            ];
          case 7:
            stateFile = _a.sent();
            t.truthy(stateFile);
            t.true(["indexed", "bootstrap"].includes(stateFile.mode));
            // Clear call history for incremental phase
            col.upserts = [];
            col.deletes = [];
            d = node_path_1.default.join(ROOT, "d.txt");
            return [4 /*yield*/, promises_1.default.appendFile(b, "++changed")];
          case 8:
            _a.sent();
            return [4 /*yield*/, promises_1.default.writeFile(d, "delta")];
          case 9:
            _a.sent();
            return [4 /*yield*/, promises_1.default.rm(a)];
          case 10:
            _a.sent();
            // Simulate service restart by clearing in-memory root so ensureBootstrap re-runs
            indexer_js_1.indexerManager.rootPath = null;
            indexer_js_1.indexerManager.queue = [];
            indexer_js_1.indexerManager.active = false;
            indexer_js_1.indexerManager._draining = false;
            return [
              4 /*yield*/,
              indexer_js_1.indexerManager.ensureBootstrap(ROOT),
            ];
          case 11:
            _a.sent();
            return [4 /*yield*/, waitIdle()];
          case 12:
            _a.sent();
            upsertPaths = new Set(
              col.upserts.flatMap(function (u) {
                return (u.metadatas || []).map(function (m) {
                  return m.path;
                });
              }),
            );
            t.true(upsertPaths.has("b.txt"));
            t.true(upsertPaths.has("d.txt"));
            deletedPaths = new Set(
              col.deletes.map(function (d) {
                return (
                  (d.where && d.where.path) ||
                  (d.where && d.where.eq && d.where.eq.path)
                );
              }),
            );
            t.true(deletedPaths.has("a.txt"));
            return [2 /*return*/];
        }
      });
    });
  },
);
ava_1.default.after.always(function () {
  // Reset globals
  (0, indexer_js_1.resetChroma)();
  (0, indexer_js_1.setEmbeddingFactory)(null);
  (0, indexer_js_1.setChromaClient)({
    getOrCreateCollection: function () {
      return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
          return [
            2 /*return*/,
            {
              query: function () {
                return __awaiter(void 0, void 0, void 0, function () {
                  return __generator(this, function (_a) {
                    return [2 /*return*/, {}];
                  });
                });
              },
              upsert: function () {
                return __awaiter(void 0, void 0, void 0, function () {
                  return __generator(this, function (_a) {
                    return [2 /*return*/];
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
  });
});

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
var node_path_1 = require("node:path");
var promises_1 = require("node:fs/promises");
var indexer_js_1 = require("../../indexer.js");
var ROOT = node_path_1.default.join(process.cwd(), "src", "tests", "fixtures");
var EmptyCollection = /** @class */ (function () {
  function EmptyCollection() {}
  EmptyCollection.prototype.query = function () {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        return [2 /*return*/, {}];
      });
    });
  };
  EmptyCollection.prototype.upsert = function () {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        return [2 /*return*/];
      });
    });
  };
  return EmptyCollection;
})();
var WeirdCollection = /** @class */ (function () {
  function WeirdCollection() {}
  WeirdCollection.prototype.query = function () {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        return [
          2 /*return*/,
          {
            ids: [[["id"]]],
            documents: [[["doc"]]],
            metadatas: [[[{ path: "p", startLine: 1, endLine: 1 }]]],
            distances: [[["not-a-number"]]],
          },
        ];
      });
    });
  };
  return WeirdCollection;
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
ava_1.default.beforeEach(function () {
  // Default to harmless stubs to avoid cross-test interference
  (0, indexer_js_1.setChromaClient)(new FakeChroma(new EmptyCollection()));
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
});
ava_1.default.serial(
  "embedding env config uses env defaults (no broker)",
  function (t) {
    return __awaiter(void 0, void 0, void 0, function () {
      var prevD, prevF, cfg;
      return __generator(this, function (_a) {
        prevD = process.env.EMBEDDING_DRIVER;
        prevF = process.env.EMBEDDING_FUNCTION;
        try {
          process.env.EMBEDDING_DRIVER = "driverZ";
          process.env.EMBEDDING_FUNCTION = "fnZ";
          cfg = (0, indexer_js_1.embeddingEnvConfig)();
          t.deepEqual(cfg, { driver: "driverZ", fn: "fnZ" });
        } finally {
          if (prevD === undefined) delete process.env.EMBEDDING_DRIVER;
          else process.env.EMBEDDING_DRIVER = prevD;
          if (prevF === undefined) delete process.env.EMBEDDING_FUNCTION;
          else process.env.EMBEDDING_FUNCTION = prevF;
        }
        return [2 /*return*/];
      });
    });
  },
);
ava_1.default.serial(
  "search handles empty result shape via fallbacks",
  function (t) {
    return __awaiter(void 0, void 0, void 0, function () {
      var res, err_1;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            t.plan(1);
            _a.label = 1;
          case 1:
            _a.trys.push([1, 3, , 4]);
            (0, indexer_js_1.setChromaClient)(
              new FakeChroma(new EmptyCollection()),
            );
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
            return [4 /*yield*/, (0, indexer_js_1.search)(ROOT, "q", 2)];
          case 2:
            res = _a.sent();
            t.deepEqual(res, []);
            return [3 /*break*/, 4];
          case 3:
            err_1 = _a.sent();
            t.fail(
              "search threw: " +
                String(
                  (err_1 === null || err_1 === void 0
                    ? void 0
                    : err_1.message) || err_1,
                ),
            );
            return [3 /*break*/, 4];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  },
);
ava_1.default.serial(
  "search sets undefined score when distance not a number",
  function (t) {
    return __awaiter(void 0, void 0, void 0, function () {
      var res, err_2;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            t.plan(2);
            _a.label = 1;
          case 1:
            _a.trys.push([1, 3, , 4]);
            (0, indexer_js_1.setChromaClient)(
              new FakeChroma(new WeirdCollection()),
            );
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
            return [4 /*yield*/, (0, indexer_js_1.search)(ROOT, "q", 1)];
          case 2:
            res = _a.sent();
            t.is(res.length, 1);
            t.is(res[0].score, undefined);
            return [3 /*break*/, 4];
          case 3:
            err_2 = _a.sent();
            t.fail(
              "search threw: " +
                String(
                  (err_2 === null || err_2 === void 0
                    ? void 0
                    : err_2.message) || err_2,
                ),
            );
            return [3 /*break*/, 4];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  },
);
ava_1.default.serial("reindexAll honors EXCLUDE_GLOBS", function (t) {
  return __awaiter(void 0, void 0, void 0, function () {
    var prev, tmp, info;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          prev = process.env.EXCLUDE_GLOBS;
          tmp = node_path_1.default.join(ROOT, "tmp_excl.txt");
          return [4 /*yield*/, promises_1.default.writeFile(tmp, "x")];
        case 1:
          _a.sent();
          _a.label = 2;
        case 2:
          _a.trys.push([2, , 4, 6]);
          process.env.EXCLUDE_GLOBS = "tmp_excl.txt";
          (0, indexer_js_1.setChromaClient)(
            new FakeChroma(new EmptyCollection()),
          );
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
          return [
            4 /*yield*/,
            (0, indexer_js_1.reindexAll)(ROOT, { include: ["tmp_excl.txt"] }),
          ];
        case 3:
          info = _a.sent();
          t.is(info.processed, 0);
          return [3 /*break*/, 6];
        case 4:
          if (prev === undefined) delete process.env.EXCLUDE_GLOBS;
          else process.env.EXCLUDE_GLOBS = prev;
          return [
            4 /*yield*/,
            promises_1.default.unlink(tmp).catch(function () {}),
          ];
        case 5:
          _a.sent();
          return [7 /*endfinally*/];
        case 6:
          return [2 /*return*/];
      }
    });
  });
});
ava_1.default.after.always(function () {
  // Ensure no real clients linger
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
            },
          ];
        });
      });
    },
  });
});

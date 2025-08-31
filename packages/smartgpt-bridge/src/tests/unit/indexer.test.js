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
var FakeCollection = /** @class */ (function () {
  function FakeCollection() {
    this.upserts = [];
  }
  FakeCollection.prototype.upsert = function (payload) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        this.upserts.push(payload);
        return [2 /*return*/];
      });
    });
  };
  FakeCollection.prototype.query = function (_a) {
    return __awaiter(this, arguments, void 0, function (_b) {
      var queryTexts = _b.queryTexts,
        nResults = _b.nResults;
      return __generator(this, function (_c) {
        return [
          2 /*return*/,
          {
            ids: [[["x#0"]]],
            documents: [[["doc"]]],
            metadatas: [
              [[{ path: "x", chunkIndex: 0, startLine: 1, endLine: 1 }]],
            ],
            distances: [[[0.42]]],
          },
        ];
      });
    });
  };
  return FakeCollection;
})();
var FakeChroma = /** @class */ (function () {
  function FakeChroma() {}
  FakeChroma.prototype.getOrCreateCollection = function () {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        return [2 /*return*/, new FakeCollection()];
      });
    });
  };
  return FakeChroma;
})();
ava_1.default.before(function () {
  (0, indexer_js_1.setChromaClient)(new FakeChroma());
  (0, indexer_js_1.setEmbeddingFactory)(function () {
    return __awaiter(void 0, void 0, void 0, function () {
      return __generator(this, function (_a) {
        return [
          2 /*return*/,
          {
            generate: function (texts) {
              return __awaiter(void 0, void 0, void 0, function () {
                return __generator(this, function (_a) {
                  return [
                    2 /*return*/,
                    texts.map(function () {
                      return [0, 0, 0];
                    }),
                  ];
                });
              });
            },
          },
        ];
      });
    });
  });
});
(0, ava_1.default)(
  "reindexAll processes multiple chunks and calls upsert",
  function (t) {
    return __awaiter(void 0, void 0, void 0, function () {
      var tmp, line, info;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            tmp = node_path_1.default.join(ROOT, "tmp_big.txt");
            line = "A".repeat(2050);
            return [
              4 /*yield*/,
              promises_1.default.writeFile(
                tmp,
                "".concat(line, "\n").concat(line),
              ),
            ];
          case 1:
            _a.sent();
            _a.label = 2;
          case 2:
            _a.trys.push([2, , 4, 6]);
            return [
              4 /*yield*/,
              (0, indexer_js_1.reindexAll)(ROOT, { include: ["tmp_big.txt"] }),
            ];
          case 3:
            info = _a.sent();
            t.true(info.processed >= 2);
            return [3 /*break*/, 6];
          case 4:
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
  },
);
ava_1.default.after.always(function () {
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
(0, ava_1.default)("reindexSubset forwards include globs", function (t) {
  return __awaiter(void 0, void 0, void 0, function () {
    var tmp, info;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          tmp = node_path_1.default.join(ROOT, "tmp_small.txt");
          return [4 /*yield*/, promises_1.default.writeFile(tmp, "hello")];
        case 1:
          _a.sent();
          _a.label = 2;
        case 2:
          _a.trys.push([2, , 4, 6]);
          return [
            4 /*yield*/,
            (0, indexer_js_1.reindexSubset)(ROOT, "tmp_small.txt", {}),
          ];
        case 3:
          info = _a.sent();
          t.true(info.processed >= 1);
          return [3 /*break*/, 6];
        case 4:
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
(0, ava_1.default)(
  "search returns shaped results from fake client",
  function (t) {
    return __awaiter(void 0, void 0, void 0, function () {
      var res;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [4 /*yield*/, (0, indexer_js_1.search)(ROOT, "q", 1)];
          case 1:
            res = _a.sent();
            t.is(res.length, 1);
            t.is(res[0].path, "x");
            t.is(res[0].startLine, 1);
            t.is(res[0].endLine, 1);
            t.is(res[0].score, 0.42);
            return [2 /*return*/];
        }
      });
    });
  },
);

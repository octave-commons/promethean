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
var files_js_1 = require("../../files.js");
var ROOT = node_path_1.default.join(process.cwd(), "src", "tests", "fixtures");
(0, ava_1.default)(
  "locateStacktrace: Node style with function (nodeB)",
  function (t) {
    return __awaiter(void 0, void 0, void 0, function () {
      var p, trace, res;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            p = node_path_1.default.join(ROOT, "hello.ts");
            trace = "Error at Greeter.greet (".concat(p, ":2:5)");
            return [
              4 /*yield*/,
              (0, files_js_1.locateStacktrace)(ROOT, trace, 1),
            ];
          case 1:
            res = _a.sent();
            t.true(res.length >= 1);
            t.true(res[0].resolved);
            t.is(res[0].path.endsWith("hello.ts"), true);
            return [2 /*return*/];
        }
      });
    });
  },
);
(0, ava_1.default)(
  "locateStacktrace: Python File:line unresolved",
  function (t) {
    return __awaiter(void 0, void 0, void 0, function () {
      var res;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [
              4 /*yield*/,
              (0, files_js_1.locateStacktrace)(
                ROOT,
                'File "/no/such/file.py", line 12',
                1,
              ),
            ];
          case 1:
            res = _a.sent();
            t.true(res.length >= 1);
            t.false(res[0].resolved);
            return [2 /*return*/];
        }
      });
    });
  },
);
(0, ava_1.default)("locateStacktrace: Go file:line unresolved", function (t) {
  return __awaiter(void 0, void 0, void 0, function () {
    var res;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          return [
            4 /*yield*/,
            (0, files_js_1.locateStacktrace)(ROOT, "cmd/main.go:45", 1),
          ];
        case 1:
          res = _a.sent();
          t.true(res.length >= 1);
          t.false(res[0].resolved);
          return [2 /*return*/];
      }
    });
  });
});
(0, ava_1.default)("resolvePath returns null for non-existent", function (t) {
  return __awaiter(void 0, void 0, void 0, function () {
    var p;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          return [4 /*yield*/, (0, files_js_1.resolvePath)(ROOT, "nope.txt")];
        case 1:
          p = _a.sent();
          t.is(p, null);
          return [2 /*return*/];
      }
    });
  });
});
(0, ava_1.default)("viewFile throws when file missing", function (t) {
  return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          return [
            4 /*yield*/,
            t.throwsAsync(function () {
              return (0, files_js_1.viewFile)(ROOT, "nope.txt", 1, 1);
            }),
          ];
        case 1:
          _a.sent();
          return [2 /*return*/];
      }
    });
  });
});
(0, ava_1.default)(
  "normalizeToRoot treats leading slash as repo root",
  function (t) {
    var p1 = (0, files_js_1.normalizeToRoot)(
      process.cwd(),
      "src/tests/fixtures/readme.md",
    );
    var p2 = (0, files_js_1.normalizeToRoot)(
      process.cwd(),
      "/tests/fixtures/readme.md",
    );
    t.is(p1, p2);
  },
);
(0, ava_1.default)('normalizeToRoot resolves "/" to repo root', function (t) {
  var p = (0, files_js_1.normalizeToRoot)(process.cwd(), "/");
  t.is(p, node_path_1.default.resolve(process.cwd()));
});

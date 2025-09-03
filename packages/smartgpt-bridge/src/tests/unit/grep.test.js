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
var execa_1 = require("execa");
var grep_js_1 = require("../../grep.js");
var ROOT = node_path_1.default.join(process.cwd(), "src", "tests", "fixtures");
function runRg(pattern, opts) {
  return __awaiter(this, void 0, void 0, function () {
    var _a,
      _b,
      flags,
      _c,
      paths,
      _d,
      exclude,
      _e,
      maxMatches,
      _f,
      context,
      args,
      searchPaths,
      _i,
      paths_1,
      p,
      stdout,
      lines,
      out,
      cache,
      _g,
      lines_1,
      line,
      obj,
      relPath,
      fileLines,
      text,
      lineNumber,
      lineText,
      column,
      start,
      end,
      snippet;
    var _h, _j, _k;
    return __generator(this, function (_l) {
      switch (_l.label) {
        case 0:
          (_a = opts || {}),
            (_b = _a.flags),
            (flags = _b === void 0 ? "g" : _b),
            (_c = _a.paths),
            (paths = _c === void 0 ? ["**/*.md"] : _c),
            (_d = _a.exclude),
            (exclude = _d === void 0 ? [] : _d),
            (_e = _a.maxMatches),
            (maxMatches = _e === void 0 ? 200 : _e),
            (_f = _a.context),
            (context = _f === void 0 ? 1 : _f);
          args = [
            "--json",
            "--max-count",
            String(maxMatches),
            "-C",
            String(context),
          ];
          if (flags.includes("i")) args.push("-i");
          exclude.forEach(function (ex) {
            args.push("--glob", "!".concat(ex));
          });
          searchPaths = [];
          for (_i = 0, paths_1 = paths; _i < paths_1.length; _i++) {
            p = paths_1[_i];
            if (/[?*{}\[\]]/.test(p)) {
              args.push("--glob", p);
            } else {
              searchPaths.push(p);
            }
          }
          args.push(pattern);
          if (searchPaths.length) {
            args.push.apply(args, searchPaths);
          } else {
            args.push(".");
          }
          return [4 /*yield*/, (0, execa_1.execa)("rg", args, { cwd: ROOT })];
        case 1:
          stdout = _l.sent().stdout;
          lines = stdout.split(/\r?\n/).filter(Boolean);
          out = [];
          cache = new Map();
          (_g = 0), (lines_1 = lines);
          _l.label = 2;
        case 2:
          if (!(_g < lines_1.length)) return [3 /*break*/, 6];
          line = lines_1[_g];
          obj = JSON.parse(line);
          if (obj.type !== "match") return [3 /*break*/, 5];
          relPath = obj.data.path.text.startsWith("./")
            ? obj.data.path.text.slice(2)
            : obj.data.path.text;
          fileLines = cache.get(relPath);
          if (!!fileLines) return [3 /*break*/, 4];
          return [
            4 /*yield*/,
            promises_1.default.readFile(
              node_path_1.default.join(ROOT, relPath),
              "utf8",
            ),
          ];
        case 3:
          text = _l.sent();
          fileLines = text.split(/\r?\n/);
          cache.set(relPath, fileLines);
          _l.label = 4;
        case 4:
          lineNumber = obj.data.line_number;
          lineText = obj.data.lines.text.replace(/\n$/, "");
          column =
            ((_k =
              (_j =
                (_h = obj.data.submatches) === null || _h === void 0
                  ? void 0
                  : _h[0]) === null || _j === void 0
                ? void 0
                : _j.start) !== null && _k !== void 0
              ? _k
              : 0) + 1;
          start = Math.max(0, lineNumber - 1 - context);
          end = Math.min(fileLines.length, lineNumber - 1 + context + 1);
          snippet = fileLines.slice(start, end).join("\n");
          out.push({
            path: relPath,
            line: lineNumber,
            column: column,
            lineText: lineText,
            snippet: snippet,
            startLine: start + 1,
            endLine: end,
          });
          if (out.length >= maxMatches) return [3 /*break*/, 6];
          _l.label = 5;
        case 5:
          _g++;
          return [3 /*break*/, 2];
        case 6:
          return [2 /*return*/, out];
      }
    });
  });
}
(0, ava_1.default)(
  "grep: matches ripgrep output with context and flags",
  function (t) {
    return __awaiter(void 0, void 0, void 0, function () {
      var opts, _a, results, expected;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            opts = {
              pattern: "heading",
              flags: "i",
              paths: ["**/*.md"],
              context: 1,
            };
            return [
              4 /*yield*/,
              Promise.all([
                (0, grep_js_1.grep)(ROOT, opts),
                runRg(opts.pattern, opts),
              ]),
            ];
          case 1:
            (_a = _b.sent()), (results = _a[0]), (expected = _a[1]);
            t.deepEqual(results, expected);
            t.snapshot(results);
            return [2 /*return*/];
        }
      });
    });
  },
);
(0, ava_1.default)("grep: invalid regex throws error", function (t) {
  return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          return [
            4 /*yield*/,
            t.throwsAsync(function () {
              return (0, grep_js_1.grep)(ROOT, {
                pattern: "(*invalid",
                paths: ["**/*.md"],
              });
            }),
          ];
        case 1:
          _a.sent();
          return [2 /*return*/];
      }
    });
  });
});

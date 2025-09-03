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
exports.resolvePath = resolvePath;
exports.viewFile = viewFile;
exports.locateStacktrace = locateStacktrace;
exports.listDirectory = listDirectory;
exports.treeDirectory = treeDirectory;
// @ts-nocheck
var promises_1 = require("node:fs/promises");
var node_path_1 = require("node:path");
var fileExplorer_js_1 = require("@shared/ts/dist/fs/fileExplorer.js");
var tree_js_1 = require("@shared/ts/dist/fs/tree.js");
var gitignore_util_js_1 = require("./gitignore-util.js");
function resolveDir(ROOT_PATH, rel) {
  if (rel === void 0) {
    rel = ".";
  }
  var base = node_path_1.default.resolve(ROOT_PATH);
  var abs = node_path_1.default.resolve(base, rel);
  if (!abs.startsWith(base)) throw new Error("path outside root");
  return abs;
}
function resolvePath(ROOT_PATH, p) {
  return __awaiter(this, void 0, void 0, function () {
    var absCandidate, st, _a, matches;
    return __generator(this, function (_b) {
      switch (_b.label) {
        case 0:
          if (!p) return [2 /*return*/, null];
          absCandidate = node_path_1.default.resolve(ROOT_PATH, p);
          _b.label = 1;
        case 1:
          _b.trys.push([1, 3, , 4]);
          return [4 /*yield*/, promises_1.default.stat(absCandidate)];
        case 2:
          st = _b.sent();
          if (st.isFile()) return [2 /*return*/, absCandidate];
          return [3 /*break*/, 4];
        case 3:
          _a = _b.sent();
          return [3 /*break*/, 4];
        case 4:
          return [
            4 /*yield*/,
            (0, fileExplorer_js_1.searchFiles)(ROOT_PATH, p, 1),
          ];
        case 5:
          matches = _b.sent();
          if (matches.length)
            return [
              2 /*return*/,
              node_path_1.default.resolve(ROOT_PATH, matches[0].relative),
            ];
          return [2 /*return*/, null];
      }
    });
  });
}
function viewFile(ROOT_PATH_1, relOrFuzzy_1) {
  return __awaiter(
    this,
    arguments,
    void 0,
    function (ROOT_PATH, relOrFuzzy, line, context) {
      var abs, rel, raw, lines, L, ctx, start, end;
      if (line === void 0) {
        line = 1;
      }
      if (context === void 0) {
        context = 25;
      }
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [4 /*yield*/, resolvePath(ROOT_PATH, relOrFuzzy)];
          case 1:
            abs = _a.sent();
            if (!abs) throw new Error("file not found");
            rel = node_path_1.default.relative(ROOT_PATH, abs);
            return [
              4 /*yield*/,
              (0, fileExplorer_js_1.readFile)(ROOT_PATH, rel),
            ];
          case 2:
            raw = _a.sent();
            lines = raw.split(/\r?\n/);
            L = Math.max(1, Math.min(lines.length, Number(line) || 1));
            ctx = Math.max(0, Number(context) || 0);
            start = Math.max(1, L - ctx);
            end = Math.min(lines.length, L + ctx);
            return [
              2 /*return*/,
              {
                path: rel,
                totalLines: lines.length,
                startLine: start,
                endLine: end,
                focusLine: L,
                snippet: lines.slice(start - 1, end).join("\n"),
              },
            ];
        }
      });
    },
  );
}
var RX = {
  nodeA: /\(?(?<file>[^():\n]+?):(?<line>\d+):(?<col>\d+)\)?/g,
  nodeB: /at\s+.*?\((?<file>[^()]+?):(?<line>\d+):(?<col>\d+)\)/g,
  py: /File\s+"(?<file>[^"]+)",\s+line\s+(?<line>\d+)/g,
  go: /(?<file>[^\s:]+?):(?<line>\d+)/g,
};
function locateStacktrace(ROOT_PATH_1, text_1) {
  return __awaiter(
    this,
    arguments,
    void 0,
    function (ROOT_PATH, text, context) {
      var results, _i, _a, key, re, m, file, line, col, snippet;
      var _b, _c, _d;
      if (context === void 0) {
        context = 25;
      }
      return __generator(this, function (_e) {
        switch (_e.label) {
          case 0:
            results = [];
            (_i = 0), (_a = Object.keys(RX));
            _e.label = 1;
          case 1:
            if (!(_i < _a.length)) return [3 /*break*/, 5];
            key = _a[_i];
            re = RX[key];
            re.lastIndex = 0;
            m = void 0;
            _e.label = 2;
          case 2:
            if (!true) return [3 /*break*/, 4];
            m = re.exec(text);
            if (!m) return [3 /*break*/, 4];
            file = (_b = m.groups) === null || _b === void 0 ? void 0 : _b.file;
            line = Number(
              ((_c = m.groups) === null || _c === void 0 ? void 0 : _c.line) ||
                1,
            );
            col = ((_d = m.groups) === null || _d === void 0 ? void 0 : _d.col)
              ? Number(m.groups.col)
              : undefined;
            if (!file) return [3 /*break*/, 2];
            return [4 /*yield*/, safeView(ROOT_PATH, file, line, context)];
          case 3:
            snippet = _e.sent();
            if (snippet) {
              results.push({
                path: snippet.path,
                line: line,
                column: col,
                resolved: true,
                relPath: snippet.path,
                startLine: snippet.startLine,
                endLine: snippet.endLine,
                focusLine: snippet.focusLine,
                snippet: snippet.snippet,
              });
            } else {
              results.push({
                path: file,
                line: line,
                column: col,
                resolved: false,
              });
            }
            return [3 /*break*/, 2];
          case 4:
            _i++;
            return [3 /*break*/, 1];
          case 5:
            return [2 /*return*/, results];
        }
      });
    },
  );
}
function safeView(ROOT_PATH, file, line, context) {
  return __awaiter(this, void 0, void 0, function () {
    var _a;
    return __generator(this, function (_b) {
      switch (_b.label) {
        case 0:
          _b.trys.push([0, 2, , 3]);
          return [4 /*yield*/, viewFile(ROOT_PATH, file, line, context)];
        case 1:
          return [2 /*return*/, _b.sent()];
        case 2:
          _a = _b.sent();
          return [2 /*return*/, null];
        case 3:
          return [2 /*return*/];
      }
    });
  });
}
function listDirectory(ROOT_PATH_1, rel_1) {
  return __awaiter(this, arguments, void 0, function (ROOT_PATH, rel, options) {
    var includeHidden,
      type,
      abs,
      ig,
      entries,
      out,
      _i,
      entries_1,
      e,
      childAbs,
      size,
      mtimeMs,
      s,
      _a;
    if (options === void 0) {
      options = {};
    }
    return __generator(this, function (_b) {
      switch (_b.label) {
        case 0:
          includeHidden = Boolean(options.hidden || options.includeHidden);
          type = options.type;
          abs = resolveDir(ROOT_PATH, rel || ".");
          return [
            4 /*yield*/,
            (0, gitignore_util_js_1.loadGitIgnore)(ROOT_PATH, abs),
          ];
        case 1:
          ig = _b.sent();
          return [
            4 /*yield*/,
            (0, fileExplorer_js_1.listDir)(ROOT_PATH, rel || ".", {
              includeHidden: includeHidden,
            }),
          ];
        case 2:
          entries = _b.sent();
          out = [];
          (_i = 0), (entries_1 = entries);
          _b.label = 3;
        case 3:
          if (!(_i < entries_1.length)) return [3 /*break*/, 9];
          e = entries_1[_i];
          if (ig.ignores(e.relative)) return [3 /*break*/, 8];
          if (type && e.type !== type) return [3 /*break*/, 8];
          childAbs = node_path_1.default.resolve(ROOT_PATH, e.relative);
          size = null;
          mtimeMs = null;
          _b.label = 4;
        case 4:
          _b.trys.push([4, 6, , 7]);
          return [4 /*yield*/, promises_1.default.stat(childAbs)];
        case 5:
          s = _b.sent();
          size = e.type === "file" ? s.size : null;
          mtimeMs = s.mtimeMs;
          return [3 /*break*/, 7];
        case 6:
          _a = _b.sent();
          return [3 /*break*/, 7];
        case 7:
          out.push({
            name: e.name,
            path: e.relative,
            type: e.type,
            size: size,
            mtimeMs: mtimeMs,
          });
          _b.label = 8;
        case 8:
          _i++;
          return [3 /*break*/, 3];
        case 9:
          out.sort(function (a, b) {
            if (a.type !== b.type) return a.type === "dir" ? -1 : 1;
            return a.name.localeCompare(b.name);
          });
          return [
            2 /*return*/,
            {
              ok: true,
              base: node_path_1.default.relative(ROOT_PATH, abs) || ".",
              entries: out,
            },
          ];
      }
    });
  });
}
function treeDirectory(ROOT_PATH_1, rel_1) {
  return __awaiter(this, arguments, void 0, function (ROOT_PATH, rel, options) {
    function mapNode(node) {
      var relPath = node_path_1.default
        .join(relBase, node.relative || "")
        .replace(/\\/g, "/");
      var base = { name: node.name, path: relPath || ".", type: node.type };
      if (node.children) base.children = node.children.map(mapNode);
      if (typeof node.size === "number") base.size = node.size;
      if (typeof node.mtimeMs === "number") base.mtimeMs = node.mtimeMs;
      return base;
    }
    var includeHidden, depth, abs, relBase, ig, raw;
    if (options === void 0) {
      options = {};
    }
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          includeHidden = Boolean(options.includeHidden);
          depth = Number(options.depth || 1);
          abs = resolveDir(ROOT_PATH, rel || ".");
          relBase = node_path_1.default.relative(ROOT_PATH, abs) || ".";
          return [
            4 /*yield*/,
            (0, gitignore_util_js_1.loadGitIgnore)(ROOT_PATH, abs),
          ];
        case 1:
          ig = _a.sent();
          return [
            4 /*yield*/,
            (0, tree_js_1.buildTree)(abs, {
              includeHidden: includeHidden,
              maxDepth: depth,
              predicate: function (absPath, dirent) {
                var relPath = node_path_1.default.relative(
                  ROOT_PATH,
                  node_path_1.default.join(absPath, dirent.name),
                );
                return !ig.ignores(relPath);
              },
            }),
          ];
        case 2:
          raw = _a.sent();
          return [
            2 /*return*/,
            { ok: true, base: relBase, tree: mapNode(raw) },
          ];
      }
    });
  });
}

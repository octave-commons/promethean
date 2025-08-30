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
exports.grep = grep;
// @ts-nocheck
var execa_1 = require("execa");
var promises_1 = require("fs/promises");
var files_js_1 = require("./files.js");
function splitCSV(s) {
  return (s || "")
    .split(",")
    .map(function (x) {
      return x.trim();
    })
    .filter(Boolean);
}
function defaultExcludes() {
  var env = splitCSV(process.env.EXCLUDE_GLOBS);
  return env.length
    ? env
    : ["node_modules/**", ".git/**", "dist/**", "build/**", ".obsidian/**"];
}
function grep(ROOT_PATH, opts) {
  return __awaiter(this, void 0, void 0, function () {
    var _a,
      pattern,
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
      err_1,
      msg,
      lines,
      out,
      cache,
      _g,
      lines_1,
      line,
      obj,
      relPath,
      fileLines,
      abs,
      text,
      _h,
      lineNumber,
      lineText,
      column,
      start,
      end,
      snippet;
    var _j, _k, _l;
    return __generator(this, function (_m) {
      switch (_m.label) {
        case 0:
          (_a = opts || {}),
            (pattern = _a.pattern),
            (_b = _a.flags),
            (flags = _b === void 0 ? "g" : _b),
            (_c = _a.paths),
            (paths =
              _c === void 0
                ? ["**/*.{ts,tsx,js,jsx,py,go,rs,md,txt,json,yml,yaml,sh}"]
                : _c),
            (_d = _a.exclude),
            (exclude = _d === void 0 ? defaultExcludes() : _d),
            (_e = _a.maxMatches),
            (maxMatches = _e === void 0 ? 200 : _e),
            (_f = _a.context),
            (context = _f === void 0 ? 2 : _f);
          if (!pattern || typeof pattern !== "string")
            throw new Error("Missing regex 'pattern'");
          args = [
            "--json",
            "--max-count",
            String(maxMatches),
            "-C",
            String(context),
          ];
          if (flags.includes("i")) args.push("-i");
          exclude.forEach(function (ex) {
            return args.push("--glob", "!".concat(ex));
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
          _m.label = 1;
        case 1:
          _m.trys.push([1, 3, , 4]);
          return [
            4 /*yield*/,
            (0, execa_1.execa)("rg", args, { cwd: ROOT_PATH }),
          ];
        case 2:
          stdout = _m.sent().stdout;
          return [3 /*break*/, 4];
        case 3:
          err_1 = _m.sent();
          // rg exits with code 1 when no matches are found. In that case the
          // stdout still contains a JSON summary which we can treat as an empty
          // result set.
          if (err_1.exitCode === 1 && err_1.stdout) {
            stdout = err_1.stdout;
          } else {
            msg = err_1.stderr || err_1.message;
            throw new Error("rg error: " + msg);
          }
          return [3 /*break*/, 4];
        case 4:
          lines = stdout.split(/\r?\n/).filter(Boolean);
          out = [];
          cache = new Map();
          (_g = 0), (lines_1 = lines);
          _m.label = 5;
        case 5:
          if (!(_g < lines_1.length)) return [3 /*break*/, 11];
          line = lines_1[_g];
          obj = JSON.parse(line);
          if (obj.type !== "match") return [3 /*break*/, 10];
          relPath = obj.data.path.text.startsWith("./")
            ? obj.data.path.text.slice(2)
            : obj.data.path.text;
          fileLines = cache.get(relPath);
          if (!!fileLines) return [3 /*break*/, 9];
          abs = (0, files_js_1.normalizeToRoot)(ROOT_PATH, relPath);
          _m.label = 6;
        case 6:
          _m.trys.push([6, 8, , 9]);
          return [4 /*yield*/, promises_1.default.readFile(abs, "utf8")];
        case 7:
          text = _m.sent();
          fileLines = text.split(/\r?\n/);
          cache.set(relPath, fileLines);
          return [3 /*break*/, 9];
        case 8:
          _h = _m.sent();
          return [3 /*break*/, 10];
        case 9:
          lineNumber = obj.data.line_number;
          lineText = obj.data.lines.text.replace(/\n$/, "");
          column =
            ((_l =
              (_k =
                (_j = obj.data.submatches) === null || _j === void 0
                  ? void 0
                  : _j[0]) === null || _k === void 0
                ? void 0
                : _k.start) !== null && _l !== void 0
              ? _l
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
          if (out.length >= maxMatches) return [3 /*break*/, 11];
          _m.label = 10;
        case 10:
          _g++;
          return [3 /*break*/, 5];
        case 11:
          return [2 /*return*/, out];
      }
    });
  });
}

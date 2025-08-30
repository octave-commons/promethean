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
exports.symbolsIndex = symbolsIndex;
exports.symbolsFind = symbolsFind;
// @ts-nocheck
var typescript_1 = require("typescript");
var path_1 = require("path");
var promises_1 = require("fs/promises");
var fast_glob_1 = require("fast-glob");
var files_js_1 = require("./files.js");
var SYMBOL_INDEX = []; // array of { path, name, kind, startLine, endLine, signature? }
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
function kindOf(node) {
  if (typescript_1.default.isClassDeclaration(node)) return "class";
  if (typescript_1.default.isInterfaceDeclaration(node)) return "interface";
  if (typescript_1.default.isFunctionDeclaration(node)) return "function";
  if (typescript_1.default.isMethodDeclaration(node)) return "method";
  if (typescript_1.default.isArrowFunction(node)) return "arrow";
  if (typescript_1.default.isVariableDeclaration(node)) return "var";
  if (typescript_1.default.isEnumDeclaration(node)) return "enum";
  if (typescript_1.default.isTypeAliasDeclaration(node)) return "type";
  if (typescript_1.default.isModuleDeclaration(node)) return "namespace";
  return typescript_1.default.SyntaxKind[node.kind] || "node";
}
function nameOf(node) {
  var n = node.name;
  if (!n) return undefined;
  return n.escapedText ? String(n.escapedText) : n.getText();
}
function signatureOf(node, source) {
  try {
    var text = node.getText(source);
    var max = 200;
    return text.length > max ? text.slice(0, max) + "…" : text;
  } catch (_a) {
    return undefined;
  }
}
function addSymbol(sourceFile, node, fileRel) {
  var _a, _b, _c, _d;
  var k = kindOf(node);
  var name =
    nameOf(node) ||
    (typescript_1.default.isVariableStatement(node)
      ? (_d =
          (_c =
            (_b =
              (_a = node.declarationList) === null || _a === void 0
                ? void 0
                : _a.declarations) === null || _b === void 0
              ? void 0
              : _b[0]) === null || _c === void 0
            ? void 0
            : _c.name) === null || _d === void 0
        ? void 0
        : _d.getText(sourceFile)
      : undefined);
  if (!name) return;
  var startLine = sourceFile.getLineAndCharacterOfPosition(
    node.getStart(),
  ).line;
  var endLine = sourceFile.getLineAndCharacterOfPosition(node.end).line;
  SYMBOL_INDEX.push({
    path: fileRel,
    name: name,
    kind: k,
    startLine: startLine + 1,
    endLine: endLine + 1,
    signature: signatureOf(node, sourceFile),
  });
}
function walk(sourceFile, fileRel) {
  function visit(node) {
    if (
      typescript_1.default.isClassDeclaration(node) ||
      typescript_1.default.isInterfaceDeclaration(node) ||
      typescript_1.default.isFunctionDeclaration(node) ||
      typescript_1.default.isMethodDeclaration(node) ||
      typescript_1.default.isVariableStatement(node) ||
      typescript_1.default.isEnumDeclaration(node) ||
      typescript_1.default.isTypeAliasDeclaration(node) ||
      typescript_1.default.isModuleDeclaration(node)
    ) {
      addSymbol(sourceFile, node, fileRel);
    }
    typescript_1.default.forEachChild(node, visit);
  }
  visit(sourceFile);
}
function symbolsIndex(ROOT_PATH_1) {
  return __awaiter(this, arguments, void 0, function (ROOT_PATH, opts) {
    var include,
      exclude,
      files,
      count,
      _i,
      files_1,
      abs,
      text,
      safeAbs,
      _a,
      rel,
      sf;
    if (opts === void 0) {
      opts = {};
    }
    return __generator(this, function (_b) {
      switch (_b.label) {
        case 0:
          SYMBOL_INDEX = [];
          include = opts.paths || ["**/*.{ts,tsx,js,jsx}"];
          exclude = opts.exclude || defaultExcludes();
          return [
            4 /*yield*/,
            (0, fast_glob_1.default)(include, {
              cwd: ROOT_PATH,
              ignore: exclude,
              onlyFiles: true,
              dot: false,
              absolute: true,
            }),
          ];
        case 1:
          files = _b.sent();
          count = 0;
          (_i = 0), (files_1 = files);
          _b.label = 2;
        case 2:
          if (!(_i < files_1.length)) return [3 /*break*/, 8];
          abs = files_1[_i];
          if (!(0, files_js_1.isInsideRoot)(ROOT_PATH, abs))
            return [3 /*break*/, 7];
          text = "";
          _b.label = 3;
        case 3:
          _b.trys.push([3, 5, , 6]);
          safeAbs = (0, files_js_1.normalizeToRoot)(ROOT_PATH, abs);
          return [4 /*yield*/, promises_1.default.readFile(safeAbs, "utf8")];
        case 4:
          text = _b.sent();
          return [3 /*break*/, 6];
        case 5:
          _a = _b.sent();
          return [3 /*break*/, 7];
        case 6:
          rel = path_1.default.relative(ROOT_PATH, abs);
          sf = typescript_1.default.createSourceFile(
            abs,
            text,
            typescript_1.default.ScriptTarget.Latest,
            true,
          );
          walk(sf, rel);
          count++;
          _b.label = 7;
        case 7:
          _i++;
          return [3 /*break*/, 2];
        case 8:
          return [
            2 /*return*/,
            { files: count, symbols: SYMBOL_INDEX.length, builtAt: Date.now() },
          ];
      }
    });
  });
}
function symbolsFind(query_1) {
  return __awaiter(this, arguments, void 0, function (query, opts) {
    var q, kind, pathFilter, limit, out, _i, SYMBOL_INDEX_1, s;
    if (opts === void 0) {
      opts = {};
    }
    return __generator(this, function (_a) {
      q = String(query || "").toLowerCase();
      kind = opts.kind ? String(opts.kind).toLowerCase() : null;
      pathFilter = opts.path ? String(opts.path).toLowerCase() : null;
      limit = Number(opts.limit || 200);
      out = [];
      for (
        _i = 0, SYMBOL_INDEX_1 = SYMBOL_INDEX;
        _i < SYMBOL_INDEX_1.length;
        _i++
      ) {
        s = SYMBOL_INDEX_1[_i];
        if (q && !s.name.toLowerCase().includes(q)) continue;
        if (kind && s.kind.toLowerCase() !== kind) continue;
        if (pathFilter && !s.path.toLowerCase().includes(pathFilter)) continue;
        out.push(s);
        if (out.length >= limit) break;
      }
      return [2 /*return*/, out];
    });
  });
}

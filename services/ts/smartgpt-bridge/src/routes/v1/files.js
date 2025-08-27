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
var __spreadArray =
  (this && this.__spreadArray) ||
  function (to, from, pack) {
    if (pack || arguments.length === 2)
      for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
          if (!ar) ar = Array.prototype.slice.call(from, 0, i);
          ar[i] = from[i];
        }
      }
    return to.concat(ar || Array.prototype.slice.call(from));
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerFilesRoutes = registerFilesRoutes;
// @ts-nocheck
var promises_1 = require("fs/promises");
var files_js_1 = require("../../files.js");
var indexer_js_1 = require("../../indexer.js");
function registerFilesRoutes(v1) {
  // ------------------------------------------------------------------
  // Files
  // Unified handler for /files and /files/*
  function filesHandler(req, reply) {
    return __awaiter(this, void 0, void 0, function () {
      function walkFlat(node) {
        var _a, _b;
        if (node.path !== undefined && node.type !== undefined) {
          if (node.path !== "." && node.path !== "")
            flat_1.push({
              name: node.name,
              path: node.path,
              type: node.type,
              size: (_a = node.size) !== null && _a !== void 0 ? _a : null,
              mtimeMs:
                (_b = node.mtimeMs) !== null && _b !== void 0 ? _b : null,
            });
        }
        if (Array.isArray(node.children)) {
          for (var _i = 0, _c = node.children; _i < _c.length; _i++) {
            var child = _c[_i];
            walkFlat(child);
          }
        }
      }
      var q,
        p,
        dir,
        hidden,
        type,
        depth,
        wantTree,
        ROOT_PATH,
        info,
        viewErr_1,
        treeResult,
        treeResult,
        flat_1,
        e_1;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            q = req.query || {};
            p = req.params && (req.params["*"] || req.params.path);
            dir = p || String(q.path || ".");
            hidden = String(q.hidden || "false").toLowerCase() === "true";
            type = q.type ? String(q.type) : undefined;
            depth =
              typeof q.depth === "number" ? q.depth : Number(q.depth || 2);
            wantTree = String(q.tree || "false").toLowerCase() === "true";
            ROOT_PATH = process.env.ROOT_PATH || process.cwd();
            _a.label = 1;
          case 1:
            _a.trys.push([1, 10, , 11]);
            _a.label = 2;
          case 2:
            _a.trys.push([2, 4, , 9]);
            return [
              4 /*yield*/,
              (0, files_js_1.viewFile)(ROOT_PATH, dir, q.line, q.context),
            ];
          case 3:
            info = _a.sent();
            reply.send(__assign({ ok: true }, info));
            return [3 /*break*/, 9];
          case 4:
            viewErr_1 = _a.sent();
            if (!wantTree) return [3 /*break*/, 6];
            return [
              4 /*yield*/,
              (0, files_js_1.treeDirectory)(ROOT_PATH, dir, {
                includeHidden: hidden,
                depth: depth,
                type: type,
              }),
            ];
          case 5:
            treeResult = _a.sent();
            reply.send({
              ok: true,
              base: treeResult.base,
              tree: treeResult.tree,
            });
            return [3 /*break*/, 8];
          case 6:
            return [
              4 /*yield*/,
              (0, files_js_1.treeDirectory)(ROOT_PATH, dir, {
                includeHidden: hidden,
                depth: depth,
                type: type,
              }),
            ];
          case 7:
            treeResult = _a.sent();
            flat_1 = [];
            walkFlat(treeResult.tree);
            reply.send({ ok: true, base: treeResult.base, entries: flat_1 });
            _a.label = 8;
          case 8:
            return [3 /*break*/, 9];
          case 9:
            return [3 /*break*/, 11];
          case 10:
            e_1 = _a.sent();
            reply
              .code(400)
              .send({
                ok: false,
                error: String(
                  (e_1 === null || e_1 === void 0 ? void 0 : e_1.message) ||
                    e_1,
                ),
              });
            return [3 /*break*/, 11];
          case 11:
            return [2 /*return*/];
        }
      });
    });
  }
  // ------------------------------------------------------------------
  v1.get("/files", {
    preHandler: [
      v1.authUser,
      v1.requirePolicy("read", function () {
        return "files";
      }),
    ],
    schema: {
      summary: "List files, tree, or view file",
      operationId: "files",
      tags: ["Files"],
      querystring: {
        type: "object",
        properties: {
          path: { type: "string", default: "." },
          hidden: { type: "boolean", default: false },
          type: { type: "string", enum: ["file", "dir"] },
          depth: { type: "integer", minimum: 0, default: 2 },
          tree: { type: "boolean", default: false },
          line: { type: "integer", minimum: 1 },
          context: { type: "integer", minimum: 0 },
        },
      },
    },
    handler: filesHandler,
  });
  v1.get("/files/*", {
    preHandler: [
      v1.authUser,
      v1.requirePolicy("read", function () {
        return "files";
      }),
    ],
    schema: {
      summary: "List files, tree, or view file",
      operationId: "files",
      tags: ["Files"],
      params: {
        type: "object",
        properties: {
          "*": { type: "string" },
        },
      },
      querystring: {
        type: "object",
        properties: {
          path: { type: "string", default: "." },
          hidden: { type: "boolean", default: false },
          type: { type: "string", enum: ["file", "dir"] },
          depth: { type: "integer", minimum: 0, default: 2 },
          tree: { type: "boolean", default: false },
          line: { type: "integer", minimum: 1 },
          context: { type: "integer", minimum: 0 },
        },
      },
    },
    handler: filesHandler,
  });
  v1.post("/files/reindex", {
    preHandler: [
      v1.authUser,
      v1.requirePolicy("write", function () {
        return "files";
      }),
    ],
    schema: {
      summary: "Reindex files under a path",
      operationId: "reindexFiles",
      tags: ["Files"],
      body: {
        type: "object",
        properties: { path: { type: "string" } },
      },
    },
    handler: function (req, reply) {
      return __awaiter(this, void 0, void 0, function () {
        var globs, r, e_2;
        var _a;
        return __generator(this, function (_b) {
          switch (_b.label) {
            case 0:
              _b.trys.push([0, 2, , 3]);
              globs =
                (_a = req.body) === null || _a === void 0 ? void 0 : _a.path;
              if (!globs)
                return [
                  2 /*return*/,
                  reply.code(400).send({ ok: false, error: "Missing 'path'" }),
                ];
              return [
                4 /*yield*/,
                indexer_js_1.indexerManager.scheduleReindexSubset(globs),
              ];
            case 1:
              r = _b.sent();
              reply.send(r);
              return [3 /*break*/, 3];
            case 2:
              e_2 = _b.sent();
              reply
                .code(500)
                .send({
                  ok: false,
                  error: String(
                    (e_2 === null || e_2 === void 0 ? void 0 : e_2.message) ||
                      e_2,
                  ),
                });
              return [3 /*break*/, 3];
            case 3:
              return [2 /*return*/];
          }
        });
      });
    },
  });
  // PUT /files: create, overwrite, or edit lines in a file
  v1.put("/files", {
    preHandler: [
      v1.authUser,
      v1.requirePolicy("write", function () {
        return "files";
      }),
    ],
    schema: {
      summary: "Create, overwrite, or edit lines in a file",
      operationId: "putFile",
      tags: ["Files"],
      body: {
        type: "object",
        required: ["path"],
        properties: {
          path: { type: "string" },
          content: {
            type: "string",
            description: "Full file content (overwrites file)",
          },
          lines: {
            type: "array",
            items: { type: "string" },
            description: "Lines to write/replace",
          },
          startLine: {
            type: "integer",
            minimum: 1,
            description: "1-based line to start writing lines at",
          },
        },
      },
      response: {
        200: {
          type: "object",
          properties: { ok: { type: "boolean" }, path: { type: "string" } },
        },
        400: {
          type: "object",
          properties: { ok: { type: "boolean" }, error: { type: "string" } },
        },
      },
    },
    handler: function (req, reply) {
      return __awaiter(this, void 0, void 0, function () {
        var _a,
          filePath,
          content,
          lines,
          startLine,
          ROOT_PATH,
          abs,
          fileLines,
          raw,
          _b,
          idx,
          e_3;
        return __generator(this, function (_c) {
          switch (_c.label) {
            case 0:
              (_a = req.body || {}),
                (filePath = _a.path),
                (content = _a.content),
                (lines = _a.lines),
                (startLine = _a.startLine);
              ROOT_PATH = process.env.ROOT_PATH || process.cwd();
              if (!filePath)
                return [
                  2 /*return*/,
                  reply.code(400).send({ ok: false, error: "Missing path" }),
                ];
              abs = (0, files_js_1.normalizeToRoot)(ROOT_PATH, filePath);
              _c.label = 1;
            case 1:
              _c.trys.push([1, 11, , 12]);
              if (!(typeof content === "string")) return [3 /*break*/, 3];
              return [
                4 /*yield*/,
                promises_1.default.writeFile(abs, content, "utf8"),
              ];
            case 2:
              _c.sent();
              return [2 /*return*/, reply.send({ ok: true, path: filePath })];
            case 3:
              if (!(Array.isArray(lines) && typeof startLine === "number"))
                return [3 /*break*/, 9];
              fileLines = [];
              _c.label = 4;
            case 4:
              _c.trys.push([4, 6, , 7]);
              return [4 /*yield*/, promises_1.default.readFile(abs, "utf8")];
            case 5:
              raw = _c.sent();
              fileLines = raw.split(/\r?\n/);
              return [3 /*break*/, 7];
            case 6:
              _b = _c.sent();
              return [3 /*break*/, 7];
            case 7:
              idx = Math.max(0, startLine - 1);
              // Insert/replace lines
              fileLines.splice.apply(
                fileLines,
                __spreadArray([idx, lines.length], lines, false),
              );
              return [
                4 /*yield*/,
                promises_1.default.writeFile(abs, fileLines.join("\n"), "utf8"),
              ];
            case 8:
              _c.sent();
              return [2 /*return*/, reply.send({ ok: true, path: filePath })];
            case 9:
              return [
                2 /*return*/,
                reply.code(400).send({
                  ok: false,
                  error: "Must provide content or lines+startLine",
                }),
              ];
            case 10:
              return [3 /*break*/, 12];
            case 11:
              e_3 = _c.sent();
              reply
                .code(400)
                .send({
                  ok: false,
                  error: String(
                    (e_3 === null || e_3 === void 0 ? void 0 : e_3.message) ||
                      e_3,
                  ),
                });
              return [3 /*break*/, 12];
            case 12:
              return [2 /*return*/];
          }
        });
      });
    },
  });
}

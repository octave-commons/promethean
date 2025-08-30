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
exports.registerFilesRoutes = registerFilesRoutes;
// @ts-nocheck
var files_js_1 = require("../../files.js");
function registerFilesRoutes(fastify) {
  var _this = this;
  var ROOT_PATH = fastify.ROOT_PATH;
  fastify.get("/files/list", {
    schema: {
      summary: "List files in a directory",
      operationId: "listFiles",
      tags: ["Files"],
      querystring: {
        type: "object",
        properties: {
          path: { type: "string", default: "." },
          hidden: { type: "boolean", default: false },
          type: { type: "string", enum: ["file", "dir"] },
        },
      },
      response: {
        200: {
          type: "object",
          properties: {
            ok: { type: "boolean" },
            base: { type: "string" },
            entries: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  path: { type: "string" },
                  type: { type: "string" },
                  size: { type: ["integer", "null"] },
                  mtimeMs: { type: ["number", "null"] },
                },
              },
            },
          },
        },
      },
    },
    handler: function (req, reply) {
      return __awaiter(_this, void 0, void 0, function () {
        var q, dir, hidden, type, out, e_1;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              q = req.query || {};
              dir = String(q.path || ".");
              hidden = String(q.hidden || "false").toLowerCase() === "true";
              type = q.type ? String(q.type) : undefined;
              _a.label = 1;
            case 1:
              _a.trys.push([1, 3, , 4]);
              return [
                4 /*yield*/,
                (0, files_js_1.listDirectory)(ROOT_PATH, dir, {
                  hidden: hidden,
                  type: type,
                }),
              ];
            case 2:
              out = _a.sent();
              reply.send(out);
              return [3 /*break*/, 4];
            case 3:
              e_1 = _a.sent();
              reply.code(400).send({
                ok: false,
                error: String(
                  (e_1 === null || e_1 === void 0 ? void 0 : e_1.message) ||
                    e_1,
                ),
              });
              return [3 /*break*/, 4];
            case 4:
              return [2 /*return*/];
          }
        });
      });
    },
  });
  fastify.get("/files/tree", {
    schema: {
      summary: "Return directory tree",
      operationId: "treeFiles",
      tags: ["Files"],
      querystring: {
        type: "object",
        properties: {
          path: { type: "string", default: "." },
          depth: { type: "integer", default: 1 },
          hidden: { type: "boolean", default: false },
        },
      },
      response: {
        200: {
          type: "object",
          properties: {
            ok: { type: "boolean" },
            base: { type: "string" },
            tree: { $ref: "FileTreeNode#" },
          },
          additionalProperties: false,
        },
      },
    },
    handler: function (req, reply) {
      return __awaiter(_this, void 0, void 0, function () {
        var q, dir, depth, hidden, out, e_2;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              q = req.query || {};
              dir = String(q.path || ".");
              depth = Number(q.depth || 1);
              hidden = String(q.hidden || "false").toLowerCase() === "true";
              _a.label = 1;
            case 1:
              _a.trys.push([1, 3, , 4]);
              return [
                4 /*yield*/,
                (0, files_js_1.treeDirectory)(ROOT_PATH, dir, {
                  depth: depth,
                  includeHidden: hidden,
                }),
              ];
            case 2:
              out = _a.sent();
              reply.send(out);
              return [3 /*break*/, 4];
            case 3:
              e_2 = _a.sent();
              reply.code(400).send({
                ok: false,
                error: String(
                  (e_2 === null || e_2 === void 0 ? void 0 : e_2.message) ||
                    e_2,
                ),
              });
              return [3 /*break*/, 4];
            case 4:
              return [2 /*return*/];
          }
        });
      });
    },
  });
  fastify.get("/files/view", {
    schema: {
      summary: "View a file snippet",
      operationId: "viewFile",
      tags: ["Files"],
      querystring: {
        type: "object",
        required: ["path"],
        properties: {
          path: { type: "string" },
          line: { type: "integer", default: 1 },
          context: { type: "integer", default: 25 },
        },
      },
      response: {
        200: {
          type: "object",
          properties: {
            ok: { type: "boolean" },
            path: { type: "string" },
            totalLines: { type: "integer" },
            startLine: { type: "integer" },
            endLine: { type: "integer" },
            focusLine: { type: "integer" },
            snippet: { type: "string" },
          },
        },
      },
    },
    handler: function (req, reply) {
      return __awaiter(_this, void 0, void 0, function () {
        var q, p, info, e_3;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              q = req.query || {};
              p = q.path;
              if (!p)
                return [
                  2 /*return*/,
                  reply.code(400).send({ ok: false, error: "Missing path" }),
                ];
              _a.label = 1;
            case 1:
              _a.trys.push([1, 3, , 4]);
              return [
                4 /*yield*/,
                (0, files_js_1.viewFile)(
                  ROOT_PATH,
                  String(p),
                  Number(q.line || 1),
                  Number(q.context || 25),
                ),
              ];
            case 2:
              info = _a.sent();
              reply.send(__assign({ ok: true }, info));
              return [3 /*break*/, 4];
            case 3:
              e_3 = _a.sent();
              reply.code(404).send({
                ok: false,
                error: String(
                  (e_3 === null || e_3 === void 0 ? void 0 : e_3.message) ||
                    e_3,
                ),
              });
              return [3 /*break*/, 4];
            case 4:
              return [2 /*return*/];
          }
        });
      });
    },
  });
  fastify.post("/stacktrace/locate", {
    schema: {
      summary: "Locate files from a stacktrace",
      operationId: "locateStacktrace",
      tags: ["Files"],
      body: {
        type: "object",
        properties: {
          text: { type: "string" },
          trace: { type: "string" },
          context: { type: "integer", default: 25 },
        },
      },
      response: {
        200: {
          type: "object",
          properties: {
            ok: { type: "boolean" },
            results: { type: "array", items: { $ref: "StacktraceResult#" } },
          },
          additionalProperties: false,
        },
      },
    },
    handler: function (req, reply) {
      return __awaiter(_this, void 0, void 0, function () {
        var body, text, ctx, r, e_4;
        var _a, _b;
        return __generator(this, function (_c) {
          switch (_c.label) {
            case 0:
              _c.trys.push([0, 2, , 3]);
              body = req.body || {};
              text =
                (_b =
                  (_a = body.text) !== null && _a !== void 0
                    ? _a
                    : body.trace) !== null && _b !== void 0
                  ? _b
                  : "";
              ctx = Number(body.context || 25);
              return [
                4 /*yield*/,
                (0, files_js_1.locateStacktrace)(ROOT_PATH, String(text), ctx),
              ];
            case 1:
              r = _c.sent();
              reply.send({ ok: true, results: r });
              return [3 /*break*/, 3];
            case 2:
              e_4 = _c.sent();
              reply.code(400).send({
                ok: false,
                error: String(
                  (e_4 === null || e_4 === void 0 ? void 0 : e_4.message) ||
                    e_4,
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
}

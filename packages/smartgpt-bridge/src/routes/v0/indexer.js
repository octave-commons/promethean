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
exports.registerIndexerRoutes = registerIndexerRoutes;
// @ts-nocheck
var indexer_js_1 = require("../../indexer.js");
function registerIndexerRoutes(fastify) {
  var _this = this;
  var ROOT_PATH = fastify.ROOT_PATH;
  fastify.post("/reindex", {
    schema: {
      summary: "Reindex entire repository",
      operationId: "reindexAll",
      tags: ["Indexer"],
      response: {
        200: {
          type: "object",
          properties: {
            ok: { type: "boolean" },
            queued: { type: "integer" },
            ignored: { type: "boolean" },
          },
        },
      },
    },
    handler: function (_req, reply) {
      return __awaiter(_this, void 0, void 0, function () {
        var r, e_1;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              _a.trys.push([0, 2, , 3]);
              return [
                4 /*yield*/,
                indexer_js_1.indexerManager.scheduleReindexAll(),
              ];
            case 1:
              r = _a.sent();
              reply.send(r);
              return [3 /*break*/, 3];
            case 2:
              e_1 = _a.sent();
              reply.code(500).send({
                ok: false,
                error: String(
                  (e_1 === null || e_1 === void 0 ? void 0 : e_1.message) ||
                    e_1,
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
  fastify.post("/files/reindex", {
    schema: {
      summary: "Reindex subset of files",
      operationId: "reindexFiles",
      tags: ["Indexer"],
      body: {
        type: "object",
        properties: {
          path: { type: ["string", "array"], items: { type: "string" } },
        },
      },
      querystring: {
        type: "object",
        properties: {
          path: { type: ["string", "array"], items: { type: "string" } },
        },
      },
      response: {
        200: {
          type: "object",
          properties: {
            ok: { type: "boolean" },
            queued: { type: "integer" },
            ignored: { type: "boolean" },
          },
        },
      },
    },
    handler: function (req, reply) {
      return __awaiter(_this, void 0, void 0, function () {
        var globs, r, e_2;
        var _a, _b, _c;
        return __generator(this, function (_d) {
          switch (_d.label) {
            case 0:
              _d.trys.push([0, 2, , 3]);
              globs =
                (_b =
                  (_a = req.body) === null || _a === void 0
                    ? void 0
                    : _a.path) !== null && _b !== void 0
                  ? _b
                  : (_c = req.query) === null || _c === void 0
                    ? void 0
                    : _c.path;
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
              r = _d.sent();
              reply.send(r);
              return [3 /*break*/, 3];
            case 2:
              e_2 = _d.sent();
              reply.code(500).send({
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
  fastify.get("/indexer/status", {
    schema: {
      summary: "Get indexer status",
      operationId: "indexerStatus",
      tags: ["Indexer"],
      response: {
        200: {
          type: "object",
          properties: {
            ok: { type: "boolean" },
            status: { type: "object" },
          },
        },
      },
    },
    handler: function (_req, reply) {
      return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
          try {
            reply.send({
              ok: true,
              status: indexer_js_1.indexerManager.status(),
            });
          } catch (e) {
            reply.code(500).send({
              ok: false,
              error: String(
                (e === null || e === void 0 ? void 0 : e.message) || e,
              ),
            });
          }
          return [2 /*return*/];
        });
      });
    },
  });
  fastify.post("/indexer/index", {
    schema: {
      summary: "Index a single file",
      operationId: "indexFile",
      tags: ["Indexer"],
      body: {
        type: "object",
        required: ["path"],
        properties: { path: { type: "string" } },
      },
      response: {
        200: {
          type: "object",
          properties: { ok: { type: "boolean" }, queued: { type: "integer" } },
        },
      },
    },
    handler: function (req, reply) {
      return __awaiter(_this, void 0, void 0, function () {
        var p, r, e_3;
        var _a;
        return __generator(this, function (_b) {
          switch (_b.label) {
            case 0:
              _b.trys.push([0, 2, , 3]);
              p = (_a = req.body) === null || _a === void 0 ? void 0 : _a.path;
              if (!p)
                return [
                  2 /*return*/,
                  reply.code(400).send({ ok: false, error: "Missing path" }),
                ];
              return [
                4 /*yield*/,
                indexer_js_1.indexerManager.scheduleIndexFile(String(p)),
              ];
            case 1:
              r = _b.sent();
              reply.send(r);
              return [3 /*break*/, 3];
            case 2:
              e_3 = _b.sent();
              reply.code(500).send({
                ok: false,
                error: String(
                  (e_3 === null || e_3 === void 0 ? void 0 : e_3.message) ||
                    e_3,
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
  fastify.post("/indexer/remove", {
    schema: {
      summary: "Remove a file from index",
      operationId: "removeFileFromIndex",
      tags: ["Indexer"],
      body: {
        type: "object",
        required: ["path"],
        properties: { path: { type: "string" } },
      },
      response: {
        200: {
          type: "object",
          properties: { ok: { type: "boolean" }, error: { type: "string" } },
        },
      },
    },
    handler: function (req, reply) {
      return __awaiter(_this, void 0, void 0, function () {
        var p, rel, out, e_4;
        var _a;
        return __generator(this, function (_b) {
          switch (_b.label) {
            case 0:
              _b.trys.push([0, 2, , 3]);
              p = (_a = req.body) === null || _a === void 0 ? void 0 : _a.path;
              if (!p)
                return [
                  2 /*return*/,
                  reply.code(400).send({ ok: false, error: "Missing path" }),
                ];
              rel = String(p);
              return [4 /*yield*/, indexer_js_1.indexerManager.removeFile(rel)];
            case 1:
              out = _b.sent();
              reply.send(out);
              return [3 /*break*/, 3];
            case 2:
              e_4 = _b.sent();
              reply.code(500).send({
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
  fastify.post("/indexer/reset", {
    schema: {
      summary: "Reset indexer state and bootstrap",
      operationId: "resetIndexer",
      tags: ["Indexer"],
      response: {
        200: { type: "object", properties: { ok: { type: "boolean" } } },
        409: {
          type: "object",
          properties: { ok: { type: "boolean" }, error: { type: "string" } },
        },
      },
    },
    handler: function (_req, reply) {
      return __awaiter(_this, void 0, void 0, function () {
        var e_5;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              _a.trys.push([0, 2, , 3]);
              if (indexer_js_1.indexerManager.isBusy())
                return [
                  2 /*return*/,
                  reply.code(409).send({ ok: false, error: "Indexer busy" }),
                ];
              return [
                4 /*yield*/,
                indexer_js_1.indexerManager.resetAndBootstrap(ROOT_PATH),
              ];
            case 1:
              _a.sent();
              reply.send({ ok: true });
              return [3 /*break*/, 3];
            case 2:
              e_5 = _a.sent();
              reply.code(500).send({
                ok: false,
                error: String(
                  (e_5 === null || e_5 === void 0 ? void 0 : e_5.message) ||
                    e_5,
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

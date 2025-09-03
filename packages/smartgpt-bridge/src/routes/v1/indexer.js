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
function registerIndexerRoutes(v1) {
  v1.get("/indexer", {
    preHandler: [
      v1.authUser,
      v1.requirePolicy("read", function () {
        return "indexer";
      }),
    ],
    schema: {
      summary: "Get indexer status",
      operationId: "getIndexerStatus",
      tags: ["Indexer"],
      response: {
        200: {
          type: "object",
          properties: {
            ok: { type: "boolean" },
            status: { type: "object", additionalProperties: true },
            lastIndexedAt: {
              type: "string",
              format: "date-time",
              nullable: true,
            },
            stats: {
              type: "object",
              additionalProperties: true,
              nullable: true,
            },
          },
        },
      },
    },
    handler: function () {
      return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
          return [2 /*return*/, { ok: true, status: indexerManager.status() }];
        });
      });
    },
  });
  v1.post("/indexer", {
    preHandler: [
      v1.authUser,
      v1.requirePolicy("write", function () {
        return "indexer";
      }),
    ],
    schema: {
      summary: "Control indexer",
      operationId: "controlIndexer",
      tags: ["Indexer"],
      body: {
        type: "object",
        required: ["op"],
        properties: {
          op: { type: "string", enum: ["index", "remove", "reset", "reindex"] },
          path: { type: "string" },
        },
      },
      response: {
        200: {
          type: "object",
          properties: {
            ok: { type: "boolean" },
            message: { type: "string", nullable: true },
          },
        },
        400: {
          type: "object",
          properties: {
            ok: { type: "boolean" },
            error: { type: "string" },
          },
        },
      },
    },
    handler: function (req, reply) {
      return __awaiter(this, void 0, void 0, function () {
        var _a, op, p, r, r, r, r, e_1;
        return __generator(this, function (_b) {
          switch (_b.label) {
            case 0:
              (_a = req.body || {}), (op = _a.op), (p = _a.path);
              _b.label = 1;
            case 1:
              _b.trys.push([1, 12, , 13]);
              if (!(op === "index")) return [3 /*break*/, 3];
              if (!p)
                return [
                  2 /*return*/,
                  reply.code(400).send({ ok: false, error: "missing path" }),
                ];
              return [4 /*yield*/, indexerManager.scheduleIndexFile(String(p))];
            case 2:
              r = _b.sent();
              return [2 /*return*/, reply.send(r)];
            case 3:
              if (!(op === "remove")) return [3 /*break*/, 5];
              if (!p)
                return [
                  2 /*return*/,
                  reply.code(400).send({ ok: false, error: "missing path" }),
                ];
              return [4 /*yield*/, indexerManager.removeFile(String(p))];
            case 4:
              r = _b.sent();
              return [2 /*return*/, reply.send(r)];
            case 5:
              if (!(op === "reset")) return [3 /*break*/, 7];
              if (indexerManager.isBusy())
                return [
                  2 /*return*/,
                  reply.code(409).send({ ok: false, error: "Indexer busy" }),
                ];
              return [4 /*yield*/, indexerManager.resetAndBootstrap(ROOT_PATH)];
            case 6:
              _b.sent();
              return [2 /*return*/, reply.send({ ok: true })];
            case 7:
              if (!(op === "reindex")) return [3 /*break*/, 11];
              if (!p) return [3 /*break*/, 9];
              return [4 /*yield*/, indexerManager.scheduleReindexSubset(p)];
            case 8:
              r = _b.sent();
              return [2 /*return*/, reply.send(r)];
            case 9:
              return [4 /*yield*/, indexerManager.scheduleReindexAll()];
            case 10:
              r = _b.sent();
              return [2 /*return*/, reply.send(r)];
            case 11:
              return [
                2 /*return*/,
                reply.code(400).send({ ok: false, error: "invalid op" }),
              ];
            case 12:
              e_1 = _b.sent();
              reply.code(500).send({
                ok: false,
                error: String(
                  (e_1 === null || e_1 === void 0 ? void 0 : e_1.message) ||
                    e_1,
                ),
              });
              return [3 /*break*/, 13];
            case 13:
              return [2 /*return*/];
          }
        });
      });
    },
  });
}

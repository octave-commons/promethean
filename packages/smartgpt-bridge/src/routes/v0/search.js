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
exports.registerSearchRoutes = registerSearchRoutes;
// @ts-nocheck
var indexer_js_1 = require("../../indexer.js");
var sinks_js_1 = require("../../sinks.js");
function registerSearchRoutes(fastify) {
  var _this = this;
  var ROOT_PATH = fastify.ROOT_PATH;
  fastify.post("/search", {
    preHandler: [fastify.authUser, fastify.requirePolicy("read", "search")],
    schema: {
      summary: "Semantic search via Chroma",
      operationId: "semanticSearch",
      tags: ["Search"],
      body: {
        $id: "SearchRequest",
        type: "object",
        required: ["q"],
        properties: {
          q: { type: "string" },
          n: { type: "integer", default: 8 },
        },
      },
      response: {
        200: {
          $id: "SearchResponse",
          type: "object",
          properties: {
            ok: { type: "boolean" },
            results: { type: "array", items: { $ref: "SearchResult#" } },
          },
          additionalProperties: false,
        },
      },
    },
    handler: function (req, reply) {
      return __awaiter(_this, void 0, void 0, function () {
        var _a, q, n, results, store, _b, e_1;
        return __generator(this, function (_c) {
          switch (_c.label) {
            case 0:
              _c.trys.push([0, 6, , 7]);
              (_a = req.body || {}), (q = _a.q), (n = _a.n);
              if (!q)
                return [
                  2 /*return*/,
                  reply.code(400).send({ ok: false, error: "Missing 'q'" }),
                ];
              return [
                4 /*yield*/,
                (0, indexer_js_1.search)(
                  ROOT_PATH,
                  q,
                  n !== null && n !== void 0 ? n : 8,
                ),
              ];
            case 1:
              results = _c.sent();
              _c.label = 2;
            case 2:
              _c.trys.push([2, 4, , 5]);
              store = sinks_js_1.contextStore.getCollection("bridge_searches");
              return [
                4 /*yield*/,
                store.addEntry({
                  text: JSON.stringify({
                    query: q,
                    results: results,
                    service: "chroma",
                  }),
                  timestamp: Date.now(),
                  metadata: {
                    query: q,
                    resultCount: results.length,
                    service: "chroma",
                  },
                }),
              ];
            case 3:
              _c.sent();
              return [3 /*break*/, 5];
            case 4:
              _b = _c.sent();
              return [3 /*break*/, 5];
            case 5:
              reply.send({ ok: true, results: results });
              return [3 /*break*/, 7];
            case 6:
              e_1 = _c.sent();
              reply.code(500).send({
                ok: false,
                error: String(
                  (e_1 === null || e_1 === void 0 ? void 0 : e_1.message) ||
                    e_1,
                ),
              });
              return [3 /*break*/, 7];
            case 7:
              return [2 /*return*/];
          }
        });
      });
    },
  });
  fastify.post("/search/web", {
    preHandler: [
      fastify.authUser,
      fastify.requirePolicy("search", "bridge_searches"),
    ],
    schema: {
      operationId: "webSearch",
      tags: ["Search"],
      body: {
        type: "object",
        required: ["q"],
        properties: {
          q: { type: "string" },
          limit: { type: "integer", default: 5 },
        },
      },
    },
    handler: function (req) {
      return __awaiter(_this, void 0, void 0, function () {
        var _a, q, limit, url, res, data, results, store, _b;
        return __generator(this, function (_c) {
          switch (_c.label) {
            case 0:
              (_a = req.body || {}), (q = _a.q), (limit = _a.limit);
              url = "https://api.duckduckgo.com/?q=".concat(
                encodeURIComponent(q),
                "&format=json&no_redirect=1&no_html=1",
              );
              return [4 /*yield*/, fetch(url)];
            case 1:
              res = _c.sent();
              return [4 /*yield*/, res.json()];
            case 2:
              data = _c.sent();
              results = extractResults(data).slice(0, limit || 5);
              _c.label = 3;
            case 3:
              _c.trys.push([3, 5, , 6]);
              store = sinks_js_1.contextStore.getCollection("bridge_searches");
              return [
                4 /*yield*/,
                store.addEntry({
                  text: JSON.stringify({ query: q, results: results }),
                  timestamp: Date.now(),
                  metadata: { query: q, resultCount: results.length },
                }),
              ];
            case 4:
              _c.sent();
              return [3 /*break*/, 6];
            case 5:
              _b = _c.sent();
              return [3 /*break*/, 6];
            case 6:
              return [2 /*return*/, { results: results }];
          }
        });
      });
    },
  });
}
function extractResults(data) {
  var results = [];
  if (data === null || data === void 0 ? void 0 : data.Results) {
    for (var _i = 0, _a = data.Results; _i < _a.length; _i++) {
      var r = _a[_i];
      if (r.Text && r.FirstURL)
        results.push({ title: r.Text, url: r.FirstURL, snippet: r.Text });
    }
  }
  if (data === null || data === void 0 ? void 0 : data.RelatedTopics) {
    for (var _b = 0, _c = data.RelatedTopics; _b < _c.length; _b++) {
      var item = _c[_b];
      if (item.Topics) {
        for (var _d = 0, _e = item.Topics; _d < _e.length; _d++) {
          var sub = _e[_d];
          if (sub.Text && sub.FirstURL)
            results.push({
              title: sub.Text,
              url: sub.FirstURL,
              snippet: sub.Text,
            });
        }
      } else if (item.Text && item.FirstURL) {
        results.push({
          title: item.Text,
          url: item.FirstURL,
          snippet: item.Text,
        });
      }
    }
  }
  if (
    (data === null || data === void 0 ? void 0 : data.AbstractURL) &&
    (data === null || data === void 0 ? void 0 : data.AbstractText)
  ) {
    results.push({
      title: data.Heading || data.AbstractURL,
      url: data.AbstractURL,
      snippet: data.AbstractText,
    });
  }
  return results;
}

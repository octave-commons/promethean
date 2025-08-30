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
exports.registerSearchRoutes = registerSearchRoutes;
// @ts-nocheck
var grep_js_1 = require("../../grep.js");
var indexer_js_1 = require("../../indexer.js");
var sinks_js_1 = require("../../sinks.js");
// import { search as ddgSearch } from 'duckduckgo-search';
function registerSearchRoutes(v1) {
  var ROOT_PATH = v1.ROOT_PATH;
  // ------------------------------------------------------------------
  // Search
  // ------------------------------------------------------------------
  v1.post("/search/code", {
    preHandler: [
      v1.authUser,
      v1.requirePolicy("read", function () {
        return "code";
      }),
    ],
    schema: {
      summary: "Grep code",
      operationId: "grepCode",
      tags: ["Search"],
      body: {
        type: "object",
        required: ["pattern"],
        properties: {
          pattern: { type: "string" },
          path: { type: "string" },
          flags: { type: "string" },
        },
      },
    },
    handler: function (req, reply) {
      return __awaiter(this, void 0, void 0, function () {
        var body, results, e_1;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              _a.trys.push([0, 2, , 3]);
              body = req.body || {};
              return [
                4 /*yield*/,
                (0, grep_js_1.grep)(ROOT_PATH, {
                  pattern: body.pattern,
                  flags: body.flags || "g",
                  paths: body.path ? [body.path] : undefined,
                  maxMatches: Number(body.maxMatches || 200),
                  context: Number(body.context || 2),
                }),
              ];
            case 1:
              results = _a.sent();
              reply.send({ ok: true, results: results });
              return [3 /*break*/, 3];
            case 2:
              e_1 = _a.sent();
              reply.code(400).send({
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
  v1.post("/search/semantic", {
    preHandler: [
      v1.authUser,
      v1.requirePolicy("read", function () {
        return "search";
      }),
    ],
    schema: {
      summary: "Semantic search (default sink)",
      operationId: "semanticSearch",
      tags: ["Search"],
      body: {
        type: "object",
        required: ["q"],
        properties: {
          q: { type: "string" },
          n: { type: "integer", default: 10 },
          where: { type: "object" },
        },
      },
      response: {
        200: {
          type: "object",
          properties: {
            results: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  path: { type: "string" },
                  chunkIndex: { type: "integer" },
                  startLine: { type: "integer" },
                  endLine: { type: "integer" },
                  score: { type: "number" },
                  text: { type: "string" },
                },
                required: [
                  "id",
                  "path",
                  "chunkIndex",
                  "startLine",
                  "endLine",
                  "score",
                  "text",
                ],
              },
            },
          },
        },
      },
    },
    handler: function (req, reply) {
      return __awaiter(this, void 0, void 0, function () {
        var _a, q, n, results, store, _b, e_2;
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
                (0, indexer_js_1.search)(ROOT_PATH, q, n || 10),
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
              console.log(results);
              reply.send({ results: results });
              return [3 /*break*/, 7];
            case 6:
              e_2 = _c.sent();
              reply.code(500).send({
                ok: false,
                error: String(
                  (e_2 === null || e_2 === void 0 ? void 0 : e_2.message) ||
                    e_2,
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
  v1.post("/search/web", {
    preHandler: [
      v1.authUser,
      v1.requirePolicy("read", function () {
        return "web-search";
      }),
    ],
    schema: {
      summary: "Web search",
      operationId: "webSearch",
      tags: ["Search"],
      body: {
        type: "object",
        required: ["q"],
        properties: {
          q: { type: "string" },
          n: { type: "integer", default: 10, description: "Max results" },
          lang: { type: "string", description: "Prefered Language (BCP-47)" },
          site: { type: "string", description: "Optional site/domain filter" },
        },
      },
    },
    handler: function (req) {
      return __awaiter(this, void 0, void 0, function () {
        var _a, q, n, lang, site, query, opts, results;
        return __generator(this, function (_b) {
          switch (_b.label) {
            case 0:
              (_a = req.body || {}),
                (q = _a.q),
                (n = _a.n),
                (lang = _a.lang),
                (site = _a.site);
              query = q;
              if (site) query = "site:".concat(site, " ").concat(q);
              opts = {};
              if (lang) opts.region = lang;
              return [
                4 /*yield*/,
                ddgSearch(query, __assign({ maxResults: n || 10 }, opts)),
              ];
            case 1:
              results = _b.sent();
              // ddgSearch returns an array of {title, url, description}
              return [
                2 /*return*/,
                {
                  results: results.map(function (r) {
                    return {
                      title: r.title,
                      url: r.url,
                      snippet: r.description || r.snippet || "",
                    };
                  }),
                },
              ];
          }
        });
      });
    },
  });
}

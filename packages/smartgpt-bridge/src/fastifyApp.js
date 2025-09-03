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
exports.buildFastifyApp = buildFastifyApp;
// @ts-nocheck
var fastify_1 = require("fastify");
// Frontend assets are served by a standalone file server under `sites/`
var swagger_1 = require("@fastify/swagger");
var swagger_ui_1 = require("@fastify/swagger-ui");
var ajv_formats_1 = require("ajv-formats");
var fastifyAuth_js_1 = require("./fastifyAuth.js");
var index_js_1 = require("./routes/v0/index.js");
var indexer_js_1 = require("./indexer.js");
var agent_js_1 = require("./agent.js");
var sinks_js_1 = require("./sinks.js");
var rbac_js_1 = require("./rbac.js");
var index_js_2 = require("./routes/v1/index.js");
var index_js_3 = require("./logging/index.js");
function buildFastifyApp(ROOT_PATH) {
  return __awaiter(this, void 0, void 0, function () {
    var app, baseUrl, auth, schemas, swaggerOpts, restoreAllowed;
    var _this = this;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          return [4 /*yield*/, (0, sinks_js_1.registerSinks)()];
        case 1:
          _a.sent();
          app = (0, fastify_1.default)({
            logger: false,
            trustProxy: true,
            ajv: {
              customOptions: { allowUnionTypes: true },
              plugins: [ajv_formats_1.default],
            },
          });
          app.decorate("ROOT_PATH", ROOT_PATH);
          app.register(index_js_3.mongoChromaLogger);
          // Schemas used across routes
          app.addSchema({
            $id: "GrepRequest",
            type: "object",
            required: ["pattern"],
            properties: {
              pattern: { type: "string" },
              flags: { type: "string", default: "g" },
              paths: {
                type: "array",
                items: { type: "string" },
                default: [
                  "**/*.{ts,tsx,js,jsx,py,go,rs,md,txt,json,yml,yaml,sh}",
                ],
              },
              maxMatches: { type: "integer", default: 200 },
              context: { type: "integer", default: 2 },
            },
          });
          app.addSchema({
            $id: "GrepResult",
            type: "object",
            required: [
              "path",
              "line",
              "column",
              "lineText",
              "snippet",
              "startLine",
              "endLine",
            ],
            properties: {
              path: { type: "string" },
              line: { type: "integer" },
              column: { type: "integer" },
              lineText: { type: "string" },
              snippet: { type: "string" },
              startLine: { type: "integer" },
              endLine: { type: "integer" },
            },
            additionalProperties: false,
          });
          app.addSchema({
            $id: "SearchResult",
            type: "object",
            required: [
              "id",
              "path",
              "chunkIndex",
              "startLine",
              "endLine",
              "text",
            ],
            properties: {
              id: { type: "string" },
              path: { type: "string" },
              chunkIndex: { type: "integer" },
              startLine: { type: "integer" },
              endLine: { type: "integer" },
              score: { type: ["number", "null"] },
              text: { type: "string" },
            },
            additionalProperties: false,
          });
          app.addSchema({
            $id: "SymbolResult",
            type: "object",
            required: ["path", "name", "kind", "startLine", "endLine"],
            properties: {
              path: { type: "string" },
              name: { type: "string" },
              kind: { type: "string" },
              startLine: { type: "integer" },
              endLine: { type: "integer" },
              signature: { type: "string" },
            },
            additionalProperties: false,
          });
          // New: child node without `children`
          app.addSchema({
            $id: "FileTreeNodeChild",
            type: "object",
            required: ["name", "path", "type"],
            properties: {
              name: { type: "string" },
              path: { type: "string" },
              type: { type: "string", enum: ["dir", "file"] },
              size: { type: ["integer", "null"] },
              mtimeMs: { type: ["number", "null"] },
            },
            additionalProperties: false,
          });
          // Main node: children use the non-recursive child
          app.addSchema({
            $id: "FileTreeNode",
            type: "object",
            required: ["name", "path", "type"],
            properties: {
              name: { type: "string" },
              path: { type: "string" },
              type: { type: "string", enum: ["dir", "file"] },
              size: { type: ["integer", "null"] },
              mtimeMs: { type: ["number", "null"] },
              children: {
                type: "array",
                items: { $ref: "FileTreeNodeChild#" },
              },
            },
            additionalProperties: false,
          });
          app.addHook("preValidation", function (req, _reply, done) {
            var rp = req.params;
            if ((rp === null || rp === void 0 ? void 0 : rp.path) && !rp["*"])
              rp["*"] = rp.path;
            done();
          });
          app.addSchema({
            $id: "StacktraceResult",
            type: "object",
            required: ["path", "line", "resolved"],
            properties: {
              path: { type: "string" },
              line: { type: "integer" },
              column: { type: ["integer", "null"] },
              resolved: { type: "boolean" },
              relPath: { type: "string" },
              startLine: { type: "integer" },
              endLine: { type: "integer" },
              focusLine: { type: "integer" },
              snippet: { type: "string" },
            },
            additionalProperties: false,
          });
          baseUrl =
            process.env.PUBLIC_BASE_URL ||
            "http://localhost:".concat(process.env.PORT || 3210);
          auth = (0, fastifyAuth_js_1.createFastifyAuth)();
          auth.registerRoutes(app); // adds /auth/me; protection handled inside
          schemas = {
            GrepRequest: app.getSchema("GrepRequest"),
            GrepResult: app.getSchema("GrepResult"),
            SearchResult: app.getSchema("SearchResult"),
            SymbolResult: app.getSchema("SymbolResult"),
            FileTreeNode: app.getSchema("FileTreeNode"),
            StacktraceResult: app.getSchema("StacktraceResult"),
          };
          swaggerOpts = {
            openapi: {
              openapi: "3.1.0",
              info: { title: "Promethean SmartGPT Bridge", version: "1.0.0" },
              servers: [{ url: baseUrl }],
              components: { schemas: schemas },
            },
          };
          if (auth.enabled) {
            swaggerOpts.openapi.components.securitySchemes = {
              bearerAuth: {
                type: "http",
                scheme: "bearer",
                name: "x-pi-token",
              },
            };
            swaggerOpts.openapi.security = [{ bearerAuth: [] }];
          }
          app.register(swagger_1.default, swaggerOpts);
          app.register(swagger_ui_1.default, { routePrefix: "/docs" });
          app.get("/openapi.json", function (_req, rep) {
            return __awaiter(_this, void 0, void 0, function () {
              return __generator(this, function (_a) {
                return [
                  2 /*return*/,
                  rep.type("application/json").send(app.swagger()),
                ];
              });
            });
          });
          (0, rbac_js_1.registerRbac)(app);
          // Mount legacy routes under /v0 with old auth scoped inside
          app.register(
            function (v0) {
              return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                  switch (_a.label) {
                    case 0:
                      return [
                        4 /*yield*/,
                        (0, index_js_1.registerV0Routes)(v0),
                      ];
                    case 1:
                      _a.sent();
                      return [2 /*return*/];
                  }
                });
              });
            },
            { prefix: "/v0" },
          );
          // Mount v1 routes with new auth scoped to /v1
          app.register(
            function (v1Scope) {
              return __awaiter(_this, void 0, void 0, function () {
                var v1Auth;
                return __generator(this, function (_a) {
                  switch (_a.label) {
                    case 0:
                      v1Auth = (0, fastifyAuth_js_1.createFastifyAuth)();
                      if (v1Auth.enabled)
                        v1Scope.addHook("onRequest", v1Auth.preHandler);
                      return [
                        4 /*yield*/,
                        (0, index_js_2.registerV1Routes)(v1Scope),
                      ];
                    case 1:
                      _a.sent();
                      return [2 /*return*/];
                  }
                });
              });
            },
            { prefix: "/v1" },
          );
          // Initialize indexer bootstrap/incremental state unless in test
          if ((process.env.NODE_ENV || "").toLowerCase() !== "test") {
            indexer_js_1.indexerManager
              .ensureBootstrap(ROOT_PATH)
              .catch(function () {});
            restoreAllowed =
              String(process.env.AGENT_RESTORE_ON_START || "true") !== "false";
            if (restoreAllowed)
              (0, agent_js_1.restoreAgentsFromStore)().catch(function () {});
          }
          return [2 /*return*/, app];
      }
    });
  });
}

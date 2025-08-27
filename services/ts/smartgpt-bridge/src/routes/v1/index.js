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
exports.registerV1Routes = registerV1Routes;
// @ts-nocheck
var swagger_1 = require("@fastify/swagger");
var swagger_ui_1 = require("@fastify/swagger-ui");
var files_js_1 = require("./files.js");
var search_js_1 = require("./search.js");
var sinks_js_1 = require("./sinks.js");
var indexer_js_1 = require("./indexer.js");
var agents_js_1 = require("./agents.js");
var exec_js_1 = require("./exec.js");
function registerV1Routes(app) {
  return __awaiter(this, void 0, void 0, function () {
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          // Everything defined here will be reachable under /v1 because of the prefix in fastifyApp.js
          return [
            4 /*yield*/,
            app.register(function v1(v1) {
              return __awaiter(this, void 0, void 0, function () {
                var baseUrl, authEnabled, swaggerOpts;
                var _this = this;
                return __generator(this, function (_a) {
                  switch (_a.label) {
                    case 0:
                      baseUrl =
                        process.env.PUBLIC_BASE_URL ||
                        "http://localhost:".concat(process.env.PORT || 3210);
                      authEnabled =
                        String(
                          process.env.AUTH_ENABLED || "false",
                        ).toLowerCase() === "true";
                      swaggerOpts = {
                        openapi: {
                          openapi: "3.1.0",
                          info: {
                            title: "Promethean SmartGPT Bridge — v1",
                            version: "1.1.0",
                          },
                          servers: [{ url: baseUrl }],
                        },
                        exposeRoute: true,
                      };
                      if (authEnabled) {
                        swaggerOpts.openapi.components = {
                          securitySchemes: {
                            apiKey: {
                              type: "apiKey",
                              name: "x-pi-token",
                              in: "header",
                            },
                          },
                        };
                        swaggerOpts.openapi.security = [{ apiKey: [] }];
                      }
                      return [
                        4 /*yield*/,
                        v1.register(swagger_1.default, swaggerOpts),
                      ];
                    case 1:
                      _a.sent();
                      return [
                        4 /*yield*/,
                        v1.register(swagger_ui_1.default, {
                          routePrefix: "/docs",
                          uiConfig: { docExpansion: "list" },
                        }),
                      ];
                    case 2:
                      _a.sent();
                      // expose the generated v1 spec
                      v1.get(
                        "/openapi.json",
                        { schema: { hide: true } },
                        function (_req, reply) {
                          return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                              reply.type("application/json").send(v1.swagger());
                              return [2 /*return*/];
                            });
                          });
                        },
                      );
                      (0, files_js_1.registerFilesRoutes)(v1);
                      (0, search_js_1.registerSearchRoutes)(v1);
                      (0, sinks_js_1.registerSinkRoutes)(v1);
                      (0, indexer_js_1.registerIndexerRoutes)(v1);
                      (0, agents_js_1.registerAgentRoutes)(v1);
                      (0, exec_js_1.registerExecRoutes)(v1);
                      return [2 /*return*/];
                  }
                });
              });
            }),
          ];
        case 1:
          // Everything defined here will be reachable under /v1 because of the prefix in fastifyApp.js
          _a.sent();
          return [2 /*return*/];
      }
    });
  });
}

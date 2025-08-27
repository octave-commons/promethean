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
exports.registerRbac = registerRbac;
// @ts-nocheck
var User_js_1 = require("./models/User.js");
var policyEngine_js_1 = require("./utils/policyEngine.js");
var mongo_js_1 = require("./mongo.js");
var logger_js_1 = require("./logger.js");
function getApiKeyHeaderNames(req) {
  var _a;
  try {
    var spec =
      typeof req.server.swagger === "function" ? req.server.swagger() : null;
    var schemes =
      ((_a = spec === null || spec === void 0 ? void 0 : spec.components) ===
        null || _a === void 0
        ? void 0
        : _a.securitySchemes) || {};
    var names = [];
    for (var _i = 0, _b = Object.entries(schemes); _i < _b.length; _i++) {
      var _c = _b[_i],
        _k = _c[0],
        v = _c[1];
      if (v && v.type === "apiKey" && v.in === "header" && v.name)
        names.push(String(v.name).toLowerCase());
    }
    return names;
  } catch (_d) {
    return [];
  }
}
function registerRbac(app) {
  var _this = this;
  app.decorate("authUser", function (req, reply) {
    return __awaiter(_this, void 0, void 0, function () {
      var token, apiKeyHeaders, _i, apiKeyHeaders_1, h, v, auth, user;
      var _a, _b, _c, _d;
      return __generator(this, function (_e) {
        switch (_e.label) {
          case 0:
            return [4 /*yield*/, (0, mongo_js_1.initMongo)()];
          case 1:
            _e.sent();
            // If upstream auth already attached a user with roles, honor it
            if (req.user && Array.isArray(req.user.roles))
              return [2 /*return*/, req.user];
            token = null;
            apiKeyHeaders = getApiKeyHeaderNames(req);
            for (
              _i = 0, apiKeyHeaders_1 = apiKeyHeaders;
              _i < apiKeyHeaders_1.length;
              _i++
            ) {
              h = apiKeyHeaders_1[_i];
              v = (_a = req.headers) === null || _a === void 0 ? void 0 : _a[h];
              if (v) {
                token = String(v);
                break;
              }
            }
            // Back-compat default header
            if (!token && req.headers["x-pi-token"])
              token = req.headers["x-pi-token"];
            // Fallback to Authorization: Bearer <apiKey>
            if (!token) {
              auth =
                ((_b = req.headers) === null || _b === void 0
                  ? void 0
                  : _b.authorization) || "";
              if (auth.toLowerCase().startsWith("bearer "))
                token = auth.slice(7).trim();
            }
            if (!token) {
              logger_js_1.logger.audit("rbac_missing_token", {
                path:
                  ((_c = req.raw) === null || _c === void 0
                    ? void 0
                    : _c.url) || req.url,
                method: req.method,
                ip: req.ip,
                ua: req.headers["user-agent"],
              });
              throw new Error("Missing API token");
            }
            return [4 /*yield*/, User_js_1.User.findOne({ apiKey: token })];
          case 2:
            user = _e.sent();
            if (!user) {
              logger_js_1.logger.audit("rbac_invalid_token", {
                path:
                  ((_d = req.raw) === null || _d === void 0
                    ? void 0
                    : _d.url) || req.url,
                method: req.method,
                ip: req.ip,
                ua: req.headers["user-agent"],
              });
              throw new Error("Invalid token");
            }
            req.user = user;
            return [2 /*return*/, user];
        }
      });
    });
  });
  app.decorate("requirePolicy", function (action, resource) {
    return function (req, reply) {
      return __awaiter(_this, void 0, void 0, function () {
        var resName, allowed;
        var _a, _b, _c, _d;
        return __generator(this, function (_e) {
          switch (_e.label) {
            case 0:
              resName =
                typeof resource === "function" ? resource(req) : resource;
              return [
                4 /*yield*/,
                (0, policyEngine_js_1.checkAccess)(req.user, action, resName),
              ];
            case 1:
              allowed = _e.sent();
              if (!allowed) {
                logger_js_1.logger.audit("rbac_forbidden", {
                  user:
                    ((_a = req.user) === null || _a === void 0
                      ? void 0
                      : _a.username) ||
                    ((_b = req.user) === null || _b === void 0
                      ? void 0
                      : _b._id) ||
                    "unknown",
                  roles:
                    (_c = req.user) === null || _c === void 0
                      ? void 0
                      : _c.roles,
                  action: action,
                  resource: resName,
                  path:
                    ((_d = req.raw) === null || _d === void 0
                      ? void 0
                      : _d.url) || req.url,
                  method: req.method,
                  ip: req.ip,
                });
                reply.code(403).send({ ok: false, error: "Forbidden" });
              }
              return [2 /*return*/];
          }
        });
      });
    };
  });
}

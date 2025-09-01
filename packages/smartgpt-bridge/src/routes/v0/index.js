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
exports.registerV0Routes = registerV0Routes;
var crypto_1 = require("crypto");
var jose_1 = require("jose");
// Route modules (legacy)
var files_js_1 = require("./files.js");
var search_js_1 = require("./search.js");
var indexer_js_1 = require("./indexer.js");
var grep_js_1 = require("./grep.js");
var symbols_js_1 = require("./symbols.js");
var agent_js_1 = require("./agent.js");
var exec_js_1 = require("./exec.js");
var sinks_js_1 = require("./sinks.js");
var users_js_1 = require("./users.js");
var policies_js_1 = require("./policies.js");
var logger_js_1 = require("../../logger.js");
var bootstrap_js_1 = require("./bootstrap.js");
function parseCookies(req) {
  var _a;
  var header =
    (_a = req.headers) === null || _a === void 0 ? void 0 : _a.cookie;
  if (!header) return {};
  var out = {};
  for (var _i = 0, _b = header.split(";"); _i < _b.length; _i++) {
    var raw = _b[_i];
    var p = raw.trim();
    var idx = p.indexOf("=");
    if (idx < 0) continue;
    var k = p.slice(0, idx).trim();
    var v = p.slice(idx + 1).trim();
    try {
      v = decodeURIComponent(v);
    } catch (_c) {}
    if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1);
    out[k] = v;
  }
  return out;
}
function timingSafeEqual(a, b) {
  var bufA = Buffer.from(String(a));
  var bufB = Buffer.from(String(b));
  if (bufA.length !== bufB.length) return false;
  return crypto_1.default.timingSafeEqual(bufA, bufB);
}
function registerV0Routes(app) {
  return __awaiter(this, void 0, void 0, function () {
    function getJwks() {
      if (jwksCache) return jwksCache;
      var url = jwksUrlEnv;
      if (!url && jwtIssuer) {
        var base = String(jwtIssuer).replace(/\/$/, "");
        url = "".concat(base, "/.well-known/jwks.json");
      }
      if (!url) return null;
      try {
        jwksCache = (0, jose_1.createRemoteJWKSet)(new URL(url));
        return jwksCache;
      } catch (_a) {
        return null;
      }
    }
    function getToken(req) {
      var _a;
      var auth =
        ((_a = req.headers) === null || _a === void 0
          ? void 0
          : _a.authorization) || "";
      if (auth.toLowerCase().startsWith("bearer ")) return auth.slice(7).trim();
      var cookies = parseCookies(req);
      if (cookies[cookieName]) return cookies[cookieName];
      return null;
    }
    function verifyJwtAny(token) {
      return __awaiter(this, void 0, void 0, function () {
        var alg,
          opts,
          allowHs,
          allowedAsym,
          allowed,
          key,
          payload_1,
          jwks,
          payload;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              alg = ((0, jose_1.decodeProtectedHeader)(String(token)) || {})
                .alg;
              opts = {
                issuer: jwtIssuer || undefined,
                audience: jwtAudience || undefined,
                clockTolerance: "60s",
              };
              allowHs = Boolean(jwtSecret);
              allowedAsym = [
                "RS256",
                "RS384",
                "RS512",
                "ES256",
                "ES384",
                "ES512",
                "PS256",
                "PS384",
                "PS512",
              ];
              allowed = allowHs
                ? __spreadArray(
                    __spreadArray([], allowedAsym, true),
                    ["HS256", "HS384", "HS512"],
                    false,
                  )
                : allowedAsym;
              if (!alg || !allowed.includes(alg))
                throw new Error("unsupported alg");
              if (!alg.startsWith("HS")) return [3 /*break*/, 2];
              if (!jwtSecret) throw new Error("missing jwt secret");
              key = new TextEncoder().encode(String(jwtSecret));
              return [
                4 /*yield*/,
                (0, jose_1.jwtVerify)(
                  String(token),
                  key,
                  __assign(__assign({}, opts), {
                    algorithms: ["HS256", "HS384", "HS512"],
                  }),
                ),
              ];
            case 1:
              payload_1 = _a.sent().payload;
              return [2 /*return*/, payload_1];
            case 2:
              jwks = getJwks();
              if (!jwks) throw new Error("missing jwks");
              return [
                4 /*yield*/,
                (0, jose_1.jwtVerify)(
                  String(token),
                  jwks,
                  __assign(__assign({}, opts), { algorithms: allowedAsym }),
                ),
              ];
            case 3:
              payload = _a.sent().payload;
              return [2 /*return*/, payload];
          }
        });
      });
    }
    function v0PreAuth(req, reply) {
      return __awaiter(this, void 0, void 0, function () {
        var token,
          initMongo,
          User,
          user,
          _a,
          tokBuf,
          _i,
          staticTokens_1,
          t,
          b,
          payload,
          err_1,
          msg,
          key,
          payload,
          e_1,
          msg;
        var _b, _c, _d, _e, _f, _g;
        return __generator(this, function (_h) {
          switch (_h.label) {
            case 0:
              if (!enabled) return [2 /*return*/]; // no auth
              token = getToken(req);
              if (!token) {
                logger_js_1.logger.audit("v0_auth_unauthorized", {
                  reason: "missing_token",
                  mode: mode,
                  path:
                    ((_b = req.raw) === null || _b === void 0
                      ? void 0
                      : _b.url) || req.url,
                  method: req.method,
                  ip: req.ip,
                  xff: req.headers["x-forwarded-for"],
                  ua: req.headers["user-agent"],
                });
                return [
                  2 /*return*/,
                  reply.code(401).send({ ok: false, error: "unauthorized" }),
                ];
              }
              _h.label = 1;
            case 1:
              _h.trys.push([1, 18, , 19]);
              _h.label = 2;
            case 2:
              _h.trys.push([2, 7, , 8]);
              return [
                4 /*yield*/,
                Promise.resolve().then(function () {
                  return require("../../mongo.js");
                }),
              ];
            case 3:
              initMongo = _h.sent().initMongo;
              return [
                4 /*yield*/,
                Promise.resolve().then(function () {
                  return require("../../models/User.js");
                }),
              ];
            case 4:
              User = _h.sent().User;
              return [4 /*yield*/, initMongo()];
            case 5:
              _h.sent();
              return [4 /*yield*/, User.findOne({ apiKey: token })];
            case 6:
              user = _h.sent();
              if (user) {
                req.user = user;
                return [2 /*return*/];
              }
              return [3 /*break*/, 8];
            case 7:
              _a = _h.sent();
              return [3 /*break*/, 8];
            case 8:
              if (!(mode === "static")) return [3 /*break*/, 9];
              tokBuf = Buffer.from(String(token));
              for (
                _i = 0, staticTokens_1 = staticTokens;
                _i < staticTokens_1.length;
                _i++
              ) {
                t = staticTokens_1[_i];
                b = Buffer.from(String(t));
                if (b.length === tokBuf.length && timingSafeEqual(b, tokBuf)) {
                  req.user = { sub: "static", mode: "static" };
                  return [2 /*return*/];
                }
              }
              logger_js_1.logger.audit("v0_auth_unauthorized", {
                reason: "static_no_match",
                mode: mode,
                path:
                  ((_c = req.raw) === null || _c === void 0
                    ? void 0
                    : _c.url) || req.url,
                method: req.method,
                ip: req.ip,
                xff: req.headers["x-forwarded-for"],
                ua: req.headers["user-agent"],
              });
              return [
                2 /*return*/,
                reply.code(401).send({ ok: false, error: "unauthorized" }),
              ];
            case 9:
              if (!(mode === "jwt")) return [3 /*break*/, 16];
              _h.label = 10;
            case 10:
              _h.trys.push([10, 12, , 15]);
              return [4 /*yield*/, verifyJwtAny(token)];
            case 11:
              payload = _h.sent();
              req.user = payload;
              return [2 /*return*/];
            case 12:
              err_1 = _h.sent();
              msg = String(
                (err_1 === null || err_1 === void 0 ? void 0 : err_1.message) ||
                  err_1,
              );
              if (!(/missing jwks/i.test(msg) && jwtSecret))
                return [3 /*break*/, 14];
              key = new TextEncoder().encode(String(jwtSecret));
              return [
                4 /*yield*/,
                (0, jose_1.jwtVerify)(String(token), key, {
                  algorithms: ["HS256", "HS384", "HS512"],
                  iss: jwtIssuer || undefined,
                  aud: jwtAudience || undefined,
                  clockTolerance: "60s",
                }),
              ];
            case 13:
              payload = _h.sent().payload;
              req.user = payload;
              return [2 /*return*/];
            case 14:
              logger_js_1.logger.audit("v0_auth_unauthorized", {
                reason: msg || "invalid_token",
                mode: mode,
                path:
                  ((_d = req.raw) === null || _d === void 0
                    ? void 0
                    : _d.url) || req.url,
                method: req.method,
                ip: req.ip,
                xff: req.headers["x-forwarded-for"],
                ua: req.headers["user-agent"],
              });
              return [
                2 /*return*/,
                reply.code(401).send({ ok: false, error: "unauthorized" }),
              ];
            case 15:
              return [3 /*break*/, 17];
            case 16:
              logger_js_1.logger.audit("v0_auth_misconfigured", {
                reason: "unknown_mode",
                mode: mode,
                path:
                  ((_e = req.raw) === null || _e === void 0
                    ? void 0
                    : _e.url) || req.url,
                method: req.method,
                ip: req.ip,
                xff: req.headers["x-forwarded-for"],
                ua: req.headers["user-agent"],
              });
              return [
                2 /*return*/,
                reply
                  .code(500)
                  .send({ ok: false, error: "auth misconfigured" }),
              ];
            case 17:
              return [3 /*break*/, 19];
            case 18:
              e_1 = _h.sent();
              msg = String(
                (e_1 === null || e_1 === void 0 ? void 0 : e_1.message) || e_1,
              );
              if (
                /(unauthorized|bad signature|expired|not active|iss|aud|malformed|bad header|bad payload|unsupported alg)/i.test(
                  msg,
                )
              ) {
                logger_js_1.logger.audit("v0_auth_unauthorized", {
                  reason: msg,
                  mode: mode,
                  path:
                    ((_f = req.raw) === null || _f === void 0
                      ? void 0
                      : _f.url) || req.url,
                  method: req.method,
                  ip: req.ip,
                  xff: req.headers["x-forwarded-for"],
                  ua: req.headers["user-agent"],
                });
                return [
                  2 /*return*/,
                  reply.code(401).send({ ok: false, error: "unauthorized" }),
                ];
              }
              logger_js_1.logger.audit("v0_auth_misconfigured", {
                reason: msg,
                mode: mode,
                path:
                  ((_g = req.raw) === null || _g === void 0
                    ? void 0
                    : _g.url) || req.url,
                method: req.method,
                ip: req.ip,
                xff: req.headers["x-forwarded-for"],
                ua: req.headers["user-agent"],
              });
              return [
                2 /*return*/,
                reply
                  .code(500)
                  .send({ ok: false, error: "auth misconfigured" }),
              ];
            case 19:
              return [2 /*return*/];
          }
        });
      });
    }
    var enabled,
      mode,
      cookieName,
      staticTokens,
      jwtSecret,
      jwtIssuer,
      jwtAudience,
      jwksUrlEnv,
      jwksCache;
    return __generator(this, function (_a) {
      enabled =
        String(process.env.AUTH_ENABLED || "false").toLowerCase() === "true";
      mode = (process.env.AUTH_MODE || "static").toLowerCase();
      cookieName = process.env.AUTH_COOKIE || "smartgpt_auth";
      staticTokens = String(
        process.env.AUTH_TOKENS || process.env.AUTH_TOKEN || "",
      )
        .split(",")
        .map(function (s) {
          return s.trim();
        })
        .filter(Boolean);
      jwtSecret = process.env.AUTH_JWT_SECRET;
      jwtIssuer = process.env.AUTH_JWT_ISSUER;
      jwtAudience = process.env.AUTH_JWT_AUDIENCE;
      jwksUrlEnv = process.env.AUTH_JWKS_URL;
      jwksCache = null;
      // Scope the old auth to the encapsulated /v0 prefix
      if (enabled) app.addHook("onRequest", v0PreAuth);
      // Mount all legacy routes under this encapsulated scope (prefix is applied by caller)
      (0, bootstrap_js_1.registerBootstrapRoutes)(app);
      (0, files_js_1.registerFilesRoutes)(app);
      (0, grep_js_1.registerGrepRoutes)(app);
      (0, symbols_js_1.registerSymbolsRoutes)(app);
      (0, search_js_1.registerSearchRoutes)(app);
      (0, indexer_js_1.registerIndexerRoutes)(app);
      (0, agent_js_1.registerAgentRoutes)(app);
      (0, exec_js_1.registerExecRoutes)(app);
      (0, sinks_js_1.registerSinkRoutes)(app);
      (0, users_js_1.registerUserRoutes)(app);
      (0, policies_js_1.registerPolicyRoutes)(app);
      return [2 /*return*/];
    });
  });
}

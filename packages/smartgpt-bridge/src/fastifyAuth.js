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
exports.createFastifyAuth = createFastifyAuth;
// @ts-nocheck
var crypto_1 = require("crypto");
var jose_1 = require("jose");
var mongo_js_1 = require("./mongo.js");
var User_js_1 = require("./models/User.js");
var logger_js_1 = require("./logger.js");
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
function verifyJwtHS(token_1, secret_1) {
  return __awaiter(this, arguments, void 0, function (token, secret, expected) {
    var _a, h, p, s, header, payload, data, sig, now, LEEWAY, aud, ok;
    if (expected === void 0) {
      expected = {};
    }
    return __generator(this, function (_b) {
      (_a = String(token).split(".")), (h = _a[0]), (p = _a[1]), (s = _a[2]);
      if (!h || !p || !s) throw new Error("malformed");
      try {
        header = JSON.parse(Buffer.from(h, "base64url").toString("utf8"));
      } catch (_c) {
        throw new Error("bad header");
      }
      if (!/^HS(256|384|512)$/.test(header.alg))
        throw new Error("unsupported alg");
      data = "".concat(h, ".").concat(p);
      sig = crypto_1.default
        .createHmac("sha256", String(secret))
        .update(data)
        .digest("base64url");
      if (!timingSafeEqual(sig, s)) throw new Error("bad signature");
      try {
        payload = JSON.parse(Buffer.from(p, "base64url").toString("utf8"));
      } catch (_d) {
        throw new Error("bad payload");
      }
      now = Math.floor(Date.now() / 1000);
      LEEWAY = 60;
      if (payload.nbf && now + LEEWAY < payload.nbf)
        throw new Error("not active");
      if (payload.exp && now - LEEWAY >= payload.exp)
        throw new Error("expired");
      if (expected.iss && payload.iss !== expected.iss) throw new Error("iss");
      if (expected.aud) {
        aud = payload.aud;
        ok = Array.isArray(aud)
          ? aud.includes(expected.aud)
          : aud === expected.aud;
        if (!ok) throw new Error("aud");
      }
      return [2 /*return*/, payload];
    });
  });
}
function createFastifyAuth() {
  var _this = this;
  var enabled =
    String(process.env.AUTH_ENABLED || "false").toLowerCase() === "true";
  var mode = (process.env.AUTH_MODE || "static").toLowerCase();
  var cookieName = process.env.AUTH_COOKIE || "smartgpt_auth";
  var staticTokens = String(
    process.env.AUTH_TOKENS || process.env.AUTH_TOKEN || "",
  )
    .split(",")
    .map(function (s) {
      return s.trim();
    })
    .filter(Boolean);
  var jwtSecret = process.env.AUTH_JWT_SECRET;
  var jwtIssuer = process.env.AUTH_JWT_ISSUER;
  var jwtAudience = process.env.AUTH_JWT_AUDIENCE;
  var jwksUrlEnv = process.env.AUTH_JWKS_URL;
  var jwksCache = null;
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
            alg = ((0, jose_1.decodeProtectedHeader)(String(token)) || {}).alg;
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
  // Discover apiKey header names from the OpenAPI spec registered on this scope.
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
  function getToken(req) {
    var _a, _b;
    var auth =
      ((_a = req.headers) === null || _a === void 0
        ? void 0
        : _a.authorization) || "";
    if (auth.toLowerCase().startsWith("bearer ")) return auth.slice(7).trim();
    // Consult OpenAPI spec for apiKey header names
    var apiKeyHeaders = getApiKeyHeaderNames(req);
    for (
      var _i = 0, apiKeyHeaders_1 = apiKeyHeaders;
      _i < apiKeyHeaders_1.length;
      _i++
    ) {
      var h = apiKeyHeaders_1[_i];
      var val = (_b = req.headers) === null || _b === void 0 ? void 0 : _b[h];
      if (val) return String(val);
    }
    var cookies = parseCookies(req);
    if (cookies[cookieName]) return cookies[cookieName];
    return null;
  }
  // fastifyAuth.js (inside createFastifyAuth)
  var OPENAPI_PUBLIC = /^true$/i.test(process.env.OPENAPI_PUBLIC || "false");
  var PUBLIC_PATHS = new Set(["/openapi.json", "/v1/openapi.json"]);
  var PUBLIC_PREFIXES = ["/docs", "/v1/docs"];
  var isPublicPath = function (req) {
    if (!OPENAPI_PUBLIC) return false;
    // req.raw.url includes query; normalize to pathname for matching
    var pathname = (function () {
      try {
        return new URL(req.raw.url, "http://local").pathname;
      } catch (_a) {
        return req.url || "";
      }
    })();
    if (PUBLIC_PATHS.has(pathname)) return true;
    return PUBLIC_PREFIXES.some(function (p) {
      return pathname.startsWith(p);
    });
  };
  var unauthorized = function (reply) {
    return reply.code(401).send({ ok: false, error: "unauthorized" });
  };
  var misconfigured = function (reply) {
    return reply.code(500).send({ ok: false, error: "auth misconfigured" });
  };
  // Build a verifier once based on mode. Returns { user, reason }.
  var verifyToken;
  if (mode === "static") {
    // timingSafeEqual requires equal-length Buffers; normalize safely
    var staticBufs_1 = staticTokens.map(function (t) {
      return Buffer.from(String(t));
    });
    verifyToken = function (token) {
      return __awaiter(_this, void 0, void 0, function () {
        var tokBuf, _i, staticBufs_2, b;
        return __generator(this, function (_a) {
          tokBuf = Buffer.from(String(token));
          for (
            _i = 0, staticBufs_2 = staticBufs_1;
            _i < staticBufs_2.length;
            _i++
          ) {
            b = staticBufs_2[_i];
            if (b.length === tokBuf.length && timingSafeEqual(b, tokBuf)) {
              return [
                2 /*return*/,
                { user: { sub: "static", mode: "static" } },
              ];
            }
          }
          return [2 /*return*/, { user: null, reason: "static_no_match" }];
        });
      });
    };
  } else if (mode === "jwt") {
    verifyToken = function (token) {
      return __awaiter(_this, void 0, void 0, function () {
        var payload, err_1, payload, msg, e_1, msg;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              _a.trys.push([0, 7, , 8]);
              _a.label = 1;
            case 1:
              _a.trys.push([1, 3, , 6]);
              return [
                4 /*yield*/,
                (0, jose_1.jwtVerify)(String(token), getJwks(), {
                  algorithms: allowedAsym,
                  iss: jwtIssuer,
                  aud: jwtAudience,
                }),
              ];
            case 2:
              payload = _a.sent().payload;
              return [2 /*return*/, { user: payload }];
            case 3:
              err_1 = _a.sent();
              if (
                !(
                  /missing jwks/i.test(
                    String(
                      err_1 === null || err_1 === void 0
                        ? void 0
                        : err_1.message,
                    ),
                  ) && jwtSecret
                )
              )
                return [3 /*break*/, 5];
              return [
                4 /*yield*/,
                (0, jose_1.jwtVerify)(String(token), key, {
                  algorithms: ["HS256", "HS384", "HS512"],
                  iss: jwtIssuer,
                  aud: jwtAudience,
                }),
              ];
            case 4:
              payload = _a.sent().payload;
              return [2 /*return*/, { user: payload }];
            case 5:
              msg = String(
                (err_1 === null || err_1 === void 0 ? void 0 : err_1.message) ||
                  err_1,
              );
              if (
                /(unauthorized|bad signature|expired|not active|iss|aud|malformed|bad header|bad payload|unsupported alg)/i.test(
                  msg,
                )
              ) {
                return [2 /*return*/, { user: null, reason: msg }];
              }
              throw err_1;
            case 6:
              return [3 /*break*/, 8];
            case 7:
              e_1 = _a.sent();
              msg = String(
                (e_1 === null || e_1 === void 0 ? void 0 : e_1.message) || e_1,
              );
              if (
                /(unauthorized|bad signature|expired|not active|iss|aud|malformed|bad header|bad payload|unsupported alg)/i.test(
                  msg,
                )
              ) {
                return [2 /*return*/, { user: null, reason: msg }];
              }
              throw e_1;
            case 8:
              return [2 /*return*/];
          }
        });
      });
    };
  } else {
    // Unknown mode — fail closed
    verifyToken = null;
  }
  function preHandler(req, reply) {
    return __awaiter(this, void 0, void 0, function () {
      var token, user, _a, vr, e_2;
      var _b, _c, _d;
      return __generator(this, function (_e) {
        switch (_e.label) {
          case 0:
            if (!enabled) return [2 /*return*/]; // auth off
            if (isPublicPath(req)) return [2 /*return*/]; // allowlisted docs
            if (!verifyToken) return [2 /*return*/, misconfigured(reply)];
            token = getToken(req);
            if (!token) {
              logger_js_1.logger.audit("auth_unauthorized", {
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
              return [2 /*return*/, unauthorized(reply)];
            }
            _e.label = 1;
          case 1:
            _e.trys.push([1, 8, , 9]);
            _e.label = 2;
          case 2:
            _e.trys.push([2, 5, , 6]);
            return [4 /*yield*/, (0, mongo_js_1.initMongo)()];
          case 3:
            _e.sent();
            return [4 /*yield*/, User_js_1.User.findOne({ apiKey: token })];
          case 4:
            user = _e.sent();
            if (user) {
              req.user = user;
              return [2 /*return*/];
            }
            return [3 /*break*/, 6];
          case 5:
            _a = _e.sent();
            return [3 /*break*/, 6];
          case 6:
            return [4 /*yield*/, verifyToken(token)];
          case 7:
            vr = _e.sent();
            if (!vr || !vr.user) {
              logger_js_1.logger.audit("auth_unauthorized", {
                reason:
                  (vr === null || vr === void 0 ? void 0 : vr.reason) ||
                  "invalid_token",
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
              return [2 /*return*/, unauthorized(reply)];
            }
            req.user = vr.user;
            return [2 /*return*/];
          case 8:
            e_2 = _e.sent();
            logger_js_1.logger.audit("auth_misconfigured", {
              reason: String(
                (e_2 === null || e_2 === void 0 ? void 0 : e_2.message) || e_2,
              ),
              mode: mode,
              path:
                ((_d = req.raw) === null || _d === void 0 ? void 0 : _d.url) ||
                req.url,
              method: req.method,
              ip: req.ip,
              xff: req.headers["x-forwarded-for"],
              ua: req.headers["user-agent"],
            });
            return [2 /*return*/, misconfigured(reply)];
          case 9:
            return [2 /*return*/];
        }
      });
    });
  }
  function registerRoutes(fastify) {
    var _this = this;
    fastify.get("/auth/me", function (req, reply) {
      return __awaiter(_this, void 0, void 0, function () {
        var t, user, _a, ok, err_2, msg, _b;
        var _c, _d, _e, _f, _g;
        return __generator(this, function (_h) {
          switch (_h.label) {
            case 0:
              if (!enabled)
                return [
                  2 /*return*/,
                  reply.send({ ok: true, auth: false, cookie: cookieName }),
                ];
              t = getToken(req);
              if (!t) {
                logger_js_1.logger.audit("auth_me_unauthorized", {
                  reason: "missing_token",
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
              }
              _h.label = 1;
            case 1:
              _h.trys.push([1, 13, , 14]);
              _h.label = 2;
            case 2:
              _h.trys.push([2, 5, , 6]);
              return [4 /*yield*/, (0, mongo_js_1.initMongo)()];
            case 3:
              _h.sent();
              return [4 /*yield*/, User_js_1.User.findOne({ apiKey: t })];
            case 4:
              user = _h.sent();
              if (user)
                return [
                  2 /*return*/,
                  reply.send({
                    ok: true,
                    auth: true,
                    mode: "apiKey",
                    cookie: cookieName,
                  }),
                ];
              return [3 /*break*/, 6];
            case 5:
              _a = _h.sent();
              return [3 /*break*/, 6];
            case 6:
              if (mode === "static") {
                ok = staticTokens.some(function (x) {
                  return timingSafeEqual(x, t);
                });
                if (!ok) {
                  logger_js_1.logger.audit("auth_me_unauthorized", {
                    reason: "static_no_match",
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
                }
                return [
                  2 /*return*/,
                  reply.send({
                    ok: true,
                    auth: true,
                    mode: "static",
                    cookie: cookieName,
                  }),
                ];
              }
              if (!(mode === "jwt")) return [3 /*break*/, 12];
              _h.label = 7;
            case 7:
              _h.trys.push([7, 9, , 12]);
              return [4 /*yield*/, verifyJwtAny(t)];
            case 8:
              _h.sent();
              return [
                2 /*return*/,
                reply.send({
                  ok: true,
                  auth: true,
                  mode: "jwt",
                  cookie: cookieName,
                }),
              ];
            case 9:
              err_2 = _h.sent();
              msg = String(
                (err_2 === null || err_2 === void 0 ? void 0 : err_2.message) ||
                  err_2,
              );
              if (!(/missing jwks/.test(msg) && jwtSecret))
                return [3 /*break*/, 11];
              return [
                4 /*yield*/,
                verifyJwtHS(t, jwtSecret, {
                  iss: jwtIssuer,
                  aud: jwtAudience,
                }),
              ];
            case 10:
              _h.sent();
              return [
                2 /*return*/,
                reply.send({
                  ok: true,
                  auth: true,
                  mode: "jwt",
                  cookie: cookieName,
                }),
              ];
            case 11:
              logger_js_1.logger.audit("auth_me_unauthorized", {
                reason: msg || "invalid_token",
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
              throw err_2;
            case 12:
              logger_js_1.logger.audit("auth_me_misconfigured", {
                reason: "unknown_mode",
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
                reply
                  .code(500)
                  .send({ ok: false, error: "auth misconfigured" }),
              ];
            case 13:
              _b = _h.sent();
              logger_js_1.logger.audit("auth_me_unauthorized", {
                reason: "invalid_token",
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
                reply.code(401).send({ ok: false, error: "unauthorized" }),
              ];
            case 14:
              return [2 /*return*/];
          }
        });
      });
    });
  }
  return {
    enabled: enabled,
    preHandler: preHandler,
    registerRoutes: registerRoutes,
  };
}

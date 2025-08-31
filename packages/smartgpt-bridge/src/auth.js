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
exports.createAuth = createAuth;
// @ts-nocheck
var crypto_1 = require("crypto");
var jose_1 = require("jose");
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
      if (header.alg !== "HS256") throw new Error("unsupported alg");
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
function createAuth() {
  var _this = this;
  var enabled =
    String(process.env.AUTH_ENABLED || "false").toLowerCase() === "true";
  var mode = (process.env.AUTH_MODE || "static").toLowerCase(); // 'static' | 'jwt'
  var cookieName = process.env.AUTH_COOKIE || "smartgpt_auth";
  // Static token(s) for dev or reverse-proxy auth
  var staticTokens = String(
    process.env.AUTH_TOKENS || process.env.AUTH_TOKEN || "",
  )
    .split(",")
    .map(function (s) {
      return s.trim();
    })
    .filter(Boolean);
  // JWT (HMAC) minimal support; for JWKS/OIDC use a proxy or extend here later
  var jwtSecret = process.env.AUTH_JWT_SECRET;
  var jwksUrl = process.env.AUTH_JWKS_URL;
  var jwtIssuer = process.env.AUTH_JWT_ISSUER;
  var jwtAudience = process.env.AUTH_JWT_AUDIENCE;
  var router = function (req, res, next) {
    return next();
  }; // placeholder (no login UI)
  var getToken = function (req) {
    var _a;
    var auth =
      ((_a = req.headers) === null || _a === void 0
        ? void 0
        : _a.authorization) || "";
    if (auth.toLowerCase().startsWith("bearer ")) return auth.slice(7).trim();
    var cookies = parseCookies(req);
    if (cookies[cookieName]) return cookies[cookieName];
    return null;
  };
  // JOSE-based JWT verifier with alg detection and JWKS caching
  var jwksCache = null;
  function getJwks() {
    if (jwksCache) return jwksCache;
    var url = jwksUrl;
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
            if (!alg || !allowed.includes(alg)) {
              // If alg is HMAC but we don't allow HS, call it unsupported
              throw new Error("unsupported alg");
            }
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
  var requireAuth = function (req, res, next) {
    return __awaiter(_this, void 0, void 0, function () {
      var token_1, ok, payload, err_1, msg, e_1, msg;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            if (!enabled) return [2 /*return*/, next()];
            _a.label = 1;
          case 1:
            _a.trys.push([1, 10, , 11]);
            token_1 = getToken(req);
            if (!token_1)
              return [
                2 /*return*/,
                res.status(401).json({ ok: false, error: "unauthorized" }),
              ];
            if (mode === "static") {
              ok = staticTokens.some(function (t) {
                return timingSafeEqual(t, token_1);
              });
              if (!ok)
                return [
                  2 /*return*/,
                  res.status(401).json({ ok: false, error: "unauthorized" }),
                ];
              req.user = { sub: "static", mode: "static" };
              return [2 /*return*/, next()];
            }
            if (!(mode === "jwt")) return [3 /*break*/, 9];
            payload = void 0;
            _a.label = 2;
          case 2:
            _a.trys.push([2, 4, , 8]);
            return [4 /*yield*/, verifyJwtAny(token_1)];
          case 3:
            payload = _a.sent();
            return [3 /*break*/, 8];
          case 4:
            err_1 = _a.sent();
            msg = String(
              (err_1 === null || err_1 === void 0 ? void 0 : err_1.message) ||
                err_1,
            );
            if (!(/missing jwks/.test(msg) && jwtSecret))
              return [3 /*break*/, 6];
            return [
              4 /*yield*/,
              verifyJwtHS(token_1, jwtSecret, {
                iss: jwtIssuer,
                aud: jwtAudience,
              }),
            ];
          case 5:
            payload = _a.sent();
            return [3 /*break*/, 7];
          case 6:
            throw err_1;
          case 7:
            return [3 /*break*/, 8];
          case 8:
            req.user = payload;
            return [2 /*return*/, next()];
          case 9:
            return [
              2 /*return*/,
              res.status(500).json({ ok: false, error: "auth misconfigured" }),
            ];
          case 10:
            e_1 = _a.sent();
            msg = String(
              (e_1 === null || e_1 === void 0 ? void 0 : e_1.message) || e_1,
            );
            if (
              /(unauthorized|bad signature|expired|not active|iss|aud|malformed|bad header|bad payload|unsupported alg)/i.test(
                msg,
              )
            ) {
              return [
                2 /*return*/,
                res.status(401).json({ ok: false, error: "unauthorized" }),
              ];
            }
            console.error("Auth error:", e_1);
            return [
              2 /*return*/,
              res.status(500).json({ ok: false, error: "auth misconfigured" }),
            ];
          case 11:
            return [2 /*return*/];
        }
      });
    });
  };
  // Small helper endpoint for clients to check status
  var mount = function (app) {
    app.get("/auth/me", function (req, res) {
      return __awaiter(_this, void 0, void 0, function () {
        var t, ok, err_2, msg, _a;
        return __generator(this, function (_b) {
          switch (_b.label) {
            case 0:
              if (!enabled)
                return [
                  2 /*return*/,
                  res.json({ ok: true, auth: false, cookie: cookieName }),
                ];
              t = getToken(req);
              if (!t)
                return [
                  2 /*return*/,
                  res.status(401).json({ ok: false, error: "unauthorized" }),
                ];
              _b.label = 1;
            case 1:
              _b.trys.push([1, 8, , 9]);
              if (mode === "static") {
                ok = staticTokens.some(function (x) {
                  return timingSafeEqual(x, t);
                });
                if (!ok)
                  return [
                    2 /*return*/,
                    res.status(401).json({ ok: false, error: "unauthorized" }),
                  ];
                return [
                  2 /*return*/,
                  res.json({
                    ok: true,
                    auth: true,
                    mode: "static",
                    cookie: cookieName,
                  }),
                ];
              }
              if (!(mode === "jwt")) return [3 /*break*/, 7];
              _b.label = 2;
            case 2:
              _b.trys.push([2, 4, , 7]);
              return [4 /*yield*/, verifyJwtAny(t)];
            case 3:
              _b.sent();
              return [
                2 /*return*/,
                res.json({
                  ok: true,
                  auth: true,
                  mode: "jwt",
                  cookie: cookieName,
                }),
              ];
            case 4:
              err_2 = _b.sent();
              msg = String(
                (err_2 === null || err_2 === void 0 ? void 0 : err_2.message) ||
                  err_2,
              );
              if (!(/missing jwks/.test(msg) && jwtSecret))
                return [3 /*break*/, 6];
              return [
                4 /*yield*/,
                verifyJwtHS(t, jwtSecret, {
                  iss: jwtIssuer,
                  aud: jwtAudience,
                }),
              ];
            case 5:
              _b.sent();
              return [
                2 /*return*/,
                res.json({
                  ok: true,
                  auth: true,
                  mode: "jwt",
                  cookie: cookieName,
                }),
              ];
            case 6:
              throw err_2;
            case 7:
              return [
                2 /*return*/,
                res
                  .status(500)
                  .json({ ok: false, error: "auth misconfigured" }),
              ];
            case 8:
              _a = _b.sent();
              return [
                2 /*return*/,
                res.status(401).json({ ok: false, error: "unauthorized" }),
              ];
            case 9:
              return [2 /*return*/];
          }
        });
      });
    });
  };
  return {
    enabled: enabled,
    mode: mode,
    requireAuth: requireAuth,
    router: router,
    mount: mount,
  };
}

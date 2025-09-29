import crypto from "crypto";

import rateLimit from "@fastify/rate-limit";
import {
  createRemoteJWKSet,
  jwtVerify,
  decodeProtectedHeader,
  type JWTVerifyOptions,
} from "jose";
import { createLogger } from "@promethean/utils";

import { logStream } from "./log-stream.js";
import { initMongo } from "./mongo.js";
import { User } from "./models/User.js";
const logger = createLogger({ service: "smartgpt-bridge", stream: logStream });

function parseCookies(req: any): Record<string, string> {
  const header = req.headers?.cookie as string | undefined;
  if (!header) return {};
  const out: Record<string, string> = {};
  for (const raw of header.split(";")) {
    const p = raw.trim();
    const idx = p.indexOf("=");
    if (idx < 0) continue;
    const k = p.slice(0, idx).trim();
    let v = p.slice(idx + 1).trim();
    try {
      v = decodeURIComponent(v);
    } catch {}
    if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1);
    out[k] = v;
  }
  return out;
}
function timingSafeEqual(a: string | Buffer, b: string | Buffer) {
  const bufA = Buffer.from(String(a));
  const bufB = Buffer.from(String(b));
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

async function verifyJwtHS(
  token: string,
  secret: string,
  expected: { iss?: string; aud?: string } = {},
) {
  const [h, p, s] = String(token).split(".");
  if (!h || !p || !s) throw new Error("malformed");
  let header: any, payload: any;
  try {
    header = JSON.parse(Buffer.from(h, "base64url").toString("utf8"));
  } catch {
    throw new Error("bad header");
  }
  if (!/^HS(256|384|512)$/.test(header.alg)) throw new Error("unsupported alg");
  const data = `${h}.${p}`;
  const hash =
    header.alg === "HS256"
      ? "sha256"
      : header.alg === "HS384"
        ? "sha384"
        : "sha512";
  const sig = crypto
    .createHmac(hash, String(secret))
    .update(data)
    .digest("base64url");
  if (!timingSafeEqual(sig, s)) throw new Error("bad signature");
  try {
    payload = JSON.parse(Buffer.from(p, "base64url").toString("utf8"));
  } catch {
    throw new Error("bad payload");
  }
  const now = Math.floor(Date.now() / 1000);
  const LEEWAY = 60;
  if (payload.nbf && now + LEEWAY < payload.nbf) throw new Error("not active");
  if (payload.exp && now - LEEWAY >= payload.exp) throw new Error("expired");
  if (expected.iss && payload.iss !== expected.iss) throw new Error("iss");
  if (expected.aud) {
    const aud: any = payload.aud;
    const ok = Array.isArray(aud)
      ? aud.includes(expected.aud)
      : aud === expected.aud;
    if (!ok) throw new Error("aud");
  }
  return payload;
}

export function createFastifyAuth() {
  const enabled =
    String(process.env.AUTH_ENABLED || "false").toLowerCase() === "true";
  const mode = (process.env.AUTH_MODE || "static").toLowerCase();
  const cookieName = process.env.AUTH_COOKIE || "smartgpt_auth";
  const staticTokens = String(
    process.env.AUTH_TOKENS || process.env.AUTH_TOKEN || "",
  )
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const jwtSecret = process.env.AUTH_JWT_SECRET;
  const jwtIssuer = process.env.AUTH_JWT_ISSUER;
  const jwtAudience = process.env.AUTH_JWT_AUDIENCE;
  const jwksUrlEnv = process.env.AUTH_JWKS_URL;

  let jwksCache: any = null;
  function getJwks(): any {
    if (jwksCache) return jwksCache;
    let url = jwksUrlEnv;
    if (!url && jwtIssuer) {
      const base = String(jwtIssuer).replace(/\/$/, "");
      url = `${base}/.well-known/jwks.json`;
    }
    if (!url) return null;
    try {
      jwksCache = createRemoteJWKSet(new URL(url));
      return jwksCache;
    } catch {
      return null;
    }
  }

  async function verifyJwtAny(token: string) {
    const { alg } = (decodeProtectedHeader(String(token)) as any) || {};
    // Build options while respecting exactOptionalPropertyTypes
    const opts: JWTVerifyOptions = {
      issuer: jwtIssuer,
      clockTolerance: "60s",
    } as JWTVerifyOptions;
    if (jwtAudience) (opts as any).audience = jwtAudience;

    const allowHs = Boolean(jwtSecret);
    const allowedAsym = [
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
    const allowed = allowHs
      ? [...allowedAsym, "HS256", "HS384", "HS512"]
      : allowedAsym;
    if (!alg || !allowed.includes(alg)) throw new Error("unsupported alg");
    if (alg.startsWith("HS")) {
      if (!jwtSecret) throw new Error("missing jwt secret");
      const key = new TextEncoder().encode(String(jwtSecret));
      const { payload } = await jwtVerify(String(token), key, {
        ...opts,
        algorithms: ["HS256", "HS384", "HS512"],
      });
      return payload;
    }
    const jwks = getJwks();
    if (!jwks) throw new Error("missing jwks");
    const { payload } = await jwtVerify(String(token), jwks, {
      ...opts,
      algorithms: allowedAsym,
    });
    return payload;
  }

  // Discover apiKey header names from the OpenAPI spec registered on this scope.
  function getApiKeyHeaderNames(req: any): string[] {
    try {
      const spec =
        typeof req.server.swagger === "function" ? req.server.swagger() : null;
      const schemes = spec?.components?.securitySchemes || {};
      const names: string[] = [];
      for (const [_k, v] of Object.entries<any>(schemes)) {
        if (v && v.type === "apiKey" && v.in === "header" && v.name)
          names.push(String(v.name).toLowerCase());
      }
      return names;
    } catch {
      return [];
    }
  }

  function getToken(req: any): string | null {
    const auth = (req.headers?.authorization as string | undefined) || "";
    if (auth.toLowerCase().startsWith("bearer ")) return auth.slice(7).trim();
    // Consult OpenAPI spec for apiKey header names
    const apiKeyHeaders = getApiKeyHeaderNames(req);
    for (const h of apiKeyHeaders) {
      const val = (req.headers?.[h] as string | undefined) || null;
      if (val) return String(val);
    }
    const cookies = parseCookies(req);
    const c = cookies[cookieName];
    if (typeof c === "string" && c) return c;
    return null;
  }

  // fastifyAuth.js (inside createFastifyAuth)
  const OPENAPI_PUBLIC = /^true$/i.test(process.env.OPENAPI_PUBLIC || "false");
  const PUBLIC_PATHS = new Set(["/openapi.json", "/v1/openapi.json"]);
  const PUBLIC_PREFIXES = ["/docs", "/v1/docs"];

  const isPublicPath = (req: any) => {
    if (!OPENAPI_PUBLIC) return false;
    // req.raw.url includes query; normalize to pathname for matching
    const pathname = (() => {
      try {
        return new URL(req.raw.url, "http://local").pathname;
      } catch {
        return req.url || "";
      }
    })();
    if (PUBLIC_PATHS.has(pathname)) return true;
    return PUBLIC_PREFIXES.some((p) => pathname.startsWith(p));
  };

  const unauthorized = (reply: any) =>
    reply.code(401).send({ ok: false, error: "unauthorized" });

  const misconfigured = (reply: any) =>
    reply.code(500).send({ ok: false, error: "auth misconfigured" });

  // Build a verifier once based on mode. Returns { user, reason }.
  let verifyToken:
    | ((token: string) => Promise<{ user: any; reason?: string | null }>)
    | null;
  if (mode === "static") {
    // timingSafeEqual requires equal-length Buffers; normalize safely
    const staticBufs = staticTokens.map((t) => Buffer.from(String(t)));
    verifyToken = async (token: string) => {
      const tokBuf = Buffer.from(String(token));
      for (const b of staticBufs) {
        if (b.length === tokBuf.length && timingSafeEqual(b, tokBuf)) {
          return { user: { sub: "static", mode: "static" } };
        }
      }
      return { user: null, reason: "static_no_match" };
    };
  } else if (mode === "jwt") {
    verifyToken = async (token: string) => {
      try {
        const payload = await verifyJwtAny(token);
        return { user: payload };
      } catch (e: any) {
        const msg = String(e?.message || e);
        // Attempt HS fallback if JWKS unavailable and a secret is configured
        if (/missing jwks/i.test(msg) && jwtSecret) {
          try {
            const expected: { iss?: string; aud?: string } = {};
            if (jwtIssuer) expected.iss = jwtIssuer;
            if (jwtAudience) expected.aud = jwtAudience;
            const payload = await verifyJwtHS(token, jwtSecret, expected);
            return { user: payload };
          } catch (hsErr: any) {
            return { user: null, reason: String(hsErr?.message || hsErr) };
          }
        }
        if (
          /(unauthorized|bad signature|expired|not active|iss|aud|malformed|bad header|bad payload|unsupported alg|missing jwks|missing jwt secret)/i.test(
            msg,
          )
        ) {
          return { user: null, reason: msg };
        }
        throw e;
      }
    };
  } else {
    // Unknown mode — fail closed
    verifyToken = async () => ({ user: null, reason: "unknown auth mode" });
  }

  async function preHandler(req: any, reply: any) {
    if (!enabled) return; // auth off
    if (isPublicPath(req)) return; // allowlisted docs

    if (!verifyToken) return misconfigured(reply);

    const token = getToken(req);
    if (!token) {
      logger.audit("auth_unauthorized", {
        reason: "missing_token",
        mode,
        path: req.raw?.url || req.url,
        method: req.method,
        ip: req.ip,
        xff: req.headers["x-forwarded-for"],
        ua: req.headers["user-agent"],
      });
      return unauthorized(reply);
    }

    try {
      // Consolidation: accept API keys as bearer tokens (single token flow)
      try {
        await initMongo();
        const user = await User.findOne({ apiKey: token });
        if (user) {
          req.user = user;
          return;
        }
      } catch {}

      const vr = await (verifyToken as any)(token);
      if (!vr || !vr.user) {
        logger.audit("auth_unauthorized", {
          reason: vr?.reason || "invalid_token",
          mode,
          path: req.raw?.url || req.url,
          method: req.method,
          ip: req.ip,
          xff: req.headers["x-forwarded-for"],
          ua: req.headers["user-agent"],
        });
        return unauthorized(reply);
      }
      req.user = vr.user;
      return;
    } catch (e: any) {
      logger.audit("auth_misconfigured", {
        reason: String(e?.message || e),
        mode,
        path: req.raw?.url || req.url,
        method: req.method,
        ip: req.ip,
        xff: req.headers["x-forwarded-for"],
        ua: req.headers["user-agent"],
      });
      return misconfigured(reply);
    }
  }

  async function registerRoutes(fastify: any) {
    // Register rate limit plugin if not already registered (best-effort)
    try {
      await fastify.register(rateLimit, {
        global: false, // we will use per-route rate limiting
      });
    } catch (err) {
      fastify.log?.error(
        { err },
        "rateLimit plugin registration failed, per-route limits may not apply",
      );
    }

    const defaultRouteRateLimit = { max: 60, timeWindow: "1 minute" } as const;
    fastify.addHook("onRoute", (routeOptions: any) => {
      const existingConfig = (routeOptions.config ?? {}) as Record<
        string,
        unknown
      >;
      if (Object.hasOwn(existingConfig, "rateLimit")) {
        return;
      }
      routeOptions.config = {
        ...existingConfig,
        rateLimit: { ...defaultRouteRateLimit },
      };
    });

    fastify.get(
      "/auth/me",
      {
        config: {
          rateLimit: {
            max: 10, // maximum 10 requests
            timeWindow: "1 minute", // per minute; adjust as desired
          },
        },
      },
      async (req: any, reply: any) => {
        if (!enabled)
          return reply.send({
            ok: true,
            auth: false,
            cookie: cookieName,
          });
        const t = getToken(req);
        if (!t) {
          logger.audit("auth_me_unauthorized", {
            reason: "missing_token",
            mode,
            path: req.raw?.url || req.url,
            method: req.method,
            ip: req.ip,
            xff: req.headers["x-forwarded-for"],
            ua: req.headers["user-agent"],
          });
          return reply.code(401).send({ ok: false, error: "unauthorized" });
        }
        try {
          // Accept API key as bearer for me-check too
          try {
            await initMongo();
            const user = await User.findOne({ apiKey: t });
            if (user)
              return reply.send({
                ok: true,
                auth: true,
                mode: "apiKey",
                cookie: cookieName,
              });
          } catch {}
          if (mode === "static") {
            const ok = staticTokens.some((x) => timingSafeEqual(x, t));
            if (!ok) {
              logger.audit("auth_me_unauthorized", {
                reason: "static_no_match",
                mode,
                path: req.raw?.url || req.url,
                method: req.method,
                ip: req.ip,
                xff: req.headers["x-forwarded-for"],
                ua: req.headers["user-agent"],
              });
              return reply.code(401).send({ ok: false, error: "unauthorized" });
            }
            return reply.send({
              ok: true,
              auth: true,
              mode: "static",
              cookie: cookieName,
            });
          }
          if (mode === "jwt") {
            try {
              await verifyJwtAny(t);
              return reply.send({
                ok: true,
                auth: true,
                mode: "jwt",
                cookie: cookieName,
              });
            } catch (err: any) {
              const msg = String(err?.message || err);
              if (/missing jwks/.test(msg) && jwtSecret) {
                const expected: { iss?: string; aud?: string } = {};
                if (jwtIssuer) expected.iss = jwtIssuer;
                if (jwtAudience) expected.aud = jwtAudience;
                await verifyJwtHS(t, jwtSecret, expected);
                return reply.send({
                  ok: true,
                  auth: true,
                  mode: "jwt",
                  cookie: cookieName,
                });
              }
              logger.audit("auth_me_unauthorized", {
                reason: msg || "invalid_token",
                mode,
                path: req.raw?.url || req.url,
                method: req.method,
                ip: req.ip,
                xff: req.headers["x-forwarded-for"],
                ua: req.headers["user-agent"],
              });
              throw err;
            }
          }
          logger.audit("auth_me_misconfigured", {
            reason: "unknown_mode",
            mode,
            path: req.raw?.url || req.url,
            method: req.method,
            ip: req.ip,
            xff: req.headers["x-forwarded-for"],
            ua: req.headers["user-agent"],
          });
          return reply
            .code(500)
            .send({ ok: false, error: "auth misconfigured" });
        } catch {
          logger.audit("auth_me_unauthorized", {
            reason: "invalid_token",
            mode,
            path: req.raw?.url || req.url,
            method: req.method,
            ip: req.ip,
            xff: req.headers["x-forwarded-for"],
            ua: req.headers["user-agent"],
          });
          return reply.code(401).send({ ok: false, error: "unauthorized" });
        }
      },
    );
  }

  return { enabled, preHandler, registerRoutes };
}

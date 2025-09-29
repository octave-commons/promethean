import crypto from "crypto";

import { createRemoteJWKSet, jwtVerify, decodeProtectedHeader } from "jose";
import rateLimit from "@fastify/rate-limit";
// Route modules (legacy)
import { createLogger } from "@promethean/utils";

import { logStream } from "../../log-stream.js";

import { registerFilesRoutes } from "./files.js";
import { registerSearchRoutes } from "./search.js";
import { registerIndexerRoutes } from "./indexer.js";
import { registerGrepRoutes } from "./grep.js";
import { registerSymbolsRoutes } from "./symbols.js";
import { registerAgentRoutes } from "./agent.js";
import { registerExecRoutes } from "./exec.js";
import { registerSinkRoutes } from "./sinks.js";
import { registerUserRoutes } from "./users.js";
import { registerPolicyRoutes } from "./policies.js";
import { registerBootstrapRoutes } from "./bootstrap.js";
const logger = createLogger({ service: "smartgpt-bridge", stream: logStream });

function parseCookies(req: any): Record<string, string> {
  const header = req.headers?.cookie;
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

function timingSafeEqual(a: any, b: any) {
  const bufA = Buffer.from(String(a));
  const bufB = Buffer.from(String(b));
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

type V0Deps = {
  runCommand?:
    | ((
        opts: Parameters<typeof import("../../exec.js").runCommand>[0],
      ) => ReturnType<typeof import("../../exec.js").runCommand>)
    | undefined;
};

export async function registerV0Routes(app: any, deps: V0Deps = {}) {
  const isTestEnv = (process.env.NODE_ENV || "").toLowerCase() === "test";
  if (!isTestEnv) {
    try {
      await app.register(rateLimit, { max: 100, timeWindow: "1 minute" });
    } catch (err) {
      app.log?.warn(
        { err },
        "rate-limit plugin registration failed for legacy /v0 scope",
      );
    }
  }
  // Old auth semantics (from src/auth.js), adapted for Fastify and scoped to /v0 only
  const enabled =
    String(process.env.AUTH_ENABLED || "false").toLowerCase() === "true";
  const mode = (process.env.AUTH_MODE || "static").toLowerCase(); // 'static' | 'jwt'
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
  function getJwks() {
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

  function getToken(req: any) {
    const auth = req.headers?.authorization || "";
    if (auth.toLowerCase().startsWith("bearer ")) return auth.slice(7).trim();
    const cookies = parseCookies(req);
    if (cookies[cookieName]) return cookies[cookieName];
    return null;
  }

  async function verifyJwtAny(token: any) {
    const { alg } = decodeProtectedHeader(String(token)) || {};
    const opts: any = { clockTolerance: "60s" };
    if (jwtIssuer) opts.issuer = jwtIssuer;
    if (jwtAudience) opts.audience = jwtAudience;
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

  async function v0PreAuth(req: any, reply: any) {
    if (!enabled) return; // no auth
    const token = getToken(req);
    if (!token) {
      logger.audit("v0_auth_unauthorized", {
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
      // Accept API key as bearer to avoid dual tokens
      try {
        const { initMongo } = await import("../../mongo.js");
        const { User } = await import("../../models/User.js");
        await initMongo();
        const user = await User.findOne({ apiKey: token });
        if (user) {
          req.user = user;
          return;
        }
      } catch {}

      if (mode === "static") {
        const tokBuf = Buffer.from(String(token));
        for (const t of staticTokens) {
          const b = Buffer.from(String(t));
          if (b.length === tokBuf.length && timingSafeEqual(b, tokBuf)) {
            req.user = { sub: "static", mode: "static" };
            return;
          }
        }
        logger.audit("v0_auth_unauthorized", {
          reason: "static_no_match",
          mode,
          path: req.raw?.url || req.url,
          method: req.method,
          ip: req.ip,
          xff: req.headers["x-forwarded-for"],
          ua: req.headers["user-agent"],
        });
        return reply.code(401).send({ ok: false, error: "unauthorized" });
      } else if (mode === "jwt") {
        try {
          const payload = await verifyJwtAny(token);
          req.user = payload;
          return;
        } catch (err: any) {
          const msg = String(err?.message || err);
          if (/missing jwks/i.test(msg) && jwtSecret) {
            // HS fallback
            const key = new TextEncoder().encode(String(jwtSecret));
            const hsOpts: any = {
              clockTolerance: "60s",
              algorithms: ["HS256", "HS384", "HS512"],
            };
            if (jwtIssuer) hsOpts.issuer = jwtIssuer;
            if (jwtAudience) hsOpts.audience = jwtAudience;
            const { payload } = await jwtVerify(String(token), key, hsOpts);
            req.user = payload;
            return;
          }
          logger.audit("v0_auth_unauthorized", {
            reason: msg || "invalid_token",
            mode,
            path: req.raw?.url || req.url,
            method: req.method,
            ip: req.ip,
            xff: req.headers["x-forwarded-for"],
            ua: req.headers["user-agent"],
          });
          return reply.code(401).send({ ok: false, error: "unauthorized" });
        }
      } else {
        logger.audit("v0_auth_misconfigured", {
          reason: "unknown_mode",
          mode,
          path: req.raw?.url || req.url,
          method: req.method,
          ip: req.ip,
          xff: req.headers["x-forwarded-for"],
          ua: req.headers["user-agent"],
        });
        return reply.code(500).send({ ok: false, error: "auth misconfigured" });
      }
    } catch (e: any) {
      const msg = String(e?.message || e);
      if (
        /(unauthorized|bad signature|expired|not active|iss|aud|malformed|bad header|bad payload|unsupported alg)/i.test(
          msg,
        )
      ) {
        logger.audit("v0_auth_unauthorized", {
          reason: msg,
          mode,
          path: req.raw?.url || req.url,
          method: req.method,
          ip: req.ip,
          xff: req.headers["x-forwarded-for"],
          ua: req.headers["user-agent"],
        });
        return reply.code(401).send({ ok: false, error: "unauthorized" });
      }
      logger.audit("v0_auth_misconfigured", {
        reason: msg,
        mode,
        path: req.raw?.url || req.url,
        method: req.method,
        ip: req.ip,
        xff: req.headers["x-forwarded-for"],
        ua: req.headers["user-agent"],
      });
      return reply.code(500).send({ ok: false, error: "auth misconfigured" });
    }
  }

  // Scope the old auth to the encapsulated /v0 prefix
  if (enabled) app.addHook("onRequest", v0PreAuth);

  // Mount all legacy routes under this encapsulated scope (prefix is applied by caller)
  registerBootstrapRoutes(app);
  registerFilesRoutes(app);
  registerGrepRoutes(app);
  registerSymbolsRoutes(app);
  registerSearchRoutes(app);
  registerIndexerRoutes(app);
  registerAgentRoutes(app);
  registerExecRoutes(app, { runCommand: deps.runCommand });
  registerSinkRoutes(app);
  registerUserRoutes(app);
  registerPolicyRoutes(app);
}

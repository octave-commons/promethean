import { createLogger } from "@promethean/utils";

import { logStream } from "./log-stream.js";
import { User } from "./models/User.js";
import { checkAccess } from "./utils/policyEngine.js";
import { initMongo } from "./mongo.js";

const logger = createLogger({ service: "smartgpt-bridge", stream: logStream });

function getApiKeyHeaderNames(req: any) {
  try {
    const spec =
      typeof req.server.swagger === "function" ? req.server.swagger() : null;
    const schemes = spec?.components?.securitySchemes || {};
    const names = [];
    for (const [_k, v] of Object.entries(schemes as any)) {
      const vv: any = v;
      if (vv && vv.type === "apiKey" && vv.in === "header" && vv.name)
        names.push(String(vv.name).toLowerCase());
    }
    return names;
  } catch {
    return [];
  }
}

export function registerRbac(app: any) {
export function registerRbac(app: any) {
  let mongoReady = false;
  app.decorate("authUser", async (req: any, reply: any) => {
    if (!mongoReady) {
      await initMongo();
      mongoReady = true;
    }
    // If upstream auth already attached a user with roles, honor it
    if (req.user && Array.isArray(req.user.roles)) return req.user;
    // …rest of authUser handler…

    // Prefer header names declared in the OpenAPI securitySchemes
    let token = null;
    const apiKeyHeaders = getApiKeyHeaderNames(req);
    for (const h of apiKeyHeaders) {
      const v = req.headers?.[h];
      if (v) {
        token = String(v);
        break;
      }
    }
    // Back-compat default header
    if (!token && req.headers["x-pi-token"]) token = req.headers["x-pi-token"];
    // Fallback to Authorization: Bearer <apiKey>
    if (!token) {
      const auth = req.headers?.authorization || "";
      if (auth.toLowerCase().startsWith("bearer "))
        token = auth.slice(7).trim();
    }
    if (!token) {
      logger.audit("rbac_missing_token", {
        path: req.raw?.url || req.url,
        method: req.method,
        ip: req.ip,
        ua: req.headers["user-agent"],
      });
      throw new Error("Missing API token");
    }
    const user = await User.findOne({ apiKey: token });
    if (!user) {
      logger.audit("rbac_invalid_token", {
        path: req.raw?.url || req.url,
        method: req.method,
        ip: req.ip,
        ua: req.headers["user-agent"],
      });
      throw new Error("Invalid token");
    }
    req.user = user;
    return user;
  });

  app.decorate(
    "requirePolicy",
    (action: string, resource: string | ((req: any) => string)) => {
      return async (req: any, reply: any) => {
        const resName =
          typeof resource === "function" ? resource(req) : resource;
        const allowed = await checkAccess(req.user, action, resName);
        if (!allowed) {
          logger.audit("rbac_forbidden", {
            user: req.user?.username || req.user?._id || "unknown",
            roles: req.user?.roles,
            action,
            resource: resName,
            path: req.raw?.url || req.url,
            method: req.method,
            ip: req.ip,
          });
          return reply.code(403).send({ ok: false, error: "Forbidden" });
        }
      };
    },
  );
}

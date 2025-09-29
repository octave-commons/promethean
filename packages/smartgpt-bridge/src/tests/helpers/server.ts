import fs from "node:fs";
import path from "node:path";

import rateLimit from "@fastify/rate-limit";
import { MongoMemoryServer } from "mongodb-memory-server";

import { createServer } from "../../server/createServer.js";

function makeClient(app: any) {
  const u = (path: string, query?: Record<string, unknown>) => {
    if (!query || Object.keys(query).length === 0) return path;
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(query)) params.append(k, String(v));
    return `${path}?${params.toString()}`;
  };
  class Req {
    method: string;
    path: string;
    _query: Record<string, unknown>;
    _body: any;
    _headers: Record<string, string>;
    constructor(method: string, path: string) {
      this.method = method;
      this.path = path;
      this._query = {};
      this._body = undefined;
      this._headers = {};
    }
    query(obj?: Record<string, unknown>) {
      this._query = obj || {};
      return this;
    }
    send(obj: any) {
      this._body = obj;
      return this;
    }
    set(key: string, value: string) {
      this._headers[key] = value;
      return this;
    }
    async expect(code: number) {
      const res = await app.inject({
        method: this.method,
        url: u(this.path, this._query),
        payload: this._body,
        headers: { "content-type": "application/json", ...this._headers },
      });
      const status = res.statusCode;
      let body;
      try {
        body = res.json();
      } catch {
        body = res.payload;
      }
      if (status !== code) {
        const msg = `Expected ${code} got ${status}: ${res.payload}`;
        throw new Error(msg);
      }
      return { status, body };
    }
  }
  return {
    get: (p: string) => new Req("GET", p),
    post: (p: string) => new Req("POST", p),
    put: (p: string) => new Req("PUT", p),
  };
}

const DANGER_PATTERNS = [
  /rm\s+-rf\s+\/(?!home)/i,
  /\bDROP\s+DATABASE\b/i,
  /\bmkfs\w*\s+\/dev\//i,
  /\bshutdown\b|\breboot\b/i,
  /\bchmod\s+777\b/i,
];

function matchesDanger(command: string): boolean {
  return DANGER_PATTERNS.some((rx) => rx.test(command));
}

function ensureRootPath(rootPath: string): string {
  const abs = path.resolve(rootPath);
  if (fs.existsSync(abs)) {
    return abs;
  }
  const segments = abs.split(path.sep);
  const len = segments.length;
  const hasFixtureSuffix =
    len >= 2 &&
    segments[len - 2] === "tests" &&
    segments[len - 1] === "fixtures";
  if (!hasFixtureSuffix) {
    return abs;
  }
  let current = abs;
  while (true) {
    const parent = path.dirname(current);
    if (parent === current) {
      break;
    }
    if (
      path.basename(current) === "fixtures" &&
      path.basename(parent) === "tests"
    ) {
      current = path.dirname(parent);
    } else {
      current = parent;
    }
    const candidate = path.join(current, "tests", "fixtures");
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }
  return abs;
}

function createFakeRunCommand(rootPath: string) {
  const baseRoot = ensureRootPath(rootPath);
  return async ({ command, cwd }: { command: string; cwd?: string }) => {
    if (matchesDanger(command)) {
      return {
        ok: false,
        error: "blocked by guard",
        exitCode: null,
        signal: null,
        stdout: "",
        stderr: "",
        durationMs: 0,
        truncated: false,
      };
    }
    const base = baseRoot;
    if (cwd) {
      const abs = path.isAbsolute(cwd)
        ? path.resolve(cwd)
        : path.resolve(base, cwd);
      const rel = path.relative(base, abs);
      if (rel.startsWith("..") || path.isAbsolute(rel)) {
        return {
          ok: false,
          error: "cwd outside root",
          exitCode: null,
          signal: null,
          stdout: "",
          stderr: "",
          durationMs: 0,
          truncated: false,
        };
      }
    }
    const stdout = command.startsWith("echo ") ? command.slice(5) : command;
    return {
      ok: true,
      exitCode: 0,
      signal: null,
      stdout,
      stderr: "",
      durationMs: 0,
      truncated: false,
      error: "",
      cwd: cwd || baseRoot,
    };
  };
}

export const withServer = async (
  root: string,
  fn: (client: any) => Promise<any>,
) => {
  const ROOT_PATH = ensureRootPath(root);
  const prevEnv = {
    NODE_ENV: process.env.NODE_ENV,
    NODE_PTY_DISABLED: process.env.NODE_PTY_DISABLED,
    MONGODB_URI: process.env.MONGODB_URI,
    DUAL_WRITE_ENABLED: process.env.DUAL_WRITE_ENABLED,
  };
  process.env.NODE_ENV = "test";
  // Avoid native addon crashes in CI/local when ABI mismatches
  if (!process.env.NODE_PTY_DISABLED) process.env.NODE_PTY_DISABLED = "1";
  // Skip Mongo unless explicitly requested via MONGODB_URI=memory
  let mms: MongoMemoryServer | undefined;
  if (!process.env.MONGODB_URI) process.env.MONGODB_URI = "disabled";
  if (process.env.MONGODB_URI === "memory") {
    let lastErr: any = null;
    for (let i = 0; i < 5; i++) {
      try {
        mms = await MongoMemoryServer.create({ instance: { port: 0 } });
        break;
      } catch (e: any) {
        lastErr = e;
        if (!/already in use/i.test(String(e?.message || e))) throw e;
      }
    }
    if (!mms) throw lastErr || new Error("mongo memory start failed");
    process.env.MONGODB_URI = mms.getUri();
  }

  // Disable dual-write to Chroma and skip sink registration to avoid external deps
  process.env.DUAL_WRITE_ENABLED = "false";
  const deps: any = {
    registerSinks: async () => {},
    registerRbac: async (app: any) => {
      app.decorate("authUser", async () => ({ id: "test" }));
      app.decorate("requirePolicy", () => async () => {});
    },
    runCommand: createFakeRunCommand(ROOT_PATH),
  };
  const authEnabled =
    String(process.env.AUTH_ENABLED || "false").toLowerCase() === "true";
  if (!authEnabled) {
    deps.createFastifyAuth = () =>
      ({
        enabled: false,
        preHandler: async () => {},
        registerRoutes: async () => {},
      }) as any;
  } else {
    const staticTokens = String(
      process.env.AUTH_TOKENS || process.env.AUTH_TOKEN || "",
    )
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const cookieName = process.env.AUTH_COOKIE || "smartgpt_auth";
    deps.createFastifyAuth = () => {
      const getToken = (req: any) => {
        const auth = String(req.headers?.authorization || "");
        if (auth.toLowerCase().startsWith("bearer "))
          return auth.slice(7).trim();
        const cookieHeader = String(req.headers?.cookie || "");
        const cookies: Record<string, string> = {};
        for (const part of cookieHeader.split(";")) {
          const idx = part.indexOf("=");
          if (idx < 0) continue;
          const k = part.slice(0, idx).trim();
          const v = part.slice(idx + 1).trim();
          cookies[k] = v;
        }
        if (cookies[cookieName]) return cookies[cookieName];
        return null;
      };
      const unauthorized = (reply: any) =>
        reply.code(401).send({ ok: false, error: "unauthorized" });
      return {
        enabled: true,
        preHandler: async (req: any, reply: any) => {
          const token = getToken(req);
          if (!token || !staticTokens.includes(token))
            return unauthorized(reply);
          (req as any).user = { sub: "static", mode: "static" };
        },
        registerRoutes: async (app: any) => {
          try {
            await app.register(rateLimit, { global: false });
          } catch (err) {
            app.log?.error?.(
              { err },
              "rateLimit plugin registration failed in test helper",
            );
          }
          app.get(
            "/auth/me",
            {
              config: {
                rateLimit: {
                  max: 10,
                  timeWindow: "1 minute",
                },
              },
            },
            async (req: any, reply: any) => {
              const token = getToken(req);
              if (!token) return unauthorized(reply);
              if (!staticTokens.includes(token)) return unauthorized(reply);
              return reply.send({
                ok: true,
                auth: true,
                mode: "static",
                cookie: cookieName,
              });
            },
          );
        },
      } as any;
    };
  }
  const app = await createServer(ROOT_PATH, deps);
  // Stub RBAC hooks so tests don't require seeded users/policies
  (app as any).authUser = async () => ({ id: "test" });
  (app as any).requirePolicy = () => async () => {};
  await app.ready();
  try {
    const client = makeClient(app);
    return await fn(client);
  } finally {
    await app.close();
    if (mms) await mms.stop();
    const mongoUri = String(process.env.MONGODB_URI || "");
    let persistenceClients:
      | typeof import("@promethean/persistence/clients.js")
      | undefined;
    if (mongoUri && mongoUri !== "disabled") {
      try {
        persistenceClients = await import("@promethean/persistence/clients.js");
        const mongo = await persistenceClients.getMongoClient();
        await mongo.close();
      } catch {}
    }
    try {
      (
        persistenceClients ||
        (await import("@promethean/persistence/clients.js"))
      ).__resetPersistenceClientsForTests?.();
    } catch {}
    if (prevEnv.MONGODB_URI === undefined) delete process.env.MONGODB_URI;
    else process.env.MONGODB_URI = prevEnv.MONGODB_URI;
    if (prevEnv.DUAL_WRITE_ENABLED === undefined)
      delete process.env.DUAL_WRITE_ENABLED;
    else process.env.DUAL_WRITE_ENABLED = prevEnv.DUAL_WRITE_ENABLED;
    if (prevEnv.NODE_PTY_DISABLED === undefined)
      delete process.env.NODE_PTY_DISABLED;
    else process.env.NODE_PTY_DISABLED = prevEnv.NODE_PTY_DISABLED;
    if (prevEnv.NODE_ENV === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = prevEnv.NODE_ENV;
  }
};

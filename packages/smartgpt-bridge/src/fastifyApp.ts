import Fastify from "fastify";
// Frontend assets are served by a standalone file server under `sites/`
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import rateLimit from "@fastify/rate-limit";

import { createFastifyAuth } from "./fastifyAuth.js";
import { registerV0Routes } from "./routes/v0/index.js";
import { ensureIndexerBootstrap } from "./indexerClient.js";
import { restoreAgentsFromStore } from "./agent.js";
import { registerSinks as defaultRegisterSinks } from "./sinks.js";
import { registerRbac as defaultRegisterRbac } from "./rbac.js";
import { registerV1Routes } from "./routes/v1/index.js";
import { mongoChromaLogger } from "./logging/index.js";

type BridgeDeps = {
  registerSinks?: () => Promise<void>;
  createFastifyAuth?: () => ReturnType<typeof createFastifyAuth>;
  indexerManager?: unknown;
  registerRbac?: (app: any) => void | Promise<void>;
  runCommand?:
    | ((
        args: Parameters<typeof import("./exec.js").runCommand>[0],
      ) => ReturnType<typeof import("./exec.js").runCommand>)
    | undefined;
};

type BridgeConfig = {
  readonly rateLimit?: {
    readonly max?: number;
    readonly timeWindow?: string | number;
    readonly allowList?: ReadonlyArray<string>;
  };
};

export const globalSchema = [
  {
    $id: "GrepRequest",
    type: "object",
    required: ["pattern"],
    properties: {
      pattern: { type: "string" },
      flags: { type: "string", default: "g" },
      paths: {
        type: "array",
        items: { type: "string" },
        default: ["**/*.{ts,tsx,js,jsx,py,go,rs,md,txt,json,yml,yaml,sh}"],
      },
      maxMatches: { type: "integer", default: 200 },
      context: { type: "integer", default: 2 },
    },
  },
  {
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
  },
  {
    $id: "SearchResult",
    type: "object",
    required: ["id", "path", "chunkIndex", "startLine", "endLine", "text"],
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
  },
  {
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
  },
  {
    $id: "FileTreeNodeChild",
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
  },
  {
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
  },
  {
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
  },
];

export function registerSchema(app: Readonly<Fastify.FastifyInstance>): void {
  // Schemas used across routes
  globalSchema.forEach(app.addSchema.bind(app));

  app.addHook("preValidation", (req, _reply, done) => {
    // also tricky. Any time you're working on an object with dynamic properties...
    // What you gotta do is specify the types you care about in a context without precluding the existance
    // of other properties in other contexts.
    const rp = req.params as any;
    if (rp?.path && !rp["*"]) rp["*"] = rp.path;
    done();
  });
}

export async function buildFastifyApp(
  ROOT_PATH: string,
  deps: BridgeDeps = {},
  config: BridgeConfig = {},
) {
  const registerSinks = deps.registerSinks || defaultRegisterSinks;
  const authFactory = deps.createFastifyAuth || createFastifyAuth;
  if (deps.indexerManager) {
    // Legacy dependency injection is no-op; indexer service overrides this path.
  }
  const registerRbac = deps.registerRbac || defaultRegisterRbac;
  const isTestEnv = (process.env.NODE_ENV || "").toLowerCase() === "test";

  registerSinks()
    .then(console.log.bind(null, "Sinks registered"))
    .catch(
      console.error.bind(null, "There was an error in registering the sinks."),
    );
  const app = Fastify({
    logger: { level: "info" },
    trustProxy: true,
    ajv: {
      customOptions: { allowUnionTypes: true },
      // No plugins to avoid duplicate ajv-formats registration across multiple instances in tests
    },
  });
  app.decorate("ROOT_PATH", ROOT_PATH);
  app.register(mongoChromaLogger);
  const fallbackRateLimitMax = 300;
  const configuredRateLimitMax = Number.parseInt(
    String(process.env.BRIDGE_RATE_LIMIT_MAX || "").trim(),
    10,
  );
  const envRateLimitMax =
    Number.isFinite(configuredRateLimitMax) && configuredRateLimitMax > 0
      ? configuredRateLimitMax
      : fallbackRateLimitMax;
  const rateLimitMax =
    typeof config.rateLimit?.max === "number" && config.rateLimit.max > 0
      ? config.rateLimit.max
      : envRateLimitMax;
  const configuredWindow = String(
    process.env.BRIDGE_RATE_LIMIT_WINDOW || "",
  ).trim();
  const envRateLimitWindow = (() => {
    if (configuredWindow.length === 0) {
      return "1 minute";
    }
    if (/^[0-9]+$/.test(configuredWindow)) {
      const numericWindow = Number.parseInt(configuredWindow, 10);
      if (Number.isFinite(numericWindow) && numericWindow > 0) {
        return numericWindow;
      }
    }
    return configuredWindow;
  })();
  const rateLimitWindow =
    typeof config.rateLimit?.timeWindow !== "undefined"
      ? config.rateLimit.timeWindow
      : envRateLimitWindow;
  const envAllowList = String(process.env.BRIDGE_RATE_LIMIT_ALLOWLIST || "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  const configuredAllowList = Array.isArray(config.rateLimit?.allowList)
    ? config.rateLimit?.allowList
    : undefined;
  const allowList = (configuredAllowList || envAllowList)
    .map((value) => value.trim())
    .filter(Boolean);
  const rateLimitOptions: Record<string, unknown> = {
    global: true,
    max: rateLimitMax,
    timeWindow: rateLimitWindow,
    hook: "preHandler",
    addHeaders: {
      "x-ratelimit-limit": true,
      "x-ratelimit-remaining": true,
      "x-ratelimit-reset": true,
      "retry-after": true,
    },
  };
  if (allowList.length > 0) {
    rateLimitOptions.allowList = allowList;
  }
  await app.register(rateLimit, rateLimitOptions);
  // NEW: Global default rate limits for all routes (opt-out with rateLimit: false)
  app.addHook('onRoute', (routeOptions) => {
    if ((routeOptions as any).rateLimit === false) return;
    (routeOptions as any).config = (routeOptions as any).config || {};
    const cfg = ((routeOptions as any).config as any);
    if (cfg.rateLimit == null) {
      cfg.rateLimit = { max: rateLimitMax, timeWindow: rateLimitWindow };
    }
  });
  registerSchema(app);

  const baseUrl =
    process.env.PUBLIC_BASE_URL ||
    `http://localhost:${process.env.PORT || 3210}`;
  // Register new-auth helper endpoint at root for dashboard compatiblity
  const auth = authFactory();
  await auth.registerRoutes(app); // adds /auth/me; protection handled inside

  // this is a hard type signature to crack...
  const schemas: Record<string, unknown> = {
    GrepRequest: app.getSchema("GrepRequest"),
    GrepResult: app.getSchema("GrepResult"),
    SearchResult: app.getSchema("SearchResult"),
    SymbolResult: app.getSchema("SymbolResult"),
    FileTreeNode: app.getSchema("FileTreeNode"),
    StacktraceResult: app.getSchema("StacktraceResult"),
  };

  // if you try this, the above doesn't work in schema.
  // const swaggerOpts: SwaggerOptions = {
  // Maybe if we gto the schema from somewhere else?
  // But schema are one of those things that are a type of type basically...
  // So "any", or "unknown" are not exactly wrong.
  // But there are keys with in the schema which are meaningful to the
  // process that consumes them.
  // We'll figure this one out.
  const swaggerOpts: any = {     
    openapi: {
      openapi: "3.1.0",
      info: { title: "Promethean SmartGPT Bridge", version: "1.0.0" },
      servers: [{ url: baseUrl }],
      components: { schemas },
    },
  };
  if (auth.enabled) {
    swaggerOpts.openapi.components.securitySchemes = {
      bearerAuth: {
        type: "http",
        schema: "bearer",

        name: "x-pi-token",
      },
    };
    swaggerOpts.openapi.security = [{ bearerAuth: [] }];
  }

  app.register(swagger, swaggerOpts);
  if (!isTestEnv) {
    app.register(swaggerUi, { routePrefix: "/docs" });
  }

  const getOpenapiDoc = () =>
    typeof (app as any).w4agger === "function"
      ? ((app as any).swagger()
      : swaggerOpts.openapi;
  app.get(
    "/openapi.json",
    { config: { rateLimit: { max: 60, timeWindow: "1 minute" } } },
    async (_req, rep) => {
      return rep.type("application/json").send(getOpenapiDoc());
    },
  );

  await registerRbac(app);

  // Mount legacy routes under /v0 with old auth scoped inside
  await app.register(
    async (v0) => {
      await registerV0Routes(v0, { runCommand: deps.runCommand });
    },
    { prefix: "/v0" },
  );

  // Mount v1 routes with new auth scoped to /v1

  await app.register(
    async (v1Scope) => {
      // Register rate limiting for v1 routes (best-effort; ignore version mismatches)
      if (!isTestEnv) {
        await registerV1Routes(v1Scope, { runCommand: deps.runCommand });
      }

      const v1Auth = authFactory();
      if (v1Auth.enabled) v1Scope.addHook("onRequest", v1Auth.preHandler);
    },
    { prefix: "/v1" },
  );

  await registerV1Routes(app, { runCommand: deps.runCommand });

  // Initialize indexer bootstrap/incremental state unless in test
  if (!isTestEnv) {
    ensureIndexerBootstrap(ROOT_PATH).catch((error) => {
      app.log.error({ err: error }, "Failed to ensure indexer bootstrap");
    });
    const restoreAllowed =
      String(process.env.AGENT_RESTORE_ON_START || "true") !== "false";
    if (restoreAllowed) restoreAgentsFromStore().catch(() => {});
  }

  console.log("APP!");

  return app;
}

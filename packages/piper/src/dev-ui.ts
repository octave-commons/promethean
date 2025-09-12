import * as url from "node:url";
import * as path from "node:path";
import { promises as fs } from "node:fs";

import fastifyFactory from "fastify";
import fastifyStatic from "@fastify/static";
import fastifyRateLimit from "@fastify/rate-limit";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import chokidar from "chokidar";

import { registerFileRoutes } from "./server/routes/files.js";
import { registerPipelineRoutes } from "./server/routes/pipelines.js";
import { sseInit } from "./server/sse.js";
import { PiperStepSchema } from "./server/schemas.js";

function getArg(flag: string, dflt: string): string {
  const idx = process.argv.indexOf(flag);
  if (idx < 0) return dflt;
  const val = process.argv[idx + 1];
  return val && !val.startsWith("-") ? val : dflt;
}

const CONFIG_PATH = path.resolve(
  getArg("--config", process.env.PIPER_CONFIG || process.env.npm_config_config || "pipelines.json"),
);
const rawPort = Number(getArg("--port", "3939"));
const PORT = Number.isFinite(rawPort) ? rawPort : 3939;
const HOST = getArg("--host", "127.0.0.1");

const UI_ROOT = path.resolve(
  path.dirname(url.fileURLToPath(import.meta.url)),
  "../ui",
);

const FRONTEND_DIST = path.resolve(
  path.dirname(url.fileURLToPath(import.meta.url)),
  "../dist/frontend",
);

function errToString(e: unknown): string {
  return String((e as { message?: unknown })?.message ?? e);
}

const app = fastifyFactory({ logger: false });

// Development events: optional SSE stream for hot-reload signals.
app.get("/api/dev-events", async (_req, reply) => {
  const send = sseInit(reply);
  send("frontend:update");
  const root = path.resolve(process.cwd(), "packages/piper/src/frontend");
  const watcher = chokidar.watch([`${root}/**/*.ts`, `${root}/**/*.css`, `${path.resolve(process.cwd(), "packages/piper/ui")}/**/*`], { ignoreInitial: true });
  const rebuild = async () => {
    send("frontend:update");
  };
  watcher.on("all", () => void rebuild());
  reply.raw.on("close", () => watcher.close());
});
await app.register(fastifyStatic, { root: UI_ROOT, prefix: "/ui" });
await app.register(fastifyStatic, {
  root: FRONTEND_DIST,
  prefix: "/js",
  decorateReply: false,
});
await app.register(fastifyRateLimit, {
  max: 100, // max 100 requests per window
  timeWindow: 15 * 60 * 1000, // 15 minutes
});
await app.register(swagger, {
  openapi: {
    info: { title: "Piper Dev API", version: "1.0.0" },
    components: {
      schemas: { PiperStep: PiperStepSchema as Record<string, unknown> },
    },
  },
});
await app.register(swaggerUi, { routePrefix: "/docs" });

// Optional auth: set PIPER_DEV_TOKEN env or pass --token to require a Bearer token.
const TOKEN = process.env.PIPER_DEV_TOKEN ?? getArg("--token", "");
if (TOKEN) {
  app.addHook("onRequest", async (req, reply) => {
    const auth = req.headers.authorization ?? "";
    if (!auth.startsWith("Bearer ") || auth.slice(7) !== TOKEN) {
      reply.header("WWW-Authenticate", "Bearer");
      return reply.code(401).send({ error: "unauthorized" });
    }
  });
}
app.get("/health", async (_req, reply) => {
  reply.header("content-type", "application/json");
  return reply.send({ ok: true });
});

app.get("/", async (_req, reply) => {
  const html = await fs.readFile(path.join(UI_ROOT, "index.html"), "utf8");
  reply.header("content-type", "text/html; charset=utf-8");
  return reply.send(html);
});

await registerFileRoutes(app);
await registerPipelineRoutes(app, { CONFIG_PATH, errToString });

app
  .listen({ port: PORT, host: HOST })
  .then(() => {
    if (HOST === "0.0.0.0") {
      console.warn(
        "[piper] WARNING: dev server bound to 0.0.0.0 exposes it to external networks",
      );
    }
    const shownHost = HOST === "0.0.0.0" ? "localhost" : HOST;
    console.log(`Piper Dev UI running on http://${shownHost}:${PORT}`);
  })
  .catch((err) => {
    console.error("Failed to start server:", err);
    process.exit(1);
  });

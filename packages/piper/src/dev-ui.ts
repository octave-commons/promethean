import * as url from "node:url";
import * as path from "node:path";
import { promises as fs } from "node:fs";

import fastifyFactory from "fastify";
import fastifyStatic from "@fastify/static";
import fastifyRateLimit from "@fastify/rate-limit";
import type { FastifyReply } from "fastify";

import { runPipeline } from "./runner.js";
import type { PiperEvent } from "./lib/events.js";
import { FileSchema } from "./types.js";

function getArg(flag: string, dflt: string): string {
  const idx = process.argv.indexOf(flag);
  return idx >= 0 ? process.argv[idx + 1] ?? dflt : dflt;
}

const CONFIG_PATH = path.resolve(getArg("--config", "pipelines.json"));
const PORT = Number(getArg("--port", "3939")) || 3939;

const UI_ROOT = path.resolve(
  path.dirname(url.fileURLToPath(import.meta.url)),
  "../ui",
);

const FRONTEND_DIST = path.resolve(
  path.dirname(url.fileURLToPath(import.meta.url)),
  "../dist/frontend",
);

async function loadConfig() {
  const raw = await fs.readFile(CONFIG_PATH, "utf-8");
  const parsed = FileSchema.safeParse(JSON.parse(raw));
  if (!parsed.success) throw new Error(parsed.error.message);
  return parsed.data;
}

function sseInit(reply: FastifyReply) {
  reply.raw.setHeader("Content-Type", "text/event-stream");
  reply.raw.setHeader("Cache-Control", "no-cache");
  reply.raw.setHeader("Connection", "keep-alive");
  reply.hijack();
  return (line: string) =>
    reply.raw.write(`data: ${String(line).replace(/\n/g, "\\n")}\n\n`);
}

const app = fastifyFactory({ logger: false });
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

app.get("/health", async (_req, reply) => {
  reply.header("content-type", "application/json");
  return reply.send({ ok: true });
});

app.get("/", async (_req, reply) => {
  const html = await fs.readFile(path.join(UI_ROOT, "index.html"), "utf8");
  reply.header("content-type", "text/html; charset=utf-8");
  return reply.send(html);
});

app.get("/api/pipelines", async (_req, reply) => {
  const cfg = await loadConfig();
  reply.header("content-type", "application/json");
  return reply.send({
    pipelines: cfg.pipelines.map((p) => ({
      name: p.name,
      steps: p.steps.map((s) => ({ id: s.id, name: s.name })),
    })),
  });
});

app.get<{
  Querystring: { pipeline?: string; step?: string; force?: string };
}>("/api/run-step", async (req, reply) => {
  const pipeline = req.query.pipeline ?? "";
  const step = req.query.step ?? "";
  const send = sseInit(reply);
  if (!pipeline || !step) {
    send("missing pipeline or step");
    reply.raw.end();
    return;
  }
  const emit = (ev: PiperEvent) => {
    if (ev.stepId !== step) return;
    if (ev.type === "start") send(`START ${ev.stepId}`);
    else if (ev.type === "skip") send(`SKIP ${ev.reason}`);
    else if (ev.type === "end") {
      if (ev.result.stdout) send(ev.result.stdout);
      if (ev.result.stderr) send(ev.result.stderr);
      send(`EXIT ${ev.result.exitCode}`);
    }
  };
  try {
    await runPipeline(CONFIG_PATH, pipeline, {
      json: true,
      force: req.query.force === "true",
      emit,
    });
  } catch (e: unknown) {
    send(String((e as Error)?.stack || e));
  }
  reply.raw.end();
});

app
  .listen({ port: PORT, host: "0.0.0.0" })
  .then(() => {
    console.log(`Piper Dev UI running on http://localhost:${PORT}`);
  })
  .catch((err) => {
    console.error("Failed to start server:", err);
    process.exit(1);
  });

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
  if (idx < 0) return dflt;
  const val = process.argv[idx + 1];
  return val && !val.startsWith("-") ? val : dflt;
}

const CONFIG_PATH = path.resolve(getArg("--config", "pipelines.json"));
const PORT = Number(getArg("--port", "3939")) || 3939;
const HOST = getArg("--host", "127.0.0.1");

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
  // send a prelude to establish the stream
  reply.raw.write(`: ok\n\n`);
  return (line: string) => {
    const raw = reply.raw as { writableEnded?: boolean; destroyed?: boolean };
    if (raw?.writableEnded || raw?.destroyed) return;
    const safe = String(line).replace(/[\r\n]/g, "\\n");
    reply.raw.write(`data: ${safe}\n\n`);
  };
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

// Basic file listing for File Explorer
app.get<{
  Querystring: {
    dir?: string;
    maxDepth?: string;
    maxEntries?: string;
    exts?: string;
  };
}>("/api/files", async (req, reply) => {
  const workspaceRoot = path.resolve(process.cwd());
  const root = path.resolve(workspaceRoot, req.query.dir || ".");
  // Make sure the resolved root is within the workspace
  if (!root.startsWith(workspaceRoot)) {
    return reply.code(400).send({ error: "invalid directory" });
  }
  const maxDepth = Math.max(0, Number(req.query.maxDepth || "2") | 0) || 2;
  const maxEntries =
    Math.max(1, Number(req.query.maxEntries || "500") | 0) || 500;
  const exts = new Set(
    (req.query.exts || ".md,.mdx,.txt,.markdown")
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean),
  );
  type Node = {
    type: "dir" | "file";
    name: string;
    children?: Node[];
    size?: number;
  };
  let count = 0;
  async function walk(dir: string, depth: number): Promise<Node[]> {
    // Make sure each traversed directory is within workspace root
    const absDir = path.resolve(dir);
    if (!absDir.startsWith(workspaceRoot)) return [];
    if (depth > maxDepth || count >= maxEntries) return [];
    let ents: Node[] = [];
    try {
      const list = await fs.readdir(absDir, { withFileTypes: true });
      for (const ent of list) {
        if (count >= maxEntries) break;
        if (ent.name.startsWith(".")) continue;
        const p = path.join(absDir, ent.name);
        const absP = path.resolve(p);
        // Only traverse/return files and dirs within workspace root
        if (!absP.startsWith(workspaceRoot)) continue;
        if (ent.isDirectory()) {
          const children = await walk(absP, depth + 1);
          if (children.length)
            ents.push({ type: "dir", name: ent.name, children });
        } else {
          const ext = path.extname(ent.name).toLowerCase();
          if (!exts.has(ext)) continue;
          const st = await fs.stat(absP);
          ents.push({ type: "file", name: ent.name, size: st.size });
          count++;
        }
      }
    } catch {
      // ignore
    }
    return ents;
  }
  const tree = await walk(root, 0);
  reply.header("content-type", "application/json");
  return reply.send({ dir: root, tree });
});

// Read a text file (UTF-8) under the workspace
app.get<{ Querystring: { path?: string } }>(
  "/api/read-file",
  async (req, reply) => {
    const ROOT = process.cwd();
    const p = req.query.path ? path.resolve(req.query.path) : "";
    if (!p || !p.startsWith(ROOT)) {
      return reply.code(400).send({ error: "invalid path" });
    }
    try {
      const content = await fs.readFile(p, "utf8");
      reply.header("content-type", "application/json");
      return reply.send({ path: p, content });
    } catch (e: unknown) {
      return reply.code(404).send({ error: String((e as any)?.message || e) });
    }
  },
);

// Write a text file (UTF-8) under the workspace
app.post<{ Body: { path?: string; content?: string } }>(
  "/api/write-file",
  async (req, reply) => {
    const ROOT = process.cwd();
    const p = req.body?.path ? path.resolve(req.body.path) : "";
    const content = req.body?.content ?? "";
    if (!p || !p.startsWith(ROOT)) {
      return reply.code(400).send({ error: "invalid path" });
    }
    try {
      await fs.mkdir(path.dirname(p), { recursive: true });
      await fs.writeFile(p, content, "utf8");
      reply.header("content-type", "application/json");
      return reply.send({ ok: true });
    } catch (e: unknown) {
      return reply.code(500).send({ error: String((e as any)?.message || e) });
    }
  },
);

app.get("/api/pipelines", async (_req, reply) => {
  try {
    const cfg = await loadConfig();
    reply.header("content-type", "application/json");
    return reply.send({
      pipelines: cfg.pipelines.map((p) => ({
        name: p.name,
        steps: p.steps.map((s) => ({ id: s.id, name: s.name })),
      })),
    });
  } catch (e: unknown) {
    reply.code(200).header("content-type", "application/json");
    return reply.send({
      pipelines: [],
      error: String((e as any)?.message || e),
    });
  }
});

// Expose a basic JSON schema describing Piper steps for UI generation
app.get("/api/schema", async (_req, reply) => {
  const schema = {
    $id: "piper.step",
    type: "object",
    additionalProperties: false,
    properties: {
      id: { type: "string" },
      name: { type: "string" },
      deps: { type: "array", items: { type: "string" }, default: [] },
      cwd: { type: "string", default: "." },
      env: {
        type: "object",
        additionalProperties: { type: "string" },
        default: {},
      },
      inputs: { type: "array", items: { type: "string" }, default: [] },
      outputs: { type: "array", items: { type: "string" }, default: [] },
      cache: {
        type: "string",
        enum: ["content", "mtime", "none"],
        default: "content",
      },
      shell: { type: "string" },
      node: { type: "string" },
      args: { type: "array", items: { type: "string" } },
      timeoutMs: { type: "number" },
      retry: { type: "integer", minimum: 0, default: 0 },
      js: {
        type: "object",
        properties: {
          module: { type: "string" },
          export: { type: "string", default: "default" },
          args: {},
          isolate: { type: "string", enum: ["worker"] },
        },
        required: ["module"],
      },
      ts: {
        type: "object",
        properties: {
          module: { type: "string" },
          export: { type: "string", default: "default" },
          args: {},
        },
        required: ["module"],
      },
    },
    anyOf: [
      { required: ["shell"] },
      { required: ["node"] },
      { required: ["js"] },
      { required: ["ts"] },
    ],
    required: ["id"],
  } as const;
  reply.header("content-type", "application/json");
  return reply.send(schema);
});

app.get<{
  Querystring: {
    pipeline?: string;
    step?: string;
    force?: string;
    files?: string;
  };
}>("/api/run-step", async (req, reply) => {
  const pipeline = req.query.pipeline ?? "";
  const step = req.query.step ?? "";
  const send = sseInit(reply);
  if (!pipeline || !step) {
    send("missing pipeline or step");
    reply.raw.end();
    return;
  }
  const cfg = await loadConfig();
  const pl = cfg.pipelines.find((p) => p.name === pipeline);
  if (!pl) {
    send(`pipeline '${pipeline}' not found`);
    reply.raw.end();
    return;
  }
  if (!pl.steps.some((s) => s.id === step)) {
    send(`step '${step}' not found in pipeline '${pipeline}'`);
    reply.raw.end();
    return;
  }
  // Optional: create a one-off config that injects selected files into the target step
  let useConfigPath = CONFIG_PATH;
  try {
    const filesParam = req.query.files || "";
    const files = filesParam
      ? filesParam
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : [];
    if (files.length) {
      const clone = JSON.parse(JSON.stringify(cfg));
      const p2 = clone.pipelines.find((p: any) => p.name === pipeline)!;
      const s2 = p2.steps.find((x: any) => x.id === step)!;
      if (!s2.env) s2.env = {};
      // Prefer JS args.files when possible; otherwise pass env var usable by scripts
      if (s2.js) {
        const current =
          s2.js.args && typeof s2.js.args === "object" ? s2.js.args : {};
        s2.js.args = { ...current, files };
      } else {
        s2.env.PIPER_FILES = JSON.stringify(files);
      }
      await fs.mkdir(path.dirname(CONFIG_PATH), { recursive: true });
      const tmpPath = path.resolve(
        path.dirname(CONFIG_PATH),
        ".cache/piper.ui.run.json",
      );
      await fs.writeFile(tmpPath, JSON.stringify(clone, null, 2), "utf8");
      useConfigPath = tmpPath;
    }
  } catch (e: unknown) {
    send("failed to prepare run config: " + String((e as any)?.message || e));
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
    await runPipeline(useConfigPath, pipeline, {
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

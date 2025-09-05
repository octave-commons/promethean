import fastifyFactory from "fastify";
import fastifyStatic from "@fastify/static";
import websocket from "@fastify/websocket";
import type { WebSocket } from "ws";

import * as url from "node:url";
import * as path from "node:path";
import { promises as fs } from "node:fs";
import { openDB } from "./db.js";
import { parseArgs } from "./utils.js";
import { computePreview } from "./preview-front.js";
import { sseInit } from "./lib/sse.js";
import type { FastifyRequest } from "fastify";
import { getChromaCollection } from "./lib/chroma.js";
import { buildFileTree } from "./lib/files.js";
import { computeDocStatus } from "./lib/status.js";
import {
  servePipeline,
  type StepId,
  runDocopsStep,
  type RunArgs,
} from "./lib/pipeline.js";

const args = parseArgs({
  "--dir": "docs/unique",
  "--collection": "docs-cosine",
  "--port": "3939",
});

const ROOT = path.resolve(args["--dir"] ?? "docs/unique");
const COLLECTION = args["--collection"] ?? "docs-cosine";
const PORT = Number(args["--port"] ?? "3939") || 3939;
// Ensure DB path .cache/* resolves to repo root where other scripts write
const REPO_ROOT = path.resolve(
  path.dirname(url.fileURLToPath(import.meta.url)),
  "../../..",
);
try {
  process.chdir(REPO_ROOT);
} catch {}

// Manage shared DB instance at server level
const dbPromise = openDB();

// Create Fastify app
const app = fastifyFactory({ logger: false });

// Try to enable WebSocket support first; fallback to SSE if plugin not installed
let WS_ENABLED = false as boolean;
try {
  await app.register(websocket);
  WS_ENABLED = true;
} catch {
  WS_ENABLED = false;
}

// Static UI serving
const UI_ROOT = path.resolve(
  path.dirname(url.fileURLToPath(import.meta.url)),
  "../ui",
);
await app.register(fastifyStatic, {
  root: UI_ROOT,
  prefix: "/",
});

app.get("/", async (_req, reply) => {
  try {
    const html = await fs.readFile(path.join(UI_ROOT, "index.html"), "utf8");
    reply.header("content-type", "text/html; charset=utf-8");
    return reply.send(html);
  } catch (e: any) {
    reply.code(500);
    return { error: "UI not found", detail: e?.message || String(e) };
  }
});

// Small favicon to avoid 404 noise
app.get("/favicon.ico", async (_req, reply) => {
  // 16x16 transparent PNG
  const pngBase64 =
    "iVBORw0KGgoAAAANSUhEUgAAAA4AAAAOCAYAAAAfSC3RAAAAJ0lEQVQoka3OsQkAMAzEwP7/0yGkKQm1gk0mWZbQm0N1xYyK0C6rjv7l2kI7P0yQAA6v2gHn0V8h0AAAAAElFTkSuQmCC";
  const buf = Buffer.from(pngBase64, "base64");
  reply.header("Content-Type", "image/png");
  reply.send(buf);
});

app.get("/api/config", async (_req, reply) => {
  reply.header("content-type", "application/json");
  return reply.send({ dir: ROOT, collection: COLLECTION, ws: WS_ENABLED });
});

// In-memory run tokens to avoid oversized query strings
const RUN_TOKENS = new Map<string, any>();
const makeToken = () =>
  Math.random().toString(36).slice(2) + Date.now().toString(36);

type RunStartBody = {
  dir?: string;
  collection?: string;
  docT?: string | number;
  refT?: string | number;
  files?: string[];
};
app.post<{ Body: RunStartBody }>("/api/run-start", async (req, reply) => {
  try {
    const body = req.body || {};
    console.log("/api/run-start", {
      files: Array.isArray(body.files) ? body.files.length : 0,
    });
    const args = {
      dir: path.resolve(body.dir || ROOT),
      collection: body.collection || COLLECTION,
      docT: body.docT || "0.78",
      refT: body.refT || "0.85",
      files: Array.isArray(body.files) ? body.files : undefined,
    };
    const token = makeToken();
    RUN_TOKENS.set(token, args);
    // simple ttl cleanup after 10 minutes
    setTimeout(() => RUN_TOKENS.delete(token), 10 * 60 * 1000).unref?.();
    reply.header("content-type", "application/json");
    return reply.send({ token, ws: WS_ENABLED });
  } catch (e: any) {
    reply.code(400);
    return reply.send({ error: e?.message || String(e) });
  }
});

app.get<{ Querystring: { dir?: string } }>("/api/docs", async (req, reply) => {
  const q = req.query || {};
  const dir = path.resolve(q.dir ?? ROOT);
  const db = await dbPromise;
  const xs: Array<{ uuid: string; path: string; title: string }> = [];
  for await (const [uuid, info] of db.docs.iterator()) {
    if (!info || !info.path) continue;
    const abs = path.resolve(info.path);
    if (!abs.startsWith(dir)) continue;
    if (!/\.(md|mdx|txt)$/i.test(info.path)) continue;
    xs.push({ uuid, path: info.path, title: info.title });
  }
  reply.header("content-type", "application/json");
  return reply.send(xs);
});

app.get<{
  Querystring: {
    dir?: string;
    maxDepth?: string | number;
    maxEntries?: string | number;
    includeMeta?: string;
    exts?: string;
  };
}>("/api/files", async (req, reply) => {
  const q = req.query || {};
  const dir = path.resolve(q.dir ?? ROOT);
  const maxDepth = Math.max(0, Number(q.maxDepth ?? 2) | 0) || 2;
  const maxEntries = Math.max(1, Number(q.maxEntries ?? 500) | 0) || 500;
  const includeMeta = String(q.includeMeta ?? "0") === "1";
  const exts = String(q.exts ?? ".md,.mdx,.txt,.markdown")
    .split(",")
    .map((s: string) => s.trim().toLowerCase())
    .filter(Boolean);
  try {
    const root = await buildFileTree(dir, {
      maxDepth,
      maxEntries,
      includeMeta,
      exts,
    });
    reply.header("content-type", "application/json");
    reply.header("Cache-Control", "no-store, no-cache, must-revalidate");
    reply.header("Pragma", "no-cache");
    return reply.send({ dir, tree: root });
  } catch (e: any) {
    reply.code(500);
    return reply.send({ error: e?.message || String(e) });
  }
});

app.get<{
  Querystring: {
    dir?: string;
    uuid?: string;
    file?: string;
    docT?: string | number;
    refT?: string | number;
  };
}>("/api/preview", async (req, reply) => {
  const q = req.query || {};
  const dir = path.resolve(q.dir ?? ROOT);
  const uuid = q.uuid || undefined;
  const file = q.file || undefined;
  const docT = Number(q.docT ?? "0.78");
  const refT = Number(q.refT ?? "0.85");
  try {
    const db = await dbPromise;
    const sel = {
      ...(uuid ? { uuid } : {}),
      ...(file ? { file } : {}),
    } as { uuid?: string; file?: string };
    const out = await computePreview(
      sel,
      { dir, docThreshold: docT, refThreshold: refT },
      db,
    );
    reply.header("content-type", "application/json");
    return reply.send(out);
  } catch (e: any) {
    reply.code(500);
    return reply.send({ error: e?.message || String(e) });
  }
});

// Text search over Chroma collection, returns best match per document
app.get<{
  Querystring: { q?: string; collection?: string; k?: string | number };
}>("/api/search", async (req, reply) => {
  try {
    const q = req.query || {};
    const query = String(q.q || "").trim();
    if (!query) return reply.send({ items: [] });
    const collection = q.collection || COLLECTION;
    const k = Math.max(1, Math.min(100, Number(q.k || "10") | 0));

    const embedModel = "nomic-embed-text:latest";
    const { coll } = await getChromaCollection({
      collection,
      embedModel,
    });

    const res: any = await coll.query({ queryTexts: [query], nResults: k });
    const ids: string[] = res.ids?.[0] || [];
    const dists: number[] = res.distances?.[0] || [];
    const metas: any[] = res.metadatas?.[0] || [];

    // Group by docUuid and take best (highest similarity) per doc
    const byDoc = new Map<
      string,
      { docUuid: string; title: string; path: string; score: number }
    >();
    for (let i = 0; i < ids.length; i++) {
      const m = metas[i] || {};
      const docUuid = m.docUuid || m.docuuid || m.uuid || "";
      const pathMeta = m.path || m.file || m.docPath || "";
      const title = m.title || path.basename(pathMeta) || docUuid || ids[i];
      const dist = Number(dists[i] ?? 1);
      const score = Math.max(0, Math.min(1, 1 - dist)); // cosine similarity
      if (!docUuid) continue;
      const prev = byDoc.get(docUuid);
      if (!prev || score > prev.score)
        byDoc.set(docUuid, { docUuid, title, path: pathMeta, score });
    }

    const items = Array.from(byDoc.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, k);
    reply.header("content-type", "application/json");
    return reply.send({ items });
  } catch (e: any) {
    reply.code(500);
    return reply.send({ error: e?.message || String(e) });
  }
});

app.get<{ Querystring: { dir?: string; file: string } }>(
  "/api/read",
  async (req, reply) => {
    try {
      const q = req.query || {};
      const dir = path.resolve(q.dir ?? ROOT);
      const file = q.file as string;
      if (!file) throw new Error("Missing file parameter");
      const abs = path.resolve(file);
      if (!abs.startsWith(dir)) throw new Error("File outside allowed dir");
      if (!/\.(md|mdx|markdown|txt)$/i.test(abs))
        throw new Error("Only markdown or text files allowed");
      const data = await fs.readFile(abs, "utf8");
      reply.header("content-type", "text/plain; charset=utf-8");
      return reply.send(data);
    } catch (e: any) {
      reply.code(400);
      return reply.send({ error: e?.message || String(e) });
    }
  },
);

// Return chunks for a given file or uuid
app.get<{ Querystring: { uuid?: string; file?: string } }>(
  "/api/chunks",
  async (req, reply) => {
    try {
      const q = req.query || {};
      const wantFile = q.file ? path.resolve(q.file) : undefined;
      let uuid: string | undefined = q.uuid || undefined;

      const db = await dbPromise;
      if (!uuid && wantFile) {
        for await (const [u, info] of db.docs.iterator()) {
          const p = info?.path as string | undefined;
          if (p && path.resolve(p) === wantFile) {
            uuid = u;
            break;
          }
        }
      }
      if (!uuid) throw new Error("Missing uuid or file");

      const raw = (await db.chunks.get(uuid).catch(() => [])) as unknown;
      const chunks = Array.isArray(raw) ? (raw as unknown[]) : [];
      reply.header("content-type", "application/json");
      return reply.send({ uuid, items: chunks });
    } catch (e: any) {
      reply.code(400);
      return reply.send({ error: e?.message || String(e) });
    }
  },
);

// Return precomputed query hits for a chunk id, enriched with titles/paths
app.get<{ Querystring: { id: string } }>(
  "/api/chunk-hits",
  async (req, reply) => {
    try {
      const q = req.query || {};
      const id = String(q.id || "");
      if (!id) throw new Error("Missing id");
      const db = await dbPromise;
      const raw = (await db.q.get(id).catch(() => [])) as unknown;
      const hits = Array.isArray(raw) ? (raw as unknown[]) : [];
      // Enrich with doc title/path
      const docs: Record<string, { title?: string; path?: string }> = {};
      for await (const [u, info] of db.docs.iterator()) {
        docs[u] = { title: info?.title, path: info?.path };
      }
      const items = hits.map((h: any) => ({
        docUuid: h.docUuid,
        score: h.score,
        startLine: h.startLine,
        startCol: h.startCol,
        title: docs[h.docUuid]?.title || h.docUuid,
        path: docs[h.docUuid]?.path || "",
      }));
      reply.header("content-type", "application/json");
      return reply.send({ id, items });
    } catch (e: any) {
      reply.code(400);
      return reply.send({ error: e?.message || String(e) });
    }
  },
);

// Pipeline status per document
app.get<{
  Querystring: {
    dir?: string;
    limit?: string | number;
    page?: string | number;
    onlyIncomplete?: string;
  };
}>("/api/status", async (req, reply) => {
  try {
    const q = req.query || {};
    const dir = path.resolve(q.dir ?? ROOT);
    const limit = Math.max(1, Math.min(1000, Number(q.limit || "200") | 0));
    const page = Math.max(1, Number(q.page || "1") | 0);
    const onlyIncomplete = String(q.onlyIncomplete || "0") === "1";
    const db = await dbPromise;
    const docs: Array<{ uuid: string; path: string; title: string }> = [];
    for await (const [uuid, info] of db.docs.iterator()) {
      if (!info?.path) continue;
      const abs = path.resolve(info.path);
      if (!abs.startsWith(dir)) continue;
      if (!/\.(md|mdx|txt)$/i.test(abs)) continue;
      docs.push({ uuid, path: info.path, title: info.title });
    }
    const total = docs.length;
    const start = (page - 1) * limit;
    const end = Math.min(start + limit, total);
    const pageDocs = start < end ? docs.slice(start, end) : [];
    const itemsRaw = await Promise.all(
      pageDocs.map((d) => computeDocStatus(db, d)),
    );
    const items = onlyIncomplete
      ? itemsRaw.filter((it) => {
          const embedIncomplete =
            (it.embed?.fingerprints || 0) < (it.embed?.chunks || 0);
          const queryIncomplete =
            (it.query?.withHits || 0) < (it.query?.of || 0);
          return (
            !it.frontmatter?.done ||
            embedIncomplete ||
            queryIncomplete ||
            !it.relations?.present ||
            !it.footers?.present
          );
        })
      : itemsRaw;
    reply.header("content-type", "application/json");
    reply.header("Cache-Control", "no-store, no-cache, must-revalidate");
    reply.header("Pragma", "no-cache");
    return reply.send({ items, page, hasMore: end < total, total });
  } catch (e: any) {
    reply.code(500);
    return reply.send({ error: e?.message || String(e) });
  }
});

// ---- DRY helpers for pipeline serving over SSE/WS ----
type RunArgsLocal = RunArgs;

function resolveRunArgs(q: any): RunArgsLocal {
  const token = String(q?.token || "").trim();
  if (token && RUN_TOKENS.has(token)) {
    const a = RUN_TOKENS.get(token);
    return {
      dir: a.dir,
      collection: a.collection,
      docT: a.docT,
      refT: a.refT,
      files: a.files,
    };
  }
  return {
    dir: path.resolve(q?.dir || ROOT),
    collection: q?.collection || COLLECTION,
    docT: q?.docT || "0.78",
    refT: q?.refT || "0.85",
    files: q?.files ? JSON.parse(String(q.files)) : undefined,
  };
}

// servePipeline now lives in lib/pipeline

app.get<{ Querystring: Partial<RunArgsLocal> }>(
  "/api/run",
  async (req, reply) => {
    const runArgs = resolveRunArgs(req.query || {});
    const line = sseInit(reply);
    const db = await dbPromise;
    await servePipeline(db, line, runArgs);
    line("Done.");
    reply.raw.end();
  },
);

// WebSocket equivalent for running full pipeline (more robust than SSE)
if (WS_ENABLED) {
  app.get<{ Querystring: Partial<RunArgsLocal> }>(
    "/ws/run",
    { websocket: true },
    async (
      socket: WebSocket,
      req: FastifyRequest<{ Querystring: Partial<RunArgsLocal> }>,
    ) => {
      const runArgs = resolveRunArgs(req.query || {});
      const send = (line: string) => {
        try {
          socket.send(String(line));
        } catch {}
      };
      const db = await dbPromise;
      await servePipeline(db, send, runArgs);
      try {
        socket.send("Done.");
      } catch {}
      try {
        socket.close();
      } catch {}
    },
  );

  // Single-step WS endpoint
  app.get<{
    Querystring: {
      step?: string;
      dir?: string;
      collection?: string;
      embedModel?: string;
      genModel?: string;
      k?: string | number;
      force?: string;
      docT?: string | number;
      refT?: string | number;
      anchorStyle?: string;
      files?: string;
    };
  }>(
    "/ws/run-step",
    { websocket: true },
    async (
      socket: WebSocket,
      req: FastifyRequest<{
        Querystring: {
          step?: string;
          dir?: string;
          collection?: string;
          embedModel?: string;
          genModel?: string;
          k?: string | number;
          force?: string;
          docT?: string | number;
          refT?: string | number;
          anchorStyle?: string;
          files?: string;
        };
      }>,
    ) => {
      const q = req.query || {};
      const step = String(q.step || "").toLowerCase();
      const dir = path.resolve(q.dir || ROOT);
      const collection = q.collection || COLLECTION;
      const embedModel = q.embedModel || "nomic-embed-text:latest";
      const genModel = q.genModel || "qwen3:4b";
      const k = Number(q.k || "16") || 16;
      const force = String(q.force || "false") === "true";
      const docT = Number(q.docT ?? "0.78");
      const refT = Number(q.refT ?? "0.85");
      const anchorStyle = (q.anchorStyle || "block") as
        | "block"
        | "heading"
        | "none";
      const sel = q.files as string | undefined;
      const files = sel ? JSON.parse(sel) : undefined;
      const send = (s: string) => {
        try {
          socket.send(String(s));
        } catch {}
      };
      send(`Running step=${step} in ${dir}`);
      try {
        const db = await dbPromise;
        const args = {
          step,
          dir,
          collection,
          embedModel,
          genModel,
          k,
          force,
          docT,
          refT,
          anchorStyle,
          files,
        };
        await runDocopsStep(db, step as StepId, args, (p) =>
          send(
            "PROGRESS " +
              JSON.stringify({
                step: p.step,
                percent:
                  p.percent ??
                  (p.total != null && p.done != null
                    ? Math.round((p.done / p.total) * 100)
                    : undefined),
                message:
                  p.message ??
                  (p.total != null && p.done != null
                    ? `${p.done}/${p.total}`
                    : undefined),
              }),
          ),
        );
        send(`Step '${step}' completed.`);
      } catch (e: any) {
        send(String(e?.stack || e));
      }
      try {
        socket.close();
      } catch {}
    },
  );
}

app.get<{
  Querystring: {
    step?: string;
    dir?: string;
    collection?: string;
    embedModel?: string;
    genModel?: string;
    k?: string | number;
    force?: string;
    docT?: string | number;
    refT?: string | number;
    anchorStyle?: string;
    files?: string;
  };
}>("/api/run-step", async (req, reply) => {
  const q = req.query || {};
  const step = String(q.step || "").toLowerCase();
  const dir = path.resolve(q.dir || ROOT);
  const collection = q.collection || COLLECTION;
  const embedModel = q.embedModel || "nomic-embed-text:latest";
  const genModel = q.genModel || "qwen3:4b";
  const k = Number(q.k || "16") || 16;
  const force = String(q.force || "false") === "true";
  const docT = Number(q.docT ?? "0.78");
  const refT = Number(q.refT ?? "0.85");
  const anchorStyle = (q.anchorStyle || "block") as
    | "block"
    | "heading"
    | "none";
  const sel = q.files as string | undefined;
  const files = sel ? JSON.parse(sel) : undefined;

  const line = sseInit(reply);
  line(`Running step=${step} in ${dir}`);
  try {
    const db = await dbPromise;
    const args = {
      step,
      dir,
      collection,
      embedModel,
      genModel,
      k,
      force,
      docT,
      refT,
      anchorStyle,
      files,
    };
    await runDocopsStep(db, step as StepId, args, (p) =>
      line(
        "PROGRESS " +
          JSON.stringify({
            step: p.step,
            percent:
              p.percent ??
              (p.total != null && p.done != null
                ? Math.round((p.done / p.total) * 100)
                : undefined),
            message:
              p.message ??
              (p.total != null && p.done != null
                ? `${p.done}/${p.total}`
                : undefined),
          }),
      ),
    );
    line(`Step '${step}' completed.`);
  } catch (e: any) {
    line(String(e?.stack || e));
  }
  reply.raw.end();
});

app
  .listen({ port: PORT, host: "0.0.0.0" })
  .then(() => {
    console.log(`Dev UI (Fastify) running on http://localhost:${PORT}`);
  })
  .catch((err) => {
    console.error("Failed to start server:", err);
    process.exit(1);
  });

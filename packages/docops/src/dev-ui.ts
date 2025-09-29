/* eslint-disable functional/no-try-statements, functional/immutable-data, functional/no-loop-statements, functional/prefer-immutable-types, @typescript-eslint/prefer-readonly-parameter-types, max-lines, max-lines-per-function, @typescript-eslint/no-unnecessary-type-assertion, @typescript-eslint/no-unsafe-assignment */
import * as fs from "node:fs/promises";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

import fastifyFactory from "fastify";
import fastifyStatic from "@fastify/static";
import fastifyRateLimit from "@fastify/rate-limit";

import { openDB } from "./db.js";
import type { DBs } from "./db.js";
import { buildFileTree } from "./lib/files.js";
import { computeDocStatus } from "./lib/status.js";
import { runDocopsStep, type RunArgs, type StepId } from "./lib/pipeline.js";
import { sseInit, log as writeSse } from "./lib/sse.js";
import { computePreview } from "./preview-front.js";
import type { Chunk } from "./types.js";
import { parseArgs } from "./utils.js";

type FilesQuery = {
  readonly dir?: string;
  readonly maxDepth?: string;
  readonly maxEntries?: string;
  readonly exts?: string;
  readonly includeMeta?: string;
};

type ReadQuery = {
  readonly file?: string;
};

type PreviewQuery = {
  readonly file?: string;
  readonly uuid?: string;
  readonly docT?: string;
  readonly refT?: string;
};

type StatusQuery = {
  readonly dir?: string;
  readonly limit?: string;
  readonly page?: string;
  readonly onlyIncomplete?: string;
};

type ChunksQuery = {
  readonly uuid?: string;
  readonly file?: string;
};

type ChunkHitsQuery = {
  readonly id?: string;
};

type SearchQuery = {
  readonly q?: string;
  readonly collection?: string;
  readonly k?: string;
};

type RunStepQuery = RunArgs & { readonly step?: StepId };

const args = parseArgs({
  "--dir": "docs/unique",
  "--collection": "docs-cosine",
  "--host": "127.0.0.1",
  "--port": "3939",
});

const ROOT_DIR = path.resolve(args["--dir"] ?? "docs/unique");
const COLLECTION = String(args["--collection"] ?? "docs-cosine");
const HOST = String(args["--host"] ?? "127.0.0.1");
const PORT_RAW = Number(args["--port"] ?? "3939");
const PORT = Number.isFinite(PORT_RAW) ? PORT_RAW : 3939;

const DEFAULT_EXTS = [".md", ".mdx", ".markdown", ".txt"] as const;
const MAX_DEPTH_DEFAULT = 4;
const MAX_ENTRIES_DEFAULT = 200;

const moduleDir = path.dirname(fileURLToPath(import.meta.url));
const UI_ROOT = path.resolve(moduleDir, "../../docops-frontend/static/dev-ui");
const JS_ROOT = path.join(UI_ROOT, "js");

const ONE_PIXEL_PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg==",
  "base64",
);

const clamp = (value: number, lo: number, hi: number) =>
  Math.min(Math.max(value, lo), hi);

const asBool = (value: string | undefined) => value === "1" || value === "true";

const ensureInDir = (candidate: string) => {
  const abs = path.resolve(candidate);
  if (abs === ROOT_DIR) return abs;
  if (abs.startsWith(`${ROOT_DIR}${path.sep}`)) return abs;
  throw new Error("File outside configured dir");
};

const toExtList = (exts: string | undefined) => {
  if (!exts) return [...DEFAULT_EXTS];
  return exts
    .split(",")
    .map((ext) => ext.trim())
    .filter(Boolean)
    .map((ext) =>
      ext.startsWith(".") ? ext.toLowerCase() : `.${ext.toLowerCase()}`,
    );
};

const loadDocs = async (db: DBs) => {
  const docs: Array<{ uuid: string; path: string; title: string }> = [];
  for await (const [uuid, info] of db.docs.iterator()) {
    const data = info as { path?: string; title?: string };
    if (!data?.path) continue;
    try {
      const abs = ensureInDir(data.path);
      docs.push({ uuid, path: abs, title: data.title ?? path.basename(abs) });
    } catch {}
  }
  return docs;
};

const readChunks = async (db: DBs, uuid: string) => {
  const raw = await db.chunks.get(uuid).catch(() => []);
  const chunks = Array.isArray(raw) ? (raw as Chunk[]) : [];
  return chunks.map((chunk) => ({
    id: chunk.id,
    docUuid: chunk.docUuid,
    docPath: chunk.docPath,
    text: chunk.text ?? "",
    startLine: chunk.startLine,
    endLine: chunk.endLine ?? chunk.startLine,
    startCol: chunk.startCol ?? 0,
    endCol: chunk.endCol ?? 0,
  }));
};

const buildSearchIndex = async (db: DBs) => {
  const docs = await loadDocs(db);
  const results: Array<{ uuid: string; path: string; text: string }> = [];
  await Promise.all(
    docs.map(async (doc) => {
      try {
        const txt = await fs.readFile(doc.path, "utf8");
        results.push({ uuid: doc.uuid, path: doc.path, text: txt });
      } catch {}
    }),
  );
  return results;
};

const ensureArray = <T>(value: unknown): T[] =>
  Array.isArray(value) ? (value as T[]) : [];

const app = fastifyFactory({ logger: false });

await app.register(fastifyStatic, {
  root: UI_ROOT,
  prefix: "/ui",
});

await app.register(fastifyStatic, {
  root: JS_ROOT,
  prefix: "/js",
  decorateReply: false,
});

const db = await openDB();

app.get("/favicon.ico", async (_req, reply) => {
  reply.header("content-type", "image/png");
  reply.send(ONE_PIXEL_PNG);
});

// Register global rate limit (e.g. 100 requests every 15 minutes per IP)
app.register(fastifyRateLimit, {
  max: 100,
  timeWindow: "15 minutes",
});

app.get(
  "/",
  {
    config: {
      rateLimit: {
        max: 30,
        timeWindow: "1 minute",
      },
    },
  },
  async (_req, reply) => {
    try {
      const html = await fs.readFile(path.join(UI_ROOT, "index.html"), "utf8");
      reply.header("content-type", "text/html; charset=utf-8");
      reply.send(html);
    } catch (error) {
      reply.code(500).send({ error: String((error as Error)?.message ?? error) });
    }
  },
);

app.get("/health", async () => ({ ok: true }));

app.get("/api/config", async () => ({
  dir: ROOT_DIR,
  collection: COLLECTION,
  ws: false,
}));

app.get<{ Querystring: FilesQuery }>(
  "/api/files",
  {
    config: {
      rateLimit: {
        max: 30,
        timeWindow: "1 minute",
      },
    },
  },
  async (request, reply) => {
    const query = request.query;
    const targetDir = (() => {
      try {
        if (query.dir) return ensureInDir(query.dir);
        return ROOT_DIR;
      } catch (error) {
        reply.code(400);
        throw error;
      }
    })();

    const maxDepth = clamp(
      Number.isFinite(Number(query.maxDepth))
        ? Number(query.maxDepth)
        : MAX_DEPTH_DEFAULT,
      0,
      16,
    );
    const maxEntries = clamp(
      Number.isFinite(Number(query.maxEntries))
        ? Number(query.maxEntries)
        : MAX_ENTRIES_DEFAULT,
      1,
      500,
    );
    const exts = toExtList(query.exts);
    const includeMeta = asBool(query.includeMeta);

    reply.header("cache-control", "no-store, no-cache, must-revalidate");
    try {
      const tree = await buildFileTree(targetDir, {
        maxDepth,
        maxEntries,
        includeMeta,
        exts,
      });
      return { dir: targetDir, tree };
    } catch (error) {
      reply.code(500);
      return { error: String((error as Error)?.message ?? error) };
    }
  },
);

app.get<{ Querystring: ReadQuery }>("/api/read", async (request, reply) => {
  const file = request.query.file;
  if (!file) {
    reply.code(400);
    return { error: "file parameter required" };
  }
  try {
    const abs = ensureInDir(file);
    const ext = path.extname(abs).toLowerCase();
    if (!DEFAULT_EXTS.includes(ext as (typeof DEFAULT_EXTS)[number])) {
      reply.code(400);
      return { error: "only markdown and text files allowed" };
    }
    const txt = await fs.readFile(abs, "utf8");
    reply.header("content-type", "text/plain; charset=utf-8");
    return txt;
  } catch (error) {
    reply.code(400);
    return { error: String((error as Error)?.message ?? error) };
  }
});

app.get("/api/docs", async () => {
  const docs = await loadDocs(db);
  return docs.map((doc) => ({
    uuid: doc.uuid,
    path: doc.path,
    title: doc.title,
  }));
});

app.get<{ Querystring: PreviewQuery }>(
  "/api/preview",
  async (request, reply) => {
    const query = request.query;
    if (!query.uuid && !query.file) {
      reply.code(400);
      return { error: "uuid or file parameter required" };
    }
    try {
      const file = query.file ? ensureInDir(query.file) : undefined;
      const result = await computePreview(
        { uuid: query.uuid, file },
        {
          dir: ROOT_DIR,
          docThreshold: Number.isFinite(Number(query.docT))
            ? Number(query.docT)
            : 0.78,
          refThreshold: Number.isFinite(Number(query.refT))
            ? Number(query.refT)
            : 0.85,
        },
        db,
      );
      return result;
    } catch (error) {
      reply.code(400);
      return { error: String((error as Error)?.message ?? error) };
    }
  },
);

app.get<{ Querystring: StatusQuery }>("/api/status", async (request, reply) => {
  const query = request.query;
  const docs = await loadDocs(db);
  const limit = clamp(
    Number.isFinite(Number(query.limit)) ? Number(query.limit) : 25,
    1,
    200,
  );
  const pageRaw = Number.isFinite(Number(query.page)) ? Number(query.page) : 1;
  const page = pageRaw >= 1 ? pageRaw : 1;
  const onlyIncomplete = asBool(query.onlyIncomplete);

  const statuses = await Promise.all(
    docs.map((doc) => computeDocStatus(db, doc)),
  );
  const filtered = onlyIncomplete
    ? statuses.filter(
        (status) =>
          !status.frontmatter.done ||
          status.embed.chunks === 0 ||
          status.query.withHits === 0 ||
          !status.relations.present ||
          !status.footers.present,
      )
    : statuses;

  const start = (page - 1) * limit;
  const slice = filtered.slice(start, start + limit);
  const hasMore = start + slice.length < filtered.length;

  reply.header("cache-control", "no-store, no-cache, must-revalidate");
  return { items: slice, page, hasMore, total: filtered.length };
});

app.get<{ Querystring: ChunksQuery }>("/api/chunks", async (request, reply) => {
  const query = request.query;
  const docs = await loadDocs(db);
  if (!query.uuid && !query.file) {
    reply.code(400);
    return { error: "uuid or file parameter required" };
  }
  try {
    const uuid = (() => {
      if (query.uuid) return query.uuid;
      if (!query.file) return "";
      const abs = ensureInDir(query.file);
      const match = docs.find((doc) => doc.path === abs);
      if (!match) throw new Error("file not indexed");
      return match.uuid;
    })();
    const items = await readChunks(db, uuid);
    return { uuid, items };
  } catch (error) {
    reply.code(400);
    return { error: String((error as Error)?.message ?? error) };
  }
});

app.get<{ Querystring: ChunkHitsQuery }>(
  "/api/chunk-hits",
  async (request, reply) => {
    const id = request.query.id;
    if (!id) {
      reply.code(400);
      return { error: "id parameter required" };
    }
    const raw = await db.q.get(id).catch(() => []);
    const items = ensureArray<unknown>(raw);
    return { id, items };
  },
);

app.get<{ Querystring: SearchQuery }>("/api/search", async (request) => {
  const q = (request.query.q ?? "").trim();
  if (!q) return { items: [] };
  const k = clamp(
    Number.isFinite(Number(request.query.k)) ? Number(request.query.k) : 10,
    1,
    50,
  );
  const haystack = await buildSearchIndex(db);
  const matches = haystack
    .map((doc) => {
      const idx = doc.text.toLowerCase().indexOf(q.toLowerCase());
      if (idx < 0) return null;
      const start = Math.max(0, idx - 40);
      const end = Math.min(doc.text.length, idx + q.length + 40);
      const snippet = doc.text.slice(start, end).replace(/\s+/g, " ");
      return { uuid: doc.uuid, path: doc.path, snippet };
    })
    .filter((x): x is { uuid: string; path: string; snippet: string } => !!x)
    .slice(0, k);
  return { items: matches };
});

app.get<{ Querystring: RunStepQuery }>(
  "/api/run-step",
  {
    config: {
      rateLimit: {
        max: 10,
        timeWindow: "1 minute",
      },
    },
  },
  async (request, reply) => {
    const {
      step: stepParam,
      files: filesRaw,
      dir,
      collection,
      ...rest
    } = request.query;
    const step = stepParam as StepId | undefined;
    if (!step) {
      reply.code(400);
      return { error: "step parameter required" };
    }
    const send = sseInit(reply);
    const sendLine = (line: string) => writeSse(send, line);

    const selectedDir = (() => {
      if (!dir) return ROOT_DIR;
      try {
        return ensureInDir(dir);
      } catch {
        return ROOT_DIR;
      }
    })();

    const files = (() => {
      if (!filesRaw) return undefined;
      try {
        const parsed = JSON.parse(String(filesRaw));
        if (!Array.isArray(parsed)) return undefined;
        const safe = parsed
          .map((item) => {
            try {
              return ensureInDir(String(item));
            } catch {
              return null;
            }
          })
          .filter((x): x is string => !!x);
        return safe.length ? safe : undefined;
      } catch {
        return undefined;
      }
    })();

    sendLine(`Running step=${step}...`);
    try {
      await runDocopsStep(
        db,
        step,
        {
          ...rest,
          dir: selectedDir,
          collection: collection ?? COLLECTION,
          files,
        },
        (progress) => {
          const payload = JSON.stringify({
            step: progress.step,
            percent: progress.percent,
            done: progress.done,
            total: progress.total,
            message: progress.message,
          });
          sendLine(`PROGRESS ${payload}`);
        },
      );
      sendLine(`Step '${step}' completed.`);
    } catch (error) {
      sendLine(`ERROR ${String((error as Error)?.message ?? error)}`);
    } finally {
      reply.raw.end();
    }
    return reply;
  },
);

process.on("SIGINT", async () => {
  await db.root.close().catch(() => {});
  process.exit(0);
});

app
  .listen({ port: PORT, host: HOST })
  .then(() => {
    const shownHost = HOST === "0.0.0.0" ? "localhost" : HOST;
    console.log(`DocOps Dev UI running on http://${shownHost}:${PORT}`);
  })
  .catch((error) => {
    console.error("Failed to start DocOps Dev UI", error);
    process.exit(1);
  });

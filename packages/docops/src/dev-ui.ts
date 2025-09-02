#!/usr/bin/env node
import fastifyFactory from "fastify";
import fastifyStatic from "@fastify/static";
import * as url from "node:url";
import * as path from "node:path";
import { promises as fs } from "node:fs";
import { openDB } from "./db";
import {
  runFrontmatter,
  runEmbed,
  runQuery,
  runRelations,
  runFooters,
  runRename,
} from "./index";
import { parseArgs } from "./utils";
import { computePreview } from "./preview-front";

const args = parseArgs({
  "--dir": "docs/unique",
  "--collection": "docs-cosine",
  "--port": "3939",
});

const ROOT = path.resolve(args["--dir"]);
const COLLECTION = args["--collection"];
const PORT = Number(args["--port"]) || 3939;
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

app.get("/api/config", async (_req, reply) => {
  reply.header("content-type", "application/json");
  return reply.send({ dir: ROOT, collection: COLLECTION });
});

app.get("/api/docs", async (req, reply) => {
  const q = (req.query || {}) as any;
  const dir = path.resolve(q.dir || ROOT);
  const db = await dbPromise;
  const xs: Array<{ uuid: string; path: string; title: string }> = [];
  for await (const [uuid, info] of db.docs.iterator()) {
    const d = info as { path: string; title: string };
    if (!d || !d.path) continue;
    const abs = path.resolve(d.path);
    if (!abs.startsWith(dir)) continue;
    if (!/\.(md|mdx|txt)$/i.test(d.path)) continue;
    xs.push({ uuid, path: d.path, title: d.title });
  }
  reply.header("content-type", "application/json");
  return reply.send(xs);
});

app.get("/api/files", async (req, reply) => {
  const q = (req.query || {}) as any;
  const dir = path.resolve(q.dir || ROOT);
  async function tree(p: string): Promise<any> {
    const ents = await fs.readdir(p, { withFileTypes: true });
    const out: any[] = [];
    for (const e of ents) {
      if (e.name.startsWith(".#")) continue; // ignore lock files
      const fp = path.join(p, e.name);
      if (e.isDirectory())
        out.push({ name: e.name, type: "dir", children: await tree(fp) });
      else out.push({ name: e.name, type: "file", path: fp });
    }
    return out;
  }
  try {
    const root = await tree(dir);
    reply.header("content-type", "application/json");
    return reply.send({ dir, tree: root });
  } catch (e: any) {
    reply.code(500);
    return reply.send({ error: e?.message || String(e) });
  }
});

app.get("/api/preview", async (req, reply) => {
  const q = (req.query || {}) as any;
  const dir = path.resolve(q.dir || ROOT);
  const uuid = q.uuid || undefined;
  const file = q.file || undefined;
  const docT = Number(q.docT ?? "0.78");
  const refT = Number(q.refT ?? "0.85");
  try {
    const db = await dbPromise;
    const out = await computePreview(
      { uuid, file },
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

app.get("/api/read", async (req, reply) => {
  try {
    const q = (req.query || {}) as any;
    const dir = path.resolve(q.dir || ROOT);
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
});

function sseInit(reply: any) {
  reply.raw.setHeader("Content-Type", "text/event-stream");
  reply.raw.setHeader("Cache-Control", "no-cache");
  reply.raw.setHeader("Connection", "keep-alive");
  // hijack to take over the underlying stream
  reply.hijack();
  return (line: string) =>
    reply.raw.write(`data: ${String(line).replace(/\n/g, "\\n")}\n\n`);
}

function log(line: (s: string) => void, s: string) {
  line(s);
}

app.get("/api/run", async (req, reply) => {
  const q = (req.query || {}) as any;
  const dir = path.resolve(q.dir || ROOT);
  const collection = q.collection || COLLECTION;
  const docT = q.docT || "0.78";
  const refT = q.refT || "0.85";
  const line = sseInit(reply);
  line(`Starting pipeline in ${dir}`);
  try {
    const db = await dbPromise;
    const { ChromaClient } = await import("chromadb");
    const { OllamaEmbeddingFunction } = await import("@chroma-core/ollama");
    const { OLLAMA_URL } = await import("./utils");
    const client = new ChromaClient({});
    const embedModel = "nomic-embed-text:latest";
    const embedder = new OllamaEmbeddingFunction({
      model: embedModel,
      url: OLLAMA_URL,
    });
    const coll = await client.getOrCreateCollection({
      name: collection,
      metadata: { embed_model: embedModel, "hnsw:space": "cosine" },
      embeddingFunction: embedder,
    });

    line(
      "PROGRESS " + JSON.stringify({ step: "frontmatter", index: 1, of: 6 }),
    );
    const sel = q.files as string | undefined;
    const files = sel ? JSON.parse(sel) : undefined;
    await runFrontmatter({ dir, genModel: "qwen3:4b", files }, db, (p) =>
      line(
        "PROGRESS " +
          JSON.stringify({
            step: p.step,
            percent: Math.round((p.done / p.total) * 100),
            message: `${p.done}/${p.total}`,
          }),
      ),
    );
    log(line, "01-frontmatter: done.");
    line("PROGRESS " + JSON.stringify({ step: "embed", index: 2, of: 6 }));
    await runEmbed(
      { dir, embedModel: embedModel, collection, files },
      db,
      coll,
      (p) =>
        line(
          "PROGRESS " +
            JSON.stringify({
              step: p.step,
              percent: Math.round((p.done / p.total) * 100),
              message: `${p.done}/${p.total}`,
            }),
        ),
    );
    log(line, "02-embed: done.");
    line("PROGRESS " + JSON.stringify({ step: "query", index: 3, of: 6 }));
    await runQuery(
      { embedModel: embedModel, collection, k: 16, force: true, files },
      db,
      coll,
      (p) =>
        line(
          "PROGRESS " +
            JSON.stringify({
              step: p.step,
              percent: Math.round((p.done / p.total) * 100),
              message: `${p.done}/${p.total}`,
            }),
        ),
    );
    log(line, "03-query: done.");
    line("PROGRESS " + JSON.stringify({ step: "relations", index: 4, of: 6 }));
    await runRelations(
      {
        docsDir: dir,
        docThreshold: Number(docT),
        refThreshold: Number(refT),
        files,
      },
      db,
      (p) =>
        line(
          "PROGRESS " +
            JSON.stringify({
              step: p.step,
              percent: Math.round((p.done / p.total) * 100),
              message: `${p.done}/${p.total}`,
            }),
        ),
    );
    log(line, "04-relations: done.");
    line("PROGRESS " + JSON.stringify({ step: "footers", index: 5, of: 6 }));
    await runFooters({ dir, anchorStyle: "block", files }, db, (p) =>
      line(
        "PROGRESS " +
          JSON.stringify({
            step: p.step,
            percent: Math.round((p.done / p.total) * 100),
            message: `${p.done}/${p.total}`,
          }),
      ),
    );
    log(line, "05-footers: done.");
    await runRename({ dir, files });
    line("PROGRESS " + JSON.stringify({ step: "rename", index: 6, of: 6 }));
    log(line, "06-rename: done.");
  } catch (e: any) {
    log(line, String(e?.stack || e));
  }
  line("Done.");
  reply.raw.end();
});

app.get("/api/run-step", async (req, reply) => {
  const q = (req.query || {}) as any;
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
    const needColl = step === "embed" || step === "query";
    let coll: any = null;
    if (needColl) {
      const { ChromaClient } = await import("chromadb");
      const { OllamaEmbeddingFunction } = await import("@chroma-core/ollama");
      const { OLLAMA_URL } = await import("./utils");
      const client = new ChromaClient({});
      const embedder = new OllamaEmbeddingFunction({
        model: embedModel,
        url: OLLAMA_URL,
      });
      coll = await client.getOrCreateCollection({
        name: collection,
        metadata: { embed_model: embedModel, "hnsw:space": "cosine" },
        embeddingFunction: embedder,
      });
    }

    switch (step) {
      case "frontmatter":
        await runFrontmatter({ dir, genModel, files }, db);
        break;
      case "embed":
        await runEmbed({ dir, embedModel, collection, files }, db, coll);
        break;
      case "query":
        await runQuery({ embedModel, collection, k, force, files }, db, coll);
        break;
      case "relations":
        await runRelations(
          { docsDir: dir, docThreshold: docT, refThreshold: refT, files },
          db,
        );
        break;
      case "footers":
        await runFooters({ dir, anchorStyle, files }, db);
        break;
      case "rename":
        await runRename({ dir, files });
        break;
      default:
        line(`Unknown step: ${step}`);
    }
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

#!/usr/bin/env node
import fastifyFactory from "fastify";
import fastifyStatic from "@fastify/static";
import * as url from "node:url";
import * as path from "node:path";
import { promises as fs } from "node:fs";
import { openDB } from "./db";
import {
  runFrontmatter,
  runPurge,
  runEmbed,
  runQuery,
  runRelations,
  runFooters,
  runRename,
} from "./index";
import { parseArgs, listFilesRec } from "./utils";
import { computePreview } from "./preview-front";

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

// Static UI serving
const UI_ROOT = path.resolve(
  path.dirname(url.fileURLToPath(import.meta.url)),
  "../ui",
);
await app.register(
  fastifyStatic as any,
  {
    root: UI_ROOT,
    prefix: "/",
  } as any,
);

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
  const maxDepth = Math.max(0, Number(q.maxDepth ?? 2) | 0) || 2;
  const maxEntries = Math.max(1, Number(q.maxEntries ?? 500) | 0) || 500;
  const includeMeta = String(q.includeMeta || "0") === "1";
  const exts = new Set(
    String(q.exts || ".md,.mdx,.txt,.markdown")
      .split(",")
      .map((s: string) => s.trim().toLowerCase())
      .filter(Boolean),
  );
  const skipDirs = new Set([
    "node_modules",
    ".git",
    ".obsidian",
    ".cache",
    "dist",
    "build",
    "coverage",
  ]);
  async function tree(p: string, depth: number): Promise<any[]> {
    if (depth < 0) return [];
    let ents = await fs.readdir(p, { withFileTypes: true });
    // order: dirs first, then files; cap total entries
    const dirs = ents.filter((e) => e.isDirectory() && !skipDirs.has(e.name));
    const files = ents.filter((e) => e.isFile());
    const limited = dirs.concat(files).slice(0, maxEntries);
    const out: any[] = [];
    for (const e of limited) {
      if (e.name.startsWith(".#")) continue; // ignore lock files
      const fp = path.join(p, e.name);
      if (e.isDirectory()) {
        const children = await tree(fp, depth - 1);
        out.push({ name: e.name, type: "dir", children });
      } else {
        const ok = exts.has(path.extname(e.name).toLowerCase());
        if (!ok) continue;
        if (!includeMeta) {
          out.push({ name: e.name, type: "file", path: fp });
        } else {
          try {
            const st = await fs.stat(fp);
            // Light frontmatter length estimation from head only
            let fmLen = 0;
            if (st.size > 0) {
              try {
                const fd = await (fs as any).open(fp, "r");
                try {
                  const headLen = Math.min(256 * 1024, st.size);
                  const buf = Buffer.allocUnsafe(headLen);
                  await fd.read(buf, 0, headLen, 0);
                  const head = buf.toString("utf8");
                  if (head.startsWith("---")) {
                    const m = head.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n/);
                    if (m) fmLen = m[0].length;
                  }
                } finally {
                  await fd.close();
                }
              } catch {}
            }
            out.push({
              name: e.name,
              type: "file",
              path: fp,
              size: st.size,
              fmLen,
            });
          } catch {
            out.push({ name: e.name, type: "file", path: fp });
          }
        }
      }
    }
    return out;
  }
  try {
    const root = await tree(dir, maxDepth);
    reply.header("content-type", "application/json");
    reply.header("Cache-Control", "no-store, no-cache, must-revalidate");
    reply.header("Pragma", "no-cache");
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

// Text search over Chroma collection, returns best match per document
app.get("/api/search", async (req, reply) => {
  try {
    const q = (req.query || {}) as any;
    const query = String(q.q || "").trim();
    if (!query) return reply.send({ items: [] });
    const collection = q.collection || COLLECTION;
    const k = Math.max(1, Math.min(100, Number(q.k || "10") | 0));

    const { ChromaClient } = await import("chromadb");
    const { OllamaEmbeddingFunction } = await import("@chroma-core/ollama");
    const { OLLAMA_URL } = await import("./utils");
    const embedModel = "nomic-embed-text:latest";

    const client = new ChromaClient({});
    const embedder = new OllamaEmbeddingFunction({
      model: embedModel,
      url: OLLAMA_URL,
    });
    const coll = await client.getOrCreateCollection({
      name: collection,
      metadata: { embed_model: embedModel, "hnsw:space": "cosine" },
      embeddingFunction: embedder,
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

// Return chunks for a given file or uuid
app.get("/api/chunks", async (req, reply) => {
  try {
    const q = (req.query || {}) as any;
    const wantFile = q.file ? path.resolve(q.file) : undefined;
    let uuid: string | undefined = (q.uuid || undefined) as string | undefined;

    const db = await dbPromise;
    if (!uuid && wantFile) {
      for await (const [u, info] of db.docs.iterator()) {
        const p = (info as any)?.path as string | undefined;
        if (p && path.resolve(p) === wantFile) {
          uuid = u;
          break;
        }
      }
    }
    if (!uuid) throw new Error("Missing uuid or file");

    const raw = (await db.chunks.get(uuid).catch(() => [])) as any;
    const chunks = Array.isArray(raw) ? raw : [];
    reply.header("content-type", "application/json");
    return reply.send({ uuid, items: chunks });
  } catch (e: any) {
    reply.code(400);
    return reply.send({ error: e?.message || String(e) });
  }
});

// Return precomputed query hits for a chunk id, enriched with titles/paths
app.get("/api/chunk-hits", async (req, reply) => {
  try {
    const q = (req.query || {}) as any;
    const id = String(q.id || "");
    if (!id) throw new Error("Missing id");
    const db = await dbPromise;
    const qhitsKV = db.root.sublevel<string, readonly any[]>("q", {
      valueEncoding: "json",
    });
    const raw = (await qhitsKV.get(id).catch(() => [])) as any;
    const hits = Array.isArray(raw) ? raw : [];
    // Enrich with doc title/path
    const docs: Record<string, { title?: string; path?: string }> = {};
    for await (const [u, info] of db.docs.iterator()) {
      docs[u] = { title: (info as any)?.title, path: (info as any)?.path };
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
});

import { sseInit, log } from "./lib/sse";
// Try to enable WebSocket support; fallback to SSE if plugin not installed
let WS_ENABLED = false as boolean;
try {
  const wsName = "@fastify/websocket";
  const wsMod: any = await import(wsName as any);
  const wsPlugin = wsMod.default || wsMod;
  // @ts-ignore fastify typings for plugins
  await app.register(wsPlugin, {});
  WS_ENABLED = true;
} catch {
  WS_ENABLED = false;
}

// Pipeline status per document
app.get("/api/status", async (req, reply) => {
  try {
    const q = (req.query || {}) as any;
    const dir = path.resolve(q.dir || ROOT);
    const db = await dbPromise;
    const docs: Array<{ uuid: string; path: string; title: string }> = [];
    for await (const [uuid, info] of db.docs.iterator()) {
      const d = info as { path: string; title: string };
      if (!d?.path) continue;
      const abs = path.resolve(d.path);
      if (!abs.startsWith(dir)) continue;
      if (!/\.(md|mdx|txt)$/i.test(abs)) continue;
      docs.push({ uuid, path: d.path, title: d.title });
    }
    // helpers
    const chunksKV = db.chunks;
    const fpKV = db.fp;
    const qhitsKV = db.root.sublevel<string, readonly any[]>("q", {
      valueEncoding: "json",
    });

    async function docStatus(d: { uuid: string; path: string; title: string }) {
      const abs = path.resolve(d.path);
      let frontmatterDone = false;
      let relationsPresent = false;
      let relationsRelated = 0;
      let relationsRefs = 0;
      let footersPresent = false;

      // Read only a small head and tail window to avoid OOM on huge files
      const HEAD_LIMIT = 256 * 1024; // 256 KB
      const TAIL_LIMIT = 128 * 1024; // 128 KB
      try {
        const fd = await (fs as any).open(abs, "r");
        try {
          const st = await fd.stat();
          const headLen = Math.min(HEAD_LIMIT, st.size);
          const headBuf = Buffer.allocUnsafe(headLen);
          await fd.read(headBuf, 0, headLen, 0);
          const head = headBuf.toString("utf8");

          // Fast frontmatter scan (YAML between leading --- ... ---)
          let fmObj: any = undefined;
          const fmStart = head.startsWith("---") ? 0 : head.indexOf("\n---");
          if (fmStart === 0) {
            const endIdx = head.indexOf("\n---", 3);
            if (endIdx > 0) {
              const yamlText = head.slice(3, endIdx).replace(/^\n+|\n+$/g, "");
              try {
                const YAML = (await import("yaml")).default;
                fmObj = YAML.parse(yamlText) || {};
              } catch {}
            }
          }
          if (fmObj && typeof fmObj === "object") {
            frontmatterDone = !!fmObj.uuid;
            const hasRelU = Array.isArray(fmObj.related_to_uuid);
            const hasRefs = Array.isArray(fmObj.references);
            const hasRelT = Array.isArray(fmObj.related_to_title);
            relationsPresent = !!(hasRelU || hasRefs || hasRelT);
            relationsRelated = hasRelU ? fmObj.related_to_uuid.length : 0;
            relationsRefs = hasRefs ? fmObj.references.length : 0;
          } else {
            // Heuristic: detect presence without parsing large YAML
            frontmatterDone = /\buuid\s*:\s*\S/.test(head);
            relationsPresent =
              /related_to_uuid|references|related_to_title/.test(head);
          }

          // Tail marker for footers presence
          const tailLen = Math.min(TAIL_LIMIT, Math.max(0, st.size - 0));
          if (tailLen > 0) {
            const readFrom = Math.max(0, st.size - tailLen);
            const tailBuf = Buffer.allocUnsafe(Math.min(TAIL_LIMIT, st.size));
            await fd.read(tailBuf, 0, Math.min(TAIL_LIMIT, st.size), readFrom);
            const tail = tailBuf.toString("utf8");
            footersPresent =
              /<!--\s*GENERATED-SECTIONS:DO-NOT-EDIT-BELOW\s*-->/.test(tail);
          }
        } finally {
          await fd.close();
        }
      } catch {}
      const chunks = (await chunksKV.get(d.uuid).catch(() => [])) as any;
      const chunkArr = Array.isArray(chunks) ? (chunks as any[]) : [];
      let fpCount = 0,
        qCount = 0;
      for (const c of chunkArr) {
        try {
          await fpKV.get(c.id);
          fpCount++;
        } catch {}
        try {
          const hs = await qhitsKV.get(c.id);
          if (Array.isArray(hs)) qCount++;
        } catch {}
      }
      return {
        uuid: d.uuid,
        path: d.path,
        title: d.title,
        frontmatter: { done: frontmatterDone },
        embed: { chunks: chunkArr.length, fingerprints: fpCount },
        query: { withHits: qCount, of: chunkArr.length },
        relations: {
          present: relationsPresent,
          related: relationsRelated,
          refs: relationsRefs,
        },
        footers: { present: footersPresent },
      };
    }

    const items = await Promise.all(docs.map(docStatus));
    reply.header("content-type", "application/json");
    reply.header("Cache-Control", "no-store, no-cache, must-revalidate");
    reply.header("Pragma", "no-cache");
    return reply.send({ items });
  } catch (e: any) {
    reply.code(500);
    return reply.send({ error: e?.message || String(e) });
  }
});

// ---- Pipeline abstraction (no shelling out) ----
type StepId =
  | "purge"
  | "frontmatter"
  | "embed"
  | "query"
  | "relations"
  | "footers"
  | "rename";

async function getColl(collection: string, embedModel: string) {
  const { getChromaCollection } = await import("./lib/chroma");
  return (await getChromaCollection({ collection, embedModel })).coll as any;
}

const stepRegistry: Record<
  StepId,
  (
    args: any,
    ctx: { db: any; collection?: string; embedModel?: string; coll?: any },
    onProgress?: (p: any) => void,
  ) => Promise<void>
> = {
  purge: async (args, _ctx, onp) => {
    const files = args.files as string[] | undefined;
    const dir = args.dir as string;
    await runPurge({ dir, files }, onp as any);
  },
  frontmatter: async (args, ctx, onp) => {
    const files = args.files as string[] | undefined;
    await runFrontmatter(
      { dir: args.dir, genModel: args.genModel || "qwen3:4b", files },
      ctx.db,
      onp as any,
    );
  },
  embed: async (args, ctx, onp) => {
    const files = args.files as string[] | undefined;
    const coll =
      ctx.coll ??
      (await getColl(
        String(args.collection),
        String(args.embedModel || "nomic-embed-text:latest"),
      ));
    await runEmbed(
      {
        dir: args.dir,
        embedModel: args.embedModel || "nomic-embed-text:latest",
        collection: args.collection,
        files,
      },
      ctx.db,
      coll,
      onp as any,
    );
  },
  query: async (args, ctx, onp) => {
    const files = args.files as string[] | undefined;
    const coll =
      ctx.coll ??
      (await getColl(
        String(args.collection),
        String(args.embedModel || "nomic-embed-text:latest"),
      ));
    await runQuery(
      {
        embedModel: args.embedModel || "nomic-embed-text:latest",
        collection: args.collection,
        k: Number(args.k || 16),
        force: String(args.force || "false") === "true",
        files,
      },
      ctx.db,
      coll,
      onp as any,
    );
  },
  relations: async (args, ctx, onp) => {
    const files = args.files as string[] | undefined;
    await runRelations(
      {
        docsDir: args.dir,
        docThreshold: Number(args.docT ?? 0.78),
        refThreshold: Number(args.refT ?? 0.85),
        files,
      },
      ctx.db,
      onp as any,
    );
  },
  footers: async (args, ctx, onp) => {
    const files = args.files as string[] | undefined;
    await runFooters(
      { dir: args.dir, anchorStyle: args.anchorStyle || "block", files },
      ctx.db,
      onp as any,
    );
  },
  rename: async (args, _ctx, _onp) => {
    const files = args.files as string[] | undefined;
    await runRename({ dir: args.dir, files });
  },
};

async function runDocopsStep(
  step: StepId,
  args: any,
  onProgress?: (p: any) => void,
) {
  const db = await dbPromise;
  const ctx: any = { db };
  if (step === "embed" || step === "query") {
    ctx.coll = await getColl(
      String(args.collection),
      String(args.embedModel || "nomic-embed-text:latest"),
    );
  }
  const fn = stepRegistry[step];
  if (!fn) throw new Error(`Unknown step: ${step}`);
  await fn(args, ctx, onProgress);
}

async function runDocopsPipeline(
  steps: StepId[],
  baseArgs: any,
  onProgress: (p: any) => void,
) {
  for (let i = 0; i < steps.length; i++) {
    const step = steps[i]!;
    onProgress({ step, index: i + 1, of: steps.length });
    await runDocopsStep(step, baseArgs, (p) =>
      onProgress({
        step: p.step || step,
        percent: p.percent,
        message: p.message,
        done: p.done,
        total: p.total,
      }),
    );
  }
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
    const embedModel = "nomic-embed-text:latest";
    // Run pipeline via registry
    const steps: StepId[] = [
      "frontmatter",
      "embed",
      "query",
      "relations",
      "footers",
      "rename",
    ];
    line(
      "PROGRESS " +
        JSON.stringify({ step: "frontmatter", index: 1, of: steps.length }),
    );
    const sel = q.files as string | undefined;
    const files = sel ? JSON.parse(sel) : undefined;
    await runDocopsPipeline(
      steps,
      { dir, collection, embedModel, files, docT, refT },
      (p) =>
        line(
          "PROGRESS " +
            JSON.stringify({
              step: p.step,
              index: p.index,
              of: p.of,
              percent: p.percent,
              message: p.message,
            }),
        ),
    );
  } catch (e: any) {
    log(line, String(e?.stack || e));
  }
  line("Done.");
  reply.raw.end();
});

// WebSocket equivalent for running full pipeline (more robust than SSE)
if (WS_ENABLED) {
  // @ts-ignore fastify websocket route
  app.get("/ws/run", { websocket: true }, async (connection: any, req: any) => {
    const q = (req.query || {}) as any;
    const dir = path.resolve(q.dir || ROOT);
    const collection = q.collection || COLLECTION;
    const docT = q.docT || "0.78";
    const refT = q.refT || "0.85";
    const send = (line: string) => {
      try {
        connection.socket.send(String(line));
      } catch {}
    };
    send(`Starting pipeline in ${dir}`);
    try {
      const db = await dbPromise;
      const { getChromaCollection } = await import("./lib/chroma");
      const embedModel = "nomic-embed-text:latest";
      const { coll } = await getChromaCollection({ collection, embedModel });

      send(
        "PROGRESS " + JSON.stringify({ step: "frontmatter", index: 1, of: 6 }),
      );
      const sel = q.files as string | undefined;
      let files = sel ? JSON.parse(sel) : undefined;
      if (step === "purge" && !files) {
        const minSize = Number(q.minSize || "0") || 0;
        if (minSize > 0) {
          const exts = new Set([".md", ".mdx", ".txt", ".markdown"]);
          const all = await listFilesRec(dir, exts);
          const stats = await Promise.all(
            all.map(async (p) => {
              try {
                const st = await fs.stat(p);
                return st.size >= minSize ? p : null;
              } catch {
                return null;
              }
            }),
          );
          files = stats.filter((x): x is string => !!x);
        }
      }
      await runFrontmatter({ dir, genModel: "qwen3:4b", files }, db, (p) =>
        send(
          "PROGRESS " +
            JSON.stringify({
              step: p.step,
              percent: Math.round((p.done / p.total) * 100),
              message: `${p.done}/${p.total}`,
            }),
        ),
      );
      send("01-frontmatter: done.");
      send("PROGRESS " + JSON.stringify({ step: "embed", index: 2, of: 6 }));
      await runEmbed(
        { dir, embedModel: embedModel, collection, files },
        db,
        coll,
        (p) =>
          send(
            "PROGRESS " +
              JSON.stringify({
                step: p.step,
                percent: Math.round((p.done / p.total) * 100),
                message: `${p.done}/${p.total}`,
              }),
          ),
      );
      send("02-embed: done.");
      send("PROGRESS " + JSON.stringify({ step: "query", index: 3, of: 6 }));
      await runQuery(
        { embedModel: embedModel, collection, k: 16, force: true, files },
        db,
        coll,
        (p) =>
          send(
            "PROGRESS " +
              JSON.stringify({
                step: p.step,
                percent: Math.round((p.done / p.total) * 100),
                message: `${p.done}/${p.total}`,
              }),
          ),
      );
      send("03-query: done.");
      send(
        "PROGRESS " + JSON.stringify({ step: "relations", index: 4, of: 6 }),
      );
      await runRelations(
        {
          docsDir: dir,
          docThreshold: Number(docT),
          refThreshold: Number(refT),
          files,
        },
        db,
        (p) =>
          send(
            "PROGRESS " +
              JSON.stringify({
                step: p.step,
                percent: Math.round((p.done / p.total) * 100),
                message: `${p.done}/${p.total}`,
              }),
          ),
      );
      send("04-relations: done.");
      send("PROGRESS " + JSON.stringify({ step: "footers", index: 5, of: 6 }));
      await runFooters({ dir, anchorStyle: "block", files }, db, (p) =>
        send(
          "PROGRESS " +
            JSON.stringify({
              step: p.step,
              percent: Math.round((p.done / p.total) * 100),
              message: `${p.done}/${p.total}`,
            }),
        ),
      );
      send("05-footers: done.");
      await runRename({ dir, files });
      send("PROGRESS " + JSON.stringify({ step: "rename", index: 6, of: 6 }));
      send("06-rename: done.");
    } catch (e: any) {
      send(String(e?.stack || e));
    }
    try {
      connection.socket.send("Done.");
    } catch {}
    try {
      connection.socket.close();
    } catch {}
  });

  // Single-step WS endpoint
  app.get(
    "/ws/run-step",
    { websocket: true },
    async (connection: any, req: any) => {
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
      const send = (s: string) => {
        try {
          connection.socket.send(String(s));
        } catch {}
      };
      send(`Running step=${step} in ${dir}`);
      try {
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
        await runDocopsStep(step as StepId, args, (p) =>
          send(
            "PROGRESS " +
              JSON.stringify({
                step: p.step,
                percent:
                  p.percent ??
                  (p.total ? Math.round((p.done / p.total) * 100) : undefined),
                message:
                  p.message ?? (p.total ? `${p.done}/${p.total}` : undefined),
              }),
          ),
        );
        send(`Step '${step}' completed.`);
      } catch (e: any) {
        send(String(e?.stack || e));
      }
      try {
        connection.socket.close();
      } catch {}
    },
  );
}

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
    await runDocopsStep(step as StepId, args, (p) =>
      line(
        "PROGRESS " +
          JSON.stringify({
            step: p.step,
            percent:
              p.percent ??
              (p.total ? Math.round((p.done / p.total) * 100) : undefined),
            message:
              p.message ?? (p.total ? `${p.done}/${p.total}` : undefined),
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

// packages/docops/src/02-embed.ts
import * as path from "node:path";
import { promises as fs } from "node:fs";
import { createHash } from "node:crypto";
import { pathToFileURL } from "node:url";

import matter from "gray-matter";
import { Ollama } from "ollama";
import { ChromaClient } from "chromadb";
import { OllamaEmbeddingFunction } from "@chroma-core/ollama";
import { listFilesRec } from "@promethean/utils";

import { DBs } from "./db.js";
import { parseArgs, parseMarkdownChunks, OLLAMA_URL } from "./utils.js";
import { Chunk } from "./types.js";
// CLI entry

type Front = { uuid?: string; filename?: string };

export type EmbedOptions = {
  dir: string;
  exts?: string[];
  embedModel: string;
  collection: string;
  batch?: number;
  debug?: boolean;
  files?: string[]; // limit to these files if provided
};
const dbg = (...xs: any[]) => {
  if ((globalThis as any).__DOCOPS_DEBUG) console.log("[02-embed]", ...xs);
};

// Minimal shape we use from Chroma
type ChromaCollection = {
  upsert(input: {
    ids: string[];
    embeddings: number[][];
    documents: string[];
    metadatas: any[];
  }): Promise<any>;
};

const sha256 = (s: string) => createHash("sha256").update(s).digest("hex");

const withId =
  (uuid: string, fpath: string) =>
  (c: ReturnType<typeof parseMarkdownChunks>[number], i: number): Chunk => ({
    id: `${uuid}:${i}`,
    docUuid: uuid,
    docPath: fpath,
    text: c.text,
    startLine: c.startLine,
    endLine: c.endLine,
    startCol: 0,
    endCol: 0,
    kind: "text",
  });

const chunkDoc = (
  fpath: string,
  uuid: string,
  content: string,
): readonly Chunk[] =>
  Object.freeze(parseMarkdownChunks(content).map(withId(uuid, fpath)));

const fingerprint = (text: string, model: string) =>
  sha256(`${model}::${text}`);

// Heuristic cleaners to avoid embedding frontmatter (already removed) and footer link dumps
const REF_HEADING_RE =
  /^(references|external links|see also|footnotes|sources|bibliography)$/i;
const LINK_DEF_RE = /^\s*\[[^\]]+\]:\s*\S+/; // [label]: url
const BARE_LINK_RE =
  /^(?:[-*+]\s*)?(?:<https?:\/\/\S+>|https?:\/\/\S+|\[[^\]]+\]\([^)]*\))\s*$/i;
function cleanChunkText(c: Chunk): string {
  const title = (c as any).title as string | undefined;
  if (title && REF_HEADING_RE.test(title.trim())) return "";
  const lines = (c.text || "").split("\n");
  const kept = lines.filter(
    (L: string) => !(LINK_DEF_RE.test(L) || BARE_LINK_RE.test(L.trim())),
  );
  const s = kept.join("\n").trim();
  return s;
}

const changedIds = async (
  fpDB: DBs["fp"],
  chunks: readonly Chunk[],
  model: string,
) => {
  const pairs = await Promise.all(
    chunks.map(async (c) => {
      const text = cleanChunkText(c);
      if (!text) return null; // drop empty/garbage chunks
      const fp = fingerprint(text, model);
      try {
        const old = await fpDB.get(c.id);
        return old === fp ? null : ([c, fp, text] as const);
      } catch {
        return [c, fp, text] as const;
      }
    }),
  );
  return pairs.filter((x): x is readonly [Chunk, string, string] => !!x);
};

const ollamaClient = new Ollama({ host: OLLAMA_URL });
const embedBatch = async (
  model: string,
  texts: string[],
  timeoutMs = 120_000,
) => {
  if (texts.length === 0) return [] as number[][];
  // Official API uses `.embed({ model, input })`
  const p = ollamaClient.embed({ model, input: texts }) as Promise<any>;
  const withTimeout = new Promise<any>((_resolve, reject) => {
    const t = setTimeout(
      () => reject(new Error(`ollama.embed timeout after ${timeoutMs}ms`)),
      timeoutMs,
    );
    p.then((v) => (clearTimeout(t), _resolve(v))).catch(
      (e) => (clearTimeout(t), reject(e)),
    );
  });
  const { embeddings } = await withTimeout;
  return embeddings as number[][];
};

const groupsOf = <T>(
  n: number,
  xs: readonly T[],
): ReadonlyArray<readonly T[]> => {
  const out: Array<readonly T[]> = [];
  for (let i = 0; i < xs.length; i += n) out.push(xs.slice(i, i + n));
  return out;
};

export async function runEmbed(
  opts: EmbedOptions,
  db: DBs,
  coll: ChromaCollection,
  onProgress?: (p: {
    step: "embed";
    done: number;
    total: number;
    message?: string;
  }) => void,
) {
  (globalThis as any).__DOCOPS_DEBUG = Boolean(opts.debug);
  const ROOT = path.resolve(opts.dir);
  const EXTS = new Set(
    (opts.exts ?? [".md", ".mdx", ".txt"]).map((s) => s.trim().toLowerCase()),
  );
  const EMBED_MODEL = opts.embedModel;
  const BATCH = Math.max(1, Number(opts.batch ?? 128) | 0) || 128;

  dbg("collection", opts.collection, "model", EMBED_MODEL, "batch", BATCH);

  let files = await listFilesRec(ROOT, EXTS);
  if (opts.files && opts.files.length) {
    const wanted = new Set(opts.files.map((p) => path.resolve(p)));
    files = files.filter((f) => wanted.has(path.resolve(f)));
  }
  dbg("files", files.length, "root", ROOT);

  let totalChunks = 0;
  let totalDeltas = 0;
  let fileDone = 0;
  for (const f of files) {
    const raw = await fs.readFile(f, "utf8");
    const { data, content } = matter(raw);
    const fm = data as Front;
    if (!fm.uuid) continue;

    const title = fm.filename || path.parse(f).name;

    // Immutable chunk array
    const chunks = chunkDoc(f, fm.uuid, content);
    totalChunks += chunks.length;

    // Upsert doc + chunks metadata (no vectors) into Level
    await db.docs.put(fm.uuid, { path: f, title });
    await db.chunks.put(fm.uuid, chunks);

    // Decide which chunks actually need embeddings
    const deltas = await changedIds(db.fp, chunks, EMBED_MODEL);
    dbg(
      "file",
      f,
      "uuid",
      fm.uuid,
      "chunks",
      chunks.length,
      "deltas",
      deltas.length,
    );
    onProgress?.({
      step: "embed",
      done: fileDone,
      total: files.length,
      message: `file ${fileDone + 1}/${files.length} ${path.basename(
        f,
      )} chunks=${chunks.length} deltas=${deltas.length}`,
    });
    totalDeltas += deltas.length;
    if (deltas.length === 0) {
      fileDone++;
      onProgress?.({ step: "embed", done: fileDone, total: files.length });
      continue;
    }

    // Batch-embed with ollama and upsert to Chroma
    const groups = groupsOf(BATCH, deltas);
    for (let gi = 0; gi < groups.length; gi++) {
      const group = groups[gi]!;
      const ids = group.map(([c]) => c.id);
      const texts = group.map(([, , text]) => text);
      const metas = group.map(([c]) => ({
        docUuid: c.docUuid,
        path: c.docPath,
        title,
      }));

      try {
        const embs = await embedBatch(EMBED_MODEL, texts); // uses ollama JS client
        await coll.upsert({
          ids,
          embeddings: embs,
          documents: texts,
          metadatas: metas,
        });
      } catch (e) {
        dbg("embed/upsert error", {
          file: f,
          uuid: fm.uuid,
          group: gi + 1,
          of: groups.length,
          error: String((e as any)?.message || e),
        });
        // continue to next group instead of stalling whole pipeline
      }

      // Persist fingerprints (immutable write: independent puts)
      await Promise.all(group.map(async ([c, fp]) => db.fp.put(c.id, fp)));

      // Fine-grained progress: advance within this file
      const frac = (gi + 1) / groups.length;
      onProgress?.({
        step: "embed",
        done: fileDone + frac,
        total: files.length,
        message: `file ${fileDone + 1}/${files.length} group ${gi + 1}/${
          groups.length
        }`,
      });
    }
    fileDone++;
    onProgress?.({ step: "embed", done: fileDone, total: files.length });
  }

  dbg("totals", { files: files.length, totalChunks, totalDeltas });
  console.log("02-embed: done (vectors in Chroma; KV in Level).");
}
const isDirect =
  !!process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url;
if (isDirect) {
  const args = parseArgs({
    "--dir": "docs/unique",
    "--ext": ".md,.mdx,.txt",
    "--embed-model": "nomic-embed-text:latest",
    "--collection": "docs",
    "--batch": "128",
    "--debug": "false",
  });
  // CLI path builds its own DB+collection when invoked directly
  const { openDB } = await import("./db.js");
  const db = await openDB();
  const client = new ChromaClient({});
  const embedModel = args["--embed-model"] ?? "nomic-embed-text:latest";
  const collection = args["--collection"] ?? "docs";
  const embedder = new OllamaEmbeddingFunction({
    model: embedModel,
    url: OLLAMA_URL,
  });
  const coll = await client.getOrCreateCollection({
    name: collection,
    metadata: { embed_model: embedModel, "hnsw:space": "cosine" },
    embeddingFunction: embedder,
  });
  const dir = args["--dir"] ?? "docs/unique";
  const extsArg = args["--ext"] ?? ".md,.mdx,.txt";
  const batch = Number(args["--batch"] ?? "128");
  const debug = (args["--debug"] ?? "false") === "true";
  runEmbed(
    {
      dir,
      exts: extsArg.split(","),
      embedModel,
      collection,
      batch,
      debug,
    },
    db,
    coll,
  )
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      try {
        await db.root.close();
      } catch {}
    });
}

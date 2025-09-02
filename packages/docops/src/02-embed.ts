#!/usr/bin/env node
// packages/docops/src/02-embed.ts
import * as path from 'node:path';
import { promises as fs } from 'node:fs';
import matter from 'gray-matter';
import { createHash } from 'node:crypto';
import ollama from 'ollama';
import { ChromaClient } from 'chromadb';
import { DBs } from './db';
import { parseArgs, listFilesRec, parseMarkdownChunks, OLLAMA_URL } from './utils';
import { Chunk } from './types';
import { OllamaEmbeddingFunction } from '@chroma-core/ollama';

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
const dbg = (...xs: any[]) => { if ((globalThis as any).__DOCOPS_DEBUG) console.log('[02-embed]', ...xs); };

// Minimal shape we use from Chroma
type ChromaCollection = {
  upsert(input: { ids: string[]; embeddings: number[][]; documents: string[]; metadatas: any[] }): Promise<any>;
};

const sha256 = (s: string) => createHash('sha256').update(s).digest('hex');

const withId = (uuid: string, fpath: string) => (c: ReturnType<typeof parseMarkdownChunks>[number], i: number): Chunk =>
  ({
      id: `${uuid}:${i}`, docUuid: uuid, docPath: fpath, text: c.text, startLine: c.startLine, endLine: c.endLine,
      startCol: 0,
      endCol: 0,
      kind: 'text'
  });

const chunkDoc = (fpath: string, uuid: string, content: string): readonly Chunk[] =>
  Object.freeze(parseMarkdownChunks(content).map(withId(uuid, fpath)));

const fingerprint = (text: string, model: string) => sha256(`${model}::${text}`);

const changedIds = async (fpDB: DBs['fp'], chunks: readonly Chunk[], model: string) => {
  const pairs = await Promise.all(
    chunks.map(async c => {
      const fp = fingerprint(c.text, model);
      try {
        const old = await fpDB.get(c.id);
        return old === fp ? null : ([c, fp] as const);
      } catch {
        return ([c, fp] as const);
      }
    })
  );
  return pairs.filter((x): x is readonly [Chunk, string] => !!x);
};

const embedBatch = async (model: string, texts: string[]) => {
  if (texts.length === 0) return [] as number[][];
  // Official API uses `.embed({ model, input })`
  const { embeddings } = await ollama.embed({ model, input: texts });
  return embeddings as number[][];
};

const groupsOf = <T>(n: number, xs: readonly T[]): ReadonlyArray<readonly T[]> =>
  xs.length === 0 ? [] : ([xs.slice(0, n) as readonly T[], ...groupsOf(n, xs.slice(n))] as const);

export async function runEmbed(
  opts: EmbedOptions,
  db: DBs,
  coll: ChromaCollection,
  onProgress?: (p: { step: 'embed'; done: number; total: number; message?: string }) => void
) {
  (globalThis as any).__DOCOPS_DEBUG = Boolean(opts.debug);
  const ROOT = path.resolve(opts.dir);
  const EXTS = new Set((opts.exts ?? ['.md','.mdx','.txt']).map(s => s.trim().toLowerCase()));
  const EMBED_MODEL = opts.embedModel;
  const BATCH = Math.max(1, Number(opts.batch ?? 128) | 0) || 128;

  dbg('collection', opts.collection, 'model', EMBED_MODEL, 'batch', BATCH);

  let files = await listFilesRec(ROOT, EXTS);
  if (opts.files && opts.files.length) {
    const wanted = new Set(opts.files.map(p => path.resolve(p)));
    files = files.filter(f => wanted.has(path.resolve(f)));
  }
  dbg('files', files.length, 'root', ROOT);

  let totalChunks = 0;
  let totalDeltas = 0;
  let fileDone = 0;
  for (const f of files) {
    const raw = await fs.readFile(f, 'utf8');
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
    dbg('file', f, 'uuid', fm.uuid, 'chunks', chunks.length, 'deltas', deltas.length);
    totalDeltas += deltas.length;
    if (deltas.length === 0) { fileDone++; onProgress?.({ step: 'embed', done: fileDone, total: files.length }); continue; }

    // Batch-embed with ollama and upsert to Chroma
    for (const group of groupsOf(BATCH, deltas)) {
      const ids = group.map(([c]) => c.id);
      const texts = group.map(([c]) => c.text);
      const metas = group.map(([c]) => ({ docUuid: c.docUuid, path: c.docPath, title }));

      const embs = await embedBatch(EMBED_MODEL, texts); // uses ollama JS client
      await coll.upsert({ ids, embeddings: embs, documents: texts, metadatas: metas });

      // Persist fingerprints (immutable write: independent puts)
      await Promise.all(group.map(async ([c, fp]) => db.fp.put(c.id, fp)));
    }
    fileDone++;
    onProgress?.({ step: 'embed', done: fileDone, total: files.length });
  }

  dbg('totals', { files: files.length, totalChunks, totalDeltas });
  console.log('02-embed: done (vectors in Chroma; KV in Level).');
}
// CLI entry
import { pathToFileURL } from 'node:url';
const isDirect = !!process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url;
if (isDirect) {
  const args = parseArgs({
    '--dir': 'docs/unique',
    '--ext': '.md,.mdx,.txt',
    '--embed-model': 'nomic-embed-text:latest',
    '--collection': 'docs',
    '--batch': '128',
    '--debug': 'false',
  });
  // CLI path builds its own DB+collection when invoked directly
  const { openDB } = await import('./db');
  const db = await openDB();
  const client = new ChromaClient({});
  const embedder = new OllamaEmbeddingFunction({ model: args['--embed-model'], url: OLLAMA_URL });
  const coll = await client.getOrCreateCollection({
    name: args['--collection'],
    metadata: { embed_model: args['--embed-model'], "hnsw:space": "cosine" },
    embeddingFunction: embedder,
  });
  runEmbed({
    dir: args['--dir'],
    exts: args['--ext'].split(','),
    embedModel: args['--embed-model'],
    collection: args['--collection'],
    batch: Number(args['--batch']),
    debug: args['--debug'] === 'true',
  }, db, coll)
    .catch(e => { console.error(e); process.exit(1); })
    .finally(async () => { try { await db.root.close(); } catch {} });
}

// packages/docops/src/02-embed.ts
import * as path from 'node:path';
import { promises as fs } from 'node:fs';
import matter from 'gray-matter';
import { createHash } from 'node:crypto';
import ollama from 'ollama';
import { ChromaClient } from 'chromadb';
import { DBs, openDB } from './db';
import { parseArgs, listFilesRec, parseMarkdownChunks, OLLAMA_URL } from './utils';
import { Chunk } from './types';
import { OllamaEmbeddingFunction } from '@chroma-core/ollama';

type Front = { uuid?: string; filename?: string };

const args = parseArgs({
  '--dir': 'docs/unique',
  '--ext': '.md,.mdx,.txt',
  '--embed-model': 'nomic-embed-text:latest',
  '--collection': 'docs',
  '--batch': '128',
});
const ROOT = path.resolve(args['--dir']);
const EXTS = new Set(args['--ext'].split(',').map(s => s.trim().toLowerCase()));
const EMBED_MODEL = args['--embed-model'];
const BATCH = Math.max(1, Number(args['--batch']) | 0) || 128;

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

async function main() {
  const db = await openDB();

  const client = new ChromaClient({}); // default localhost
  const embedder = new OllamaEmbeddingFunction({
    model: EMBED_MODEL,
    url: OLLAMA_URL
  });
  const coll = await client.getOrCreateCollection({
    name: args["--collection"],
    metadata: { embed_model: EMBED_MODEL },
    embeddingFunction:embedder

  });

  const files = await listFilesRec(ROOT, EXTS);

  for (const f of files) {
    const raw = await fs.readFile(f, 'utf8');
    const { data, content } = matter(raw);
    const fm = data as Front;
    if (!fm.uuid) continue;

    const title = fm.filename || path.parse(f).name;

    // Immutable chunk array
    const chunks = chunkDoc(f, fm.uuid, content);

    // Upsert doc + chunks metadata (no vectors) into Level
    await db.docs.put(fm.uuid, { path: f, title });
    await db.chunks.put(fm.uuid, chunks);

    // Decide which chunks actually need embeddings
    const deltas = await changedIds(db.fp, chunks, EMBED_MODEL);
    if (deltas.length === 0) continue;

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
  }

  console.log('02-embed: done (vectors in Chroma; KV in Level).');
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});

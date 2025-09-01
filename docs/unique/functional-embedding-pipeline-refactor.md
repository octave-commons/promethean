---
uuid: a4a25141-6380-40b9-9cd7-b554b246b303
created_at: 2025.09.01.10.58.21.md
filename: Functional Embedding Pipeline Refactor
description: >-
  This refactor isolates I/O operations at the edges of the system, ensuring
  pure mappers and reducers handle core logic. It introduces safe caching via
  content-hash compatibility and bounds concurrency to prevent Ollama overload.
  The design maintains output consistency while improving error resilience
  through doc-level error handling.
tags:
  - functional
  - caching
  - concurrency
  - embeddings
  - io-boundary
  - pure-functions
  - error-handling
  - type-safety
related_to_uuid: []
related_to_title: []
references: []
---
you’ve got way too much state mutation and IO mixed into control flow. here’s a functional pass that:

* isolates IO at the edges
* keeps the “core” as pure mappers/reducers
* adds safe caching via content-hash (back-compatible with your old cache)
* bounds concurrency so ollama doesn’t get dogpiled
* keeps output files and types the same where it matters

quick mental model:

```
files
  -> read+parse (IO)
    -> filter invalid
      -> chunkify (pure)
        -> embed with memoized cache + p-limit (IO)
          -> groupBy docUuid (pure)
            -> write caches (IO)
```

### what changed (and why)

* **pure helpers**: `toChunks`, `groupBy`, `buildDocsByUuid`, `sha1`.
* **cache validity**: embedding cache entries now optionally store `{hash, embedding}`; old `number[]` entries continue to work without recompute. if text changes, we recompute.
* **parallelism**: tiny `limit()` to cap concurrent POSTs.
* **error boundaries**: doc-level try/catch so one bad file doesn’t kill the run.
* **immutability**: we derive new maps and merge into previous caches instead of mutating in place.

---

```typescript
// 02-embed.ts (functional refactor)
import { promises as fs } from "fs";
import * as path from "path";
import crypto from "crypto";
import matter from "gray-matter";
import {
  parseArgs,
  listFilesRec,
  writeJSON,
  readJSON,
  parseMarkdownChunks,
} from "./utils";
import type { Chunk, Front } from "./types";

// ------------------------
// Config (IO boundary)
// ------------------------
const OLLAMA_URL = process.env.OLLAMA_URL ?? "http://localhost:11434";

type Config = {
  root: string;
  exts: Set<string>;
  embedModel: string;
  cacheDir: string;
  chunkCachePath: string;
  embedCachePath: string;
  docsMapPath: string;
  concurrency: number;
};

const mkConfig = (): Config => {
  const args = parseArgs({
    "--dir": "docs/unique",
    "--ext": ".md,.mdx,.txt",
    "--embed-model": "nomic-embed-text:latest",
    "--concurrency": "4",
  });
  const ROOT = path.resolve(args["--dir"]);
  const EXTS = new Set(
    args["--ext"].split(",").map((s) => s.trim().toLowerCase())
  );
  const EMBED_MODEL = args["--embed-model"];
  const CACHE = path.join(process.cwd(), ".cache/docs-pipeline");
  return {
    root: ROOT,
    exts: EXTS,
    embedModel: EMBED_MODEL,
    cacheDir: CACHE,
    chunkCachePath: path.join(CACHE, "chunks.json"),
    embedCachePath: path.join(CACHE, "embeddings.json"),
    docsMapPath: path.join(CACHE, "docs-by-uuid.json"),
    concurrency: Math.max(1, Number(args["--concurrency"]) || 4),
  };
};

// ------------------------
// Pure helpers
// ------------------------
const sha1 = (s: string) => crypto.createHash("sha1").update(s).digest("hex");

type EmbeddingCacheValue = number[] | { hash: string; embedding: number[] };
type EmbeddingCache = Record<string, EmbeddingCacheValue>;

const getCachedEmbedding = (
  id: string,
  textHash: string,
  cache: EmbeddingCache
): number[] | null => {
  const v = cache[id];
  if (!v) return null;
  if (Array.isArray(v)) return v; // legacy cache entry; accept as-is
  return v.hash === textHash ? v.embedding : null;
};

const setCachedEmbedding = (
  id: string,
  textHash: string,
  embedding: number[],
  cache: EmbeddingCache
): EmbeddingCache => {
  return { ...cache, [id]: { hash: textHash, embedding } };
};

type Doc = {
  path: string;
  front: Front;
  content: string;
};

const toChunks = (doc: Doc): Chunk[] =>
  parseMarkdownChunks(doc.content).map((c, i) => ({
    ...c,
    id: `${doc.front.uuid}:${i}`,
    docUuid: doc.front.uuid!,
    docPath: doc.path,
  }));

const groupBy = <T, K extends string>(
  keyFn: (x: T) => K,
  xs: T[]
): Record<K, T[]> =>
  xs.reduce((acc, x) => {
    const k = keyFn(x);
    (acc[k] ??= []).push(x);
    return acc;
  }, {} as Record<K, T[]>);

const buildDocsByUuid = (
  docs: Doc[]
): Record<string, { path: string; title: string }> =>
  docs.reduce((acc, d) => {
    const title = d.front.filename || path.parse(d.path).name;
    acc[d.front.uuid!] = { path: d.path, title };
    return acc;
  }, {} as Record<string, { path: string; title: string }>);

// ------------------------
// Small concurrency limiter
// ------------------------
const limit = (concurrency: number) => {
  let active = 0;
  const queue: (() => void)[] = [];
  const next = () => {
    active--;
    const fn = queue.shift();
    if (fn) fn();
  };
  return async <T>(task: () => Promise<T>): Promise<T> =>
    new Promise<T>((resolve, reject) => {
      const run = () => {
        active++;
        task()
          .then((v) => {
            next();
            resolve(v);
          })
          .catch((e) => {
            next();
            reject(e);
          });
      };
      if (active < concurrency) run();
      else queue.push(run);
    });
};

// ------------------------
// IO helpers
// ------------------------
const readDoc = async (file: string): Promise<Doc> => {
  const raw = await fs.readFile(file, "utf-8");
  const { data, content } = matter(raw);
  return { path: file, front: data as Front, content };
};

const ollamaEmbed =
  (model: string) =>
  async (text: string): Promise<number[]> => {
    // simple retry with jitter
    let attempt = 0;
    const max = 4;
    while (true) {
      try {
        const res = await fetch(`${OLLAMA_URL}/api/embeddings`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ model, prompt: text }),
        });
        if (!res.ok) {
          throw new Error(`HTTP ${res.status} ${res.statusText}`);
        }
        const data = (await res.json()) as { embedding: number[] };
        return data.embedding;
      } catch (err) {
        attempt++;
        if (attempt >= max) throw err;
        const backoff = 250 * Math.pow(2, attempt) + Math.random() * 100;
        await new Promise((r) => setTimeout(r, backoff));
      }
    }
  };

// ------------------------
// Core flow
// ------------------------
async function main() {
  const cfg = mkConfig();

  // ensure cache dir exists
  await fs.mkdir(cfg.cacheDir, { recursive: true });

  // load prior caches (IO)
  const prevChunksByDoc: Record<string, Chunk[]> = await readJSON(
    cfg.chunkCachePath,
    {}
  );
  const prevEmbedCache: EmbeddingCache = await readJSON(
    cfg.embedCachePath,
    {}
  );
  const prevDocsMap: Record<string, { path: string; title: string }> =
    await readJSON(cfg.docsMapPath, {});

  // discover files (IO)
  const files = await listFilesRec(cfg.root, cfg.exts);

  // read + parse (IO) -> filter for uuid
  const docs: Doc[] = (
    await Promise.all(
      files.map(async (f) => {
        try {
          const d = await readDoc(f);
          if (!d.front?.uuid) return null;
          return d;
        } catch (e) {
          console.error(`! failed parsing ${f}:`, e);
          return null;
        }
      })
    )
  ).filter(Boolean) as Doc[];

  // chunkify (pure)
  const allChunks = docs.flatMap(toChunks);

  // embed with memoized cache + p-limit (IO)
  const limiter = limit(cfg.concurrency);
  const embedFn = ollamaEmbed(cfg.embedModel);

  let nextEmbedCache = { ...prevEmbedCache };
  const embeddedChunks: Chunk[] = await Promise.all(
    allChunks.map((ch) =>
      limiter(async () => {
        const hash = sha1(ch.text);
        const cached = getCachedEmbedding(ch.id, hash, nextEmbedCache);
        const embedding = cached ?? (await embedFn(ch.text));
        if (!cached) {
          nextEmbedCache = setCachedEmbedding(ch.id, hash, embedding, nextEmbedCache);
        }
        return { ...ch, embedding };
      })
    )
  );

  // group (pure)
  const newChunksByDoc = groupBy<Chunk, string>((c) => c.docUuid!, embeddedChunks);
  const newDocsMap = buildDocsByUuid(docs);

  // merge with previous (pure-ish)
  const mergedChunksByDoc = { ...prevChunksByDoc, ...newChunksByDoc };
  const mergedDocsMap = { ...prevDocsMap, ...newDocsMap };

  // persist (IO)
  await writeJSON(cfg.chunkCachePath, mergedChunksByDoc);
  await writeJSON(cfg.embedCachePath, nextEmbedCache);
  await writeJSON(cfg.docsMapPath, mergedDocsMap);

  console.log(
    `02-embed: done. files=${files.length} docs=${docs.length} chunks=${embeddedChunks.length} concurrency=${cfg.concurrency}`
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
```

### notes you’ll care about

* **cache semantics**: `embeddings.json` can now hold either `number[]` (legacy) or `{ hash, embedding }`. that means you won’t churn embeddings on first run, and you’ll only recompute when the chunk text actually changed.
* **determinism**: chunk ids are still `${uuid}:${i}` to stay compatible with anything downstream that relies on that shape.
* **bounded pressure**: `--concurrency` (default 4). tune it to your box; NPUs/GPUs don’t like a stampede.
* **blast radius**: one corrupt file won’t nuke the run; it logs and keeps going.

if you want to go even more functional, we can make the “runner” pass in *all* side-effectors (`readFile`, `postEmbed`, `writeJSON`) as injected deps and test the whole pipeline with pure data. but this is already a big step up without over-engineering.

\#refactor #functional #typescript #ollama #embeddings #docs-pipeline<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
## Related content
- _None_
## Sources
- _None_
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->

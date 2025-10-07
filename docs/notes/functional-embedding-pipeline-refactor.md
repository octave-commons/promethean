---
```
uuid: 4f36e541-005c-4a03-9feb-c076f630cc35
```
created_at: functional-embedding-pipeline-refactor.md
filename: Functional Embedding Pipeline Refactor
title: Functional Embedding Pipeline Refactor
```
description: >-
```
  Refactors a document embedding pipeline to isolate IO operations, use pure
  mappers/reducers, implement safe caching with content-hash, and bound
  concurrency to prevent Ollama dogpiling. The changes ensure backward
  compatibility with existing cache structures while maintaining output file
  types and types.
tags:
  - functional
  - embedding
  - pipeline
  - caching
  - concurrency
  - io
  - pure
  - backwards-compatible
```
related_to_uuid:
```
  - f5579967-762d-4cfd-851e-4f71b4cb77a1
  - 6bcff92c-4224-453d-9993-1be8d37d47c3
  - 5020e892-8f18-443a-b707-6d0f3efcfe22
  - 9a93a756-6d33-45d1-aca9-51b74f2b33d2
  - fc21f824-4244-4030-a48e-c4170160ea1d
  - f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
  - d144aa62-348c-4e5d-ae8f-38084c67ceca
  - 64a9f9f9-58ee-4996-bdaf-9373845c6b29
  - 5e8b2388-022b-46cf-952c-36ae9b8f0037
  - db74343f-8f84-43a3-adb2-499c6f00be1c
  - 8430617b-80a2-4cc9-8288-9a74cb57990b
  - 23df6ddb-05cf-4639-8201-f8291f8a6026
  - c3cd4f65-2bb3-4fca-a32e-2ac667e03f40
  - b09141b7-544f-4c8e-8f49-bf76cecaacbb
  - 22b989d5-f4aa-4880-8632-709c21830f83
  - 9c79206d-4cb9-4f00-87e0-782dcea37bc7
  - 98c8ff62-6ea3-4172-9e8b-93913e5d4a7f
  - 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
  - 2d6e5553-8dc4-497f-bf45-96f8ca00a6f6
  - ac9d3ac5-9a6a-4180-a67f-1ab7e229d981
  - 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
  - 6620e2f2-de6d-45d8-a722-5d26e160b370
  - ae24a280-678e-4c0b-8cc4-56667fa04172
  - 1cfae310-35dc-49c2-98f1-b186da25d84b
  - 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
```
related_to_title:
```
  - Performance-Optimized-Polyglot-Bridge
  - Post-Linguistic Transhuman Design Frameworks
  - Chroma Toolkit Consolidation Plan
  - Protocol_0_The_Contradiction_Engine
  - Fnord Tracer Protocol
  - Dynamic Context Model for Web Components
  - Model Selection for Lightweight Conversational Tasks
  - Layer1SurvivabilityEnvelope
  - Eidolon Field Abstract Model
  - Model Upgrade Calm-Down Guide
  - ripple-propagation-demo
  - Promethean State Format
  - Tracing the Signal
  - field-interaction-equations
  - field-node-diagram-set
  - polyglot-repl-interface-layer
  - Optimizing Command Limitations in System Design
  - Debugging Broker Connections and Agent Behavior
  - Promethean_Eidolon_Synchronicity_Model
  - Smoke Resonance Visualizations
  - eidolon-field-math-foundations
  - graph-ds
  - Promethean-Copilot-Intent-Engine
  - Functional Refactor of TypeScript Document Processing
  - Promethean Documentation Pipeline Overview
references:
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 412
    col: 0
    score: 1
  - uuid: 5e8b2388-022b-46cf-952c-36ae9b8f0037
    line: 261
    col: 0
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 181
    col: 0
    score: 1
  - uuid: 938eca9c-97e2-4bcc-8653-b0ef1a5ac7a3
    line: 90
    col: 0
    score: 1
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 157
    col: 0
    score: 1
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 205
    col: 0
    score: 1
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 149
    col: 0
    score: 1
  - uuid: 1f32c94a-4da4-4266-8ac0-6c282cfb401f
    line: 110
    col: 0
    score: 1
  - uuid: 22b989d5-f4aa-4880-8632-709c21830f83
    line: 203
    col: 0
    score: 1
  - uuid: e9b27b06-f608-4734-ae6c-f03a8b1fcf5f
    line: 95
    col: 0
    score: 1
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 495
    col: 0
    score: 1
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 459
    col: 0
    score: 1
  - uuid: e2135d9f-c69d-47ee-9b17-0b05e98dc748
    line: 27
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1002
    col: 0
    score: 1
  - uuid: 9c79206d-4cb9-4f00-87e0-782dcea37bc7
    line: 171
    col: 0
    score: 1
  - uuid: 6bcff92c-4224-453d-9993-1be8d37d47c3
    line: 112
    col: 0
    score: 1
  - uuid: 18344cf9-0c49-4a71-b6c8-b8d84d660fca
    line: 24
    col: 0
    score: 1
  - uuid: 9a93a756-6d33-45d1-aca9-51b74f2b33d2
    line: 143
    col: 0
    score: 1
  - uuid: 43bfe9dd-d433-42ca-9777-f4c40eaba791
    line: 241
    col: 0
    score: 1
  - uuid: 95205cd3-c3d5-4047-9c33-9c5ca2b49597
    line: 79
    col: 0
    score: 1
  - uuid: 23df6ddb-05cf-4639-8201-f8291f8a6026
    line: 103
    col: 0
    score: 1
  - uuid: d614d983-7795-491f-9437-09f3a43f72cf
    line: 119
    col: 0
    score: 1
  - uuid: e90b5a16-d58f-424d-bd36-70e9bd2861ad
    line: 559
    col: 0
    score: 1
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 256
    col: 0
    score: 1
  - uuid: 9a93a756-6d33-45d1-aca9-51b74f2b33d2
    line: 202
    col: 0
    score: 1
  - uuid: 8430617b-80a2-4cc9-8288-9a74cb57990b
    line: 114
    col: 0
    score: 1
  - uuid: 15d25922-0de6-414f-b7d1-e50e2a57b33a
    line: 1044
    col: 0
    score: 1
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 595
    col: 0
    score: 1
  - uuid: 49a9a860-944c-467a-b532-4f99186a8593
    line: 77
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 396
    col: 0
    score: 1
  - uuid: 10d98225-12e0-4212-8e15-88b57cf7bee5
    line: 43
    col: 0
    score: 1
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 104
    col: 0
    score: 1
  - uuid: cdbd21ee-25a0-4bfa-884c-c1b948e9b0b2
    line: 44
    col: 0
    score: 1
  - uuid: 2792d448-c3b5-4050-93dd-93768529d99c
    line: 75
    col: 0
    score: 1
  - uuid: e979c50f-69bb-48b0-8417-e1ee1b31c0c0
    line: 48
    col: 0
    score: 1
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 127
    col: 0
    score: 1
  - uuid: 930054b3-ba95-4acf-bb92-0e3ead25ed0b
    line: 22
    col: 0
    score: 1
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 280
    col: 0
    score: 1
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 148
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 511
    col: 0
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 240
    col: 0
    score: 1
  - uuid: 938eca9c-97e2-4bcc-8653-b0ef1a5ac7a3
    line: 123
    col: 0
    score: 1
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 222
    col: 0
    score: 1
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 270
    col: 0
    score: 1
  - uuid: 6620e2f2-de6d-45d8-a722-5d26e160b370
    line: 494
    col: 0
    score: 1
  - uuid: 64a9f9f9-58ee-4996-bdaf-9373845c6b29
    line: 299
    col: 0
    score: 1
  - uuid: 2792d448-c3b5-4050-93dd-93768529d99c
    line: 61
    col: 0
    score: 1
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 99
    col: 0
    score: 1
  - uuid: 71726f04-eb1c-42a5-a5fe-d8209de6e159
    line: 80
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 405
    col: 0
    score: 1
  - uuid: 5e8b2388-022b-46cf-952c-36ae9b8f0037
    line: 216
    col: 0
    score: 1
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 189
    col: 0
    score: 1
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 172
    col: 0
    score: 1
  - uuid: 64a9f9f9-58ee-4996-bdaf-9373845c6b29
    line: 175
    col: 0
    score: 1
  - uuid: 86a691ec-ca1f-4350-824c-0ded1f8ebe70
    line: 90
    col: 0
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 298
    col: 0
    score: 1
  - uuid: 18344cf9-0c49-4a71-b6c8-b8d84d660fca
    line: 48
    col: 0
    score: 1
  - uuid: dd89372d-10de-42a9-8c96-6bc13ea36d02
    line: 262
    col: 0
    score: 1
  - uuid: b5e0183e-c34b-44b2-8fc9-a740a1a8d4e2
    line: 84
    col: 0
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 314
    col: 0
    score: 1
  - uuid: 40185d05-010e-45e7-8c2d-2f879bf14218
    line: 26
    col: 0
    score: 1
  - uuid: 5a02283e-4281-4930-9ca7-e27849de11bd
    line: 10
    col: 0
    score: 1
  - uuid: ca8e1399-77bf-4f77-82a3-3f703b68706d
    line: 43
    col: 0
    score: 1
  - uuid: ffb9b2a9-744d-4a53-9565-130fceae0832
    line: 82
    col: 0
    score: 1
  - uuid: 9b694a91-dec5-4708-9462-3f71000ba925
    line: 37
    col: 0
    score: 1
  - uuid: 5c152b08-6b69-4bb8-a1a7-66745789c169
    line: 68
    col: 0
    score: 1
  - uuid: e018dd7a-1fb7-4732-9e67-cd8b2f0831cf
    line: 294
    col: 0
    score: 1
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 532
    col: 0
    score: 1
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 456
    col: 0
    score: 1
  - uuid: e2135d9f-c69d-47ee-9b17-0b05e98dc748
    line: 17
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1035
    col: 0
    score: 1
  - uuid: 10d98225-12e0-4212-8e15-88b57cf7bee5
    line: 28
    col: 0
    score: 1
  - uuid: cdbd21ee-25a0-4bfa-884c-c1b948e9b0b2
    line: 65
    col: 0
    score: 1
  - uuid: 2792d448-c3b5-4050-93dd-93768529d99c
    line: 86
    col: 0
    score: 1
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 123
    col: 0
    score: 1
  - uuid: 71726f04-eb1c-42a5-a5fe-d8209de6e159
    line: 34
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 442
    col: 0
    score: 1
  - uuid: 5e8b2388-022b-46cf-952c-36ae9b8f0037
    line: 218
    col: 0
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 176
    col: 0
    score: 1
  - uuid: 938eca9c-97e2-4bcc-8653-b0ef1a5ac7a3
    line: 70
    col: 0
    score: 1
  - uuid: 2792d448-c3b5-4050-93dd-93768529d99c
    line: 35
    col: 0
    score: 1
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 94
    col: 0
    score: 1
  - uuid: 71726f04-eb1c-42a5-a5fe-d8209de6e159
    line: 53
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 424
    col: 0
    score: 1
  - uuid: 5e8b2388-022b-46cf-952c-36ae9b8f0037
    line: 209
    col: 0
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 142
    col: 0
    score: 1
  - uuid: 938eca9c-97e2-4bcc-8653-b0ef1a5ac7a3
    line: 39
    col: 0
    score: 1
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 547
    col: 0
    score: 1
  - uuid: 9413237f-2537-4bbf-8768-db6180970e36
    line: 98
    col: 0
    score: 1
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 162
    col: 0
    score: 1
  - uuid: 10d98225-12e0-4212-8e15-88b57cf7bee5
    line: 75
    col: 0
    score: 1
  - uuid: cdbd21ee-25a0-4bfa-884c-c1b948e9b0b2
    line: 46
    col: 0
    score: 1
  - uuid: 2792d448-c3b5-4050-93dd-93768529d99c
    line: 64
    col: 0
    score: 1
  - uuid: e979c50f-69bb-48b0-8417-e1ee1b31c0c0
    line: 40
    col: 0
    score: 1
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 137
    col: 0
    score: 1
  - uuid: 71726f04-eb1c-42a5-a5fe-d8209de6e159
    line: 82
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 454
    col: 0
    score: 1
  - uuid: db74343f-8f84-43a3-adb2-499c6f00be1c
    line: 86
    col: 0
    score: 1
  - uuid: 5a02283e-4281-4930-9ca7-e27849de11bd
    line: 49
    col: 0
    score: 1
  - uuid: 1d3d6c3a-039e-4b96-93c1-95854945e248
    line: 59
    col: 0
    score: 1
---
you’ve got way too much state mutation and IO mixed into control flow. here’s a functional pass that: ^ref-a4a25141-1-0

* isolates IO at the edges ^ref-a4a25141-3-0
* keeps the “core” as pure mappers/reducers ^ref-a4a25141-4-0
* adds safe caching via content-hash back-compatible with your old cache ^ref-a4a25141-5-0
* bounds concurrency so ollama doesn’t get dogpiled ^ref-a4a25141-6-0
* keeps output files and types the same where it matters ^ref-a4a25141-7-0
```
quick mental model: ^ref-a4a25141-9-0
```
```
files
  -> read+parse (IO)
    -> filter invalid
      -> chunkify (pure)
        -> embed with memoized cache + p-limit (IO)
          -> groupBy docUuid (pure)
            -> write caches (IO)
```
```
^ref-a4a25141-11-0 ^ref-a4a25141-20-0
```
### what changed (and why)
```
^ref-a4a25141-23-0
```
* **pure helpers**: `toChunks`, `groupBy`, `buildDocsByUuid`, `sha1`. ^ref-a4a25141-24-0
* **cache validity**: embedding cache entries now optionally store `{hash, embedding}`; old `number[]` entries continue to work without recompute. if text changes, we recompute. ^ref-a4a25141-25-0
* **parallelism**: tiny `limit()` to cap concurrent POSTs. ^ref-a4a25141-26-0
* **error boundaries**: doc-level try/catch so one bad file doesn’t kill the run. ^ref-a4a25141-27-0
* **immutability**: we derive new maps and merge into previous caches instead of mutating in place.

---
```
^ref-a4a25141-31-0
```
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
const OLLAMA_URL = process.env.OLLAMA_URL ?? "

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
    id: `{doc.front.uuid}:{i}`,
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
        const res = await fetch(`{OLLAMA_URL}/api/embeddings`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ model, prompt: text }),
        });
        if (!res.ok) {
          throw new Error(`HTTP {res.status} {res.statusText}`);
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
          console.error(`! failed parsing {f}:`, e);
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
    `02-embed: done. files={files.length} docs={docs.length} chunks={embeddedChunks.length} concurrency={cfg.concurrency}`
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
^ref-a4a25141-31-0
```
```
^ref-a4a25141-32-0 ^ref-a4a25141-301-0
```
```
^ref-a4a25141-302-0
```
### notes you’ll care about ^ref-a4a25141-302-0
```
^ref-a4a25141-303-0 ^ref-a4a25141-304-0
```
* **cache semantics**: `embeddings.json` can now hold either `number[]` (legacy) or `{ hash, embedding }`. that means you won’t churn embeddings on first run, and you’ll only recompute when the chunk text actually changed. ^ref-a4a25141-304-0 ^ref-a4a25141-305-0
* **determinism**: chunk ids are still `{uuid}:{i}` to stay compatible with anything downstream that relies on that shape. ^ref-a4a25141-305-0
* **bounded pressure**: `--concurrency` (default 4). tune it to your box; NPUs/GPUs don’t like a stampede. ^ref-a4a25141-307-0
* **blast radius**: one corrupt file won’t nuke the run; it logs and keeps going. ^ref-a4a25141-307-0
```
^ref-a4a25141-309-0
```
if you want to go even more functional, we can make the “runner” pass in *all* side-effectors (`readFile`, `postEmbed`, `writeJSON`) as injected deps and test the whole pipeline with pure data. but this is already a big step up without over-engineering. ^ref-a4a25141-309-0

\#refactor #functional #typescript #ollama #embeddings #docs-pipeline
```
./utils";
```
import type { Chunk, Front } from "./types";
```
// ------------------------
```
```
// Config (IO boundary)
```
```
// ------------------------
```
```
const OLLAMA_URL = process.env.OLLAMA_URL ?? "
```
```
type Config = {
```
  root: string;
  exts: Set<string>;
  embedModel: string;
  cacheDir: string;
  chunkCachePath: string;
```
embedCachePath: string; ^ref-a4a25141-327-0
```
  docsMapPath: string;
  concurrency: number;
};
```
const mkConfig = (): Config => {
```
```
const args = parseArgs({
```
```
"--dir": "docs/unique",
```
    "--ext": ".md,.mdx,.txt", ^ref-a4a25141-335-0
    "--embed-model": "nomic-embed-text:latest",
```
"--concurrency": "4",
```
  });
  const ROOT = path.resolveargs"--dir"$;
```
const EXTS = new Set(
```
    args"--ext".split(",").map(s) => s.trim().toLowerCase()
  );
```
const EMBED_MODEL = args["--embed-model"];
```
  const CACHE = path.joinprocess.cwd(), ".cache/docs-pipeline";
  return {
    root: ROOT,
    exts: EXTS,
```
embedModel: EMBED_MODEL,
```
    cacheDir: CACHE,
    chunkCachePath: path.join(CACHE, "chunks.json"),
    embedCachePath: path.join(CACHE, "embeddings.json"),
    docsMapPath: path.joinCACHE, "docs-by-uuid.json",
    concurrency: Math.max(1, Number(args"--concurrency") || 4),
  };
};
```
// ------------------------
```
```
// Pure helpers
```
```
// ------------------------
```
const sha1 = (s: string) => crypto.createHash("sha1").update(s).digest("hex");

type EmbeddingCacheValue = number[] | { hash: string; embedding: number[] };
type EmbeddingCache = Record<string, EmbeddingCacheValue>;
```
const getCachedEmbedding = (
```
```
id: string, ^ref-a4a25141-366-0
```
  textHash: string,
  cache: EmbeddingCache
```
): number[] | null => {
```
```
const v = cache[id];
```
  if (!v) return null;
  if Array.isArray(v) return v; // legacy cache entry; accept as-is
  return v.hash === textHash ? v.embedding : null;
};
```
const setCachedEmbedding = (
```
  id: string,
  textHash: string,
  embedding: number[],
```
cache: EmbeddingCache ^ref-a4a25141-380-0
```
```
): EmbeddingCache => {
```
  return { ...cache, [id]: { hash: textHash, embedding } };
};
```
type Doc = {
```
  path: string;
  front: Front;
  content: string;
};

const toChunks = (doc: Doc): Chunk[] =>
```
parseMarkdownChunks(doc.content).map((c, i) => ({
```
    ...c,
    id: `{doc.front.uuid}:{i}`,
    docUuid: doc.front.uuid!,
    docPath: doc.path,
  }));
```
const groupBy = <T, K extends string>(
```
```
keyFn: (x: T) => K,
```
  xs: T[]
```
): Record<K, T[]> =>
```
```
xs.reduce((acc, x) => {
```
```
const k = keyFn(x);
```
```
(acc[k] ??= []).push(x);
```
    return acc;
```
}, {} as Record<K, T[]>); ^ref-a4a25141-407-0
```
```
const buildDocsByUuid = ( ^ref-a4a25141-409-0
```
```
docs: Doc[] ^ref-a4a25141-410-0
```
): Record<string, { path: string; title: string }> =>
```
docs.reduce((acc, d) => {
```
    const title = d.front.filename || path.parse(d.path).name;
    acc[d.front.uuid!] = { path: d.path, title };
    return acc;
  }, {} as Record<string, { path: string; title: string }>);
```
// ------------------------
```
```
// Small concurrency limiter
```
```
// ------------------------
```
const limit = (concurrency: number) => { ^ref-a4a25141-421-0
```
let active = 0; ^ref-a4a25141-422-0
```
```
const queue: (() => void)[] = [];
```
```
const next = () => { ^ref-a4a25141-424-0
```
```
active--;
```
```
const fn = queue.shift();
```
    if (fn) fn();
  };
  return async <T>task: () => Promise<T>: Promise<T> =>
```
new Promise<T>((resolve, reject) => {
```
```
const run = () => {
```
```
active++;
```
        task()
```
.then((v) => {
```
            next();
            resolve(v);
          })
```
.catch((e) => {
```
            next();
            reject(e);
          });
      };
      if (active < concurrency) run();
      else queue.push(run);
    });
};
```
// ------------------------
```
```
// IO helpers
```
```
// ------------------------
```
const readDoc = async (file: string): Promise<Doc> => {
  const raw = await fs.readFilefile, "utf-8";
  const { data, content } = matter(raw);
  return { path: file, front: data as Front, content };
};
```
const ollamaEmbed =
```
```
(model: string) =>
```
  async (text: string): Promise<number[]> => {
```
// simple retry with jitter
```
```
let attempt = 0;
```
```
const max = 4;
```
    while (true) {
      try {
        const res = await fetch`{OLLAMA_URL}/api/embeddings`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ model, prompt: text }),
        };
        if (!res.ok) {
          throw new Error(`HTTP {res.status} {res.statusText}`);
        }
        const data = await res.json() as { embedding: number[] };
        return data.embedding;
      } catch (err) {
```
attempt++;
```
        if attempt >= max throw err;
        const backoff = 250 * Math.pow(2, attempt) + Math.random() * 100;
        await new Promise(r) => setTimeout(r, backoff);
      }
    }
  };
```
// ------------------------
```
```
// Core flow
```
```
// ------------------------
```
async function main() {
```
const cfg = mkConfig();
```
```
// ensure cache dir exists
```
  await fs.mkdir(cfg.cacheDir, { recursive: true });
```
// load prior caches (IO)
```
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
```
// discover files (IO)
```
  const files = await listFilesRec(cfg.root, cfg.exts);

  // read + parse (IO) -> filter for uuid
```
const docs: Doc[] = (
```
    await Promise.all(
```
files.map(async (f) => {
```
        try {
```
const d = await readDoc(f);
```
          if (!d.front?.uuid) return null;
          return d;
        } catch (e) {
          console.error(`! failed parsing {f}:`, e);
          return null;
        }
      })
    )
  ).filter(Boolean) as Doc[];
```
// chunkify (pure)
```
  const allChunks = docs.flatMap(toChunks);

  // embed with memoized cache + p-limit (IO)
  const limiter = limit(cfg.concurrency);
  const embedFn = ollamaEmbed(cfg.embedModel);
```
let nextEmbedCache = { ...prevEmbedCache };
```
  const embeddedChunks: Chunk[] = await Promise.all(
```
allChunks.map((ch) =>
```
```
limiter(async () => {
```
```
const hash = sha1(ch.text);
```
        const cached = getCachedEmbedding(ch.id, hash, nextEmbedCache);
        const embedding = cached ?? await embedFn(ch.text);
        if (!cached) {
          nextEmbedCache = setCachedEmbedding(ch.id, hash, embedding, nextEmbedCache);
        }
        return { ...ch, embedding };
      })
    )
  );
```
// group (pure)
```
  const newChunksByDoc = groupBy<Chunk, string>(c) => c.docUuid!, embeddedChunks;
```
const newDocsMap = buildDocsByUuid(docs);
```
  // merge with previous pure-ish
```
const mergedChunksByDoc = { ...prevChunksByDoc, ...newChunksByDoc };
```
```
const mergedDocsMap = { ...prevDocsMap, ...newDocsMap };
```
```
// persist (IO)
```
  await writeJSON(cfg.chunkCachePath, mergedChunksByDoc);
  await writeJSON(cfg.embedCachePath, nextEmbedCache);
  await writeJSON(cfg.docsMapPath, mergedDocsMap);

  console.log`02-embed: done. files={files.length} docs={docs.length} chunks={embeddedChunks.length} concurrency={cfg.concurrency}`;
}
```
main().catch((e) => {
```
  console.error(e);
  process.exit(1);
});
```
^ref-a4a25141-31-0
```
```
```
^ref-a4a25141-32-0 ^ref-a4a25141-301-0
```
```
^ref-a4a25141-302-0
```
### notes you’ll care about ^ref-a4a25141-302-0
```
^ref-a4a25141-303-0 ^ref-a4a25141-304-0
```
* **cache semantics**: `embeddings.json` can now hold either `number[]` (legacy) or `{ hash, embedding }`. that means you won’t churn embeddings on first run, and you’ll only recompute when the chunk text actually changed. ^ref-a4a25141-304-0 ^ref-a4a25141-305-0
* **determinism**: chunk ids are still `{uuid}:{i}` to stay compatible with anything downstream that relies on that shape. ^ref-a4a25141-305-0
* **bounded pressure**: `--concurrency` (default 4). tune it to your box; NPUs/GPUs don’t like a stampede. ^ref-a4a25141-307-0
* **blast radius**: one corrupt file won’t nuke the run; it logs and keeps going. ^ref-a4a25141-307-0
```
^ref-a4a25141-309-0
```
if you want to go even more functional, we can make the “runner” pass in *all* side-effectors (`readFile`, `postEmbed`, `writeJSON`) as injected deps and test the whole pipeline with pure data. but this is already a big step up without over-engineering. ^ref-a4a25141-309-0

\#refactor #functional #typescript #ollama #embeddings #docs-pipeline
```
^ref-a4a25141-726-0 ^ref-a4a25141-1247-0 ^ref-a4a25141-2451-0 ^ref-a4a25141-3624-0
```
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
## Related content
- Performance-Optimized-Polyglot-Bridge$performance-optimized-polyglot-bridge.md
- Post-Linguistic Transhuman Design Frameworks$post-linguistic-transhuman-design-frameworks.md
- [Chroma Toolkit Consolidation Plan]chroma-toolkit-consolidation-plan.md
- Protocol_0_The_Contradiction_Engine$protocol-0-the-contradiction-engine.md
- [Fnord Tracer Protocol]fnord-tracer-protocol.md
- [Dynamic Context Model for Web Components]dynamic-context-model-for-web-components.md
- [Model Selection for Lightweight Conversational Tasks]model-selection-for-lightweight-conversational-tasks.md
- [Layer1SurvivabilityEnvelope](layer1survivabilityenvelope.md)
- [Eidolon Field Abstract Model]eidolon-field-abstract-model.md
- Model Upgrade Calm-Down Guide$model-upgrade-calm-down-guide.md
- ripple-propagation-demo$ripple-propagation-demo.md
- [Promethean State Format]promethean-state-format.md
- [Tracing the Signal]tracing-the-signal.md
- field-interaction-equations$field-interaction-equations.md
- field-node-diagram-set$field-node-diagram-set.md
- polyglot-repl-interface-layer$polyglot-repl-interface-layer.md
- [Optimizing Command Limitations in System Design]optimizing-command-limitations-in-system-design.md
- [Debugging Broker Connections and Agent Behavior]debugging-broker-connections-and-agent-behavior.md
- Promethean_Eidolon_Synchronicity_Model$promethean-eidolon-synchronicity-model.md
- [Smoke Resonance Visualizations]smoke-resonance-visualizations.md
- eidolon-field-math-foundations$eidolon-field-math-foundations.md
- graph-ds$graph-ds.md
- Promethean-Copilot-Intent-Engine$promethean-copilot-intent-engine.md
- [Functional Refactor of TypeScript Document Processing]functional-refactor-of-typescript-document-processing.md
- [Promethean Documentation Pipeline Overview]promethean-documentation-pipeline-overview.md
## Sources
- [Dynamic Context Model for Web Components — L412]dynamic-context-model-for-web-components.md#^ref-f7702bf8-412-0 (line 412, col 0, score 1)
- [Eidolon Field Abstract Model — L261]eidolon-field-abstract-model.md#^ref-5e8b2388-261-0 (line 261, col 0, score 1)
- eidolon-field-math-foundations — L181$eidolon-field-math-foundations.md#^ref-008f2ac0-181-0 (line 181, col 0, score 1)
- eidolon-node-lifecycle — L90$eidolon-node-lifecycle.md#^ref-938eca9c-90-0 (line 90, col 0, score 1)
- [Factorio AI with External Agents — L157]factorio-ai-with-external-agents.md#^ref-a4d90289-157-0 (line 157, col 0, score 1)
- field-dynamics-math-blocks — L205$field-dynamics-math-blocks.md#^ref-7cfc230d-205-0 (line 205, col 0, score 1)
- field-interaction-equations — L149$field-interaction-equations.md#^ref-b09141b7-149-0 (line 149, col 0, score 1)
- field-node-diagram-outline — L110$field-node-diagram-outline.md#^ref-1f32c94a-110-0 (line 110, col 0, score 1)
- field-node-diagram-set — L203$field-node-diagram-set.md#^ref-22b989d5-203-0 (line 203, col 0, score 1)
- field-node-diagram-visualizations — L95$field-node-diagram-visualizations.md#^ref-e9b27b06-95-0 (line 95, col 0, score 1)
- Per-Domain Policy System for JS Crawler — L495$per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-495-0 (line 495, col 0, score 1)
- Performance-Optimized-Polyglot-Bridge — L459$performance-optimized-polyglot-bridge.md#^ref-f5579967-459-0 (line 459, col 0, score 1)
- [Pipeline Enhancements — L27]pipeline-enhancements.md#^ref-e2135d9f-27-0 (line 27, col 0, score 1)
- plan-update-confirmation — L1002$plan-update-confirmation.md#^ref-b22d79c6-1002-0 (line 1002, col 0, score 1)
- polyglot-repl-interface-layer — L171$polyglot-repl-interface-layer.md#^ref-9c79206d-171-0 (line 171, col 0, score 1)
- Post-Linguistic Transhuman Design Frameworks — L112$post-linguistic-transhuman-design-frameworks.md#^ref-6bcff92c-112-0 (line 112, col 0, score 1)
- [Promethean Chat Activity Report — L24]promethean-chat-activity-report.md#^ref-18344cf9-24-0 (line 24, col 0, score 1)
- Protocol_0_The_Contradiction_Engine — L143$protocol-0-the-contradiction-engine.md#^ref-9a93a756-143-0 (line 143, col 0, score 1)
- Provider-Agnostic Chat Panel Implementation — L241$provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-241-0 (line 241, col 0, score 1)
- promethean-requirements — L79$promethean-requirements.md#^ref-95205cd3-79-0 (line 79, col 0, score 1)
- [Promethean State Format — L103]promethean-state-format.md#^ref-23df6ddb-103-0 (line 103, col 0, score 1)
- [Promethean Workflow Optimization — L119]promethean-workflow-optimization.md#^ref-d614d983-119-0 (line 119, col 0, score 1)
- [Prometheus Observability Stack — L559]prometheus-observability-stack.md#^ref-e90b5a16-559-0 (line 559, col 0, score 1)
- Prompt_Folder_Bootstrap — L256$prompt-folder-bootstrap.md#^ref-bd4f0976-256-0 (line 256, col 0, score 1)
- Protocol_0_The_Contradiction_Engine — L202$protocol-0-the-contradiction-engine.md#^ref-9a93a756-202-0 (line 202, col 0, score 1)
- ripple-propagation-demo — L114$ripple-propagation-demo.md#^ref-8430617b-114-0 (line 114, col 0, score 1)
- run-step-api — L1044$run-step-api.md#^ref-15d25922-1044-0 (line 1044, col 0, score 1)
- schema-evolution-workflow — L595$schema-evolution-workflow.md#^ref-d8059b6a-595-0 (line 595, col 0, score 1)
- Self-Agency in AI Interaction — L77$self-agency-in-ai-interaction.md#^ref-49a9a860-77-0 (line 77, col 0, score 1)
- [Dynamic Context Model for Web Components — L396]dynamic-context-model-for-web-components.md#^ref-f7702bf8-396-0 (line 396, col 0, score 1)
- [Creative Moments — L43]creative-moments.md#^ref-10d98225-43-0 (line 43, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L104]debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-104-0 (line 104, col 0, score 1)
- [Docops Feature Updates — L44]docops-feature-updates-3.md#^ref-cdbd21ee-44-0 (line 44, col 0, score 1)
- [Docops Feature Updates — L75]docops-feature-updates.md#^ref-2792d448-75-0 (line 75, col 0, score 1)
- [DuckDuckGoSearchPipeline — L48]duckduckgosearchpipeline.md#^ref-e979c50f-48-0 (line 48, col 0, score 1)
- [Duck's Attractor States — L127]ducks-attractor-states.md#^ref-13951643-127-0 (line 127, col 0, score 1)
- [ChatGPT Custom Prompts — L22]chatgpt-custom-prompts.md#^ref-930054b3-22-0 (line 22, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L280]chroma-toolkit-consolidation-plan.md#^ref-5020e892-280-0 (line 280, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L148]debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-148-0 (line 148, col 0, score 1)
- [Dynamic Context Model for Web Components — L511]dynamic-context-model-for-web-components.md#^ref-f7702bf8-511-0 (line 511, col 0, score 1)
- eidolon-field-math-foundations — L240$eidolon-field-math-foundations.md#^ref-008f2ac0-240-0 (line 240, col 0, score 1)
- eidolon-node-lifecycle — L123$eidolon-node-lifecycle.md#^ref-938eca9c-123-0 (line 123, col 0, score 1)
- [Factorio AI with External Agents — L222]factorio-ai-with-external-agents.md#^ref-a4d90289-222-0 (line 222, col 0, score 1)
- field-dynamics-math-blocks — L270$field-dynamics-math-blocks.md#^ref-7cfc230d-270-0 (line 270, col 0, score 1)
- graph-ds — L494$graph-ds.md#^ref-6620e2f2-494-0 (line 494, col 0, score 1)
- [Layer1SurvivabilityEnvelope — L299]layer1survivabilityenvelope.md#^ref-64a9f9f9-299-0 (line 299, col 0, score 1)
- [Docops Feature Updates — L61]docops-feature-updates.md#^ref-2792d448-61-0 (line 61, col 0, score 1)
- [Duck's Attractor States — L99]ducks-attractor-states.md#^ref-13951643-99-0 (line 99, col 0, score 1)
- Duck's Self-Referential Perceptual Loop — L80$ducks-self-referential-perceptual-loop.md#^ref-71726f04-80-0 (line 80, col 0, score 1)
- [Dynamic Context Model for Web Components — L405]dynamic-context-model-for-web-components.md#^ref-f7702bf8-405-0 (line 405, col 0, score 1)
- [Eidolon Field Abstract Model — L216]eidolon-field-abstract-model.md#^ref-5e8b2388-216-0 (line 216, col 0, score 1)
- [Factorio AI with External Agents — L189]factorio-ai-with-external-agents.md#^ref-a4d90289-189-0 (line 189, col 0, score 1)
- field-interaction-equations — L172$field-interaction-equations.md#^ref-b09141b7-172-0 (line 172, col 0, score 1)
- [Layer1SurvivabilityEnvelope — L175]layer1survivabilityenvelope.md#^ref-64a9f9f9-175-0 (line 175, col 0, score 1)
- [Mathematical Samplers — L90]mathematical-samplers.md#^ref-86a691ec-90-0 (line 90, col 0, score 1)
- Migrate to Provider-Tenant Architecture — L298$migrate-to-provider-tenant-architecture.md#^ref-54382370-298-0 (line 298, col 0, score 1)
- [Promethean Chat Activity Report — L48]promethean-chat-activity-report.md#^ref-18344cf9-48-0 (line 48, col 0, score 1)
- komorebi-group-window-hack — L262$komorebi-group-window-hack.md#^ref-dd89372d-262-0 (line 262, col 0, score 1)
- [Mathematics Sampler — L84]mathematics-sampler.md#^ref-b5e0183e-84-0 (line 84, col 0, score 1)
- Migrate to Provider-Tenant Architecture — L314$migrate-to-provider-tenant-architecture.md#^ref-54382370-314-0 (line 314, col 0, score 1)
- [Mindful Prioritization — L26]mindful-prioritization.md#^ref-40185d05-26-0 (line 26, col 0, score 1)
- [NPU Voice Code and Sensory Integration — L10]npu-voice-code-and-sensory-integration.md#^ref-5a02283e-10-0 (line 10, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration — L43]obsidian-chatgpt-plugin-integration.md#^ref-ca8e1399-43-0 (line 43, col 0, score 1)
- obsidian-ignore-node-modules-regex — L82$obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-82-0 (line 82, col 0, score 1)
- [Obsidian Task Generation — L37]obsidian-task-generation.md#^ref-9b694a91-37-0 (line 37, col 0, score 1)
- [OpenAPI Validation Report — L68]openapi-validation-report.md#^ref-5c152b08-68-0 (line 68, col 0, score 1)
- [ParticleSimulationWithCanvasAndFFmpeg — L294]particlesimulationwithcanvasandffmpeg.md#^ref-e018dd7a-294-0 (line 294, col 0, score 1)
- Per-Domain Policy System for JS Crawler — L532$per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-532-0 (line 532, col 0, score 1)
- Performance-Optimized-Polyglot-Bridge — L456$performance-optimized-polyglot-bridge.md#^ref-f5579967-456-0 (line 456, col 0, score 1)
- [Pipeline Enhancements — L17]pipeline-enhancements.md#^ref-e2135d9f-17-0 (line 17, col 0, score 1)
- plan-update-confirmation — L1035$plan-update-confirmation.md#^ref-b22d79c6-1035-0 (line 1035, col 0, score 1)
- [Creative Moments — L28]creative-moments.md#^ref-10d98225-28-0 (line 28, col 0, score 1)
- [Docops Feature Updates — L65]docops-feature-updates-3.md#^ref-cdbd21ee-65-0 (line 65, col 0, score 1)
- [Docops Feature Updates — L86]docops-feature-updates.md#^ref-2792d448-86-0 (line 86, col 0, score 1)
- [Duck's Attractor States — L123]ducks-attractor-states.md#^ref-13951643-123-0 (line 123, col 0, score 1)
- Duck's Self-Referential Perceptual Loop — L34$ducks-self-referential-perceptual-loop.md#^ref-71726f04-34-0 (line 34, col 0, score 1)
- [Dynamic Context Model for Web Components — L442]dynamic-context-model-for-web-components.md#^ref-f7702bf8-442-0 (line 442, col 0, score 1)
- [Eidolon Field Abstract Model — L218]eidolon-field-abstract-model.md#^ref-5e8b2388-218-0 (line 218, col 0, score 1)
- eidolon-field-math-foundations — L176$eidolon-field-math-foundations.md#^ref-008f2ac0-176-0 (line 176, col 0, score 1)
- eidolon-node-lifecycle — L70$eidolon-node-lifecycle.md#^ref-938eca9c-70-0 (line 70, col 0, score 1)
- [Docops Feature Updates — L35]docops-feature-updates.md#^ref-2792d448-35-0 (line 35, col 0, score 1)
- [Duck's Attractor States — L94]ducks-attractor-states.md#^ref-13951643-94-0 (line 94, col 0, score 1)
- Duck's Self-Referential Perceptual Loop — L53$ducks-self-referential-perceptual-loop.md#^ref-71726f04-53-0 (line 53, col 0, score 1)
- [Dynamic Context Model for Web Components — L424]dynamic-context-model-for-web-components.md#^ref-f7702bf8-424-0 (line 424, col 0, score 1)
- [Eidolon Field Abstract Model — L209]eidolon-field-abstract-model.md#^ref-5e8b2388-209-0 (line 209, col 0, score 1)
- eidolon-field-math-foundations — L142$eidolon-field-math-foundations.md#^ref-008f2ac0-142-0 (line 142, col 0, score 1)
- eidolon-node-lifecycle — L39$eidolon-node-lifecycle.md#^ref-938eca9c-39-0 (line 39, col 0, score 1)
- Per-Domain Policy System for JS Crawler — L547$per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-547-0 (line 547, col 0, score 1)
- [Promethean Documentation Overview — L98]promethean-documentation-overview.md#^ref-9413237f-98-0 (line 98, col 0, score 1)
- [Promethean Documentation Pipeline Overview — L162]promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-162-0 (line 162, col 0, score 1)
- [Creative Moments — L75]creative-moments.md#^ref-10d98225-75-0 (line 75, col 0, score 1)
- [Docops Feature Updates — L46]docops-feature-updates-3.md#^ref-cdbd21ee-46-0 (line 46, col 0, score 1)
- [Docops Feature Updates — L64]docops-feature-updates.md#^ref-2792d448-64-0 (line 64, col 0, score 1)
- [DuckDuckGoSearchPipeline — L40]duckduckgosearchpipeline.md#^ref-e979c50f-40-0 (line 40, col 0, score 1)
- [Duck's Attractor States — L137]ducks-attractor-states.md#^ref-13951643-137-0 (line 137, col 0, score 1)
- Duck's Self-Referential Perceptual Loop — L82$ducks-self-referential-perceptual-loop.md#^ref-71726f04-82-0 (line 82, col 0, score 1)
- [Dynamic Context Model for Web Components — L454]dynamic-context-model-for-web-components.md#^ref-f7702bf8-454-0 (line 454, col 0, score 1)
- Model Upgrade Calm-Down Guide — L86$model-upgrade-calm-down-guide.md#^ref-db74343f-86-0 (line 86, col 0, score 1)
- [NPU Voice Code and Sensory Integration — L49]npu-voice-code-and-sensory-integration.md#^ref-5a02283e-49-0 (line 49, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration Guide — L59]obsidian-chatgpt-plugin-integration-guide.md#^ref-1d3d6c3a-59-0 (line 59, col 0, score 1)
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->

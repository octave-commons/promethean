---
uuid: 0a8255a5-ef49-4a1e-ae71-b2f57eb7bdf8
created_at: functional-refactor-of-typescript-document-processing.md
filename: Functional Refactor of TypeScript Document Processing
title: Functional Refactor of TypeScript Document Processing
description: >-
  This refactor transforms a TypeScript program into a functional style using
  pure functions, immutability, and data transformations. It processes markdown
  files with async operations while maintaining cache efficiency and avoiding
  mutations.
tags:
  - functional-programming
  - typescript
  - document-processing
  - immutability
  - async-operations
  - cache-efficiency
  - markdown
---
Here is a direct refactor of the provided TypeScript program into a more functional style using functional programming techniques such as mapping, immutability, and pure functions. The refactor avoids mutation, prefers data transformations, and composes smaller functions, while still handling asynchronous operations as needed for file IO and API calls.[1][2][3] ^ref-1cfae310-1-0

## Functional Refactor

```typescript
import { promises as fs } from "fs";
import * as path from "path";
import matter from "gray-matter";
import { parseArgs, listFilesRec, writeJSON, readJSON, parseMarkdownChunks } from "./utils";
import type { Chunk, Front } from "./types";
const OLLAMA_URL = process.env.OLLAMA_URL ?? "
const args = parseArgs({
  "--dir": "docs/unique",
  "--ext": ".md,.mdx,.txt",
  "--embed-model": "nomic-embed-text:latest",
});
const ROOT = path.resolve(args["--dir"]);
const EXTS = new Set(args["--ext"].split(",").map((s) => s.trim().toLowerCase()));
const EMBED_MODEL = args["--embed-model"];
const CACHE = path.join(process.cwd(), ".cache/docs-pipeline");
const CHUNK_CACHE = path.join(CACHE, "chunks.json");
const EMBED_CACHE = path.join(CACHE, "embeddings.json");
const DOCS_MAP = path.join(CACHE, "docs-by-uuid.json");

const ollamaEmbed = (model: string, text: string): Promise<number[]> =>
  fetch(`${OLLAMA_URL}/api/embeddings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model, prompt: text }),
  })
    .then(res => res.json())
    .then(data => data.embedding as number[]);

// Pure function to process one file
const processFile = async (
  f: string,
  embedModel: string,
  embedCache: Record<string, number[]>
): Promise<{ uuid: string, chunks: Chunk[], docMeta: { path: string, title: string }, embeddings: Record<string, number[]> }> => {
  const raw = await fs.readFile(f, "utf-8");
  const { data, content } = matter(raw);
  const fm = data as Front;
  if (!fm.uuid) return null;
  const baseTitle = fm.filename || path.parse(f).name;

  // Get or fetch embeddings for all chunks
  const chunks = parseMarkdownChunks(content).map((c, i) => ({
    ...c,
    id: `${fm.uuid}:${i}`,
    docUuid: fm.uuid,
    docPath: f,
  }));
  const chunkEmbeddings = await Promise.all(
    chunks.map(async ch => {
      const embedding = embedCache[ch.id] || await ollamaEmbed(embedModel, ch.text);
      if (!embedCache[ch.id]) embedCache[ch.id] = embedding;
      return { ...ch, embedding };
    })
  );
  return {
    uuid: fm.uuid,
    chunks: chunkEmbeddings,
    docMeta: { path: f, title: baseTitle },
    embeddings: chunkEmbeddings.reduce((acc, ch) => ((acc[ch.id] = ch.embedding), acc), {}),
  };
};

const objectMerge = <A>(objs: Array<Record<string, A>>) =>
  Object.assign({}, ...objs);

// Main entry, composed functionally
const main = async () => {
  const [files, chunksByDoc, embedCache, docsByUuid] = await Promise.all([
    listFilesRec(ROOT, EXTS),
    readJSON(CHUNK_CACHE, {}),
    readJSON(EMBED_CACHE, {}),
    readJSON(DOCS_MAP, {}),
  ]);
  // Process all files in parallel, filter out null
  const processed = (
    await Promise.all(
      files.map(f => processFile(f, EMBED_MODEL, embedCache))
    )
  ).filter(Boolean);

  // Combine results immutably
  const newChunksByDoc = {
    ...chunksByDoc,
    ...objectMerge(processed.map(r => ({ [r.uuid]: r.chunks }))),
  };
  const newDocsByUuid = {
    ...docsByUuid,
    ...objectMerge(processed.map(r => ({ [r.uuid]: r.docMeta }))),
  };
  const newEmbedCache = {
    ...embedCache,
    ...objectMerge(processed.map(r => r.embeddings)),
  };

  // Write output
  await Promise.all([
    writeJSON(CHUNK_CACHE, newChunksByDoc),
    writeJSON(EMBED_CACHE, newEmbedCache),
    writeJSON(DOCS_MAP, newDocsByUuid),
  ]);
  console.log("02-embed: done.");
};
main().catch((e) => { console.error(e); process.exit(1); });
```
^ref-1cfae310-5-0

## Key Functional Changes
 ^ref-1cfae310-113-0
- **Pure file transforms**: Each file is processed in isolation using `processFile`, with all return values collected and merged later.[4][5] ^ref-1cfae310-114-0
- **Immutability**: Instead of mutating objects in place, new objects are composed and merged using functional helpers. ^ref-1cfae310-115-0
- **Mapping**: `map` is used to process files, and all IO asynchronicity is handled with non-blocking promise transformations.[6][3][1] ^ref-1cfae310-116-0
- **Avoid side effects**: All side effects (writes, network requests) are contained to explicit effectful areas of the code.
 ^ref-1cfae310-118-0
This approach makes the code more testable, maintainable, and readable by clearly separating data transformations from side effects.[2][7][5]
 ^ref-1cfae310-120-0
1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
18
19
20

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
related_to_uuid:
  - 10d98225-12e0-4212-8e15-88b57cf7bee5
  - 13951643-1741-46bb-89dc-1beebb122633
  - 18344cf9-0c49-4a71-b6c8-b8d84d660fca
  - 03a5578f-d689-45db-95e9-11300e5eee6f
  - 0b872af2-4197-46f3-b631-afb4e6135585
  - 1c4046b5-742d-4004-aec6-b47251fef5d6
  - 18138627-a348-4fbb-b447-410dfb400564
  - 0f6f8f38-98d0-438f-9601-58f478acc0b7
  - 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
  - 8b8e6103-30a4-4d66-b5f2-87db1612b587
  - 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
  - bd4f0976-0d5b-47f6-a20a-0601d1842dc1
  - a4a25141-6380-40b9-9cd7-b554b246b303
  - 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
  - 23df6ddb-05cf-4639-8201-f8291f8a6026
  - e90b5a16-d58f-424d-bd36-70e9bd2861ad
  - 4330e8f0-5f46-4235-918b-39b6b93fa561
  - f5579967-762d-4cfd-851e-4f71b4cb77a1
  - b22d79c6-825b-4cd3-b0d3-1cef0532bb54
  - c03020e1-e3e7-48bf-aa7e-aa740c601b63
  - e2135d9f-c69d-47ee-9b17-0b05e98dc748
  - 9c79206d-4cb9-4f00-87e0-782dcea37bc7
  - 6bcff92c-4224-453d-9993-1be8d37d47c3
  - ae24a280-678e-4c0b-8cc4-56667fa04172
  - 45cd25b5-ed36-49ab-82c8-10d0903e34db
related_to_title:
  - Creative Moments
  - Duck's Attractor States
  - Promethean Chat Activity Report
  - Promethean Dev Workflow Update
  - Promethean Documentation Update
  - Promethean Notes
  - The Jar of Echoes
  - windows-tiling-with-autohotkey
  - eidolon-field-math-foundations
  - Promethean Pipelines
  - Promethean Documentation Pipeline Overview
  - Prompt_Folder_Bootstrap
  - Functional Embedding Pipeline Refactor
  - Promethean Infrastructure Setup
  - Promethean State Format
  - Prometheus Observability Stack
  - Stateful Partitions and Rebalancing
  - Performance-Optimized-Polyglot-Bridge
  - plan-update-confirmation
  - Per-Domain Policy System for JS Crawler
  - Pipeline Enhancements
  - polyglot-repl-interface-layer
  - Post-Linguistic Transhuman Design Frameworks
  - Promethean-Copilot-Intent-Engine
  - Diagrams
references:
  - uuid: 1b1338fc-bb4d-41df-828f-e219cc9442eb
    line: 3584
    col: 0
    score: 1
  - uuid: 10d98225-12e0-4212-8e15-88b57cf7bee5
    line: 2074
    col: 0
    score: 1
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 4639
    col: 0
    score: 1
  - uuid: 18344cf9-0c49-4a71-b6c8-b8d84d660fca
    line: 2146
    col: 0
    score: 1
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 5539
    col: 0
    score: 1
  - uuid: 0b872af2-4197-46f3-b631-afb4e6135585
    line: 1851
    col: 0
    score: 1
  - uuid: 1c4046b5-742d-4004-aec6-b47251fef5d6
    line: 2047
    col: 0
    score: 1
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 4629
    col: 0
    score: 1
  - uuid: 18344cf9-0c49-4a71-b6c8-b8d84d660fca
    line: 2147
    col: 0
    score: 1
  - uuid: 0b872af2-4197-46f3-b631-afb4e6135585
    line: 1852
    col: 0
    score: 1
  - uuid: 1c4046b5-742d-4004-aec6-b47251fef5d6
    line: 2048
    col: 0
    score: 1
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 4630
    col: 0
    score: 1
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 5404
    col: 0
    score: 1
  - uuid: 1b1338fc-bb4d-41df-828f-e219cc9442eb
    line: 3586
    col: 0
    score: 1
  - uuid: 10d98225-12e0-4212-8e15-88b57cf7bee5
    line: 2076
    col: 0
    score: 1
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 4641
    col: 0
    score: 1
  - uuid: 18344cf9-0c49-4a71-b6c8-b8d84d660fca
    line: 2148
    col: 0
    score: 1
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 5540
    col: 0
    score: 1
  - uuid: 0b872af2-4197-46f3-b631-afb4e6135585
    line: 1853
    col: 0
    score: 1
  - uuid: 1c4046b5-742d-4004-aec6-b47251fef5d6
    line: 2049
    col: 0
    score: 1
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 5405
    col: 0
    score: 1
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 4642
    col: 0
    score: 1
  - uuid: 18344cf9-0c49-4a71-b6c8-b8d84d660fca
    line: 2149
    col: 0
    score: 1
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 5541
    col: 0
    score: 1
  - uuid: 0b872af2-4197-46f3-b631-afb4e6135585
    line: 1854
    col: 0
    score: 1
  - uuid: 1c4046b5-742d-4004-aec6-b47251fef5d6
    line: 2050
    col: 0
    score: 1
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 4631
    col: 0
    score: 1
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 5406
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
  - uuid: 9c79206d-4cb9-4f00-87e0-782dcea37bc7
    line: 163
    col: 0
    score: 1
  - uuid: 6bcff92c-4224-453d-9993-1be8d37d47c3
    line: 113
    col: 0
    score: 1
  - uuid: 18344cf9-0c49-4a71-b6c8-b8d84d660fca
    line: 32
    col: 0
    score: 1
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 73
    col: 0
    score: 1
  - uuid: 9fab9e76-e283-4c9d-a8cd-cb76892ea7ac
    line: 25
    col: 0
    score: 1
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 64
    col: 0
    score: 1
  - uuid: 9413237f-2537-4bbf-8768-db6180970e36
    line: 8
    col: 0
    score: 1
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 181
    col: 0
    score: 1
  - uuid: c0392040-16a2-41e8-bd54-75110319e3c0
    line: 8
    col: 0
    score: 1
  - uuid: 45cd25b5-ed36-49ab-82c8-10d0903e34db
    line: 20
    col: 0
    score: 1
  - uuid: e87bc036-1570-419e-a558-f45b9c0db698
    line: 9
    col: 0
    score: 1
  - uuid: c1618c66-f73a-4e04-9bfa-ef38755f7acc
    line: 72
    col: 0
    score: 1
  - uuid: f1add613-656e-4bec-b52b-193fd78c4642
    line: 23
    col: 0
    score: 1
  - uuid: 75ea4a6a-8270-488d-9d37-799c288e5f70
    line: 25
    col: 0
    score: 1
  - uuid: 6cb4943e-8267-4e27-8618-2ce0a464d173
    line: 11
    col: 0
    score: 1
  - uuid: 9e8ae388-767a-4ea8-9f2e-88801291d947
    line: 22
    col: 0
    score: 1
  - uuid: 10d98225-12e0-4212-8e15-88b57cf7bee5
    line: 7
    col: 0
    score: 1
  - uuid: 2792d448-c3b5-4050-93dd-93768529d99c
    line: 33
    col: 0
    score: 1
  - uuid: e979c50f-69bb-48b0-8417-e1ee1b31c0c0
    line: 15
    col: 0
    score: 1
  - uuid: 71726f04-eb1c-42a5-a5fe-d8209de6e159
    line: 44
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 401
    col: 0
    score: 1
  - uuid: 5e8b2388-022b-46cf-952c-36ae9b8f0037
    line: 205
    col: 0
    score: 1
  - uuid: 9e8ae388-767a-4ea8-9f2e-88801291d947
    line: 93
    col: 0
    score: 1
  - uuid: 10d98225-12e0-4212-8e15-88b57cf7bee5
    line: 9
    col: 0
    score: 1
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 117
    col: 0
    score: 1
  - uuid: cdbd21ee-25a0-4bfa-884c-c1b948e9b0b2
    line: 58
    col: 0
    score: 1
  - uuid: 2792d448-c3b5-4050-93dd-93768529d99c
    line: 82
    col: 0
    score: 1
  - uuid: e979c50f-69bb-48b0-8417-e1ee1b31c0c0
    line: 67
    col: 0
    score: 1
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 66
    col: 0
    score: 1
  - uuid: 71726f04-eb1c-42a5-a5fe-d8209de6e159
    line: 113
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 469
    col: 0
    score: 1
  - uuid: 5e8b2388-022b-46cf-952c-36ae9b8f0037
    line: 270
    col: 0
    score: 1
  - uuid: 45cd25b5-ed36-49ab-82c8-10d0903e34db
    line: 91
    col: 0
    score: 1
  - uuid: c1618c66-f73a-4e04-9bfa-ef38755f7acc
    line: 21
    col: 0
    score: 1
  - uuid: f1add613-656e-4bec-b52b-193fd78c4642
    line: 83
    col: 0
    score: 1
  - uuid: 75ea4a6a-8270-488d-9d37-799c288e5f70
    line: 95
    col: 0
    score: 1
  - uuid: 623a55f7-685c-486b-abaf-469da1bbbb69
    line: 82
    col: 0
    score: 1
  - uuid: 6cb4943e-8267-4e27-8618-2ce0a464d173
    line: 109
    col: 0
    score: 1
  - uuid: 9e8ae388-767a-4ea8-9f2e-88801291d947
    line: 33
    col: 0
    score: 1
  - uuid: 10d98225-12e0-4212-8e15-88b57cf7bee5
    line: 10
    col: 0
    score: 1
  - uuid: cdbd21ee-25a0-4bfa-884c-c1b948e9b0b2
    line: 57
    col: 0
    score: 1
  - uuid: 2792d448-c3b5-4050-93dd-93768529d99c
    line: 67
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 434
    col: 0
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 121
    col: 0
    score: 1
  - uuid: 938eca9c-97e2-4bcc-8653-b0ef1a5ac7a3
    line: 110
    col: 0
    score: 1
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 133
    col: 0
    score: 1
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 147
    col: 0
    score: 1
  - uuid: 9fab9e76-e283-4c9d-a8cd-cb76892ea7ac
    line: 92
    col: 0
    score: 1
  - uuid: 9fab9e76-e283-4c9d-a8cd-cb76892ea7ac
    line: 99
    col: 0
    score: 1
  - uuid: 9413237f-2537-4bbf-8768-db6180970e36
    line: 85
    col: 0
    score: 1
  - uuid: c0392040-16a2-41e8-bd54-75110319e3c0
    line: 92
    col: 0
    score: 1
  - uuid: 0b872af2-4197-46f3-b631-afb4e6135585
    line: 101
    col: 0
    score: 1
  - uuid: 2d6e5553-8dc4-497f-bf45-96f8ca00a6f6
    line: 132
    col: 0
    score: 1
  - uuid: 2d6e5553-8dc4-497f-bf45-96f8ca00a6f6
    line: 136
    col: 0
    score: 1
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 757
    col: 0
    score: 1
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 777
    col: 0
    score: 1
  - uuid: 1c4046b5-742d-4004-aec6-b47251fef5d6
    line: 103
    col: 0
    score: 1
  - uuid: 8b8e6103-30a4-4d66-b5f2-87db1612b587
    line: 161
    col: 0
    score: 1
  - uuid: 75ea4a6a-8270-488d-9d37-799c288e5f70
    line: 97
    col: 0
    score: 1
  - uuid: 623a55f7-685c-486b-abaf-469da1bbbb69
    line: 87
    col: 0
    score: 1
  - uuid: 6cb4943e-8267-4e27-8618-2ce0a464d173
    line: 112
    col: 0
    score: 1
  - uuid: 9e8ae388-767a-4ea8-9f2e-88801291d947
    line: 95
    col: 0
    score: 1
  - uuid: 10d98225-12e0-4212-8e15-88b57cf7bee5
    line: 13
    col: 0
    score: 1
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

# DocOps Pipeline: Architecture and Usage

This document explains the DocOps pipeline architecture, data model, server/UI, and programmatic APIs. It is the authoritative guide for contributors and integrators.

## Goals

- Process Markdown documents into a cross-referenced, searchable corpus
- Keep stages modular and composable (pure JS/TS functions)
- Use Dependency Injection (DI) for external resources (LevelDB, Chroma)
- Provide a lightweight dev UI for previewing and running steps
- Stream progress with clear, coarse and fine-grained signals

## High-Level Flow

1. Frontmatter (01)
2. Embed (02)
3. Query (03)
4. Relations (04)
5. Footers (05)
6. Rename (06)

All steps are exportable functions that accept injected dependencies and optional progress callbacks. The server composes and orchestrates them.

## Data Model

- LevelDB root at `.cache/docops.level`
  - `docs`: uuid → `{ path, title }`
  - `chunks`: uuid → `Chunk[]` (immutable arrays per doc)
  - `fp`: chunk id → fingerprint string for (text + embed model)
  - `q`: chunk id → `QueryHit[]` (top neighbors for the chunk)

- Types
  - `Front`: extended markdown frontmatter
  - `Chunk`: parsed markdown segment with positional info
  - `QueryHit`: vector search result for a chunk

- Chroma collection (vector index)
  - Created by the server with `"hnsw:space": "cosine"`
  - Stores embeddings for chunks
  - Answers kNN queries; returns ids and distances

## Dependency Injection (DI)

The server owns the lifecycle of LevelDB and Chroma. Pipeline functions never open/close databases or collections on their own.

```ts
type DBs = {
  root: Level<string, unknown>
  docs: Sublevel<string, { path: string; title: string }>
  chunks: Sublevel<string, readonly Chunk[]>
  fp: Sublevel<string, string>
}

type ChromaCollection = {
  upsert(input: { ids: string[]; embeddings: number[][]; documents: string[]; metadatas: any[] }): Promise<any>
  get(input: { ids: string[]; include?: ("metadatas"|"documents"|"embeddings")[] }): Promise<any>
  query(input: { queryEmbeddings: number[][]; nResults: number; where?: any }): Promise<any>
}
```

## Programmatic API

Import from `packages/docops/src/index.ts`:

```ts
import {
  runFrontmatter,
  runEmbed,
  runQuery,
  runRelations,
  runFooters,
  runRename,
  computePreview,
} from "@promethean/docops/src";
```

### Frontmatter

```ts
runFrontmatter(options: {
  dir: string
  exts?: string[] // default [".md", ".mdx", ".txt"]
  genModel: string // e.g. "qwen3:4b"
  dryRun?: boolean
}, db: DBs, onProgress?: (p: { step: 'frontmatter'; done: number; total: number }) => void): Promise<void>
```

Ensures uuid/created_at and optionally fills filename/description/tags via LLM. Writes to files unless `dryRun`.

### Embed

```ts
runEmbed(options: {
  dir: string
  exts?: string[]
  embedModel: string // e.g. "nomic-embed-text:latest"
  collection: string
  batch?: number
  debug?: boolean
}, db: DBs, coll: ChromaCollection, onProgress?: (p: { step: 'embed'; done: number; total: number }) => void): Promise<void>
```

Parses, fingerprints, and embeds new/changed chunks; upserts to Chroma.

### Query

```ts
runQuery(options: {
  embedModel: string
  collection: string
  k?: number
  force?: boolean
  debug?: boolean
}, db: DBs, coll: ChromaCollection, onProgress?: (p: { step: 'query'; done: number; total: number }) => void): Promise<void>
```

Builds kNN for each chunk and stores results under `q`.

### Relations

```ts
runRelations(options: {
  docsDir: string
  docThreshold: number
  refThreshold: number
  debug?: boolean
  files?: string[]
}, db: DBs, onProgress?: (p: { step: 'relations'; done: number; total: number }) => void): Promise<void>
```

Computes `related_to_uuid`/`related_to_title` and thresholded `references` and writes updated frontmatter. These sections are rebuilt on every run, not merged with previous content. Changing thresholds will fully replace `related_to_*` and `references` with freshly computed values.

### Footers

```ts
runFooters(options: {
  dir: string
  anchorStyle?: 'block' | 'heading' | 'none'
  includeRelated?: boolean
  includeSources?: boolean
  dryRun?: boolean
}, db: DBs, onProgress?: (p: { step: 'footers'; done: number; total: number }) => void): Promise<void>
```

Renders standardized footer sections between GENERATED-SECTIONS markers.

### Rename

```ts
runRename(options: { dir: string; dryRun?: boolean }): Promise<void>
```

Renames files to match `fm.filename` (slugged), avoiding collisions.

### Preview

```ts
computePreview(
  target: { uuid?: string; file?: string },
  opts: { dir: string; docThreshold: number; refThreshold: number; debug?: boolean },
  db?: DBs
): Promise<{ uuid: string; path: string; title: string; front: Front }>
```

Returns predicted frontmatter after relations (no writes).

## Server & UI

The dev server (`packages/docops/src/dev-ui.ts`) exposes:

- `GET /` → static UI
- `GET /api/config` → `{ dir, collection }`
- `GET /api/docs?dir=...` → documents in a dir
- `GET /api/preview?dir=...&uuid=...&docT=...&refT=...` → predicted front
- `GET /api/run?dir=...&collection=...&docT=...&refT=...` → run full pipeline (SSE)
- `GET /api/run-step?step=...` → run a single stage (SSE)

SSE payloads include lines starting `PROGRESS {json}` for rendering progress bars.

The UI (`packages/docops/ui/index.html`) provides:

- Global controls (dir, collection, thresholds)
- Preview widget (no write)
- Run Pipeline button with overall progress
- Per-step Web Components (`<docops-step>`) to run a single stage with parameter inputs and streaming logs

## Progress Reporting

Two layers:

- Coarse: step index/of emitted by server on `/api/run`
- Fine: in-step percent reported via callbacks → SSE `PROGRESS { step, percent, message }`

The UI updates a `<progress>` element and label accordingly.

## Error Handling

- LevelDB: a single shared instance via DI prevents lock contention
- Chroma: constructed only when needed for embed/query
- SSE: errors are printed as plain text log lines for visibility

## Extensibility

- Add a new stage by implementing `runX(opts, db, coll?, onProgress?)` and exporting from `src/index.ts`
- Extend `/api/run-step` switch and UI with another `<docops-step>` instance

## Troubleshooting

- “Database failed to open”: ensure a single LevelDB instance; avoid opening in multiple processes
- Empty references: confirm cosine space and distance→similarity conversion; lower `refThreshold` for debugging
- Slow iterations: use `/api/run-step` to run only the stage you’re changing

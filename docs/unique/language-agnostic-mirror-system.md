---
uuid: 3657117f-241d-4ab9-a717-4a3f584071fc
created_at: language-agnostic-mirror-system.md
filename: language-agnostic-mirror-system
title: language-agnostic-mirror-system
description: >-
  A system for maintaining synchronized code mirrors across multiple languages
  using Merkle trees, language-independent IR hashing, and chunk-level
  reconciliation. It ensures equivalent code across languages by comparing
  canonical IR representations and regenerating files only when necessary.
tags:
  - language-agnostic
  - merkle-trees
  - ir-hashing
  - chunk-reconciliation
  - cross-language-sync
related_to_uuid:
  - d3dc5e9d-ec20-47d8-a824-d7ec4300c510
  - c5fba0a0-9196-468d-a0f3-51c99e987263
  - c62a1815-c43b-4a3b-88e6-d7fa008a155e
  - 513dc4c7-e045-4123-ba2e-cf5ef0b7b4a3
  - d28090ac-f746-4958-aab5-ed1315382c04
  - 9c1acd1e-c6a4-4a49-a66f-6da8b1bc9333
  - e1056831-ae0c-460b-95fa-4cf09b3398c6
  - 31f0166e-4631-45fa-aecd-b44e9a13f497
  - dd89372d-10de-42a9-8c96-6bc13ea36d02
  - 4127189a-e0ab-436f-8571-cc852b8e9add
  - 9a8ab57e-507c-4c6b-aab4-01cea1bc0501
  - 871490c7-a050-429b-88b2-55dfeaa1f8d5
  - 2c2b48ca-1476-47fb-8ad4-69d2588a6c84
  - 9044701b-03c9-4a30-92c4-46b1bd66c11e
  - 543ed9b3-b7af-4ce1-b455-f7ba71a0bbc8
  - d144aa62-348c-4e5d-ae8f-38084c67ceca
  - 1cfae310-35dc-49c2-98f1-b186da25d84b
  - d771154e-a7ef-44ca-b69c-a1626cf94fbf
  - 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
  - 23df6ddb-05cf-4639-8201-f8291f8a6026
  - f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
  - 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
  - e811123d-5841-4e52-bf8c-978f26db4230
  - c34c36a6-80c9-4b44-a200-6448543b1b33
  - 51932e7b-4237-4756-bcae-8be6d535d0d1
related_to_title:
  - Code Deduping Guide
  - set-assignment-in-lisp-ast
  - ecs-scheduler-and-prefabs
  - mystery-lisp-search-session
  - i3-config-validation-methods
  - Mongo Outbox Implementation
  - RAG UI Panel with Qdrant and PostgREST
  - i3-layout-saver
  - komorebi-group-window-hack
  - layer-1-uptime-diagrams
  - Local-Only-LLM-Workflow
  - Local-First Intention→Code Loop with Free Models
  - Promethean Full-Stack Docker Setup
  - file-watcher-auth-fix
  - Voice Access Layer Design
  - Model Selection for Lightweight Conversational Tasks
  - Functional Refactor of TypeScript Document Processing
  - Vectorial Exception Descent
  - Promethean Documentation Pipeline Overview
  - Promethean State Format
  - Dynamic Context Model for Web Components
  - field-dynamics-math-blocks
  - WebSocket Gateway Implementation
  - Cross-Language Runtime Polymorphism
  - pm2-orchestration-patterns
references:
  - uuid: d3dc5e9d-ec20-47d8-a824-d7ec4300c510
    line: 3
    col: 0
    score: 1
  - uuid: d3dc5e9d-ec20-47d8-a824-d7ec4300c510
    line: 10
    col: 0
    score: 1
  - uuid: c5fba0a0-9196-468d-a0f3-51c99e987263
    line: 148
    col: 0
    score: 0.91
  - uuid: c62a1815-c43b-4a3b-88e6-d7fa008a155e
    line: 379
    col: 0
    score: 0.9
  - uuid: d28090ac-f746-4958-aab5-ed1315382c04
    line: 14
    col: 0
    score: 0.88
  - uuid: 513dc4c7-e045-4123-ba2e-cf5ef0b7b4a3
    line: 106
    col: 0
    score: 0.88
  - uuid: e1056831-ae0c-460b-95fa-4cf09b3398c6
    line: 110
    col: 0
    score: 0.87
  - uuid: 31f0166e-4631-45fa-aecd-b44e9a13f497
    line: 79
    col: 0
    score: 0.87
  - uuid: 9c1acd1e-c6a4-4a49-a66f-6da8b1bc9333
    line: 610
    col: 0
    score: 0.87
  - uuid: dd89372d-10de-42a9-8c96-6bc13ea36d02
    line: 32
    col: 0
    score: 0.86
  - uuid: 9a8ab57e-507c-4c6b-aab4-01cea1bc0501
    line: 129
    col: 0
    score: 0.86
  - uuid: 2c2b48ca-1476-47fb-8ad4-69d2588a6c84
    line: 417
    col: 0
    score: 0.86
  - uuid: 4127189a-e0ab-436f-8571-cc852b8e9add
    line: 129
    col: 0
    score: 0.86
  - uuid: 871490c7-a050-429b-88b2-55dfeaa1f8d5
    line: 105
    col: 0
    score: 0.86
  - uuid: e1056831-ae0c-460b-95fa-4cf09b3398c6
    line: 79
    col: 0
    score: 0.85
  - uuid: d28090ac-f746-4958-aab5-ed1315382c04
    line: 28
    col: 0
    score: 0.85
  - uuid: 9044701b-03c9-4a30-92c4-46b1bd66c11e
    line: 32
    col: 0
    score: 0.85
  - uuid: 543ed9b3-b7af-4ce1-b455-f7ba71a0bbc8
    line: 280
    col: 0
    score: 0.85
  - uuid: d771154e-a7ef-44ca-b69c-a1626cf94fbf
    line: 95
    col: 0
    score: 0.85
  - uuid: d144aa62-348c-4e5d-ae8f-38084c67ceca
    line: 1624
    col: 0
    score: 0.85
  - uuid: 1cfae310-35dc-49c2-98f1-b186da25d84b
    line: 1854
    col: 0
    score: 0.85
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 2455
    col: 0
    score: 0.85
  - uuid: 23df6ddb-05cf-4639-8201-f8291f8a6026
    line: 2739
    col: 0
    score: 0.85
---
Ohhh this is fun. Let’s build a **language-agnostic mirror** that keeps N folders (js, ts, lisp, …) in lockstep. We’ll use: ^ref-d2b3628c-1-0

* **Merkle trees** for directories/files/chunks ^ref-d2b3628c-3-0
* **Language-independent IR hashing** (your ANF IR) for *equivalence across languages* ^ref-d2b3628c-4-0
* **Chunk-level** reconciliation (per function/top-level form), not whole files ^ref-d2b3628c-5-0
* A pluggable **adapter system** (JS, TS, Lisp now; add more later) ^ref-d2b3628c-6-0
* A CLI you can run **after a pull/merge** to **rectify** mirrors (and a watch mode if you want) ^ref-d2b3628c-7-0

# How it works (high level)

```mermaid
flowchart LR
  subgraph Trees
  A[js/]:::lang --> I[Indexer]
  B[ts/]:::lang --> I
  C[lisp/]:::lang --> I
  end
  I --> S[Chunks: {lang,path,span,rawHash,ASTHash,IRHash,mtime}]
  S --> M[Merger: pick latest per-chunk]
  M --> P[Provenance DB (.promirror/)]
  M --> R[Regen: adapters (IR <-> lang)]
  R --> W[Write changed files]
  W --> P
  classDef lang fill:#f0f9ff,stroke:#0ea5e9,color:#0ea5e9;
```
^ref-d2b3628c-11-0
 ^ref-d2b3628c-27-0
* Each file is parsed into **chunks** (e.g., top-level functions). For each chunk we compute a digest **triple**:
  `rawHash` (bytes), `astHash` (syntax-normalized), `irHash` (**lowered to IR**, canonicalized). ^ref-d2b3628c-29-0
* The **IR hash** lets us prove two chunks in different languages are the *same program*. ^ref-d2b3628c-30-0
* Reconcile rule: **pick the freshest chunk** (by mtime) as authority *per chunk*, regenerate all other languages from IR, write only what changed, stamp provenance. ^ref-d2b3628c-31-0
* If **two languages both changed** the *same chunk* since the last sync → conflict; we show a diff and require a pick (can be “newest wins” if you want).

---

# Drop-in layout
 ^ref-d2b3628c-37-0
```
shared/js/prom-lib/mirror/
  types.ts
  hash.ts
  merkle.ts
  adapters/
    js.ts
    ts.ts
    lisp.ts
  engine.ts
  cli.ts
^ref-d2b3628c-37-0
```

## 1) Types ^ref-d2b3628c-52-0

```ts
// shared/js/prom-lib/mirror/types.ts
export type Lang = "js" | "ts" | "lisp";

export type ChunkId = string;  // stable id (e.g., lang:path#name or IR-derived)

export interface Chunk {
  lang: Lang;
  file: string;            // relative path within that lang root
  id: ChunkId;             // stable
  name?: string;           // human label (function name, defun, etc.)
  span?: { start: number; end: number }; // in-file byte offsets
  mtime: number;           // ms since epoch
  rawHash: string;         // sha256 of raw bytes slice
  astHash: string;         // sha256 of normalized AST
  irHash: string;          // sha256 of canonical IR (the cross-lang anchor)
  irJSON?: string;         // canonicalized IR text (for regen)
}

export interface FileChunks {
  lang: Lang;
  file: string;
  fileHash: string;        // Merkle root of chunks
  mtime: number;
  chunks: Chunk[];
}

export interface MirrorRoots {
  js?: string; ts?: string; lisp?: string; // absolute or cwd-relative paths
}

export interface Provenance {
  version: 1;
  lastSync: number;
  // key: chunkId
  chunks: Record<string, {
    irHash: string;
    // last authorative source
    source: { lang: Lang; file: string; mtime: number };
    // languages known in sync with that irHash at last sync
    synced: Partial<Record<Lang, { file: string; mtime: number; rawHash: string }>>;
  }>;
}

export interface Adapter {
  lang: Lang;
  /** Split file into chunks and compute hashes (raw/AST/IR). */
  indexFile(absPath: string, relPath: string, fileBytes: Buffer | string): Promise<FileChunks>;
  /** Generate a language file from a set of chunks (same file). Return new bytes and updated chunk spans. */
  emitFile(targetFile: string, chunks: Chunk[], opts?: { provenance?: Provenance }): Promise<{ bytes: string|Buffer; chunks: Chunk[] }>;
  /** Optional: stamp provenance header in a comment. */
  stampProvenance?(bytes: string, info: { irRoot?: string; at: number }): string;
^ref-d2b3628c-52-0
}
```
 ^ref-d2b3628c-109-0
## 2) Hashing + Merkle

```ts
// shared/js/prom-lib/mirror/hash.ts
import crypto from "node:crypto";

export const sha256 = (buf: Buffer|string) => crypto.createHash("sha256").update(buf).digest("hex");

export function canonicalJSON(x: any): string {
  return JSON.stringify(sortDeep(x));
}
function sortDeep(x: any): any {
  if (Array.isArray(x)) return x.map(sortDeep);
  if (x && typeof x === "object") {
    return Object.fromEntries(Object.keys(x).sort().map(k => [k, sortDeep(x[k])]));
  }
^ref-d2b3628c-109-0
  return x;
}
```
^ref-d2b3628c-127-0 ^ref-d2b3628c-130-0

```ts
// shared/js/prom-lib/mirror/merkle.ts
export type Node = { type: "dir"|"file"|"chunks"; name: string; hash: string; children?: Node[] };

export function merkleFromChunks(fc: import("./types").FileChunks): Node {
  const kids = fc.chunks.map(c => ({ type:"chunks", name: c.id, hash: c.irHash } as Node));
  const fileHash = shaJoin(kids.map(k => k.hash));
  return { type:"file", name: fc.file, hash: fileHash, children: kids };
}

export function shaJoin(hashes: string[]): string {
  return sha256(hashes.join("|"));
}
^ref-d2b3628c-127-0

// re-export
import { sha256 } from "./hash"; export { sha256 }; ^ref-d2b3628c-147-0
^ref-d2b3628c-147-0
```
^ref-d2b3628c-147-0
 ^ref-d2b3628c-151-0
## 3) Adapters

We piggyback on the compiler pieces you already have.

### 3a) JS adapter

```ts
// shared/js/prom-lib/mirror/adapters/js.ts
import fs from "node:fs/promises";
import { Adapter, FileChunks, Chunk } from "../types";
import { sha256, canonicalJSON } from "../hash";
// Use your existing compiler bits:
import * as acorn from "acorn"; // optional, but do it for robust AST splits
import { parse as parseOurJS } from "../../compiler/parser"; // fallback if you like
import { lower } from "../../compiler/lower";
import { emitJS } from "../../compiler/jsgen";
import { compileLispToJS } from "../../compiler/lisp/driver"; // for regen from Lisp IR if needed

export const JSAdapter: Adapter = {
  lang: "js",
  async indexFile(abs, rel, bytes) {
    const src = bytes.toString();
    const ast = acorn.parse(src, { ecmaVersion: "latest", sourceType: "module" }) as any;
    // split chunks: top-level FunctionDeclaration / VariableDeclaration with fn expr / ArrowFn assigned, etc.
    const chunks: Chunk[] = [];
    const now = 0; // caller should pass mtime; we’ll override
    const rawFileHash = sha256(src);

    function pushChunk(name: string, start: number, end: number, code: string) {
      const rawHash = sha256(code);
      const { irHash, irJSON } = jsToIRHash(code);
      const astHash = rawHash; // TODO: build syntax-normalized hash if needed
      const id = `${rel}#${name}`;
      chunks.push({ lang:"js", file: rel, id, name, span:{start,end}, mtime:now, rawHash, astHash, irHash, irJSON });
    }

    for (const n of ast.body) {
      if (n.type === "FunctionDeclaration" && n.id?.name) {
        const start = n.start, end = n.end;
        pushChunk(n.id.name, start, end, src.slice(start, end));
      } else if (n.type === "VariableDeclaration") {
        for (const d of n.declarations) {
          const id = d.id?.name; const init = d.init;
          if (!id || !init) continue;
          if (init.type === "FunctionExpression" || init.type === "ArrowFunctionExpression") {
            pushChunk(id, init.start, init.end, src.slice(init.start, init.end));
          }
        }
      }
    }

    return { lang:"js", file: rel, fileHash: sha256(chunks.map(c=>c.irHash).join("|")), mtime: 0, chunks } as FileChunks;
  },

  async emitFile(rel, chunks, opts) {
    // naive: just concatenate functions in stable order; in practice keep original scaffold and replace slices by span
    const pieces = chunks.map(c => chunkIRToJS(c));
    const bytes = pieces.join("\n\n");
    return { bytes, chunks };
  },

  stampProvenance(bytes, info) {
    const header = `/* promirror: ir=${info.irRoot ?? "unknown"} at=${new Date(info.at).toISOString()} */\n`;
    return header + bytes;
  }
};

// Helpers — convert JS snippet -> IR hash, and IR -> JS
function jsToIRHash(code: string): { irHash: string; irJSON: string } {
  // Pretend: parse -> (we could lower via our front-end if we parse to our AST)
  // For v1, go via Lisp front-end if needed; but we have direct JS IR only from our earlier pipeline via Lisp; keep stub simple:
  const ir = { code }; // replace with real IR when wired
  const irJSON = canonicalJSON(ir);
  return { irHash: sha256(irJSON), irJSON };
}

function chunkIRToJS(c: Chunk): string {
  // v1: if we have irJSON, use your JS emitter; else raw code
  if (c.irJSON) {
^ref-d2b3628c-151-0
    // TODO: decode and emit; for now pass through raw ^ref-d2b3628c-230-0
  }
  return `// ${c.name}\n${c.lang === "js" ? "" : ""}${"/* generated */"}`;
^ref-d2b3628c-234-0 ^ref-d2b3628c-235-0
^ref-d2b3628c-230-0
} ^ref-d2b3628c-237-0
^ref-d2b3628c-237-0
^ref-d2b3628c-235-0
^ref-d2b3628c-234-0
^ref-d2b3628c-230-0
``` ^ref-d2b3628c-234-0
^ref-d2b3628c-237-0
^ref-d2b3628c-235-0
^ref-d2b3628c-234-0
^ref-d2b3628c-230-0
 ^ref-d2b3628c-235-0
> ^ I kept JS adapter concise; you’ll wire it to your real IR (use `lower` on your own AST when you route JS through your reader or reuse the Lisp pipeline JS backend).

### 3b) TS adapter

* TS → JS (erase types), then reuse JS adapter’s chunking & IR hashing.
* Emission from IR: emit JS then **format as TS** (usually the same), add type stubs if you want.

```ts
// shared/js/prom-lib/mirror/adapters/ts.ts
import { Adapter, FileChunks, Chunk } from "../types";
import { sha256 } from "../hash";
import { tsToLisp } from "../../compiler/lisp/ts2lisp"; // for regen to Lisp if you want
import * as path from "node:path";
import * as fs from "node:fs/promises";
import * as ts from "typescript";
import { JSAdapter } from "./js";

export const TSAdapter: Adapter = {
  lang: "ts",
  async indexFile(abs, rel, bytes) {
    const js = ts.transpileModule(bytes.toString(), { compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.ESNext } }).outputText;
    // Reuse JS adapter to chunk/IR-hash
    const fakeRel = rel.replace(/\.ts$/, ".js");
    const fc = await JSAdapter.indexFile(abs, fakeRel, js);
    // translate back to TS paths/lang
    return { ...fc, lang:"ts", file: rel, fileHash: fc.fileHash, chunks: fc.chunks.map(c => ({ ...c, lang:"ts", file: rel })) };
  },
  async emitFile(rel, chunks) {
    // emit JS then rename to .ts; optionally add type banners
    const js = await JSAdapter.emitFile(rel.replace(/\.ts$/, ".js"), chunks);
    return { bytes: js.bytes, chunks: chunks.map(c => ({ ...c, lang:"ts", file: rel })) };
  },
^ref-d2b3628c-237-0
  stampProvenance(bytes, info) {
    const header = `// promirror: ir=${info.irRoot ?? "unknown"} at=${new Date(info.at).toISOString()}\n`;
^ref-d2b3628c-271-0
^ref-d2b3628c-273-0
^ref-d2b3628c-273-0
    return header + bytes; ^ref-d2b3628c-271-0
  }
};
```

### 3c) Lisp adapter

Use your existing Lisp driver (`compileLispToJS`, `runLisp`, reader) to split by top-level forms (defun/let/fn at top level → chunks), hash IR via **lower()** directly (you already have).

```ts
// shared/js/prom-lib/mirror/adapters/lisp.ts
import { Adapter, FileChunks, Chunk } from "../types";
import { sha256, canonicalJSON } from "../hash";
import fs from "node:fs/promises";
import { read } from "../../compiler/lisp/reader";
import { macroexpandAll } from "../../compiler/lisp/expand";
import { toExpr } from "../../compiler/lisp/to-expr";
import { lower } from "../../compiler/lower";
import { emitJS } from "../../compiler/jsgen";
import { printS } from "../../compiler/lisp/print";

export const LispAdapter: Adapter = {
  lang: "lisp",
  async indexFile(abs, rel, bytes) {
    const src = bytes.toString();
    const forms = read(src);
    const expanded = macroexpandAll(forms);
    const chunks: Chunk[] = [];
    for (let i=0;i<expanded.length;i++) {
      const form = expanded[i];
      const name = guessFormName(form, i);
      const expr = toExpr(form);
      const ir = lower(expr);
      const irJSON = canonicalJSON(ir);
      const irHash = sha256(irJSON);
      const rawHash = sha256(printS(form));
      const id = `${rel}#${name}`;
      chunks.push({ lang:"lisp", file: rel, id, name, mtime:0, rawHash, astHash: rawHash, irHash, irJSON });
    }
    return { lang:"lisp", file: rel, fileHash: sha256(chunks.map(c=>c.irHash).join("|")), mtime: 0, chunks };
  },

  async emitFile(rel, chunks) {
    // Emit each chunk from IR back to Lisp form via JS then reverse; or keep original s-exprs in irJSON if stored.
    const pieces = chunks.map(c => {
      if (c.irJSON) {
        // optional: derive Lisp from IR; for now, emit a comment stub:
        return `; generated: ${c.id}\n(begin)`;
      }
      return `; passthrough ${c.id}`;
    });
    return { bytes: pieces.join("\n\n"), chunks };
  },

  stampProvenance(bytes, info) {
    const header = `; promirror: ir=${info.irRoot ?? "unknown"} at=${new Date(info.at).toISOString()}\n`;
    return header + bytes;
  }
};

^ref-d2b3628c-273-0
function guessFormName(form: any, i: number) { ^ref-d2b3628c-332-0
  // (def name ...) / (define name ...) / (let ((name ...)) ...)
^ref-d2b3628c-336-0
^ref-d2b3628c-336-0
^ref-d2b3628c-332-0
^ref-d2b3628c-336-0
^ref-d2b3628c-332-0
  const head = (form as any).xs?.[0]?.name;
  const name = (form as any).xs?.[1]?.name;
  return name || head || `form${i}`;
}
```

> You can tighten this later to emit true Lisp from IR (round-trip) using your reverse compiler as a scaffold.

## 4) Engine (index, status, sync)

```ts
// shared/js/prom-lib/mirror/engine.ts
import fs from "node:fs/promises";
import path from "node:path";
import { Adapter, FileChunks, MirrorRoots, Provenance, Lang, Chunk } from "./types";
import { sha256, canonicalJSON } from "./hash";
import { merkleFromChunks, shaJoin } from "./merkle";
import { JSAdapter } from "./adapters/js";
import { TSAdapter } from "./adapters/ts";
import { LispAdapter } from "./adapters/lisp";

const ADAPTERS: Record<Lang, Adapter> = { js: JSAdapter, ts: TSAdapter, lisp: LispAdapter };

export class MirrorEngine {
  roots: MirrorRoots;
  provPath: string;
  prov: Provenance;

  constructor(roots: MirrorRoots, repoRoot: string = process.cwd()) {
    this.roots = roots;
    this.provPath = path.join(repoRoot, ".promirror/provenance.json");
    this.prov = { version:1, lastSync:0, chunks:{} };
  }

  async loadProv() {
    try {
      const s = await fs.readFile(this.provPath, "utf8");
      this.prov = JSON.parse(s);
    } catch {}
  }
  async saveProv() {
    await fs.mkdir(path.dirname(this.provPath), { recursive: true });
    await fs.writeFile(this.provPath, JSON.stringify(this.prov, null, 2), "utf8");
  }

  async indexAll(): Promise<Map<string, Chunk[]>> {
    const map = new Map<string, Chunk[]>(); // key: chunkId (by IR), value: variants
    for (const [lang, root] of Object.entries(this.roots) as [Lang,string][]) {
      if (!root) continue;
      const files = await walk(root);
      for (const f of files.filter(x => matchLangFile(lang, x))) {
        const abs = path.join(root, f);
        const st = await fs.stat(abs);
        const bytes = await fs.readFile(abs);
        const fc = await ADAPTERS[lang].indexFile(abs, f, bytes);
        // backfill mtimes
        for (const c of fc.chunks) c.mtime = st.mtimeMs;
        for (const c of fc.chunks) {
          const key = c.id.split("#")[1] ?? c.id;
          const variants = map.get(key) ?? [];
          variants.push(c);
          map.set(key, variants);
        }
      }
    }
    return map;
  }

  /** Decide winner per chunk (latest mtime), and which langs need regen. */
  plan(map: Map<string, Chunk[]>) {
    const actions: { chunkId: string; winner: Chunk; regenerate: Lang[] }[] = [];
    for (const [id, variants] of map) {
      const winner = variants.reduce((a,b)=> a.mtime >= b.mtime ? a : b);
      const regen: Lang[] = Object.keys(this.roots).filter(l => l !== winner.lang) as Lang[];
      actions.push({ chunkId: id, winner, regenerate: regen });
    }
    return actions;
  }

  /** Execute regen & write. */
  async sync() {
    await this.loadProv();

    const map = await this.indexAll();
    const plan = this.plan(map);

    for (const step of plan) {
      const { chunkId, winner, regenerate } = step;
      for (const lang of regenerate) {
        const targetRoot = this.roots[lang]!;
        const targetFile = mirrorPath(winner.file, winner.lang, lang);
        const abs = path.join(targetRoot, targetFile);
        const adapter = ADAPTERS[lang];

        // group chunks per file (v1: per-chunk which share same file id = file)
        const chunksForFile: Chunk[] = (map.get(chunkId) ?? []).map(c => c.lang===lang ? c : { ...c, lang }); // simplistic

        // emit file (real impl: group by target file, not by chunk)
        const { bytes } = await adapter.emitFile(targetFile, [winner]);
        const stamped = adapter.stampProvenance ? adapter.stampProvenance(bytes.toString(), { irRoot: winner.irHash, at: Date.now() }) : bytes.toString();
        await fs.mkdir(path.dirname(abs), { recursive: true });
        await fs.writeFile(abs, stamped, "utf8");

        // update prov
        const key = chunkId;
        const rec = this.prov.chunks[key] ?? { irHash: winner.irHash, source: { lang: winner.lang, file: winner.file, mtime: winner.mtime }, synced: {} };
        rec.irHash = winner.irHash;
        rec.source = { lang: winner.lang, file: winner.file, mtime: winner.mtime };
        rec.synced![lang] = { file: targetFile, mtime: Date.now(), rawHash: sha256(stamped) };
        this.prov.chunks[key] = rec;
      }
    }
    this.prov.lastSync = Date.now();
    await this.saveProv();
  }
}

// --- helpers ---
async function walk(root: string): Promise<string[]> {
  const out: string[] = [];
  async function rec(dir: string, base="") {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const e of entries) {
      if (e.isDirectory()) await rec(path.join(dir, e.name), path.join(base, e.name));
      else out.push(path.join(base, e.name));
    }
  }
  await rec(root);
  return out;
}
function matchLangFile(lang: Lang, file: string) {
  if (lang === "js") return /\.m?jsx?$/.test(file);
  if (lang === "ts") return /\.tsx?$/.test(file);
  if (lang === "lisp") return /\.lisp$/.test(file);
^ref-d2b3628c-336-0
  return false;
^ref-d2b3628c-471-0
^ref-d2b3628c-471-0
^ref-d2b3628c-471-0
}
function mirrorPath(file: string, from: Lang, to: Lang): string {
  // naive: same relative path, different extension
  const extMap: Record<Lang,string> = { js: ".js", ts: ".ts", lisp: ".lisp" };
  return file.replace(/\.[^.]+$/, extMap[to]);
}
```

## 5) CLI (status + sync)

```ts
// shared/js/prom-lib/mirror/cli.ts
#!/usr/bin/env node
import path from "node:path";
import { MirrorEngine } from "./engine";

const cmd = process.argv[2] || "status";
const root = process.cwd();
const roots = {
  js: path.join(root, "src/js"),
  ts: path.join(root, "src/ts"),
  lisp: path.join(root, "src/lisp"),
};

const engine = new MirrorEngine(roots, root);

if (cmd === "sync") {
  engine.sync().then(()=>console.log("synced")).catch(e=>{console.error(e); process.exit(1);});
} else if (cmd === "status") {
  engine.indexAll().then(map => {
    for (const [id, variants] of map) {
^ref-d2b3628c-471-0
      const latest = variants.reduce((a,b)=> a.mtime>=b.mtime ? a : b);
^ref-d2b3628c-510-0 ^ref-d2b3628c-511-0
^ref-d2b3628c-508-0 ^ref-d2b3628c-512-0
^ref-d2b3628c-507-0 ^ref-d2b3628c-513-0
^ref-d2b3628c-506-0
^ref-d2b3628c-522-0 ^ref-d2b3628c-523-0
^ref-d2b3628c-521-0 ^ref-d2b3628c-524-0
^ref-d2b3628c-519-0 ^ref-d2b3628c-525-0
^ref-d2b3628c-513-0 ^ref-d2b3628c-526-0
^ref-d2b3628c-512-0
^ref-d2b3628c-511-0
^ref-d2b3628c-510-0
^ref-d2b3628c-508-0
^ref-d2b3628c-507-0
^ref-d2b3628c-506-0 ^ref-d2b3628c-532-0
^ref-d2b3628c-540-0 ^ref-d2b3628c-541-0
^ref-d2b3628c-539-0
^ref-d2b3628c-538-0
^ref-d2b3628c-537-0
^ref-d2b3628c-536-0
^ref-d2b3628c-534-0
^ref-d2b3628c-533-0 ^ref-d2b3628c-547-0
^ref-d2b3628c-532-0 ^ref-d2b3628c-548-0
^ref-d2b3628c-526-0 ^ref-d2b3628c-549-0
^ref-d2b3628c-525-0 ^ref-d2b3628c-550-0
^ref-d2b3628c-524-0 ^ref-d2b3628c-551-0
^ref-d2b3628c-523-0
^ref-d2b3628c-522-0
^ref-d2b3628c-521-0
^ref-d2b3628c-519-0
^ref-d2b3628c-513-0
^ref-d2b3628c-512-0
^ref-d2b3628c-511-0
^ref-d2b3628c-510-0 ^ref-d2b3628c-559-0
^ref-d2b3628c-508-0
^ref-d2b3628c-507-0
^ref-d2b3628c-506-0
^ref-d2b3628c-496-0 ^ref-d2b3628c-563-0
      const langs = variants.map(v => `${v.lang}@${new Date(v.mtime).toISOString()}`).join(", "); ^ref-d2b3628c-533-0
      console.log(`${id}: latest=${latest.lang} (${new Date(latest.mtime).toLocaleString()}) :: ${langs}`); ^ref-d2b3628c-534-0 ^ref-d2b3628c-565-0
    } ^ref-d2b3628c-566-0
  }); ^ref-d2b3628c-506-0 ^ref-d2b3628c-536-0
} else { ^ref-d2b3628c-507-0 ^ref-d2b3628c-519-0 ^ref-d2b3628c-537-0
  console.log("Usage: promirror [status|sync]"); ^ref-d2b3628c-508-0 ^ref-d2b3628c-538-0
} ^ref-d2b3628c-521-0 ^ref-d2b3628c-539-0
``` ^ref-d2b3628c-510-0 ^ref-d2b3628c-522-0 ^ref-d2b3628c-540-0
^ref-d2b3628c-504-0
 ^ref-d2b3628c-511-0 ^ref-d2b3628c-523-0 ^ref-d2b3628c-541-0
--- ^ref-d2b3628c-512-0 ^ref-d2b3628c-524-0
 ^ref-d2b3628c-513-0 ^ref-d2b3628c-525-0
# Practical notes ^ref-d2b3628c-526-0

* **IR as anchor.** Don’t trust `rawHash` to compare across languages; the **`irHash`** is the canonical “same program” proof. Your existing lowerer/IR gives this basically for free.
* **Chunking.** Start with top-level functions. Later, add class methods / exports / defmacro forms. For JS/TS you can use Acorn/TS AST to find stable chunk names. ^ref-d2b3628c-547-0
* **Conflicts.** If multiple languages changed the **same chunk** since `provenance.lastSync`, either: ^ref-d2b3628c-548-0
 ^ref-d2b3628c-519-0 ^ref-d2b3628c-549-0
  * pick newest (your stated policy), or ^ref-d2b3628c-532-0 ^ref-d2b3628c-550-0
  * mark **conflict** and require manual pick (safe default). ^ref-d2b3628c-521-0 ^ref-d2b3628c-533-0 ^ref-d2b3628c-551-0
* **Provenance header.** Stamp each generated file with `ir=<hash> at=<time>` in a comment; cheap sanity check for humans. ^ref-d2b3628c-522-0 ^ref-d2b3628c-534-0
* **Post-commit rectifier.** Add a git alias or CI step that runs `promirror sync` after merges/pulls. It will reindex and regenerate downstream languages. ^ref-d2b3628c-523-0
 ^ref-d2b3628c-524-0 ^ref-d2b3628c-536-0
--- ^ref-d2b3628c-525-0 ^ref-d2b3628c-537-0
 ^ref-d2b3628c-526-0 ^ref-d2b3628c-538-0
# Next steps (I can add any/all) ^ref-d2b3628c-539-0
 ^ref-d2b3628c-540-0
1. **Real IR plumbing** inside the adapters (I sketched stubs to keep this readable). Wire: ^ref-d2b3628c-541-0 ^ref-d2b3628c-559-0

   * JS → Lisp reader (or a JS → IR path) → `lower()` → `irHash`
   * IR → JS via `emitJS` and IR → Lisp via your reverse codegen ^ref-d2b3628c-532-0
2. **Better per-file reconstruction**: preserve untouched scaffolding and only replace affected spans (so comments stay). ^ref-d2b3628c-533-0 ^ref-d2b3628c-563-0
3. **Conflict UI**: `promirror status --json` with a small TUI to pick winners per chunk. ^ref-d2b3628c-534-0
4. **Watch mode** + **git hook** template. ^ref-d2b3628c-547-0 ^ref-d2b3628c-565-0
5. **Tests**: round-trip test harness (JS↔Lisp↔TS) to ensure stability. ^ref-d2b3628c-536-0 ^ref-d2b3628c-548-0 ^ref-d2b3628c-566-0
 ^ref-d2b3628c-537-0 ^ref-d2b3628c-549-0
Want me to wire the JS and Lisp adapters to your actual IR so `irHash` is 100% real and regeneration works end-to-end?

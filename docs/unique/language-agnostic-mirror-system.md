---
uuid: d2b3628c-6cad-4664-8551-94ef8280851d
created_at: 2025.08.08.23.08.30.md
filename: Language-Agnostic Mirror System
description: >-
  A system that synchronizes multiple programming language repositories in
  lockstep using Merkle trees, language-independent IR hashing, and chunk-level
  reconciliation. It ensures cross-language program equivalence through
  canonical IR representations and resolves conflicts by prioritizing the latest
  authoritative chunks.
tags:
  - language-agnostic
  - merkle
  - ir
  - reconciliation
  - chunk
  - adapter
  - provenance
related_to_title:
  - Lisp-Compiler-Integration
  - js-to-lisp-reverse-compiler
  - Interop and Source Maps
  - set-assignment-in-lisp-ast
  - Lispy Macros with syntax-rules
  - archetype-ecs
  - universal-intention-code-fabric
  - compiler-kit-foundations
  - DSL
  - 'Polyglot S-expr Bridge: Python-JS-Lisp Interop'
  - lisp-dsl-for-window-management
  - Local-Only-LLM-Workflow
  - Dynamic Context Model for Web Components
  - ecs-scheduler-and-prefabs
  - Performance-Optimized-Polyglot-Bridge
  - Cross-Target Macro System in Sibilant
  - ecs-offload-workers
  - graph-ds
  - Ollama-LLM-Provider-for-Pseudo-Code-Transpiler
  - JavaScript
  - AI-Centric OS with MCP Layer
  - AI-First-OS-Model-Context-Protocol
  - balanced-bst
related_to_uuid:
  - cfee6d36-b9f5-4587-885a-cdfddb4f054e
  - 58191024-d04a-4520-8aae-a18be7b94263
  - cdfac40c-00e4-458f-96a7-4c37d0278731
  - c5fba0a0-9196-468d-a0f3-51c99e987263
  - cbfe3513-6a4a-4d2e-915d-ddfab583b2de
  - 8f4c1e86-1236-4936-84ca-6ed7082af6b7
  - c14edce7-0656-45b2-aaf3-51f042451b7d
  - 01b21543-7e03-4129-8fe4-b6306be69dee
  - e87bc036-1570-419e-a558-f45b9c0db698
  - 63a1cc28-b85c-4ce2-b754-01c2bc0c0bc3
  - c5c5ff1c-d1bc-45c7-8a84-55a4a847dfc5
  - 9a8ab57e-507c-4c6b-aab4-01cea1bc0501
  - f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
  - c62a1815-c43b-4a3b-88e6-d7fa008a155e
  - f5579967-762d-4cfd-851e-4f71b4cb77a1
  - 5f210ca2-54e9-445b-afe4-fb340d4992c5
  - 6498b9d7-bd35-4bd3-89fb-af1c415c3cd1
  - 6620e2f2-de6d-45d8-a722-5d26e160b370
  - b362e12e-2802-4e41-9a21-6e0c7ad419a2
  - c1618c66-f73a-4e04-9bfa-ef38755f7acc
  - 0f1f8cc1-b5a6-4307-a40d-78de3adafca2
  - 618198f4-cfad-4677-9df6-0640d8a97bae
  - d3e7db72-2e07-4dae-8920-0e07c499a1e5
references:
  - uuid: 01b21543-7e03-4129-8fe4-b6306be69dee
    line: 610
    col: 1
    score: 1
  - uuid: 01b21543-7e03-4129-8fe4-b6306be69dee
    line: 610
    col: 3
    score: 1
  - uuid: cdfac40c-00e4-458f-96a7-4c37d0278731
    line: 515
    col: 1
    score: 1
  - uuid: cdfac40c-00e4-458f-96a7-4c37d0278731
    line: 515
    col: 3
    score: 1
  - uuid: 58191024-d04a-4520-8aae-a18be7b94263
    line: 423
    col: 1
    score: 1
  - uuid: 58191024-d04a-4520-8aae-a18be7b94263
    line: 423
    col: 3
    score: 1
  - uuid: c5c5ff1c-d1bc-45c7-8a84-55a4a847dfc5
    line: 220
    col: 1
    score: 1
  - uuid: c5c5ff1c-d1bc-45c7-8a84-55a4a847dfc5
    line: 220
    col: 3
    score: 1
  - uuid: 5f210ca2-54e9-445b-afe4-fb340d4992c5
    line: 179
    col: 1
    score: 1
  - uuid: 5f210ca2-54e9-445b-afe4-fb340d4992c5
    line: 179
    col: 3
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 389
    col: 1
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 389
    col: 3
    score: 1
  - uuid: cdfac40c-00e4-458f-96a7-4c37d0278731
    line: 522
    col: 1
    score: 1
  - uuid: cdfac40c-00e4-458f-96a7-4c37d0278731
    line: 522
    col: 3
    score: 1
  - uuid: cfee6d36-b9f5-4587-885a-cdfddb4f054e
    line: 547
    col: 1
    score: 1
  - uuid: cfee6d36-b9f5-4587-885a-cdfddb4f054e
    line: 547
    col: 3
    score: 1
  - uuid: e87bc036-1570-419e-a558-f45b9c0db698
    line: 11
    col: 1
    score: 1
  - uuid: e87bc036-1570-419e-a558-f45b9c0db698
    line: 11
    col: 3
    score: 1
  - uuid: 01b21543-7e03-4129-8fe4-b6306be69dee
    line: 606
    col: 1
    score: 1
  - uuid: 01b21543-7e03-4129-8fe4-b6306be69dee
    line: 606
    col: 3
    score: 1
  - uuid: 58191024-d04a-4520-8aae-a18be7b94263
    line: 422
    col: 1
    score: 1
  - uuid: 58191024-d04a-4520-8aae-a18be7b94263
    line: 422
    col: 3
    score: 1
  - uuid: cfee6d36-b9f5-4587-885a-cdfddb4f054e
    line: 537
    col: 1
    score: 1
  - uuid: cfee6d36-b9f5-4587-885a-cdfddb4f054e
    line: 537
    col: 3
    score: 1
  - uuid: 01b21543-7e03-4129-8fe4-b6306be69dee
    line: 607
    col: 1
    score: 1
  - uuid: 01b21543-7e03-4129-8fe4-b6306be69dee
    line: 607
    col: 3
    score: 1
  - uuid: cdfac40c-00e4-458f-96a7-4c37d0278731
    line: 514
    col: 1
    score: 1
  - uuid: cdfac40c-00e4-458f-96a7-4c37d0278731
    line: 514
    col: 3
    score: 1
  - uuid: 58191024-d04a-4520-8aae-a18be7b94263
    line: 411
    col: 1
    score: 1
  - uuid: 58191024-d04a-4520-8aae-a18be7b94263
    line: 411
    col: 3
    score: 1
  - uuid: cfee6d36-b9f5-4587-885a-cdfddb4f054e
    line: 540
    col: 1
    score: 1
  - uuid: cfee6d36-b9f5-4587-885a-cdfddb4f054e
    line: 540
    col: 3
    score: 1
  - uuid: 01b21543-7e03-4129-8fe4-b6306be69dee
    line: 608
    col: 1
    score: 1
  - uuid: 01b21543-7e03-4129-8fe4-b6306be69dee
    line: 608
    col: 3
    score: 1
  - uuid: cdfac40c-00e4-458f-96a7-4c37d0278731
    line: 516
    col: 1
    score: 1
  - uuid: cdfac40c-00e4-458f-96a7-4c37d0278731
    line: 516
    col: 3
    score: 1
  - uuid: cfee6d36-b9f5-4587-885a-cdfddb4f054e
    line: 538
    col: 1
    score: 1
  - uuid: cfee6d36-b9f5-4587-885a-cdfddb4f054e
    line: 538
    col: 3
    score: 1
  - uuid: 63a1cc28-b85c-4ce2-b754-01c2bc0c0bc3
    line: 517
    col: 1
    score: 1
  - uuid: 63a1cc28-b85c-4ce2-b754-01c2bc0c0bc3
    line: 517
    col: 3
    score: 1
  - uuid: c1618c66-f73a-4e04-9bfa-ef38755f7acc
    line: 16
    col: 1
    score: 1
  - uuid: c1618c66-f73a-4e04-9bfa-ef38755f7acc
    line: 16
    col: 3
    score: 1
  - uuid: 6498b9d7-bd35-4bd3-89fb-af1c415c3cd1
    line: 466
    col: 1
    score: 1
  - uuid: 6498b9d7-bd35-4bd3-89fb-af1c415c3cd1
    line: 466
    col: 3
    score: 1
  - uuid: c62a1815-c43b-4a3b-88e6-d7fa008a155e
    line: 394
    col: 1
    score: 1
  - uuid: c62a1815-c43b-4a3b-88e6-d7fa008a155e
    line: 394
    col: 3
    score: 1
  - uuid: 6620e2f2-de6d-45d8-a722-5d26e160b370
    line: 367
    col: 1
    score: 1
  - uuid: 6620e2f2-de6d-45d8-a722-5d26e160b370
    line: 367
    col: 3
    score: 1
  - uuid: cdfac40c-00e4-458f-96a7-4c37d0278731
    line: 518
    col: 1
    score: 1
  - uuid: cdfac40c-00e4-458f-96a7-4c37d0278731
    line: 518
    col: 3
    score: 1
  - uuid: 9a8ab57e-507c-4c6b-aab4-01cea1bc0501
    line: 171
    col: 1
    score: 1
  - uuid: 9a8ab57e-507c-4c6b-aab4-01cea1bc0501
    line: 171
    col: 3
    score: 1
  - uuid: b362e12e-2802-4e41-9a21-6e0c7ad419a2
    line: 171
    col: 1
    score: 1
  - uuid: b362e12e-2802-4e41-9a21-6e0c7ad419a2
    line: 171
    col: 3
    score: 1
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 439
    col: 1
    score: 1
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 439
    col: 3
    score: 1
  - uuid: 0f1f8cc1-b5a6-4307-a40d-78de3adafca2
    line: 406
    col: 1
    score: 1
  - uuid: 0f1f8cc1-b5a6-4307-a40d-78de3adafca2
    line: 406
    col: 3
    score: 1
  - uuid: 618198f4-cfad-4677-9df6-0640d8a97bae
    line: 11
    col: 1
    score: 1
  - uuid: 618198f4-cfad-4677-9df6-0640d8a97bae
    line: 11
    col: 3
    score: 1
  - uuid: 618198f4-cfad-4677-9df6-0640d8a97bae
    line: 14
    col: 1
    score: 1
  - uuid: 618198f4-cfad-4677-9df6-0640d8a97bae
    line: 14
    col: 3
    score: 1
  - uuid: d3e7db72-2e07-4dae-8920-0e07c499a1e5
    line: 297
    col: 1
    score: 1
  - uuid: d3e7db72-2e07-4dae-8920-0e07c499a1e5
    line: 297
    col: 3
    score: 1
---
Ohhh this is fun. Let’s build a **language-agnostic mirror** that keeps N folders (js, ts, lisp, …) in lockstep. We’ll use:

* **Merkle trees** for directories/files/chunks
* **Language-independent IR hashing** (your ANF IR) for *equivalence across languages*
* **Chunk-level** reconciliation (per function/top-level form), not whole files
* A pluggable **adapter system** (JS, TS, Lisp now; add more later)
* A CLI you can run **after a pull/merge** to **rectify** mirrors (and a watch mode if you want)

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

* Each file is parsed into **chunks** (e.g., top-level functions). For each chunk we compute a digest **triple**:
  `rawHash` (bytes), `astHash` (syntax-normalized), `irHash` (**lowered to IR**, canonicalized).
* The **IR hash** lets us prove two chunks in different languages are the *same program*.
* Reconcile rule: **pick the freshest chunk** (by mtime) as authority *per chunk*, regenerate all other languages from IR, write only what changed, stamp provenance.
* If **two languages both changed** the *same chunk* since the last sync → conflict; we show a diff and require a pick (can be “newest wins” if you want).

---

# Drop-in layout

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
```

## 1) Types

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
}
```

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
  return x;
}
```

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

// re-export
import { sha256 } from "./hash"; export { sha256 };
```

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
    // TODO: decode and emit; for now pass through raw
  }
  return `// ${c.name}\n${c.lang === "js" ? "" : ""}${"/* generated */"}`;
}
```

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
  stampProvenance(bytes, info) {
    const header = `// promirror: ir=${info.irRoot ?? "unknown"} at=${new Date(info.at).toISOString()}\n`;
    return header + bytes;
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

function guessFormName(form: any, i: number) {
  // (def name ...) / (define name ...) / (let ((name ...)) ...)
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
  return false;
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
      const latest = variants.reduce((a,b)=> a.mtime>=b.mtime ? a : b);
      const langs = variants.map(v => `${v.lang}@${new Date(v.mtime).toISOString()}`).join(", ");
      console.log(`${id}: latest=${latest.lang} (${new Date(latest.mtime).toLocaleString()}) :: ${langs}`);
    }
  });
} else {
  console.log("Usage: promirror [status|sync]");
}
```

---

# Practical notes

* **IR as anchor.** Don’t trust `rawHash` to compare across languages; the **`irHash`** is the canonical “same program” proof. Your existing lowerer/IR gives this basically for free.
* **Chunking.** Start with top-level functions. Later, add class methods / exports / defmacro forms. For JS/TS you can use Acorn/TS AST to find stable chunk names.
* **Conflicts.** If multiple languages changed the **same chunk** since `provenance.lastSync`, either:

  * pick newest (your stated policy), or
  * mark **conflict** and require manual pick (safe default).
* **Provenance header.** Stamp each generated file with `ir=<hash> at=<time>` in a comment; cheap sanity check for humans.
* **Post-commit rectifier.** Add a git alias or CI step that runs `promirror sync` after merges/pulls. It will reindex and regenerate downstream languages.

---

# Next steps (I can add any/all)

1. **Real IR plumbing** inside the adapters (I sketched stubs to keep this readable). Wire:

   * JS → Lisp reader (or a JS → IR path) → `lower()` → `irHash`
   * IR → JS via `emitJS` and IR → Lisp via your reverse codegen
2. **Better per-file reconstruction**: preserve untouched scaffolding and only replace affected spans (so comments stay).
3. **Conflict UI**: `promirror status --json` with a small TUI to pick winners per chunk.
4. **Watch mode** + **git hook** template.
5. **Tests**: round-trip test harness (JS↔Lisp↔TS) to ensure stability.

Want me to wire the JS and Lisp adapters to your actual IR so `irHash` is 100% real and regeneration works end-to-end?
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
## Related content
- [Lisp-Compiler-Integration](lisp-compiler-integration.md)
- [js-to-lisp-reverse-compiler](js-to-lisp-reverse-compiler.md)
- [Interop and Source Maps](interop-and-source-maps.md)
- [set-assignment-in-lisp-ast](set-assignment-in-lisp-ast.md)
- [Lispy Macros with syntax-rules](lispy-macros-with-syntax-rules.md)
- [archetype-ecs](archetype-ecs.md)
- [universal-intention-code-fabric](universal-intention-code-fabric.md)
- [compiler-kit-foundations](compiler-kit-foundations.md)
- [DSL](chunks/dsl.md)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop](polyglot-s-expr-bridge-python-js-lisp-interop.md)
- [lisp-dsl-for-window-management](lisp-dsl-for-window-management.md)
- [Local-Only-LLM-Workflow](local-only-llm-workflow.md)
- [Dynamic Context Model for Web Components](dynamic-context-model-for-web-components.md)
- [ecs-scheduler-and-prefabs](ecs-scheduler-and-prefabs.md)
- [Performance-Optimized-Polyglot-Bridge](performance-optimized-polyglot-bridge.md)
- [Cross-Target Macro System in Sibilant](cross-target-macro-system-in-sibilant.md)
- [ecs-offload-workers](ecs-offload-workers.md)
- [graph-ds](graph-ds.md)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler](ollama-llm-provider-for-pseudo-code-transpiler.md)
- [JavaScript](chunks/javascript.md)
- [AI-Centric OS with MCP Layer](ai-centric-os-with-mcp-layer.md)
- [AI-First-OS-Model-Context-Protocol](ai-first-os-model-context-protocol.md)
- [balanced-bst](balanced-bst.md)

## Sources
- [compiler-kit-foundations — L610](compiler-kit-foundations.md#L610) (line 610, col 1, score 1)
- [compiler-kit-foundations — L610](compiler-kit-foundations.md#L610) (line 610, col 3, score 1)
- [Interop and Source Maps — L515](interop-and-source-maps.md#L515) (line 515, col 1, score 1)
- [Interop and Source Maps — L515](interop-and-source-maps.md#L515) (line 515, col 3, score 1)
- [js-to-lisp-reverse-compiler — L423](js-to-lisp-reverse-compiler.md#L423) (line 423, col 1, score 1)
- [js-to-lisp-reverse-compiler — L423](js-to-lisp-reverse-compiler.md#L423) (line 423, col 3, score 1)
- [lisp-dsl-for-window-management — L220](lisp-dsl-for-window-management.md#L220) (line 220, col 1, score 1)
- [lisp-dsl-for-window-management — L220](lisp-dsl-for-window-management.md#L220) (line 220, col 3, score 1)
- [Cross-Target Macro System in Sibilant — L179](cross-target-macro-system-in-sibilant.md#L179) (line 179, col 1, score 1)
- [Cross-Target Macro System in Sibilant — L179](cross-target-macro-system-in-sibilant.md#L179) (line 179, col 3, score 1)
- [Dynamic Context Model for Web Components — L389](dynamic-context-model-for-web-components.md#L389) (line 389, col 1, score 1)
- [Dynamic Context Model for Web Components — L389](dynamic-context-model-for-web-components.md#L389) (line 389, col 3, score 1)
- [Interop and Source Maps — L522](interop-and-source-maps.md#L522) (line 522, col 1, score 1)
- [Interop and Source Maps — L522](interop-and-source-maps.md#L522) (line 522, col 3, score 1)
- [Lisp-Compiler-Integration — L547](lisp-compiler-integration.md#L547) (line 547, col 1, score 1)
- [Lisp-Compiler-Integration — L547](lisp-compiler-integration.md#L547) (line 547, col 3, score 1)
- [DSL — L11](chunks/dsl.md#L11) (line 11, col 1, score 1)
- [DSL — L11](chunks/dsl.md#L11) (line 11, col 3, score 1)
- [compiler-kit-foundations — L606](compiler-kit-foundations.md#L606) (line 606, col 1, score 1)
- [compiler-kit-foundations — L606](compiler-kit-foundations.md#L606) (line 606, col 3, score 1)
- [js-to-lisp-reverse-compiler — L422](js-to-lisp-reverse-compiler.md#L422) (line 422, col 1, score 1)
- [js-to-lisp-reverse-compiler — L422](js-to-lisp-reverse-compiler.md#L422) (line 422, col 3, score 1)
- [Lisp-Compiler-Integration — L537](lisp-compiler-integration.md#L537) (line 537, col 1, score 1)
- [Lisp-Compiler-Integration — L537](lisp-compiler-integration.md#L537) (line 537, col 3, score 1)
- [compiler-kit-foundations — L607](compiler-kit-foundations.md#L607) (line 607, col 1, score 1)
- [compiler-kit-foundations — L607](compiler-kit-foundations.md#L607) (line 607, col 3, score 1)
- [Interop and Source Maps — L514](interop-and-source-maps.md#L514) (line 514, col 1, score 1)
- [Interop and Source Maps — L514](interop-and-source-maps.md#L514) (line 514, col 3, score 1)
- [js-to-lisp-reverse-compiler — L411](js-to-lisp-reverse-compiler.md#L411) (line 411, col 1, score 1)
- [js-to-lisp-reverse-compiler — L411](js-to-lisp-reverse-compiler.md#L411) (line 411, col 3, score 1)
- [Lisp-Compiler-Integration — L540](lisp-compiler-integration.md#L540) (line 540, col 1, score 1)
- [Lisp-Compiler-Integration — L540](lisp-compiler-integration.md#L540) (line 540, col 3, score 1)
- [compiler-kit-foundations — L608](compiler-kit-foundations.md#L608) (line 608, col 1, score 1)
- [compiler-kit-foundations — L608](compiler-kit-foundations.md#L608) (line 608, col 3, score 1)
- [Interop and Source Maps — L516](interop-and-source-maps.md#L516) (line 516, col 1, score 1)
- [Interop and Source Maps — L516](interop-and-source-maps.md#L516) (line 516, col 3, score 1)
- [Lisp-Compiler-Integration — L538](lisp-compiler-integration.md#L538) (line 538, col 1, score 1)
- [Lisp-Compiler-Integration — L538](lisp-compiler-integration.md#L538) (line 538, col 3, score 1)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L517](polyglot-s-expr-bridge-python-js-lisp-interop.md#L517) (line 517, col 1, score 1)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L517](polyglot-s-expr-bridge-python-js-lisp-interop.md#L517) (line 517, col 3, score 1)
- [JavaScript — L16](chunks/javascript.md#L16) (line 16, col 1, score 1)
- [JavaScript — L16](chunks/javascript.md#L16) (line 16, col 3, score 1)
- [ecs-offload-workers — L466](ecs-offload-workers.md#L466) (line 466, col 1, score 1)
- [ecs-offload-workers — L466](ecs-offload-workers.md#L466) (line 466, col 3, score 1)
- [ecs-scheduler-and-prefabs — L394](ecs-scheduler-and-prefabs.md#L394) (line 394, col 1, score 1)
- [ecs-scheduler-and-prefabs — L394](ecs-scheduler-and-prefabs.md#L394) (line 394, col 3, score 1)
- [graph-ds — L367](graph-ds.md#L367) (line 367, col 1, score 1)
- [graph-ds — L367](graph-ds.md#L367) (line 367, col 3, score 1)
- [Interop and Source Maps — L518](interop-and-source-maps.md#L518) (line 518, col 1, score 1)
- [Interop and Source Maps — L518](interop-and-source-maps.md#L518) (line 518, col 3, score 1)
- [Local-Only-LLM-Workflow — L171](local-only-llm-workflow.md#L171) (line 171, col 1, score 1)
- [Local-Only-LLM-Workflow — L171](local-only-llm-workflow.md#L171) (line 171, col 3, score 1)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L171](ollama-llm-provider-for-pseudo-code-transpiler.md#L171) (line 171, col 1, score 1)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L171](ollama-llm-provider-for-pseudo-code-transpiler.md#L171) (line 171, col 3, score 1)
- [Performance-Optimized-Polyglot-Bridge — L439](performance-optimized-polyglot-bridge.md#L439) (line 439, col 1, score 1)
- [Performance-Optimized-Polyglot-Bridge — L439](performance-optimized-polyglot-bridge.md#L439) (line 439, col 3, score 1)
- [AI-Centric OS with MCP Layer — L406](ai-centric-os-with-mcp-layer.md#L406) (line 406, col 1, score 1)
- [AI-Centric OS with MCP Layer — L406](ai-centric-os-with-mcp-layer.md#L406) (line 406, col 3, score 1)
- [AI-First-OS-Model-Context-Protocol — L11](ai-first-os-model-context-protocol.md#L11) (line 11, col 1, score 1)
- [AI-First-OS-Model-Context-Protocol — L11](ai-first-os-model-context-protocol.md#L11) (line 11, col 3, score 1)
- [AI-First-OS-Model-Context-Protocol — L14](ai-first-os-model-context-protocol.md#L14) (line 14, col 1, score 1)
- [AI-First-OS-Model-Context-Protocol — L14](ai-first-os-model-context-protocol.md#L14) (line 14, col 3, score 1)
- [balanced-bst — L297](balanced-bst.md#L297) (line 297, col 1, score 1)
- [balanced-bst — L297](balanced-bst.md#L297) (line 297, col 3, score 1)
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->

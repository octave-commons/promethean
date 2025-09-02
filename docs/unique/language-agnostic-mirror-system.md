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
related_to_title: []
related_to_uuid: []
references: []
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
^ref-d2b3628c-127-0

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
Want me to wire the JS and Lisp adapters to your actual IR so `irHash` is 100% real and regeneration works end-to-end?<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
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
- [Agent Tasks: Persistence Migration to DualStore](agent-tasks-persistence-migration-to-dualstore.md)
- [aionian-circuit-math](aionian-circuit-math.md)
- [Window Management](chunks/window-management.md)
- [Diagrams](chunks/diagrams.md)
- [Admin Dashboard for User Management](admin-dashboard-for-user-management.md)
- [Cross-Language Runtime Polymorphism](cross-language-runtime-polymorphism.md)
- [api-gateway-versioning](api-gateway-versioning.md)
- [Agent Reflections and Prompt Evolution](agent-reflections-and-prompt-evolution.md)
- [Board Automation Improvements](board-automation-improvements.md)
- [Operations](chunks/operations.md)
- [Chroma Toolkit Consolidation Plan](chroma-toolkit-consolidation-plan.md)
- [Board Walk – 2025-08-11](board-walk-2025-08-11.md)
- [2d-sandbox-field](2d-sandbox-field.md)
- [refactor-relations](refactor-relations.md)
- [Sibilant Meta-Prompt DSL](sibilant-meta-prompt-dsl.md)
- [System Scheduler with Resource-Aware DAG](system-scheduler-with-resource-aware-dag.md)
- [template-based-compilation](template-based-compilation.md)
- [typed-struct-compiler](typed-struct-compiler.md)
- [sibilant-macro-targets](sibilant-macro-targets.md)
- [State Snapshots API and Transactional Projector](state-snapshots-api-and-transactional-projector.md)
- [sibilant-meta-string-templating-runtime](sibilant-meta-string-templating-runtime.md)
- [ts-to-lisp-transpiler](ts-to-lisp-transpiler.md)
- [eidolon-field-math-foundations](eidolon-field-math-foundations.md)
- [i3-config-validation-methods](i3-config-validation-methods.md)
- [sibilant-metacompiler-overview](sibilant-metacompiler-overview.md)
- [Math Fundamentals](chunks/math-fundamentals.md)
- [Services](chunks/services.md)
- [Event Bus MVP](event-bus-mvp.md)
- [Debugging Broker Connections and Agent Behavior](debugging-broker-connections-and-agent-behavior.md)
- [Shared](chunks/shared.md)
- [Simulation Demo](chunks/simulation-demo.md)
- [Tooling](chunks/tooling.md)
- [Local-First Intention→Code Loop with Free Models](local-first-intention-code-loop-with-free-models.md)
- [Duck's Self-Referential Perceptual Loop](ducks-self-referential-perceptual-loop.md)
- [Promethean Agent Config DSL](promethean-agent-config-dsl.md)
- [field-dynamics-math-blocks](field-dynamics-math-blocks.md)
- [Exception Layer Analysis](exception-layer-analysis.md)
- [field-interaction-equations](field-interaction-equations.md)
- [field-node-diagram-outline](field-node-diagram-outline.md)
- [Factorio AI with External Agents](factorio-ai-with-external-agents.md)
- [Event Bus Projections Architecture](event-bus-projections-architecture.md)
- [eidolon-node-lifecycle](eidolon-node-lifecycle.md)
- [EidolonField](eidolonfield.md)
- [Eidolon Field Abstract Model](eidolon-field-abstract-model.md)
- [Prompt_Folder_Bootstrap](prompt-folder-bootstrap.md)
- [Duck's Attractor States](ducks-attractor-states.md)
- [Promethean-native config design](promethean-native-config-design.md)
- [Promethean Event Bus MVP v0.1](promethean-event-bus-mvp-v0-1.md)
- [Promethean Infrastructure Setup](promethean-infrastructure-setup.md)
- [Promethean Web UI Setup](promethean-web-ui-setup.md)
- [prompt-programming-language-lisp](prompt-programming-language-lisp.md)
- [field-node-diagram-visualizations](field-node-diagram-visualizations.md)
- [field-node-diagram-set](field-node-diagram-set.md)
- [heartbeat-fragment-demo](heartbeat-fragment-demo.md)
- [heartbeat-simulation-snippets](heartbeat-simulation-snippets.md)
- [Post-Linguistic Transhuman Design Frameworks](post-linguistic-transhuman-design-frameworks.md)
- [Creative Moments](creative-moments.md)
- [Promethean_Eidolon_Synchronicity_Model](promethean-eidolon-synchronicity-model.md)
- [promethean-system-diagrams](promethean-system-diagrams.md)
- [DuckDuckGoSearchPipeline](duckduckgosearchpipeline.md)
- [Promethean Chat Activity Report](promethean-chat-activity-report.md)
- [Canonical Org-Babel Matplotlib Animation Template](canonical-org-babel-matplotlib-animation-template.md)
- [mystery-lisp-search-session](mystery-lisp-search-session.md)
- [observability-infrastructure-setup](observability-infrastructure-setup.md)
- [Mongo Outbox Implementation](mongo-outbox-implementation.md)
- [plan-update-confirmation](plan-update-confirmation.md)
- [markdown-to-org-transpiler](markdown-to-org-transpiler.md)
- [Local-Offline-Model-Deployment-Strategy](local-offline-model-deployment-strategy.md)
- [Migrate to Provider-Tenant Architecture](migrate-to-provider-tenant-architecture.md)
- [ParticleSimulationWithCanvasAndFFmpeg](particlesimulationwithcanvasandffmpeg.md)
- [Model Selection for Lightweight Conversational Tasks](model-selection-for-lightweight-conversational-tasks.md)
- [Obsidian ChatGPT Plugin Integration](obsidian-chatgpt-plugin-integration.md)
- [Obsidian Templating Plugins Integration Guide](obsidian-templating-plugins-integration-guide.md)
- [Protocol_0_The_Contradiction_Engine](protocol-0-the-contradiction-engine.md)
- [Model Upgrade Calm-Down Guide](model-upgrade-calm-down-guide.md)
- [NPU Voice Code and Sensory Integration](npu-voice-code-and-sensory-integration.md)
- [OpenAPI Validation Report](openapi-validation-report.md)
- [Optimizing Command Limitations in System Design](optimizing-command-limitations-in-system-design.md)
- [pm2-orchestration-patterns](pm2-orchestration-patterns.md)
- [Mindful Prioritization](mindful-prioritization.md)
- [MindfulRobotIntegration](mindfulrobotintegration.md)
- [Obsidian ChatGPT Plugin Integration Guide](obsidian-chatgpt-plugin-integration-guide.md)
- [polymorphic-meta-programming-engine](polymorphic-meta-programming-engine.md)
- [Per-Domain Policy System for JS Crawler](per-domain-policy-system-for-js-crawler.md)
- [Functional Refactor of TypeScript Document Processing](functional-refactor-of-typescript-document-processing.md)
- [Chroma-Embedding-Refactor](chroma-embedding-refactor.md)
- [obsidian-ignore-node-modules-regex](obsidian-ignore-node-modules-regex.md)
- [Shared Package Structure](shared-package-structure.md)
- [schema-evolution-workflow](schema-evolution-workflow.md)
- [ripple-propagation-demo](ripple-propagation-demo.md)
- [Pure-Node Crawl Stack with Playwright and Crawlee](pure-node-crawl-stack-with-playwright-and-crawlee.md)
- [Provider-Agnostic Chat Panel Implementation](provider-agnostic-chat-panel-implementation.md)
- [zero-copy-snapshots-and-workers](zero-copy-snapshots-and-workers.md)
- [layer-1-uptime-diagrams](layer-1-uptime-diagrams.md)
- [Promethean Workflow Optimization](promethean-workflow-optimization.md)
- [Prometheus Observability Stack](prometheus-observability-stack.md)
- [RAG UI Panel with Qdrant and PostgREST](rag-ui-panel-with-qdrant-and-postgrest.md)
- [shared-package-layout-clarification](shared-package-layout-clarification.md)
- [Pure TypeScript Search Microservice](pure-typescript-search-microservice.md)
- [Self-Agency in AI Interaction](self-agency-in-ai-interaction.md)
- [Promethean Pipelines: Local TypeScript-First Workflow](promethean-pipelines-local-typescript-first-workflow.md)
- [Promethean Pipelines](promethean-pipelines.md)
- [Promethean Documentation Pipeline Overview](promethean-documentation-pipeline-overview.md)
- [Functional Embedding Pipeline Refactor](functional-embedding-pipeline-refactor.md)
- [Redirecting Standard Error](redirecting-standard-error.md)
- [Promethean-Copilot-Intent-Engine](promethean-copilot-intent-engine.md)
- [Refactor Frontmatter Processing](refactor-frontmatter-processing.md)
- [prom-lib-rate-limiters-and-replay-api](prom-lib-rate-limiters-and-replay-api.md)
- [Stateful Partitions and Rebalancing](stateful-partitions-and-rebalancing.md)
- [Promethean Agent DSL TS Scaffold](promethean-agent-dsl-ts-scaffold.md)
- [Promethean State Format](promethean-state-format.md)
- [WebSocket Gateway Implementation](websocket-gateway-implementation.md)
- [polyglot-repl-interface-layer](polyglot-repl-interface-layer.md)
- [Universal Lisp Interface](universal-lisp-interface.md)
- [TypeScript Patch for Tool Calling Support](typescript-patch-for-tool-calling-support.md)
- [i3-bluetooth-setup](i3-bluetooth-setup.md)
- [Matplotlib Animation with Async Execution](matplotlib-animation-with-async-execution.md)
- [Recursive Prompt Construction Engine](recursive-prompt-construction-engine.md)
- [Vectorial Exception Descent](vectorial-exception-descent.md)
## Sources
- [Local-Only-LLM-Workflow — L167](local-only-llm-workflow.md#^ref-9a8ab57e-167-0) (line 167, col 0, score 0.66)
- [js-to-lisp-reverse-compiler — L1](js-to-lisp-reverse-compiler.md#^ref-58191024-1-0) (line 1, col 0, score 0.63)
- [Lispy Macros with syntax-rules — L1](lispy-macros-with-syntax-rules.md#^ref-cbfe3513-1-0) (line 1, col 0, score 0.71)
- [Universal Lisp Interface — L3](universal-lisp-interface.md#^ref-b01856b4-3-0) (line 3, col 0, score 0.67)
- [js-to-lisp-reverse-compiler — L406](js-to-lisp-reverse-compiler.md#^ref-58191024-406-0) (line 406, col 0, score 0.65)
- [Interop and Source Maps — L3](interop-and-source-maps.md#^ref-cdfac40c-3-0) (line 3, col 0, score 0.65)
- [polymorphic-meta-programming-engine — L149](polymorphic-meta-programming-engine.md#^ref-7bed0b9a-149-0) (line 149, col 0, score 0.68)
- [mystery-lisp-search-session — L97](mystery-lisp-search-session.md#^ref-513dc4c7-97-0) (line 97, col 0, score 0.66)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L1](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-1-0) (line 1, col 0, score 0.64)
- [universal-intention-code-fabric — L1](universal-intention-code-fabric.md#^ref-c14edce7-1-0) (line 1, col 0, score 0.62)
- [compiler-kit-foundations — L3](compiler-kit-foundations.md#^ref-01b21543-3-0) (line 3, col 0, score 0.67)
- [Lisp-Compiler-Integration — L1](lisp-compiler-integration.md#^ref-cfee6d36-1-0) (line 1, col 0, score 0.64)
- [Per-Domain Policy System for JS Crawler — L1](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-1-0) (line 1, col 0, score 0.65)
- [Universal Lisp Interface — L188](universal-lisp-interface.md#^ref-b01856b4-188-0) (line 188, col 0, score 0.65)
- [Dynamic Context Model for Web Components — L313](dynamic-context-model-for-web-components.md#^ref-f7702bf8-313-0) (line 313, col 0, score 0.72)
- [Promethean Documentation Pipeline Overview — L28](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-28-0) (line 28, col 0, score 0.66)
- [prom-lib-rate-limiters-and-replay-api — L256](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-256-0) (line 256, col 0, score 0.64)
- [Dynamic Context Model for Web Components — L23](dynamic-context-model-for-web-components.md#^ref-f7702bf8-23-0) (line 23, col 0, score 0.63)
- [Agent Tasks: Persistence Migration to DualStore — L7](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-7-0) (line 7, col 0, score 0.63)
- [Admin Dashboard for User Management — L26](admin-dashboard-for-user-management.md#^ref-2901a3e9-26-0) (line 26, col 0, score 0.63)
- [Prompt_Folder_Bootstrap — L145](prompt-folder-bootstrap.md#^ref-bd4f0976-145-0) (line 145, col 0, score 0.62)
- [Promethean Documentation Pipeline Overview — L25](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-25-0) (line 25, col 0, score 0.62)
- [Dynamic Context Model for Web Components — L165](dynamic-context-model-for-web-components.md#^ref-f7702bf8-165-0) (line 165, col 0, score 0.61)
- [Math Fundamentals — L34](chunks/math-fundamentals.md#^ref-c6e87433-34-0) (line 34, col 0, score 1)
- [Services — L22](chunks/services.md#^ref-75ea4a6a-22-0) (line 22, col 0, score 1)
- [Shared — L29](chunks/shared.md#^ref-623a55f7-29-0) (line 29, col 0, score 1)
- [Simulation Demo — L23](chunks/simulation-demo.md#^ref-557309a3-23-0) (line 23, col 0, score 1)
- [Tooling — L16](chunks/tooling.md#^ref-6cb4943e-16-0) (line 16, col 0, score 1)
- [Window Management — L25](chunks/window-management.md#^ref-9e8ae388-25-0) (line 25, col 0, score 1)
- [compiler-kit-foundations — L627](compiler-kit-foundations.md#^ref-01b21543-627-0) (line 627, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L171](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-171-0) (line 171, col 0, score 1)
- [Duck's Attractor States — L81](ducks-attractor-states.md#^ref-13951643-81-0) (line 81, col 0, score 1)
- [Functional Refactor of TypeScript Document Processing — L113](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-113-0) (line 113, col 0, score 0.65)
- [Functional Embedding Pipeline Refactor — L303](functional-embedding-pipeline-refactor.md#^ref-a4a25141-303-0) (line 303, col 0, score 0.59)
- [Dynamic Context Model for Web Components — L37](dynamic-context-model-for-web-components.md#^ref-f7702bf8-37-0) (line 37, col 0, score 0.63)
- [Dynamic Context Model for Web Components — L311](dynamic-context-model-for-web-components.md#^ref-f7702bf8-311-0) (line 311, col 0, score 0.65)
- [Functional Embedding Pipeline Refactor — L11](functional-embedding-pipeline-refactor.md#^ref-a4a25141-11-0) (line 11, col 0, score 0.66)
- [Promethean-native config design — L51](promethean-native-config-design.md#^ref-ab748541-51-0) (line 51, col 0, score 0.61)
- [Agent Reflections and Prompt Evolution — L28](agent-reflections-and-prompt-evolution.md#^ref-bb7f0835-28-0) (line 28, col 0, score 0.66)
- [refactor-relations — L10](refactor-relations.md#^ref-41ce0216-10-0) (line 10, col 0, score 0.71)
- [Recursive Prompt Construction Engine — L137](recursive-prompt-construction-engine.md#^ref-babdb9eb-137-0) (line 137, col 0, score 0.6)
- [mystery-lisp-search-session — L78](mystery-lisp-search-session.md#^ref-513dc4c7-78-0) (line 78, col 0, score 0.7)
- [Lispy Macros with syntax-rules — L317](lispy-macros-with-syntax-rules.md#^ref-cbfe3513-317-0) (line 317, col 0, score 0.7)
- [Sibilant Meta-Prompt DSL — L1](sibilant-meta-prompt-dsl.md#^ref-af5d2824-1-0) (line 1, col 0, score 0.68)
- [Lispy Macros with syntax-rules — L319](lispy-macros-with-syntax-rules.md#^ref-cbfe3513-319-0) (line 319, col 0, score 0.65)
- [DSL — L12](chunks/dsl.md#^ref-e87bc036-12-0) (line 12, col 0, score 0.67)
- [Local-First Intention→Code Loop with Free Models — L139](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-139-0) (line 139, col 0, score 0.66)
- [i3-bluetooth-setup — L74](i3-bluetooth-setup.md#^ref-5e408692-74-0) (line 74, col 0, score 0.66)
- [universal-intention-code-fabric — L383](universal-intention-code-fabric.md#^ref-c14edce7-383-0) (line 383, col 0, score 0.68)
- [Chroma Toolkit Consolidation Plan — L148](chroma-toolkit-consolidation-plan.md#^ref-5020e892-148-0) (line 148, col 0, score 0.6)
- [aionian-circuit-math — L110](aionian-circuit-math.md#^ref-f2d83a77-110-0) (line 110, col 0, score 0.63)
- [Dynamic Context Model for Web Components — L147](dynamic-context-model-for-web-components.md#^ref-f7702bf8-147-0) (line 147, col 0, score 0.63)
- [universal-intention-code-fabric — L382](universal-intention-code-fabric.md#^ref-c14edce7-382-0) (line 382, col 0, score 0.67)
- [Universal Lisp Interface — L73](universal-lisp-interface.md#^ref-b01856b4-73-0) (line 73, col 0, score 0.62)
- [universal-intention-code-fabric — L26](universal-intention-code-fabric.md#^ref-c14edce7-26-0) (line 26, col 0, score 0.68)
- [archetype-ecs — L423](archetype-ecs.md#^ref-8f4c1e86-423-0) (line 423, col 0, score 0.81)
- [ecs-scheduler-and-prefabs — L352](ecs-scheduler-and-prefabs.md#^ref-c62a1815-352-0) (line 352, col 0, score 0.77)
- [System Scheduler with Resource-Aware DAG — L350](system-scheduler-with-resource-aware-dag.md#^ref-ba244286-350-0) (line 350, col 0, score 0.77)
- [Promethean Pipelines: Local TypeScript-First Workflow — L219](promethean-pipelines-local-typescript-first-workflow.md#^ref-6b63edca-219-0) (line 219, col 0, score 0.77)
- [Promethean Pipelines — L58](promethean-pipelines.md#^ref-8b8e6103-58-0) (line 58, col 0, score 0.75)
- [Lisp-Compiler-Integration — L13](lisp-compiler-integration.md#^ref-cfee6d36-13-0) (line 13, col 0, score 0.67)
- [universal-intention-code-fabric — L9](universal-intention-code-fabric.md#^ref-c14edce7-9-0) (line 9, col 0, score 0.73)
- [RAG UI Panel with Qdrant and PostgREST — L336](rag-ui-panel-with-qdrant-and-postgrest.md#^ref-e1056831-336-0) (line 336, col 0, score 0.73)
- [Duck's Attractor States — L5](ducks-attractor-states.md#^ref-13951643-5-0) (line 5, col 0, score 0.73)
- [Promethean Documentation Pipeline Overview — L78](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-78-0) (line 78, col 0, score 0.73)
- [Promethean Event Bus MVP v0.1 — L832](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-832-0) (line 832, col 0, score 0.72)
- [Promethean Infrastructure Setup — L501](promethean-infrastructure-setup.md#^ref-6deed6ac-501-0) (line 501, col 0, score 0.72)
- [Redirecting Standard Error — L7](redirecting-standard-error.md#^ref-b3555ede-7-0) (line 7, col 0, score 0.71)
- [compiler-kit-foundations — L15](compiler-kit-foundations.md#^ref-01b21543-15-0) (line 15, col 0, score 0.71)
- [Stateful Partitions and Rebalancing — L187](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-187-0) (line 187, col 0, score 0.7)
- [Promethean Web UI Setup — L581](promethean-web-ui-setup.md#^ref-bc5172ca-581-0) (line 581, col 0, score 0.69)
- [Board Walk – 2025-08-11 — L101](board-walk-2025-08-11.md#^ref-7aa1eb92-101-0) (line 101, col 0, score 0.65)
- [Performance-Optimized-Polyglot-Bridge — L22](performance-optimized-polyglot-bridge.md#^ref-f5579967-22-0) (line 22, col 0, score 0.64)
- [Functional Refactor of TypeScript Document Processing — L5](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-5-0) (line 5, col 0, score 0.7)
- [Promethean-Copilot-Intent-Engine — L29](promethean-copilot-intent-engine.md#^ref-ae24a280-29-0) (line 29, col 0, score 0.63)
- [template-based-compilation — L90](template-based-compilation.md#^ref-f8877e5e-90-0) (line 90, col 0, score 0.62)
- [archetype-ecs — L418](archetype-ecs.md#^ref-8f4c1e86-418-0) (line 418, col 0, score 0.65)
- [universal-intention-code-fabric — L419](universal-intention-code-fabric.md#^ref-c14edce7-419-0) (line 419, col 0, score 0.6)
- [universal-intention-code-fabric — L27](universal-intention-code-fabric.md#^ref-c14edce7-27-0) (line 27, col 0, score 0.55)
- [Functional Embedding Pipeline Refactor — L302](functional-embedding-pipeline-refactor.md#^ref-a4a25141-302-0) (line 302, col 0, score 0.69)
- [Promethean State Format — L27](promethean-state-format.md#^ref-23df6ddb-27-0) (line 27, col 0, score 0.69)
- [universal-intention-code-fabric — L393](universal-intention-code-fabric.md#^ref-c14edce7-393-0) (line 393, col 0, score 0.65)
- [Promethean-Copilot-Intent-Engine — L32](promethean-copilot-intent-engine.md#^ref-ae24a280-32-0) (line 32, col 0, score 0.7)
- [Agent Tasks: Persistence Migration to DualStore — L84](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-84-0) (line 84, col 0, score 0.65)
- [Promethean Event Bus MVP v0.1 — L395](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-395-0) (line 395, col 0, score 0.78)
- [universal-intention-code-fabric — L53](universal-intention-code-fabric.md#^ref-c14edce7-53-0) (line 53, col 0, score 0.76)
- [shared-package-layout-clarification — L161](shared-package-layout-clarification.md#^ref-36c8882a-161-0) (line 161, col 0, score 0.72)
- [Shared Package Structure — L159](shared-package-structure.md#^ref-66a72fc3-159-0) (line 159, col 0, score 0.69)
- [Promethean-native config design — L90](promethean-native-config-design.md#^ref-ab748541-90-0) (line 90, col 0, score 0.69)
- [Chroma-Embedding-Refactor — L311](chroma-embedding-refactor.md#^ref-8b256935-311-0) (line 311, col 0, score 0.68)
- [Event Bus MVP — L7](event-bus-mvp.md#^ref-534fe91d-7-0) (line 7, col 0, score 0.66)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L352](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-352-0) (line 352, col 0, score 0.67)
- [js-to-lisp-reverse-compiler — L380](js-to-lisp-reverse-compiler.md#^ref-58191024-380-0) (line 380, col 0, score 0.67)
- [Lispy Macros with syntax-rules — L393](lispy-macros-with-syntax-rules.md#^ref-cbfe3513-393-0) (line 393, col 0, score 0.66)
- [compiler-kit-foundations — L140](compiler-kit-foundations.md#^ref-01b21543-140-0) (line 140, col 0, score 0.68)
- [compiler-kit-foundations — L324](compiler-kit-foundations.md#^ref-01b21543-324-0) (line 324, col 0, score 0.63)
- [compiler-kit-foundations — L31](compiler-kit-foundations.md#^ref-01b21543-31-0) (line 31, col 0, score 0.68)
- [schema-evolution-workflow — L146](schema-evolution-workflow.md#^ref-d8059b6a-146-0) (line 146, col 0, score 0.71)
- [Interop and Source Maps — L85](interop-and-source-maps.md#^ref-cdfac40c-85-0) (line 85, col 0, score 0.69)
- [Lisp-Compiler-Integration — L440](lisp-compiler-integration.md#^ref-cfee6d36-440-0) (line 440, col 0, score 0.65)
- [universal-intention-code-fabric — L68](universal-intention-code-fabric.md#^ref-c14edce7-68-0) (line 68, col 0, score 0.7)
- [prom-lib-rate-limiters-and-replay-api — L186](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-186-0) (line 186, col 0, score 0.7)
- [js-to-lisp-reverse-compiler — L13](js-to-lisp-reverse-compiler.md#^ref-58191024-13-0) (line 13, col 0, score 0.63)
- [Promethean Event Bus MVP v0.1 — L423](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-423-0) (line 423, col 0, score 0.69)
- [Interop and Source Maps — L421](interop-and-source-maps.md#^ref-cdfac40c-421-0) (line 421, col 0, score 0.82)
- [WebSocket Gateway Implementation — L447](websocket-gateway-implementation.md#^ref-e811123d-447-0) (line 447, col 0, score 0.69)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L336](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-336-0) (line 336, col 0, score 0.65)
- [TypeScript Patch for Tool Calling Support — L9](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-9-0) (line 9, col 0, score 0.66)
- [Promethean Event Bus MVP v0.1 — L28](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-28-0) (line 28, col 0, score 0.58)
- [Functional Refactor of TypeScript Document Processing — L115](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-115-0) (line 115, col 0, score 0.63)
- [typed-struct-compiler — L16](typed-struct-compiler.md#^ref-78eeedf7-16-0) (line 16, col 0, score 0.58)
- [Promethean Event Bus MVP v0.1 — L497](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-497-0) (line 497, col 0, score 0.6)
- [Promethean Agent DSL TS Scaffold — L223](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-223-0) (line 223, col 0, score 0.65)
- [Stateful Partitions and Rebalancing — L11](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-11-0) (line 11, col 0, score 0.65)
- [Performance-Optimized-Polyglot-Bridge — L170](performance-optimized-polyglot-bridge.md#^ref-f5579967-170-0) (line 170, col 0, score 0.67)
- [observability-infrastructure-setup — L189](observability-infrastructure-setup.md#^ref-b4e64f8c-189-0) (line 189, col 0, score 0.65)
- [Chroma-Embedding-Refactor — L66](chroma-embedding-refactor.md#^ref-8b256935-66-0) (line 66, col 0, score 0.65)
- [Promethean Documentation Pipeline Overview — L16](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-16-0) (line 16, col 0, score 0.71)
- [sibilant-macro-targets — L127](sibilant-macro-targets.md#^ref-c5c9a5c6-127-0) (line 127, col 0, score 0.69)
- [polyglot-repl-interface-layer — L96](polyglot-repl-interface-layer.md#^ref-9c79206d-96-0) (line 96, col 0, score 0.68)
- [Chroma-Embedding-Refactor — L111](chroma-embedding-refactor.md#^ref-8b256935-111-0) (line 111, col 0, score 0.66)
- [ripple-propagation-demo — L36](ripple-propagation-demo.md#^ref-8430617b-36-0) (line 36, col 0, score 0.67)
- [ripple-propagation-demo — L52](ripple-propagation-demo.md#^ref-8430617b-52-0) (line 52, col 0, score 0.67)
- [Stateful Partitions and Rebalancing — L351](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-351-0) (line 351, col 0, score 0.69)
- [Local-First Intention→Code Loop with Free Models — L23](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-23-0) (line 23, col 0, score 0.63)
- [State Snapshots API and Transactional Projector — L9](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-9-0) (line 9, col 0, score 0.71)
- [Promethean Agent DSL TS Scaffold — L160](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-160-0) (line 160, col 0, score 0.69)
- [Pure-Node Crawl Stack with Playwright and Crawlee — L178](pure-node-crawl-stack-with-playwright-and-crawlee.md#^ref-d527c05d-178-0) (line 178, col 0, score 0.67)
- [universal-intention-code-fabric — L252](universal-intention-code-fabric.md#^ref-c14edce7-252-0) (line 252, col 0, score 0.67)
- [ecs-offload-workers — L187](ecs-offload-workers.md#^ref-6498b9d7-187-0) (line 187, col 0, score 0.68)
- [schema-evolution-workflow — L9](schema-evolution-workflow.md#^ref-d8059b6a-9-0) (line 9, col 0, score 0.68)
- [Promethean Web UI Setup — L351](promethean-web-ui-setup.md#^ref-bc5172ca-351-0) (line 351, col 0, score 0.67)
- [Per-Domain Policy System for JS Crawler — L141](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-141-0) (line 141, col 0, score 0.68)
- [prom-lib-rate-limiters-and-replay-api — L106](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-106-0) (line 106, col 0, score 0.59)
- [Mongo Outbox Implementation — L381](mongo-outbox-implementation.md#^ref-9c1acd1e-381-0) (line 381, col 0, score 0.72)
- [universal-intention-code-fabric — L186](universal-intention-code-fabric.md#^ref-c14edce7-186-0) (line 186, col 0, score 0.68)
- [Chroma-Embedding-Refactor — L260](chroma-embedding-refactor.md#^ref-8b256935-260-0) (line 260, col 0, score 0.71)
- [plan-update-confirmation — L650](plan-update-confirmation.md#^ref-b22d79c6-650-0) (line 650, col 0, score 0.69)
- [plan-update-confirmation — L662](plan-update-confirmation.md#^ref-b22d79c6-662-0) (line 662, col 0, score 0.69)
- [plan-update-confirmation — L674](plan-update-confirmation.md#^ref-b22d79c6-674-0) (line 674, col 0, score 0.69)
- [Promethean Event Bus MVP v0.1 — L380](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-380-0) (line 380, col 0, score 0.68)
- [Promethean Event Bus MVP v0.1 — L474](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-474-0) (line 474, col 0, score 0.68)
- [Promethean Agent DSL TS Scaffold — L186](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-186-0) (line 186, col 0, score 0.68)
- [Event Bus MVP — L457](event-bus-mvp.md#^ref-534fe91d-457-0) (line 457, col 0, score 0.68)
- [Lispy Macros with syntax-rules — L3](lispy-macros-with-syntax-rules.md#^ref-cbfe3513-3-0) (line 3, col 0, score 0.77)
- [sibilant-macro-targets — L1](sibilant-macro-targets.md#^ref-c5c9a5c6-1-0) (line 1, col 0, score 0.73)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L332](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-332-0) (line 332, col 0, score 0.67)
- [Pure TypeScript Search Microservice — L139](pure-typescript-search-microservice.md#^ref-d17d3a96-139-0) (line 139, col 0, score 0.67)
- [Promethean Web UI Setup — L298](promethean-web-ui-setup.md#^ref-bc5172ca-298-0) (line 298, col 0, score 0.66)
- [sibilant-meta-string-templating-runtime — L33](sibilant-meta-string-templating-runtime.md#^ref-2aafc801-33-0) (line 33, col 0, score 0.65)
- [Sibilant Meta-Prompt DSL — L137](sibilant-meta-prompt-dsl.md#^ref-af5d2824-137-0) (line 137, col 0, score 0.65)
- [aionian-circuit-math — L171](aionian-circuit-math.md#^ref-f2d83a77-171-0) (line 171, col 0, score 0.65)
- [Chroma Toolkit Consolidation Plan — L202](chroma-toolkit-consolidation-plan.md#^ref-5020e892-202-0) (line 202, col 0, score 0.65)
- [DSL — L11](chunks/dsl.md#^ref-e87bc036-11-0) (line 11, col 0, score 0.65)
- [JavaScript — L23](chunks/javascript.md#^ref-c1618c66-23-0) (line 23, col 0, score 0.65)
- [Math Fundamentals — L32](chunks/math-fundamentals.md#^ref-c6e87433-32-0) (line 32, col 0, score 0.65)
- [Cross-Language Runtime Polymorphism — L221](cross-language-runtime-polymorphism.md#^ref-c34c36a6-221-0) (line 221, col 0, score 0.65)
- [Duck's Self-Referential Perceptual Loop — L50](ducks-self-referential-perceptual-loop.md#^ref-71726f04-50-0) (line 50, col 0, score 0.65)
- [Dynamic Context Model for Web Components — L418](dynamic-context-model-for-web-components.md#^ref-f7702bf8-418-0) (line 418, col 0, score 0.65)
- [js-to-lisp-reverse-compiler — L308](js-to-lisp-reverse-compiler.md#^ref-58191024-308-0) (line 308, col 0, score 0.77)
- [compiler-kit-foundations — L166](compiler-kit-foundations.md#^ref-01b21543-166-0) (line 166, col 0, score 0.69)
- [universal-intention-code-fabric — L277](universal-intention-code-fabric.md#^ref-c14edce7-277-0) (line 277, col 0, score 0.69)
- [compiler-kit-foundations — L574](compiler-kit-foundations.md#^ref-01b21543-574-0) (line 574, col 0, score 0.62)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L345](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-345-0) (line 345, col 0, score 0.65)
- [Lispy Macros with syntax-rules — L301](lispy-macros-with-syntax-rules.md#^ref-cbfe3513-301-0) (line 301, col 0, score 0.64)
- [set-assignment-in-lisp-ast — L5](set-assignment-in-lisp-ast.md#^ref-c5fba0a0-5-0) (line 5, col 0, score 0.71)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L445](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-445-0) (line 445, col 0, score 0.7)
- [Lisp-Compiler-Integration — L188](lisp-compiler-integration.md#^ref-cfee6d36-188-0) (line 188, col 0, score 0.68)
- [Interop and Source Maps — L319](interop-and-source-maps.md#^ref-cdfac40c-319-0) (line 319, col 0, score 0.69)
- [compiler-kit-foundations — L471](compiler-kit-foundations.md#^ref-01b21543-471-0) (line 471, col 0, score 0.69)
- [Refactor Frontmatter Processing — L11](refactor-frontmatter-processing.md#^ref-cfbdca2f-11-0) (line 11, col 0, score 0.63)
- [compiler-kit-foundations — L50](compiler-kit-foundations.md#^ref-01b21543-50-0) (line 50, col 0, score 0.66)
- [Lisp-Compiler-Integration — L341](lisp-compiler-integration.md#^ref-cfee6d36-341-0) (line 341, col 0, score 0.68)
- [Interop and Source Maps — L21](interop-and-source-maps.md#^ref-cdfac40c-21-0) (line 21, col 0, score 0.7)
- [compiler-kit-foundations — L359](compiler-kit-foundations.md#^ref-01b21543-359-0) (line 359, col 0, score 0.66)
- [Lispy Macros with syntax-rules — L9](lispy-macros-with-syntax-rules.md#^ref-cbfe3513-9-0) (line 9, col 0, score 0.66)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L194](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-194-0) (line 194, col 0, score 0.64)
- [ecs-scheduler-and-prefabs — L7](ecs-scheduler-and-prefabs.md#^ref-c62a1815-7-0) (line 7, col 0, score 0.67)
- [System Scheduler with Resource-Aware DAG — L5](system-scheduler-with-resource-aware-dag.md#^ref-ba244286-5-0) (line 5, col 0, score 0.67)
- [Performance-Optimized-Polyglot-Bridge — L396](performance-optimized-polyglot-bridge.md#^ref-f5579967-396-0) (line 396, col 0, score 0.63)
- [Functional Embedding Pipeline Refactor — L31](functional-embedding-pipeline-refactor.md#^ref-a4a25141-31-0) (line 31, col 0, score 0.67)
- [TypeScript Patch for Tool Calling Support — L67](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-67-0) (line 67, col 0, score 0.63)
- [Interop and Source Maps — L8](interop-and-source-maps.md#^ref-cdfac40c-8-0) (line 8, col 0, score 0.69)
- [set-assignment-in-lisp-ast — L54](set-assignment-in-lisp-ast.md#^ref-c5fba0a0-54-0) (line 54, col 0, score 0.61)
- [Interop and Source Maps — L9](interop-and-source-maps.md#^ref-cdfac40c-9-0) (line 9, col 0, score 0.59)
- [set-assignment-in-lisp-ast — L1](set-assignment-in-lisp-ast.md#^ref-c5fba0a0-1-0) (line 1, col 0, score 0.71)
- [Lisp-Compiler-Integration — L7](lisp-compiler-integration.md#^ref-cfee6d36-7-0) (line 7, col 0, score 0.65)
- [Promethean Agent Config DSL — L288](promethean-agent-config-dsl.md#^ref-2c00ce45-288-0) (line 288, col 0, score 0.67)
- [compiler-kit-foundations — L602](compiler-kit-foundations.md#^ref-01b21543-602-0) (line 602, col 0, score 0.62)
- [Cross-Target Macro System in Sibilant — L3](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-3-0) (line 3, col 0, score 0.65)
- [Promethean Agent DSL TS Scaffold — L1](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-1-0) (line 1, col 0, score 0.67)
- [js-to-lisp-reverse-compiler — L404](js-to-lisp-reverse-compiler.md#^ref-58191024-404-0) (line 404, col 0, score 0.66)
- [template-based-compilation — L58](template-based-compilation.md#^ref-f8877e5e-58-0) (line 58, col 0, score 0.66)
- [Cross-Target Macro System in Sibilant — L115](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-115-0) (line 115, col 0, score 0.65)
- [set-assignment-in-lisp-ast — L106](set-assignment-in-lisp-ast.md#^ref-c5fba0a0-106-0) (line 106, col 0, score 0.65)
- [js-to-lisp-reverse-compiler — L397](js-to-lisp-reverse-compiler.md#^ref-58191024-397-0) (line 397, col 0, score 0.66)
- [Lispy Macros with syntax-rules — L392](lispy-macros-with-syntax-rules.md#^ref-cbfe3513-392-0) (line 392, col 0, score 0.71)
- [js-to-lisp-reverse-compiler — L384](js-to-lisp-reverse-compiler.md#^ref-58191024-384-0) (line 384, col 0, score 0.7)
- [Promethean Agent Config DSL — L143](promethean-agent-config-dsl.md#^ref-2c00ce45-143-0) (line 143, col 0, score 0.69)
- [universal-intention-code-fabric — L394](universal-intention-code-fabric.md#^ref-c14edce7-394-0) (line 394, col 0, score 0.68)
- [Dynamic Context Model for Web Components — L149](dynamic-context-model-for-web-components.md#^ref-f7702bf8-149-0) (line 149, col 0, score 0.68)
- [shared-package-layout-clarification — L47](shared-package-layout-clarification.md#^ref-36c8882a-47-0) (line 47, col 0, score 0.71)
- [shared-package-layout-clarification — L84](shared-package-layout-clarification.md#^ref-36c8882a-84-0) (line 84, col 0, score 0.64)
- [Shared Package Structure — L64](shared-package-structure.md#^ref-66a72fc3-64-0) (line 64, col 0, score 0.7)
- [Promethean Infrastructure Setup — L392](promethean-infrastructure-setup.md#^ref-6deed6ac-392-0) (line 392, col 0, score 0.69)
- [ts-to-lisp-transpiler — L3](ts-to-lisp-transpiler.md#^ref-ba11486b-3-0) (line 3, col 0, score 0.68)
- [Lispy Macros with syntax-rules — L217](lispy-macros-with-syntax-rules.md#^ref-cbfe3513-217-0) (line 217, col 0, score 0.63)
- [Local-First Intention→Code Loop with Free Models — L47](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-47-0) (line 47, col 0, score 0.65)
- [Pure-Node Crawl Stack with Playwright and Crawlee — L223](pure-node-crawl-stack-with-playwright-and-crawlee.md#^ref-d527c05d-223-0) (line 223, col 0, score 0.63)
- [Per-Domain Policy System for JS Crawler — L184](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-184-0) (line 184, col 0, score 0.69)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L489](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-489-0) (line 489, col 0, score 0.71)
- [Shared Package Structure — L117](shared-package-structure.md#^ref-66a72fc3-117-0) (line 117, col 0, score 0.61)
- [WebSocket Gateway Implementation — L333](websocket-gateway-implementation.md#^ref-e811123d-333-0) (line 333, col 0, score 0.62)
- [schema-evolution-workflow — L29](schema-evolution-workflow.md#^ref-d8059b6a-29-0) (line 29, col 0, score 0.62)
- [ecs-offload-workers — L359](ecs-offload-workers.md#^ref-6498b9d7-359-0) (line 359, col 0, score 0.68)
- [Event Bus MVP — L284](event-bus-mvp.md#^ref-534fe91d-284-0) (line 284, col 0, score 0.59)
- [Promethean Agent DSL TS Scaffold — L349](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-349-0) (line 349, col 0, score 0.59)
- [Sibilant Meta-Prompt DSL — L100](sibilant-meta-prompt-dsl.md#^ref-af5d2824-100-0) (line 100, col 0, score 0.59)
- [Event Bus MVP — L99](event-bus-mvp.md#^ref-534fe91d-99-0) (line 99, col 0, score 0.68)
- [Chroma-Embedding-Refactor — L64](chroma-embedding-refactor.md#^ref-8b256935-64-0) (line 64, col 0, score 0.6)
- [Chroma-Embedding-Refactor — L109](chroma-embedding-refactor.md#^ref-8b256935-109-0) (line 109, col 0, score 0.6)
- [js-to-lisp-reverse-compiler — L5](js-to-lisp-reverse-compiler.md#^ref-58191024-5-0) (line 5, col 0, score 0.67)
- [Lisp-Compiler-Integration — L472](lisp-compiler-integration.md#^ref-cfee6d36-472-0) (line 472, col 0, score 0.66)
- [Lispy Macros with syntax-rules — L339](lispy-macros-with-syntax-rules.md#^ref-cbfe3513-339-0) (line 339, col 0, score 0.66)
- [Interop and Source Maps — L11](interop-and-source-maps.md#^ref-cdfac40c-11-0) (line 11, col 0, score 0.66)
- [js-to-lisp-reverse-compiler — L267](js-to-lisp-reverse-compiler.md#^ref-58191024-267-0) (line 267, col 0, score 0.75)
- [Lisp-Compiler-Integration — L291](lisp-compiler-integration.md#^ref-cfee6d36-291-0) (line 291, col 0, score 0.66)
- [Lisp-Compiler-Integration — L151](lisp-compiler-integration.md#^ref-cfee6d36-151-0) (line 151, col 0, score 0.66)
- [Interop and Source Maps — L68](interop-and-source-maps.md#^ref-cdfac40c-68-0) (line 68, col 0, score 0.73)
- [Promethean-native config design — L160](promethean-native-config-design.md#^ref-ab748541-160-0) (line 160, col 0, score 0.69)
- [Agent Tasks: Persistence Migration to DualStore — L153](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-153-0) (line 153, col 0, score 1)
- [AI-Centric OS with MCP Layer — L404](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-404-0) (line 404, col 0, score 0.68)
- [archetype-ecs — L468](archetype-ecs.md#^ref-8f4c1e86-468-0) (line 468, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L190](chroma-toolkit-consolidation-plan.md#^ref-5020e892-190-0) (line 190, col 0, score 0.68)
- [DSL — L17](chunks/dsl.md#^ref-e87bc036-17-0) (line 17, col 0, score 1)
- [compiler-kit-foundations — L619](compiler-kit-foundations.md#^ref-01b21543-619-0) (line 619, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L217](cross-language-runtime-polymorphism.md#^ref-c34c36a6-217-0) (line 217, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L177](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-177-0) (line 177, col 0, score 1)
- [Dynamic Context Model for Web Components — L387](dynamic-context-model-for-web-components.md#^ref-f7702bf8-387-0) (line 387, col 0, score 1)
- [ecs-offload-workers — L472](ecs-offload-workers.md#^ref-6498b9d7-472-0) (line 472, col 0, score 1)
- [Local-Only-LLM-Workflow — L69](local-only-llm-workflow.md#^ref-9a8ab57e-69-0) (line 69, col 0, score 0.71)
- [Promethean-native config design — L233](promethean-native-config-design.md#^ref-ab748541-233-0) (line 233, col 0, score 0.69)
- [ecs-offload-workers — L39](ecs-offload-workers.md#^ref-6498b9d7-39-0) (line 39, col 0, score 0.69)
- [ecs-offload-workers — L169](ecs-offload-workers.md#^ref-6498b9d7-169-0) (line 169, col 0, score 0.68)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L108](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-108-0) (line 108, col 0, score 0.68)
- [graph-ds — L5](graph-ds.md#^ref-6620e2f2-5-0) (line 5, col 0, score 0.69)
- [RAG UI Panel with Qdrant and PostgREST — L172](rag-ui-panel-with-qdrant-and-postgrest.md#^ref-e1056831-172-0) (line 172, col 0, score 0.66)
- [Cross-Target Macro System in Sibilant — L141](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-141-0) (line 141, col 0, score 0.7)
- [ecs-offload-workers — L209](ecs-offload-workers.md#^ref-6498b9d7-209-0) (line 209, col 0, score 0.68)
- [Cross-Target Macro System in Sibilant — L21](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-21-0) (line 21, col 0, score 0.7)
- [Cross-Target Macro System in Sibilant — L134](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-134-0) (line 134, col 0, score 0.68)
- [sibilant-macro-targets — L64](sibilant-macro-targets.md#^ref-c5c9a5c6-64-0) (line 64, col 0, score 0.72)
- [Provider-Agnostic Chat Panel Implementation — L26](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-26-0) (line 26, col 0, score 0.67)
- [universal-intention-code-fabric — L384](universal-intention-code-fabric.md#^ref-c14edce7-384-0) (line 384, col 0, score 0.65)
- [set-assignment-in-lisp-ast — L25](set-assignment-in-lisp-ast.md#^ref-c5fba0a0-25-0) (line 25, col 0, score 0.69)
- [Promethean Agent DSL TS Scaffold — L723](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-723-0) (line 723, col 0, score 0.63)
- [ecs-offload-workers — L75](ecs-offload-workers.md#^ref-6498b9d7-75-0) (line 75, col 0, score 0.7)
- [ecs-offload-workers — L149](ecs-offload-workers.md#^ref-6498b9d7-149-0) (line 149, col 0, score 0.7)
- [zero-copy-snapshots-and-workers — L267](zero-copy-snapshots-and-workers.md#^ref-62bec6f0-267-0) (line 267, col 0, score 0.68)
- [Event Bus MVP — L258](event-bus-mvp.md#^ref-534fe91d-258-0) (line 258, col 0, score 0.67)
- [Promethean Event Bus MVP v0.1 — L787](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-787-0) (line 787, col 0, score 0.66)
- [WebSocket Gateway Implementation — L473](websocket-gateway-implementation.md#^ref-e811123d-473-0) (line 473, col 0, score 0.66)
- [schema-evolution-workflow — L393](schema-evolution-workflow.md#^ref-d8059b6a-393-0) (line 393, col 0, score 0.66)
- [prom-lib-rate-limiters-and-replay-api — L282](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-282-0) (line 282, col 0, score 0.66)
- [compiler-kit-foundations — L7](compiler-kit-foundations.md#^ref-01b21543-7-0) (line 7, col 0, score 0.64)
- [Matplotlib Animation with Async Execution — L33](matplotlib-animation-with-async-execution.md#^ref-687439f9-33-0) (line 33, col 0, score 0.63)
- [markdown-to-org-transpiler — L1](markdown-to-org-transpiler.md#^ref-ab54cdd8-1-0) (line 1, col 0, score 0.72)
- [RAG UI Panel with Qdrant and PostgREST — L358](rag-ui-panel-with-qdrant-and-postgrest.md#^ref-e1056831-358-0) (line 358, col 0, score 0.71)
- [Per-Domain Policy System for JS Crawler — L180](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-180-0) (line 180, col 0, score 0.65)
- [Promethean-native config design — L334](promethean-native-config-design.md#^ref-ab748541-334-0) (line 334, col 0, score 0.63)
- [i3-bluetooth-setup — L37](i3-bluetooth-setup.md#^ref-5e408692-37-0) (line 37, col 0, score 0.63)
- [Local-Offline-Model-Deployment-Strategy — L246](local-offline-model-deployment-strategy.md#^ref-ad7f1ed3-246-0) (line 246, col 0, score 0.61)
- [Migrate to Provider-Tenant Architecture — L186](migrate-to-provider-tenant-architecture.md#^ref-54382370-186-0) (line 186, col 0, score 0.6)
- [Migrate to Provider-Tenant Architecture — L187](migrate-to-provider-tenant-architecture.md#^ref-54382370-187-0) (line 187, col 0, score 0.6)
- [Migrate to Provider-Tenant Architecture — L188](migrate-to-provider-tenant-architecture.md#^ref-54382370-188-0) (line 188, col 0, score 0.6)
- [Migrate to Provider-Tenant Architecture — L189](migrate-to-provider-tenant-architecture.md#^ref-54382370-189-0) (line 189, col 0, score 0.6)
- [Migrate to Provider-Tenant Architecture — L190](migrate-to-provider-tenant-architecture.md#^ref-54382370-190-0) (line 190, col 0, score 0.6)
- [Migrate to Provider-Tenant Architecture — L191](migrate-to-provider-tenant-architecture.md#^ref-54382370-191-0) (line 191, col 0, score 0.6)
- [Promethean-native config design — L73](promethean-native-config-design.md#^ref-ab748541-73-0) (line 73, col 0, score 0.63)
- [Promethean-native config design — L29](promethean-native-config-design.md#^ref-ab748541-29-0) (line 29, col 0, score 0.61)
- [field-dynamics-math-blocks — L98](field-dynamics-math-blocks.md#^ref-7cfc230d-98-0) (line 98, col 0, score 0.61)
- [Exception Layer Analysis — L115](exception-layer-analysis.md#^ref-21d5cc09-115-0) (line 115, col 0, score 0.59)
- [Interop and Source Maps — L507](interop-and-source-maps.md#^ref-cdfac40c-507-0) (line 507, col 0, score 0.58)
- [Dynamic Context Model for Web Components — L170](dynamic-context-model-for-web-components.md#^ref-f7702bf8-170-0) (line 170, col 0, score 0.57)
- [Lispy Macros with syntax-rules — L388](lispy-macros-with-syntax-rules.md#^ref-cbfe3513-388-0) (line 388, col 0, score 0.57)
- [Promethean Event Bus MVP v0.1 — L114](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-114-0) (line 114, col 0, score 0.57)
- [Vectorial Exception Descent — L136](vectorial-exception-descent.md#^ref-d771154e-136-0) (line 136, col 0, score 0.56)
- [Promethean-Copilot-Intent-Engine — L31](promethean-copilot-intent-engine.md#^ref-ae24a280-31-0) (line 31, col 0, score 0.65)
- [Promethean Documentation Pipeline Overview — L148](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-148-0) (line 148, col 0, score 0.64)
- [Agent Tasks: Persistence Migration to DualStore — L81](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-81-0) (line 81, col 0, score 0.64)
- [WebSocket Gateway Implementation — L614](websocket-gateway-implementation.md#^ref-e811123d-614-0) (line 614, col 0, score 0.64)
- [universal-intention-code-fabric — L418](universal-intention-code-fabric.md#^ref-c14edce7-418-0) (line 418, col 0, score 0.64)
- [Promethean-Copilot-Intent-Engine — L48](promethean-copilot-intent-engine.md#^ref-ae24a280-48-0) (line 48, col 0, score 0.63)
- [Promethean Event Bus MVP v0.1 — L346](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-346-0) (line 346, col 0, score 0.7)
- [Agent Tasks: Persistence Migration to DualStore — L103](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-103-0) (line 103, col 0, score 0.68)
- [ecs-scheduler-and-prefabs — L383](ecs-scheduler-and-prefabs.md#^ref-c62a1815-383-0) (line 383, col 0, score 0.67)
- [System Scheduler with Resource-Aware DAG — L381](system-scheduler-with-resource-aware-dag.md#^ref-ba244286-381-0) (line 381, col 0, score 0.67)
- [Lisp-Compiler-Integration — L531](lisp-compiler-integration.md#^ref-cfee6d36-531-0) (line 531, col 0, score 0.67)
- [Mongo Outbox Implementation — L537](mongo-outbox-implementation.md#^ref-9c1acd1e-537-0) (line 537, col 0, score 0.67)
- [Migrate to Provider-Tenant Architecture — L160](migrate-to-provider-tenant-architecture.md#^ref-54382370-160-0) (line 160, col 0, score 0.67)
- [i3-bluetooth-setup — L45](i3-bluetooth-setup.md#^ref-5e408692-45-0) (line 45, col 0, score 0.6)
- [Universal Lisp Interface — L111](universal-lisp-interface.md#^ref-b01856b4-111-0) (line 111, col 0, score 0.59)
- [Local-Only-LLM-Workflow — L165](local-only-llm-workflow.md#^ref-9a8ab57e-165-0) (line 165, col 0, score 0.7)
- [Migrate to Provider-Tenant Architecture — L20](migrate-to-provider-tenant-architecture.md#^ref-54382370-20-0) (line 20, col 0, score 0.56)
- [prom-lib-rate-limiters-and-replay-api — L60](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-60-0) (line 60, col 0, score 0.56)
- [Interop and Source Maps — L505](interop-and-source-maps.md#^ref-cdfac40c-505-0) (line 505, col 0, score 0.55)
- [Interop and Source Maps — L7](interop-and-source-maps.md#^ref-cdfac40c-7-0) (line 7, col 0, score 0.71)
- [AI-Centric OS with MCP Layer — L413](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-413-0) (line 413, col 0, score 0.68)
- [ecs-scheduler-and-prefabs — L402](ecs-scheduler-and-prefabs.md#^ref-c62a1815-402-0) (line 402, col 0, score 0.8)
- [eidolon-field-math-foundations — L145](eidolon-field-math-foundations.md#^ref-008f2ac0-145-0) (line 145, col 0, score 1)
- [field-interaction-equations — L167](field-interaction-equations.md#^ref-b09141b7-167-0) (line 167, col 0, score 0.8)
- [Lisp-Compiler-Integration — L545](lisp-compiler-integration.md#^ref-cfee6d36-545-0) (line 545, col 0, score 0.8)
- [Promethean-native config design — L62](promethean-native-config-design.md#^ref-ab748541-62-0) (line 62, col 0, score 0.66)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L150](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-150-0) (line 150, col 0, score 0.66)
- [Agent Reflections and Prompt Evolution — L105](agent-reflections-and-prompt-evolution.md#^ref-bb7f0835-105-0) (line 105, col 0, score 0.64)
- [Promethean State Format — L26](promethean-state-format.md#^ref-23df6ddb-26-0) (line 26, col 0, score 0.64)
- [Chroma-Embedding-Refactor — L250](chroma-embedding-refactor.md#^ref-8b256935-250-0) (line 250, col 0, score 0.64)
- [prompt-programming-language-lisp — L66](prompt-programming-language-lisp.md#^ref-d41a06d1-66-0) (line 66, col 0, score 0.62)
- [Dynamic Context Model for Web Components — L45](dynamic-context-model-for-web-components.md#^ref-f7702bf8-45-0) (line 45, col 0, score 0.63)
- [Board Walk – 2025-08-11 — L93](board-walk-2025-08-11.md#^ref-7aa1eb92-93-0) (line 93, col 0, score 0.61)
- [Promethean-Copilot-Intent-Engine — L44](promethean-copilot-intent-engine.md#^ref-ae24a280-44-0) (line 44, col 0, score 0.6)
- [Dynamic Context Model for Web Components — L41](dynamic-context-model-for-web-components.md#^ref-f7702bf8-41-0) (line 41, col 0, score 0.6)
- [Chroma-Embedding-Refactor — L258](chroma-embedding-refactor.md#^ref-8b256935-258-0) (line 258, col 0, score 0.6)
- [Chroma Toolkit Consolidation Plan — L72](chroma-toolkit-consolidation-plan.md#^ref-5020e892-72-0) (line 72, col 0, score 0.6)
- [Chroma Toolkit Consolidation Plan — L88](chroma-toolkit-consolidation-plan.md#^ref-5020e892-88-0) (line 88, col 0, score 0.6)
- [Chroma Toolkit Consolidation Plan — L107](chroma-toolkit-consolidation-plan.md#^ref-5020e892-107-0) (line 107, col 0, score 0.6)
- [field-node-diagram-visualizations — L39](field-node-diagram-visualizations.md#^ref-e9b27b06-39-0) (line 39, col 0, score 0.59)
- [universal-intention-code-fabric — L428](universal-intention-code-fabric.md#^ref-c14edce7-428-0) (line 428, col 0, score 0.63)
- [Local-Only-LLM-Workflow — L130](local-only-llm-workflow.md#^ref-9a8ab57e-130-0) (line 130, col 0, score 0.61)
- [universal-intention-code-fabric — L420](universal-intention-code-fabric.md#^ref-c14edce7-420-0) (line 420, col 0, score 0.6)
- [Promethean-native config design — L369](promethean-native-config-design.md#^ref-ab748541-369-0) (line 369, col 0, score 0.59)
- [Promethean Pipelines — L7](promethean-pipelines.md#^ref-8b8e6103-7-0) (line 7, col 0, score 0.59)
- [Promethean State Format — L71](promethean-state-format.md#^ref-23df6ddb-71-0) (line 71, col 0, score 0.58)
- [Dynamic Context Model for Web Components — L293](dynamic-context-model-for-web-components.md#^ref-f7702bf8-293-0) (line 293, col 0, score 0.58)
- [Per-Domain Policy System for JS Crawler — L467](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-467-0) (line 467, col 0, score 0.57)
- [polyglot-repl-interface-layer — L139](polyglot-repl-interface-layer.md#^ref-9c79206d-139-0) (line 139, col 0, score 0.57)
- [Migrate to Provider-Tenant Architecture — L69](migrate-to-provider-tenant-architecture.md#^ref-54382370-69-0) (line 69, col 0, score 0.71)
- [Migrate to Provider-Tenant Architecture — L107](migrate-to-provider-tenant-architecture.md#^ref-54382370-107-0) (line 107, col 0, score 0.71)
- [Local-First Intention→Code Loop with Free Models — L114](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-114-0) (line 114, col 0, score 0.69)
- [Migrate to Provider-Tenant Architecture — L144](migrate-to-provider-tenant-architecture.md#^ref-54382370-144-0) (line 144, col 0, score 0.68)
- [Migrate to Provider-Tenant Architecture — L156](migrate-to-provider-tenant-architecture.md#^ref-54382370-156-0) (line 156, col 0, score 0.68)
- [schema-evolution-workflow — L478](schema-evolution-workflow.md#^ref-d8059b6a-478-0) (line 478, col 0, score 0.67)
- [i3-config-validation-methods — L34](i3-config-validation-methods.md#^ref-d28090ac-34-0) (line 34, col 0, score 0.66)
- [State Snapshots API and Transactional Projector — L280](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-280-0) (line 280, col 0, score 0.65)
- [lisp-dsl-for-window-management — L172](lisp-dsl-for-window-management.md#^ref-c5c5ff1c-172-0) (line 172, col 0, score 0.61)
- [AI-Centric OS with MCP Layer — L405](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-405-0) (line 405, col 0, score 1)
- [archetype-ecs — L469](archetype-ecs.md#^ref-8f4c1e86-469-0) (line 469, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L219](chroma-toolkit-consolidation-plan.md#^ref-5020e892-219-0) (line 219, col 0, score 1)
- [DSL — L19](chunks/dsl.md#^ref-e87bc036-19-0) (line 19, col 0, score 1)
- [JavaScript — L25](chunks/javascript.md#^ref-c1618c66-25-0) (line 25, col 0, score 1)
- [Window Management — L26](chunks/window-management.md#^ref-9e8ae388-26-0) (line 26, col 0, score 1)
- [compiler-kit-foundations — L608](compiler-kit-foundations.md#^ref-01b21543-608-0) (line 608, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L261](cross-language-runtime-polymorphism.md#^ref-c34c36a6-261-0) (line 261, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L181](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-181-0) (line 181, col 0, score 1)
- [Dynamic Context Model for Web Components — L400](dynamic-context-model-for-web-components.md#^ref-f7702bf8-400-0) (line 400, col 0, score 1)
- [Lisp-Compiler-Integration — L535](lisp-compiler-integration.md#^ref-cfee6d36-535-0) (line 535, col 0, score 1)
- [Lispy Macros with syntax-rules — L399](lispy-macros-with-syntax-rules.md#^ref-cbfe3513-399-0) (line 399, col 0, score 1)
- [Local-Only-LLM-Workflow — L183](local-only-llm-workflow.md#^ref-9a8ab57e-183-0) (line 183, col 0, score 1)
- [markdown-to-org-transpiler — L306](markdown-to-org-transpiler.md#^ref-ab54cdd8-306-0) (line 306, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L314](migrate-to-provider-tenant-architecture.md#^ref-54382370-314-0) (line 314, col 0, score 1)
- [mystery-lisp-search-session — L127](mystery-lisp-search-session.md#^ref-513dc4c7-127-0) (line 127, col 0, score 1)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L171](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-171-0) (line 171, col 0, score 1)
- [ParticleSimulationWithCanvasAndFFmpeg — L255](particlesimulationwithcanvasandffmpeg.md#^ref-e018dd7a-255-0) (line 255, col 0, score 1)
- [Performance-Optimized-Polyglot-Bridge — L448](performance-optimized-polyglot-bridge.md#^ref-f5579967-448-0) (line 448, col 0, score 1)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L505](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-505-0) (line 505, col 0, score 1)
- [compiler-kit-foundations — L605](compiler-kit-foundations.md#^ref-01b21543-605-0) (line 605, col 0, score 1)
- [Interop and Source Maps — L512](interop-and-source-maps.md#^ref-cdfac40c-512-0) (line 512, col 0, score 1)
- [js-to-lisp-reverse-compiler — L409](js-to-lisp-reverse-compiler.md#^ref-58191024-409-0) (line 409, col 0, score 1)
- [Lisp-Compiler-Integration — L538](lisp-compiler-integration.md#^ref-cfee6d36-538-0) (line 538, col 0, score 1)
- [Lispy Macros with syntax-rules — L397](lispy-macros-with-syntax-rules.md#^ref-cbfe3513-397-0) (line 397, col 0, score 1)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L512](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-512-0) (line 512, col 0, score 1)
- [Promethean Agent Config DSL — L338](promethean-agent-config-dsl.md#^ref-2c00ce45-338-0) (line 338, col 0, score 1)
- [template-based-compilation — L144](template-based-compilation.md#^ref-f8877e5e-144-0) (line 144, col 0, score 1)
- [archetype-ecs — L467](archetype-ecs.md#^ref-8f4c1e86-467-0) (line 467, col 0, score 1)
- [DSL — L20](chunks/dsl.md#^ref-e87bc036-20-0) (line 20, col 0, score 1)
- [compiler-kit-foundations — L606](compiler-kit-foundations.md#^ref-01b21543-606-0) (line 606, col 0, score 1)
- [Interop and Source Maps — L514](interop-and-source-maps.md#^ref-cdfac40c-514-0) (line 514, col 0, score 1)
- [js-to-lisp-reverse-compiler — L437](js-to-lisp-reverse-compiler.md#^ref-58191024-437-0) (line 437, col 0, score 1)
- [Lisp-Compiler-Integration — L536](lisp-compiler-integration.md#^ref-cfee6d36-536-0) (line 536, col 0, score 1)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L515](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-515-0) (line 515, col 0, score 1)
- [set-assignment-in-lisp-ast — L148](set-assignment-in-lisp-ast.md#^ref-c5fba0a0-148-0) (line 148, col 0, score 1)
- [Exception Layer Analysis — L172](exception-layer-analysis.md#^ref-21d5cc09-172-0) (line 172, col 0, score 1)
- [field-dynamics-math-blocks — L154](field-dynamics-math-blocks.md#^ref-7cfc230d-154-0) (line 154, col 0, score 1)
- [field-interaction-equations — L164](field-interaction-equations.md#^ref-b09141b7-164-0) (line 164, col 0, score 1)
- [field-node-diagram-outline — L120](field-node-diagram-outline.md#^ref-1f32c94a-120-0) (line 120, col 0, score 1)
- [field-node-diagram-set — L149](field-node-diagram-set.md#^ref-22b989d5-149-0) (line 149, col 0, score 1)
- [field-node-diagram-visualizations — L99](field-node-diagram-visualizations.md#^ref-e9b27b06-99-0) (line 99, col 0, score 1)
- [graph-ds — L365](graph-ds.md#^ref-6620e2f2-365-0) (line 365, col 0, score 1)
- [heartbeat-fragment-demo — L111](heartbeat-fragment-demo.md#^ref-dd00677a-111-0) (line 111, col 0, score 1)
- [heartbeat-simulation-snippets — L101](heartbeat-simulation-snippets.md#^ref-23e221e9-101-0) (line 101, col 0, score 1)
- [Interop and Source Maps — L516](interop-and-source-maps.md#^ref-cdfac40c-516-0) (line 516, col 0, score 1)
- [Local-Only-LLM-Workflow — L169](local-only-llm-workflow.md#^ref-9a8ab57e-169-0) (line 169, col 0, score 1)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L169](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-169-0) (line 169, col 0, score 1)
- [Performance-Optimized-Polyglot-Bridge — L437](performance-optimized-polyglot-bridge.md#^ref-f5579967-437-0) (line 437, col 0, score 1)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L506](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-506-0) (line 506, col 0, score 1)
- [Promethean Infrastructure Setup — L608](promethean-infrastructure-setup.md#^ref-6deed6ac-608-0) (line 608, col 0, score 1)
- [Promethean-Copilot-Intent-Engine — L12](promethean-copilot-intent-engine.md#^ref-ae24a280-12-0) (line 12, col 0, score 0.67)
- [universal-intention-code-fabric — L22](universal-intention-code-fabric.md#^ref-c14edce7-22-0) (line 22, col 0, score 0.67)
- [sibilant-macro-targets — L172](sibilant-macro-targets.md#^ref-c5c9a5c6-172-0) (line 172, col 0, score 1)
- [Sibilant Meta-Prompt DSL — L205](sibilant-meta-prompt-dsl.md#^ref-af5d2824-205-0) (line 205, col 0, score 1)
- [sibilant-meta-string-templating-runtime — L137](sibilant-meta-string-templating-runtime.md#^ref-2aafc801-137-0) (line 137, col 0, score 1)
- [sibilant-metacompiler-overview — L90](sibilant-metacompiler-overview.md#^ref-61d4086b-90-0) (line 90, col 0, score 1)
- [State Snapshots API and Transactional Projector — L366](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-366-0) (line 366, col 0, score 1)
- [System Scheduler with Resource-Aware DAG — L394](system-scheduler-with-resource-aware-dag.md#^ref-ba244286-394-0) (line 394, col 0, score 1)
- [template-based-compilation — L104](template-based-compilation.md#^ref-f8877e5e-104-0) (line 104, col 0, score 1)
- [ts-to-lisp-transpiler — L8](ts-to-lisp-transpiler.md#^ref-ba11486b-8-0) (line 8, col 0, score 1)
- [typed-struct-compiler — L384](typed-struct-compiler.md#^ref-78eeedf7-384-0) (line 384, col 0, score 1)
- [layer-1-uptime-diagrams — L178](layer-1-uptime-diagrams.md#^ref-4127189a-178-0) (line 178, col 0, score 1)
- [Lisp-Compiler-Integration — L550](lisp-compiler-integration.md#^ref-cfee6d36-550-0) (line 550, col 0, score 1)
- [lisp-dsl-for-window-management — L223](lisp-dsl-for-window-management.md#^ref-c5c5ff1c-223-0) (line 223, col 0, score 1)
- [Lispy Macros with syntax-rules — L406](lispy-macros-with-syntax-rules.md#^ref-cbfe3513-406-0) (line 406, col 0, score 1)
- [Local-First Intention→Code Loop with Free Models — L168](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-168-0) (line 168, col 0, score 1)
- [Local-Only-LLM-Workflow — L201](local-only-llm-workflow.md#^ref-9a8ab57e-201-0) (line 201, col 0, score 1)
- [markdown-to-org-transpiler — L323](markdown-to-org-transpiler.md#^ref-ab54cdd8-323-0) (line 323, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L496](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-496-0) (line 496, col 0, score 1)
- [ripple-propagation-demo — L118](ripple-propagation-demo.md#^ref-8430617b-118-0) (line 118, col 0, score 1)
- [schema-evolution-workflow — L492](schema-evolution-workflow.md#^ref-d8059b6a-492-0) (line 492, col 0, score 1)
- [Admin Dashboard for User Management — L46](admin-dashboard-for-user-management.md#^ref-2901a3e9-46-0) (line 46, col 0, score 1)
- [DSL — L22](chunks/dsl.md#^ref-e87bc036-22-0) (line 22, col 0, score 1)
- [compiler-kit-foundations — L609](compiler-kit-foundations.md#^ref-01b21543-609-0) (line 609, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L229](cross-language-runtime-polymorphism.md#^ref-c34c36a6-229-0) (line 229, col 0, score 1)
- [ecs-offload-workers — L460](ecs-offload-workers.md#^ref-6498b9d7-460-0) (line 460, col 0, score 1)
- [ecs-scheduler-and-prefabs — L396](ecs-scheduler-and-prefabs.md#^ref-c62a1815-396-0) (line 396, col 0, score 1)
- [eidolon-field-math-foundations — L157](eidolon-field-math-foundations.md#^ref-008f2ac0-157-0) (line 157, col 0, score 1)
- [i3-config-validation-methods — L57](i3-config-validation-methods.md#^ref-d28090ac-57-0) (line 57, col 0, score 1)
- [Interop and Source Maps — L515](interop-and-source-maps.md#^ref-cdfac40c-515-0) (line 515, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L166](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-166-0) (line 166, col 0, score 0.67)
- [AI-Centric OS with MCP Layer — L430](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-430-0) (line 430, col 0, score 0.67)
- [aionian-circuit-math — L166](aionian-circuit-math.md#^ref-f2d83a77-166-0) (line 166, col 0, score 0.67)
- [archetype-ecs — L464](archetype-ecs.md#^ref-8f4c1e86-464-0) (line 464, col 0, score 0.67)
- [Chroma Toolkit Consolidation Plan — L210](chroma-toolkit-consolidation-plan.md#^ref-5020e892-210-0) (line 210, col 0, score 0.67)
- [Diagrams — L15](chunks/diagrams.md#^ref-45cd25b5-15-0) (line 15, col 0, score 0.67)
- [JavaScript — L16](chunks/javascript.md#^ref-c1618c66-16-0) (line 16, col 0, score 0.67)
- [Math Fundamentals — L17](chunks/math-fundamentals.md#^ref-c6e87433-17-0) (line 17, col 0, score 0.67)
- [Services — L13](chunks/services.md#^ref-75ea4a6a-13-0) (line 13, col 0, score 0.67)
- [Shared — L9](chunks/shared.md#^ref-623a55f7-9-0) (line 9, col 0, score 0.67)
- [Simulation Demo — L13](chunks/simulation-demo.md#^ref-557309a3-13-0) (line 13, col 0, score 0.67)
- [Tooling — L12](chunks/tooling.md#^ref-6cb4943e-12-0) (line 12, col 0, score 0.67)
- [Admin Dashboard for User Management — L43](admin-dashboard-for-user-management.md#^ref-2901a3e9-43-0) (line 43, col 0, score 1)
- [api-gateway-versioning — L300](api-gateway-versioning.md#^ref-0580dcd3-300-0) (line 300, col 0, score 1)
- [observability-infrastructure-setup — L399](observability-infrastructure-setup.md#^ref-b4e64f8c-399-0) (line 399, col 0, score 1)
- [obsidian-ignore-node-modules-regex — L79](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-79-0) (line 79, col 0, score 1)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L165](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-165-0) (line 165, col 0, score 1)
- [ParticleSimulationWithCanvasAndFFmpeg — L266](particlesimulationwithcanvasandffmpeg.md#^ref-e018dd7a-266-0) (line 266, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L488](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-488-0) (line 488, col 0, score 1)
- [Performance-Optimized-Polyglot-Bridge — L436](performance-optimized-polyglot-bridge.md#^ref-f5579967-436-0) (line 436, col 0, score 1)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L504](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-504-0) (line 504, col 0, score 1)
- [polymorphic-meta-programming-engine — L244](polymorphic-meta-programming-engine.md#^ref-7bed0b9a-244-0) (line 244, col 0, score 1)
- [Post-Linguistic Transhuman Design Frameworks — L91](post-linguistic-transhuman-design-frameworks.md#^ref-6bcff92c-91-0) (line 91, col 0, score 1)
- [zero-copy-snapshots-and-workers — L363](zero-copy-snapshots-and-workers.md#^ref-62bec6f0-363-0) (line 363, col 0, score 1)
- [Simulation Demo — L32](chunks/simulation-demo.md#^ref-557309a3-32-0) (line 32, col 0, score 1)
- [Tooling — L26](chunks/tooling.md#^ref-6cb4943e-26-0) (line 26, col 0, score 1)
- [Window Management — L36](chunks/window-management.md#^ref-9e8ae388-36-0) (line 36, col 0, score 1)
- [compiler-kit-foundations — L639](compiler-kit-foundations.md#^ref-01b21543-639-0) (line 639, col 0, score 1)
- [Creative Moments — L10](creative-moments.md#^ref-10d98225-10-0) (line 10, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L258](cross-language-runtime-polymorphism.md#^ref-c34c36a6-258-0) (line 258, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L215](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-215-0) (line 215, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L50](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-50-0) (line 50, col 0, score 1)
- [Admin Dashboard for User Management — L39](admin-dashboard-for-user-management.md#^ref-2901a3e9-39-0) (line 39, col 0, score 1)
- [archetype-ecs — L471](archetype-ecs.md#^ref-8f4c1e86-471-0) (line 471, col 0, score 1)
- [Board Walk – 2025-08-11 — L141](board-walk-2025-08-11.md#^ref-7aa1eb92-141-0) (line 141, col 0, score 1)
- [JavaScript — L31](chunks/javascript.md#^ref-c1618c66-31-0) (line 31, col 0, score 1)
- [ecs-offload-workers — L459](ecs-offload-workers.md#^ref-6498b9d7-459-0) (line 459, col 0, score 1)
- [ecs-scheduler-and-prefabs — L395](ecs-scheduler-and-prefabs.md#^ref-c62a1815-395-0) (line 395, col 0, score 1)
- [eidolon-field-math-foundations — L156](eidolon-field-math-foundations.md#^ref-008f2ac0-156-0) (line 156, col 0, score 1)
- [i3-config-validation-methods — L64](i3-config-validation-methods.md#^ref-d28090ac-64-0) (line 64, col 0, score 1)
- [Lispy Macros with syntax-rules — L408](lispy-macros-with-syntax-rules.md#^ref-cbfe3513-408-0) (line 408, col 0, score 1)
- [Local-First Intention→Code Loop with Free Models — L182](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-182-0) (line 182, col 0, score 1)
- [Local-Offline-Model-Deployment-Strategy — L307](local-offline-model-deployment-strategy.md#^ref-ad7f1ed3-307-0) (line 307, col 0, score 1)
- [Local-Only-LLM-Workflow — L210](local-only-llm-workflow.md#^ref-9a8ab57e-210-0) (line 210, col 0, score 1)
- [markdown-to-org-transpiler — L320](markdown-to-org-transpiler.md#^ref-ab54cdd8-320-0) (line 320, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L272](migrate-to-provider-tenant-architecture.md#^ref-54382370-272-0) (line 272, col 0, score 1)
- [Model Selection for Lightweight Conversational Tasks — L136](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-136-0) (line 136, col 0, score 1)
- [Mongo Outbox Implementation — L583](mongo-outbox-implementation.md#^ref-9c1acd1e-583-0) (line 583, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration — L48](obsidian-chatgpt-plugin-integration.md#^ref-ca8e1399-48-0) (line 48, col 0, score 1)
- [Obsidian Templating Plugins Integration Guide — L109](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-109-0) (line 109, col 0, score 1)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L529](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-529-0) (line 529, col 0, score 1)
- [Protocol_0_The_Contradiction_Engine — L138](protocol-0-the-contradiction-engine.md#^ref-9a93a756-138-0) (line 138, col 0, score 1)
- [Math Fundamentals — L20](chunks/math-fundamentals.md#^ref-c6e87433-20-0) (line 20, col 0, score 1)
- [Services — L20](chunks/services.md#^ref-75ea4a6a-20-0) (line 20, col 0, score 1)
- [compiler-kit-foundations — L620](compiler-kit-foundations.md#^ref-01b21543-620-0) (line 620, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L237](cross-language-runtime-polymorphism.md#^ref-c34c36a6-237-0) (line 237, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L40](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-40-0) (line 40, col 0, score 1)
- [Dynamic Context Model for Web Components — L401](dynamic-context-model-for-web-components.md#^ref-f7702bf8-401-0) (line 401, col 0, score 1)
- [ecs-scheduler-and-prefabs — L386](ecs-scheduler-and-prefabs.md#^ref-c62a1815-386-0) (line 386, col 0, score 1)
- [eidolon-field-math-foundations — L127](eidolon-field-math-foundations.md#^ref-008f2ac0-127-0) (line 127, col 0, score 1)
- [Event Bus MVP — L557](event-bus-mvp.md#^ref-534fe91d-557-0) (line 557, col 0, score 1)
- [archetype-ecs — L457](archetype-ecs.md#^ref-8f4c1e86-457-0) (line 457, col 0, score 1)
- [JavaScript — L21](chunks/javascript.md#^ref-c1618c66-21-0) (line 21, col 0, score 1)
- [compiler-kit-foundations — L626](compiler-kit-foundations.md#^ref-01b21543-626-0) (line 626, col 0, score 1)
- [ecs-offload-workers — L488](ecs-offload-workers.md#^ref-6498b9d7-488-0) (line 488, col 0, score 1)
- [ecs-scheduler-and-prefabs — L412](ecs-scheduler-and-prefabs.md#^ref-c62a1815-412-0) (line 412, col 0, score 1)
- [System Scheduler with Resource-Aware DAG — L407](system-scheduler-with-resource-aware-dag.md#^ref-ba244286-407-0) (line 407, col 0, score 1)
- [template-based-compilation — L130](template-based-compilation.md#^ref-f8877e5e-130-0) (line 130, col 0, score 1)
- [typed-struct-compiler — L386](typed-struct-compiler.md#^ref-78eeedf7-386-0) (line 386, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L157](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-157-0) (line 157, col 0, score 1)
- [api-gateway-versioning — L298](api-gateway-versioning.md#^ref-0580dcd3-298-0) (line 298, col 0, score 1)
- [ecs-offload-workers — L455](ecs-offload-workers.md#^ref-6498b9d7-455-0) (line 455, col 0, score 1)
- [ecs-scheduler-and-prefabs — L389](ecs-scheduler-and-prefabs.md#^ref-c62a1815-389-0) (line 389, col 0, score 1)
- [eidolon-field-math-foundations — L130](eidolon-field-math-foundations.md#^ref-008f2ac0-130-0) (line 130, col 0, score 1)
- [i3-config-validation-methods — L63](i3-config-validation-methods.md#^ref-d28090ac-63-0) (line 63, col 0, score 1)
- [Interop and Source Maps — L531](interop-and-source-maps.md#^ref-cdfac40c-531-0) (line 531, col 0, score 1)
- [Local-First Intention→Code Loop with Free Models — L143](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-143-0) (line 143, col 0, score 1)
- [Local-Only-LLM-Workflow — L172](local-only-llm-workflow.md#^ref-9a8ab57e-172-0) (line 172, col 0, score 1)
- [Promethean_Eidolon_Synchronicity_Model — L74](promethean-eidolon-synchronicity-model.md#^ref-2d6e5553-74-0) (line 74, col 0, score 1)
- [Promethean Event Bus MVP v0.1 — L929](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-929-0) (line 929, col 0, score 1)
- [Promethean Infrastructure Setup — L597](promethean-infrastructure-setup.md#^ref-6deed6ac-597-0) (line 597, col 0, score 1)
- [Promethean-native config design — L421](promethean-native-config-design.md#^ref-ab748541-421-0) (line 421, col 0, score 1)
- [promethean-system-diagrams — L217](promethean-system-diagrams.md#^ref-b51e19b4-217-0) (line 217, col 0, score 1)
- [Promethean Web UI Setup — L629](promethean-web-ui-setup.md#^ref-bc5172ca-629-0) (line 629, col 0, score 1)
- [Prompt_Folder_Bootstrap — L193](prompt-folder-bootstrap.md#^ref-bd4f0976-193-0) (line 193, col 0, score 1)
- [prompt-programming-language-lisp — L107](prompt-programming-language-lisp.md#^ref-d41a06d1-107-0) (line 107, col 0, score 1)
- [2d-sandbox-field — L225](2d-sandbox-field.md#^ref-c710dc93-225-0) (line 225, col 0, score 1)
- [Admin Dashboard for User Management — L49](admin-dashboard-for-user-management.md#^ref-2901a3e9-49-0) (line 49, col 0, score 1)
- [Agent Reflections and Prompt Evolution — L150](agent-reflections-and-prompt-evolution.md#^ref-bb7f0835-150-0) (line 150, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L163](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-163-0) (line 163, col 0, score 1)
- [AI-First-OS-Model-Context-Protocol — L9](ai-first-os-model-context-protocol.md#^ref-618198f4-9-0) (line 9, col 0, score 1)
- [aionian-circuit-math — L179](aionian-circuit-math.md#^ref-f2d83a77-179-0) (line 179, col 0, score 1)
- [api-gateway-versioning — L304](api-gateway-versioning.md#^ref-0580dcd3-304-0) (line 304, col 0, score 1)
- [archetype-ecs — L479](archetype-ecs.md#^ref-8f4c1e86-479-0) (line 479, col 0, score 1)
- [balanced-bst — L295](balanced-bst.md#^ref-d3e7db72-295-0) (line 295, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L209](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-209-0) (line 209, col 0, score 1)
- [Duck's Attractor States — L67](ducks-attractor-states.md#^ref-13951643-67-0) (line 67, col 0, score 1)
- [Factorio AI with External Agents — L150](factorio-ai-with-external-agents.md#^ref-a4d90289-150-0) (line 150, col 0, score 1)
- [Model Upgrade Calm-Down Guide — L63](model-upgrade-calm-down-guide.md#^ref-db74343f-63-0) (line 63, col 0, score 1)
- [NPU Voice Code and Sensory Integration — L10](npu-voice-code-and-sensory-integration.md#^ref-5a02283e-10-0) (line 10, col 0, score 1)
- [observability-infrastructure-setup — L391](observability-infrastructure-setup.md#^ref-b4e64f8c-391-0) (line 391, col 0, score 1)
- [Obsidian Templating Plugins Integration Guide — L111](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-111-0) (line 111, col 0, score 1)
- [OpenAPI Validation Report — L29](openapi-validation-report.md#^ref-5c152b08-29-0) (line 29, col 0, score 1)
- [Optimizing Command Limitations in System Design — L36](optimizing-command-limitations-in-system-design.md#^ref-98c8ff62-36-0) (line 36, col 0, score 1)
- [plan-update-confirmation — L1013](plan-update-confirmation.md#^ref-b22d79c6-1013-0) (line 1013, col 0, score 1)
- [pm2-orchestration-patterns — L252](pm2-orchestration-patterns.md#^ref-51932e7b-252-0) (line 252, col 0, score 1)
- [AI-Centric OS with MCP Layer — L414](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-414-0) (line 414, col 0, score 1)
- [AI-First-OS-Model-Context-Protocol — L10](ai-first-os-model-context-protocol.md#^ref-618198f4-10-0) (line 10, col 0, score 1)
- [Board Automation Improvements — L15](board-automation-improvements.md#^ref-ac60a1d6-15-0) (line 15, col 0, score 1)
- [Board Walk – 2025-08-11 — L144](board-walk-2025-08-11.md#^ref-7aa1eb92-144-0) (line 144, col 0, score 1)
- [Shared — L15](chunks/shared.md#^ref-623a55f7-15-0) (line 15, col 0, score 1)
- [Creative Moments — L7](creative-moments.md#^ref-10d98225-7-0) (line 7, col 0, score 1)
- [DuckDuckGoSearchPipeline — L11](duckduckgosearchpipeline.md#^ref-e979c50f-11-0) (line 11, col 0, score 1)
- [Duck's Self-Referential Perceptual Loop — L44](ducks-self-referential-perceptual-loop.md#^ref-71726f04-44-0) (line 44, col 0, score 1)
- [Dynamic Context Model for Web Components — L424](dynamic-context-model-for-web-components.md#^ref-f7702bf8-424-0) (line 424, col 0, score 1)
- [Event Bus Projections Architecture — L170](event-bus-projections-architecture.md#^ref-cf6b9b17-170-0) (line 170, col 0, score 1)
- [Post-Linguistic Transhuman Design Frameworks — L96](post-linguistic-transhuman-design-frameworks.md#^ref-6bcff92c-96-0) (line 96, col 0, score 1)
- [Promethean Agent Config DSL — L348](promethean-agent-config-dsl.md#^ref-2c00ce45-348-0) (line 348, col 0, score 1)
- [Promethean Chat Activity Report — L22](promethean-chat-activity-report.md#^ref-18344cf9-22-0) (line 22, col 0, score 1)
- [Pure TypeScript Search Microservice — L538](pure-typescript-search-microservice.md#^ref-d17d3a96-538-0) (line 538, col 0, score 1)
- [RAG UI Panel with Qdrant and PostgREST — L374](rag-ui-panel-with-qdrant-and-postgrest.md#^ref-e1056831-374-0) (line 374, col 0, score 1)
- [ripple-propagation-demo — L120](ripple-propagation-demo.md#^ref-8430617b-120-0) (line 120, col 0, score 1)
- [schema-evolution-workflow — L502](schema-evolution-workflow.md#^ref-d8059b6a-502-0) (line 502, col 0, score 1)
- [Self-Agency in AI Interaction — L53](self-agency-in-ai-interaction.md#^ref-49a9a860-53-0) (line 53, col 0, score 1)
- [set-assignment-in-lisp-ast — L161](set-assignment-in-lisp-ast.md#^ref-c5fba0a0-161-0) (line 161, col 0, score 1)
- [shared-package-layout-clarification — L185](shared-package-layout-clarification.md#^ref-36c8882a-185-0) (line 185, col 0, score 1)
- [Shared Package Structure — L181](shared-package-structure.md#^ref-66a72fc3-181-0) (line 181, col 0, score 1)
- [sibilant-macro-targets — L173](sibilant-macro-targets.md#^ref-c5c9a5c6-173-0) (line 173, col 0, score 1)
- [Sibilant Meta-Prompt DSL — L194](sibilant-meta-prompt-dsl.md#^ref-af5d2824-194-0) (line 194, col 0, score 1)
- [Diagrams — L13](chunks/diagrams.md#^ref-45cd25b5-13-0) (line 13, col 0, score 1)
- [DSL — L15](chunks/dsl.md#^ref-e87bc036-15-0) (line 15, col 0, score 1)
- [JavaScript — L18](chunks/javascript.md#^ref-c1618c66-18-0) (line 18, col 0, score 1)
- [Math Fundamentals — L14](chunks/math-fundamentals.md#^ref-c6e87433-14-0) (line 14, col 0, score 1)
- [Services — L14](chunks/services.md#^ref-75ea4a6a-14-0) (line 14, col 0, score 1)
- [Shared — L7](chunks/shared.md#^ref-623a55f7-7-0) (line 7, col 0, score 1)
- [Simulation Demo — L10](chunks/simulation-demo.md#^ref-557309a3-10-0) (line 10, col 0, score 1)
- [Tooling — L9](chunks/tooling.md#^ref-6cb4943e-9-0) (line 9, col 0, score 1)
- [Window Management — L15](chunks/window-management.md#^ref-9e8ae388-15-0) (line 15, col 0, score 1)
- [eidolon-node-lifecycle — L63](eidolon-node-lifecycle.md#^ref-938eca9c-63-0) (line 63, col 0, score 1)
- [EidolonField — L269](eidolonfield.md#^ref-49d1e1e5-269-0) (line 269, col 0, score 1)
- [Event Bus MVP — L566](event-bus-mvp.md#^ref-534fe91d-566-0) (line 566, col 0, score 1)
- [Event Bus Projections Architecture — L185](event-bus-projections-architecture.md#^ref-cf6b9b17-185-0) (line 185, col 0, score 1)
- [Exception Layer Analysis — L165](exception-layer-analysis.md#^ref-21d5cc09-165-0) (line 165, col 0, score 1)
- [Factorio AI with External Agents — L160](factorio-ai-with-external-agents.md#^ref-a4d90289-160-0) (line 160, col 0, score 1)
- [field-dynamics-math-blocks — L165](field-dynamics-math-blocks.md#^ref-7cfc230d-165-0) (line 165, col 0, score 1)
- [field-interaction-equations — L184](field-interaction-equations.md#^ref-b09141b7-184-0) (line 184, col 0, score 1)
- [field-node-diagram-outline — L132](field-node-diagram-outline.md#^ref-1f32c94a-132-0) (line 132, col 0, score 1)
- [aionian-circuit-math — L165](aionian-circuit-math.md#^ref-f2d83a77-165-0) (line 165, col 0, score 1)
- [api-gateway-versioning — L319](api-gateway-versioning.md#^ref-0580dcd3-319-0) (line 319, col 0, score 1)
- [Canonical Org-Babel Matplotlib Animation Template — L116](canonical-org-babel-matplotlib-animation-template.md#^ref-1b1338fc-116-0) (line 116, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L209](chroma-toolkit-consolidation-plan.md#^ref-5020e892-209-0) (line 209, col 0, score 1)
- [DSL — L13](chunks/dsl.md#^ref-e87bc036-13-0) (line 13, col 0, score 1)
- [Math Fundamentals — L16](chunks/math-fundamentals.md#^ref-c6e87433-16-0) (line 16, col 0, score 1)
- [Services — L16](chunks/services.md#^ref-75ea4a6a-16-0) (line 16, col 0, score 1)
- [Shared — L5](chunks/shared.md#^ref-623a55f7-5-0) (line 5, col 0, score 1)
- [Simulation Demo — L12](chunks/simulation-demo.md#^ref-557309a3-12-0) (line 12, col 0, score 1)
- [AI-Centric OS with MCP Layer — L420](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-420-0) (line 420, col 0, score 1)
- [aionian-circuit-math — L177](aionian-circuit-math.md#^ref-f2d83a77-177-0) (line 177, col 0, score 1)
- [Board Automation Improvements — L18](board-automation-improvements.md#^ref-ac60a1d6-18-0) (line 18, col 0, score 1)
- [Board Walk – 2025-08-11 — L140](board-walk-2025-08-11.md#^ref-7aa1eb92-140-0) (line 140, col 0, score 1)
- [Canonical Org-Babel Matplotlib Animation Template — L118](canonical-org-babel-matplotlib-animation-template.md#^ref-1b1338fc-118-0) (line 118, col 0, score 1)
- [Diagrams — L47](chunks/diagrams.md#^ref-45cd25b5-47-0) (line 47, col 0, score 1)
- [JavaScript — L35](chunks/javascript.md#^ref-c1618c66-35-0) (line 35, col 0, score 1)
- [Math Fundamentals — L33](chunks/math-fundamentals.md#^ref-c6e87433-33-0) (line 33, col 0, score 1)
- [Services — L31](chunks/services.md#^ref-75ea4a6a-31-0) (line 31, col 0, score 1)
- [compiler-kit-foundations — L640](compiler-kit-foundations.md#^ref-01b21543-640-0) (line 640, col 0, score 1)
- [DuckDuckGoSearchPipeline — L16](duckduckgosearchpipeline.md#^ref-e979c50f-16-0) (line 16, col 0, score 1)
- [Admin Dashboard for User Management — L45](admin-dashboard-for-user-management.md#^ref-2901a3e9-45-0) (line 45, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L170](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-170-0) (line 170, col 0, score 1)
- [AI-Centric OS with MCP Layer — L416](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-416-0) (line 416, col 0, score 1)
- [AI-First-OS-Model-Context-Protocol — L11](ai-first-os-model-context-protocol.md#^ref-618198f4-11-0) (line 11, col 0, score 1)
- [aionian-circuit-math — L178](aionian-circuit-math.md#^ref-f2d83a77-178-0) (line 178, col 0, score 1)
- [api-gateway-versioning — L312](api-gateway-versioning.md#^ref-0580dcd3-312-0) (line 312, col 0, score 1)
- [balanced-bst — L297](balanced-bst.md#^ref-d3e7db72-297-0) (line 297, col 0, score 1)
- [Board Walk – 2025-08-11 — L131](board-walk-2025-08-11.md#^ref-7aa1eb92-131-0) (line 131, col 0, score 1)
- [Operations — L8](chunks/operations.md#^ref-f1add613-8-0) (line 8, col 0, score 1)
- [Local-Offline-Model-Deployment-Strategy — L305](local-offline-model-deployment-strategy.md#^ref-ad7f1ed3-305-0) (line 305, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L331](migrate-to-provider-tenant-architecture.md#^ref-54382370-331-0) (line 331, col 0, score 1)
- [Mindful Prioritization — L9](mindful-prioritization.md#^ref-40185d05-9-0) (line 9, col 0, score 1)
- [MindfulRobotIntegration — L7](mindfulrobotintegration.md#^ref-5f65dfa5-7-0) (line 7, col 0, score 1)
- [Model Upgrade Calm-Down Guide — L66](model-upgrade-calm-down-guide.md#^ref-db74343f-66-0) (line 66, col 0, score 1)
- [NPU Voice Code and Sensory Integration — L13](npu-voice-code-and-sensory-integration.md#^ref-5a02283e-13-0) (line 13, col 0, score 1)
- [observability-infrastructure-setup — L393](observability-infrastructure-setup.md#^ref-b4e64f8c-393-0) (line 393, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration Guide — L59](obsidian-chatgpt-plugin-integration-guide.md#^ref-1d3d6c3a-59-0) (line 59, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration — L56](obsidian-chatgpt-plugin-integration.md#^ref-ca8e1399-56-0) (line 56, col 0, score 1)
- [Math Fundamentals — L31](chunks/math-fundamentals.md#^ref-c6e87433-31-0) (line 31, col 0, score 1)
- [Tooling — L19](chunks/tooling.md#^ref-6cb4943e-19-0) (line 19, col 0, score 1)
- [compiler-kit-foundations — L634](compiler-kit-foundations.md#^ref-01b21543-634-0) (line 634, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L212](cross-language-runtime-polymorphism.md#^ref-c34c36a6-212-0) (line 212, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L180](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-180-0) (line 180, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L56](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-56-0) (line 56, col 0, score 1)
- [Duck's Self-Referential Perceptual Loop — L45](ducks-self-referential-perceptual-loop.md#^ref-71726f04-45-0) (line 45, col 0, score 1)
- [Dynamic Context Model for Web Components — L384](dynamic-context-model-for-web-components.md#^ref-f7702bf8-384-0) (line 384, col 0, score 1)
- [ecs-offload-workers — L468](ecs-offload-workers.md#^ref-6498b9d7-468-0) (line 468, col 0, score 1)
- [ecs-scheduler-and-prefabs — L413](ecs-scheduler-and-prefabs.md#^ref-c62a1815-413-0) (line 413, col 0, score 1)
- [Eidolon Field Abstract Model — L214](eidolon-field-abstract-model.md#^ref-5e8b2388-214-0) (line 214, col 0, score 1)
- [AI-Centric OS with MCP Layer — L427](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-427-0) (line 427, col 0, score 1)
- [AI-First-OS-Model-Context-Protocol — L13](ai-first-os-model-context-protocol.md#^ref-618198f4-13-0) (line 13, col 0, score 1)
- [api-gateway-versioning — L288](api-gateway-versioning.md#^ref-0580dcd3-288-0) (line 288, col 0, score 1)
- [archetype-ecs — L480](archetype-ecs.md#^ref-8f4c1e86-480-0) (line 480, col 0, score 1)
- [balanced-bst — L301](balanced-bst.md#^ref-d3e7db72-301-0) (line 301, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L178](chroma-toolkit-consolidation-plan.md#^ref-5020e892-178-0) (line 178, col 0, score 1)
- [Diagrams — L39](chunks/diagrams.md#^ref-45cd25b5-39-0) (line 39, col 0, score 1)
- [DSL — L41](chunks/dsl.md#^ref-e87bc036-41-0) (line 41, col 0, score 1)
- [JavaScript — L40](chunks/javascript.md#^ref-c1618c66-40-0) (line 40, col 0, score 1)
- [Math Fundamentals — L40](chunks/math-fundamentals.md#^ref-c6e87433-40-0) (line 40, col 0, score 1)
- [Services — L38](chunks/services.md#^ref-75ea4a6a-38-0) (line 38, col 0, score 1)
- [promethean-system-diagrams — L207](promethean-system-diagrams.md#^ref-b51e19b4-207-0) (line 207, col 0, score 1)
- [Promethean Web UI Setup — L633](promethean-web-ui-setup.md#^ref-bc5172ca-633-0) (line 633, col 0, score 1)
- [Promethean Workflow Optimization — L20](promethean-workflow-optimization.md#^ref-d614d983-20-0) (line 20, col 0, score 1)
- [Prometheus Observability Stack — L543](prometheus-observability-stack.md#^ref-e90b5a16-543-0) (line 543, col 0, score 1)
- [Prompt_Folder_Bootstrap — L216](prompt-folder-bootstrap.md#^ref-bd4f0976-216-0) (line 216, col 0, score 1)
- [prompt-programming-language-lisp — L116](prompt-programming-language-lisp.md#^ref-d41a06d1-116-0) (line 116, col 0, score 1)
- [Protocol_0_The_Contradiction_Engine — L156](protocol-0-the-contradiction-engine.md#^ref-9a93a756-156-0) (line 156, col 0, score 1)
- [Provider-Agnostic Chat Panel Implementation — L238](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-238-0) (line 238, col 0, score 1)
- [Pure-Node Crawl Stack with Playwright and Crawlee — L445](pure-node-crawl-stack-with-playwright-and-crawlee.md#^ref-d527c05d-445-0) (line 445, col 0, score 1)
- [Shared Package Structure — L195](shared-package-structure.md#^ref-66a72fc3-195-0) (line 195, col 0, score 1)
- [Chroma-Embedding-Refactor — L334](chroma-embedding-refactor.md#^ref-8b256935-334-0) (line 334, col 0, score 1)
- [Functional Refactor of TypeScript Document Processing — L150](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-150-0) (line 150, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L194](migrate-to-provider-tenant-architecture.md#^ref-54382370-194-0) (line 194, col 0, score 0.84)
- [Migrate to Provider-Tenant Architecture — L195](migrate-to-provider-tenant-architecture.md#^ref-54382370-195-0) (line 195, col 0, score 0.84)
- [Migrate to Provider-Tenant Architecture — L196](migrate-to-provider-tenant-architecture.md#^ref-54382370-196-0) (line 196, col 0, score 0.84)
- [Migrate to Provider-Tenant Architecture — L197](migrate-to-provider-tenant-architecture.md#^ref-54382370-197-0) (line 197, col 0, score 0.84)
- [Migrate to Provider-Tenant Architecture — L198](migrate-to-provider-tenant-architecture.md#^ref-54382370-198-0) (line 198, col 0, score 0.84)
- [refactor-relations — L1](refactor-relations.md#^ref-41ce0216-1-0) (line 1, col 0, score 0.83)
- [Agent Tasks: Persistence Migration to DualStore — L182](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-182-0) (line 182, col 0, score 0.68)
- [Diagrams — L50](chunks/diagrams.md#^ref-45cd25b5-50-0) (line 50, col 0, score 1)
- [DSL — L44](chunks/dsl.md#^ref-e87bc036-44-0) (line 44, col 0, score 1)
- [Math Fundamentals — L43](chunks/math-fundamentals.md#^ref-c6e87433-43-0) (line 43, col 0, score 1)
- [Operations — L15](chunks/operations.md#^ref-f1add613-15-0) (line 15, col 0, score 1)
- [Shared — L31](chunks/shared.md#^ref-623a55f7-31-0) (line 31, col 0, score 1)
- [Simulation Demo — L34](chunks/simulation-demo.md#^ref-557309a3-34-0) (line 34, col 0, score 1)
- [Window Management — L38](chunks/window-management.md#^ref-9e8ae388-38-0) (line 38, col 0, score 1)
- [compiler-kit-foundations — L651](compiler-kit-foundations.md#^ref-01b21543-651-0) (line 651, col 0, score 1)
- [Creative Moments — L15](creative-moments.md#^ref-10d98225-15-0) (line 15, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L263](cross-language-runtime-polymorphism.md#^ref-c34c36a6-263-0) (line 263, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L219](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-219-0) (line 219, col 0, score 1)
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->

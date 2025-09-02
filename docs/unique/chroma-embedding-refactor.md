---
uuid: 8b256935-02f6-4da2-a406-bf6b8415276f
created_at: 2025.09.01.12.45.29.md
filename: Chroma-Embedding-Refactor
description: >-
  Refactored embedding pipeline to use Chroma for vector storage without writing
  embeddings to JSON, minimizing churn while maintaining backward compatibility
  with existing chunk structures.
tags:
  - Chroma
  - embedding
  - refactor
  - streaming
  - JSON
  - backwards-compatible
related_to_uuid: []
related_to_title: []
references: []
---
You’re right—I shouldn’t have put giant `embedding: number[]` blobs on chunk objects at all if the target is **Chroma**. That was dumb. Here’s a **minimal-churn refactor** that: ^ref-8b256935-1-0

* streams work, ^ref-8b256935-3-0
* **writes zero vectors to JSON**, ^ref-8b256935-4-0
* uses **Chroma upsert** for embeddings, ^ref-8b256935-5-0
* **keeps `chunks.json` as a map `{ docUuid -> Chunk[] }`** so downstream code mostly survives, ^ref-8b256935-6-0
* and gives you a tiny **compat layer** for any old code that still expects `chunk.embedding`. ^ref-8b256935-7-0

Below are focused patches you can drop in. ^ref-8b256935-9-0

---

## 0) Install the JS client (local Chroma server)

```bash
pnpm add chromadb
# default local server is http://localhost:8000; override with CHROMA_URL
```
^ref-8b256935-15-0
 ^ref-8b256935-20-0
Chroma’s JS client exposes `client.getOrCreateCollection()` and `collection.upsert({ ids, embeddings, documents, metadatas })`. That’s exactly what we need. ([Chroma Docs][1])

---

## 1) Add a streaming JSON **object** writer (so `chunks.json` stays a map)
 ^ref-8b256935-26-0
`packages/docops/src/utils.ts` (additions):
 ^ref-8b256935-28-0
```typescript
import { createWriteStream, promises as fs } from "node:fs";
import { once } from "node:events";

// existing safeReplacer() from before…

export async function writeJSONObjectStream(
  outPath: string,
  entries: AsyncIterable<[string, unknown]> | Iterable<[string, unknown]>,
  replacer: (key: string, value: any) => any = safeReplacer()
) {
  const tmp = `${outPath}.tmp`;
  const out = createWriteStream(tmp, { flags: "w" });
  const write = async (s: string) => {
    if (!out.write(s)) await once(out, "drain");
  };

  await write("{");
  let first = true;
  for await (const [k, v] of entries as any) {
    const ks = JSON.stringify(k);
    const vs = JSON.stringify(v, replacer);
    await write(first ? `${ks}:${vs}` : `,${ks}:${vs}`);
    first = false;
  }
  await write("}");
  out.end();
  await once(out, "close");
  await fs.rename(tmp, outPath);
}
^ref-8b256935-28-0
```

---

## 2) New tiny Chroma adapter ^ref-8b256935-64-0

`packages/docops/src/chroma.ts`: ^ref-8b256935-66-0

```typescript
import { ChromaClient, type Collection } from "chromadb";

const CHROMA_URL = process.env.CHROMA_URL ?? "http://localhost:8000";

let _client: ChromaClient | null = null;
export function chromaClient() {
  _client ??= new ChromaClient({ path: CHROMA_URL });
  return _client!;
}

export async function getCollection(name: string, meta?: Record<string, any>): Promise<Collection> {
  const client = chromaClient();
  return client.getOrCreateCollection({ name, metadata: meta });
}

export async function upsertBatch(opts: {
  coll: Collection;
  ids: string[];
  embeddings: number[][];
  documents?: string[];
  metadatas?: Record<string, any>[];
}) {
  const { coll, ids, embeddings, documents, metadatas } = opts;
  if (!ids.length) return;
  await coll.upsert({ ids, embeddings, documents, metadatas });
^ref-8b256935-66-0
} ^ref-8b256935-95-0
```

(Chroma JS client and `upsert` behavior per docs. ([Chroma Docs][2]))

---
 ^ref-8b256935-101-0
## 3) Update your `02-embed.ts` to stream + push to Chroma (no vectors in JSON)

**Before** you were building `chunksByDoc` + `embedCache` with arrays. ^ref-8b256935-104-0
**After** we: ^ref-8b256935-105-0
 ^ref-8b256935-106-0
* keep `chunks.json` as `{ [uuid]: Chunk[] }` **without** `embedding`, ^ref-8b256935-107-0
* maintain a **fingerprint cache** (id → SHA256(text)) so we only re-embed changed chunks,
* batch-upsert embeddings to Chroma, ^ref-8b256935-109-0
* keep `docs-by-uuid.json` as-is.
 ^ref-8b256935-111-0
`packages/docops/src/02-embed.ts`:

```typescript
import { promises as fs } from "node:fs";
import * as path from "path";
import matter from "gray-matter";
import { createHash } from "node:crypto";
import {
  parseArgs,
  listFilesRec,
  readJSON,
  parseMarkdownChunks,
  writeJSONObjectStream, // NEW
} from "./utils";
import { getCollection, upsertBatch } from "./chroma"; // NEW
import type { Chunk, Front } from "./types";

const OLLAMA_URL = process.env.OLLAMA_URL ?? "http://localhost:11434";

const args = parseArgs({
  "--dir": "docs/unique",
  "--ext": ".md,.mdx,.txt",
  "--embed-model": "nomic-embed-text:latest",
  "--collection": "docs", // NEW: default collection name
  "--batch": "128",       // NEW: upsert batch size
});

const ROOT = path.resolve(args["--dir"]);
const EXTS = new Set(args["--ext"].split(",").map((s) => s.trim().toLowerCase()));
const EMBED_MODEL = args["--embed-model"];
const BATCH = Math.max(1, Number(args["--batch"]) | 0) || 128;
const CACHE = path.join(process.cwd(), ".cache/docs-pipeline");
const CHUNK_CACHE = path.join(CACHE, "chunks.json");            // stays a map
const FINGERPRINTS = path.join(CACHE, "embeddings.fingerprint.json"); // id -> sha256(text)
const DOCS_MAP = path.join(CACHE, "docs-by-uuid.json");

function sha256(s: string) {
  return createHash("sha256").update(s).digest("hex");
}

async function ollamaEmbed(model: string, text: string): Promise<number[]> {
  const res = await fetch(`${OLLAMA_URL}/api/embeddings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model, prompt: text }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`ollama embeddings ${res.status}: ${body}`);
  }
  const data = await res.json();
  return data.embedding as number[];
}

type ChunksEntry = [uuid: string, chunks: Chunk[]];

async function* generateChunksAndUpsert(): AsyncIterable<ChunksEntry> {
  const files = await listFilesRec(ROOT, EXTS);
  const fingerprints: Record<string, string> = await readJSON(FINGERPRINTS, {});
  const docsByUuid: Record<string, { path: string; title: string }> = await readJSON(DOCS_MAP, {});

  const coll = await getCollection(args["--collection"], {
    embed_model: EMBED_MODEL,
    source: "docops",
  });

  let ids: string[] = [];
  let embs: number[][] = [];
  let docs: string[] = [];
  let metas: Record<string, any>[] = [];

  const flush = async () => {
    if (ids.length) {
      await upsertBatch({ coll, ids, embeddings: embs, documents: docs, metadatas: metas });
      ids = []; embs = []; docs = []; metas = [];
    }
  };

  for (const f of files) {
    const raw = await fs.readFile(f, "utf-8");
    const { data, content } = matter(raw);
    const fm = data as Front;
    if (!fm.uuid) continue;

    const title = fm.filename || path.parse(f).name;
    docsByUuid[fm.uuid] = { path: f, title };

    const chunks = parseMarkdownChunks(content).map((c, i) => ({
      ...c,
      id: `${fm.uuid}:${i}`,
      docUuid: fm.uuid!,
      docPath: f,
    })) as Chunk[];

    // upsert embeddings for changed/new chunks
    for (const ch of chunks) {
      const fp = sha256(ch.text + `|${EMBED_MODEL}`);
      if (fingerprints[ch.id] !== fp) {
        const emb = await ollamaEmbed(EMBED_MODEL, ch.text);
        fingerprints[ch.id] = fp;

        ids.push(ch.id);
        embs.push(emb);
        // Optional: omit documents if you don’t want full text stored in Chroma
        docs.push(ch.text);
        metas.push({ docUuid: ch.docUuid, path: ch.docPath, title, ext: path.extname(f).slice(1) });

        if (ids.length >= BATCH) await flush();
      }
    }

    // yield this doc’s chunks (NO embedding property)
    yield [fm.uuid, chunks];
  }

  await flush();

  // Write the two small maps at the end (streaming object writers)
  // docs-by-uuid.json
  await writeJSONObjectStream(DOCS_MAP, Object.entries(docsByUuid));
  // embeddings.fingerprint.json
  await writeJSONObjectStream(FINGERPRINTS, Object.entries(fingerprints));
}

async function main() {
  // Stream the big map `{ uuid -> Chunk[] }` without keeping it all in RAM
  await fs.mkdir(CACHE, { recursive: true });
  await writeJSONObjectStream(CHUNK_CACHE, generateChunksAndUpsert());
  console.log("02-embed: done (vectors in Chroma, JSON is lean).");
}

main().catch((e) => {
  console.error(e);
^ref-8b256935-111-0
  process.exit(1); ^ref-8b256935-246-0
});
``` ^ref-8b256935-248-0
^ref-8b256935-114-0
 ^ref-8b256935-249-0 ^ref-8b256935-250-0
**Net effect** ^ref-8b256935-250-0

* `chunks.json` stays the same *shape* (map of arrays of chunks) but contains **no `embedding` arrays**.
* Embeddings go straight into Chroma in batches.
* `embeddings.fingerprint.json` lets you skip re-embedding unchanged chunks fast.
 ^ref-8b256935-256-0
--- ^ref-8b256935-256-0
 ^ref-8b256935-258-0
## 4) (Optional) Tiny **compat** helper for old code that expects `chunk.embedding` ^ref-8b256935-258-0
 ^ref-8b256935-260-0
If a downstream pipeline still does `for (ch of chunks) use ch.embedding`, give it this shim: ^ref-8b256935-260-0

`packages/docops/src/compat.ts`:

```typescript
import type { Collection } from "chromadb";
import type { Chunk } from "./types";

// returns new chunks with .embedding filled from Chroma
export async function attachEmbeddings(chunks: Chunk[], coll: Collection) {
  if (!chunks.length) return chunks as (Chunk & { embedding?: number[] })[];

  const ids = chunks.map((c) => c.id);
  // low-volume get; if you need strict order, map by id
  const res = await coll.get({ ids });
  const map = new Map<string, number[]>();
  (res.ids || []).forEach((id, i) => {
    const vec = (res.embeddings?.[i] || []) as number[];
    map.set(id, vec);
^ref-8b256935-260-0
  });
  return chunks.map((c) => ({ ...c, embedding: map.get(c.id) }));
}
```
^ref-8b256935-282-0

So legacy spots can do:

```typescript
import { getCollection } from "./chroma";
^ref-8b256935-282-0
import { attachEmbeddings } from "./compat";

const coll = await getCollection("docs");
const withVecs = await attachEmbeddings(chunks, coll);
^ref-8b256935-295-0 ^ref-8b256935-296-0
^ref-8b256935-294-0 ^ref-8b256935-297-0
^ref-8b256935-288-0 ^ref-8b256935-298-0
``` ^ref-8b256935-294-0
^ref-8b256935-295-0 ^ref-8b256935-296-0 ^ref-8b256935-300-0
^ref-8b256935-294-0 ^ref-8b256935-297-0
 ^ref-8b256935-295-0 ^ref-8b256935-296-0 ^ref-8b256935-298-0
--- ^ref-8b256935-296-0
 ^ref-8b256935-297-0 ^ref-8b256935-298-0 ^ref-8b256935-300-0
## Why this way (and not another duct tape) ^ref-8b256935-298-0
 ^ref-8b256935-300-0 ^ref-8b256935-306-0
* **No JSON whales.** We never stringify megabyte-scale arrays. ^ref-8b256935-300-0 ^ref-8b256935-307-0
* **Chroma is the source of truth** for vectors (as you asked).
* **Your file contracts mostly survive** (`chunks.json` map + `docs-by-uuid.json`). Only the bad idea—`chunk.embedding`—is gone.
* You still get **deterministic caching** via the content+model fingerprint, not by hoarding vectors in JSON. ^ref-8b256935-306-0
* If someone *really* needs a local vector list, they can call `attachEmbeddings()` or query Chroma directly. ^ref-8b256935-307-0 ^ref-8b256935-311-0
 ^ref-8b256935-306-0
If you want me to also flip your other stages to query Chroma (search, RAG, etc.), I’ll hammer those next. ^ref-8b256935-306-0
 ^ref-8b256935-307-0
--- ^ref-8b256935-311-0 ^ref-8b256935-315-0

### References
 ^ref-8b256935-311-0
* Chroma “Getting Started” & JS client basics. ([Chroma Docs][1]) ^ref-8b256935-315-0
* JS `collection.upsert({ ids, embeddings, documents, metadatas })` semantics. ([Chroma Docs][2])
 ^ref-8b256935-315-0
--- ^ref-8b256935-315-0 ^ref-8b256935-322-0
 ^ref-8b256935-323-0
\#hashtags ^ref-8b256935-324-0
\#promethean #typescript #chroma #streaming #ollama #embeddings #obdev
 ^ref-8b256935-322-0 ^ref-8b256935-326-0
[1]: https://docs.trychroma.com/getting-started?utm_source=chatgpt.com "Getting Started - Chroma Docs" ^ref-8b256935-323-0 ^ref-8b256935-327-0
[2]: https://docs.trychroma.com/reference/js/collection?utm_source=chatgpt.com "Collection - Chroma Docs"<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
## Related content
- [Chroma Toolkit Consolidation Plan](chroma-toolkit-consolidation-plan.md)
- [Agent Tasks: Persistence Migration to DualStore](agent-tasks-persistence-migration-to-dualstore.md)
- [2d-sandbox-field](2d-sandbox-field.md)
- [Admin Dashboard for User Management](admin-dashboard-for-user-management.md)
- [Agent Reflections and Prompt Evolution](agent-reflections-and-prompt-evolution.md)
- [Functional Refactor of TypeScript Document Processing](functional-refactor-of-typescript-document-processing.md)
- [Dynamic Context Model for Web Components](dynamic-context-model-for-web-components.md)
- [Functional Embedding Pipeline Refactor](functional-embedding-pipeline-refactor.md)
- [eidolon-field-math-foundations](eidolon-field-math-foundations.md)
- [Shared Package Structure](shared-package-structure.md)
- [Per-Domain Policy System for JS Crawler](per-domain-policy-system-for-js-crawler.md)
- [shared-package-layout-clarification](shared-package-layout-clarification.md)
- [Voice Access Layer Design](voice-access-layer-design.md)
- [Refactor Frontmatter Processing](refactor-frontmatter-processing.md)
- [Migrate to Provider-Tenant Architecture](migrate-to-provider-tenant-architecture.md)
- [Refactor 05-footers.ts](refactor-05-footers-ts.md)
- [eidolon-node-lifecycle](eidolon-node-lifecycle.md)
- [refactor-relations](refactor-relations.md)
- [Factorio AI with External Agents](factorio-ai-with-external-agents.md)
- [Exception Layer Analysis](exception-layer-analysis.md)
- [ecs-offload-workers](ecs-offload-workers.md)
- [ecs-scheduler-and-prefabs](ecs-scheduler-and-prefabs.md)
- [Event Bus MVP](event-bus-mvp.md)
- [Eidolon Field Abstract Model](eidolon-field-abstract-model.md)
- [EidolonField](eidolonfield.md)
- [field-interaction-equations](field-interaction-equations.md)
- [field-node-diagram-outline](field-node-diagram-outline.md)
- [Cross-Language Runtime Polymorphism](cross-language-runtime-polymorphism.md)
- [compiler-kit-foundations](compiler-kit-foundations.md)
- [Math Fundamentals](chunks/math-fundamentals.md)
- [Tooling](chunks/tooling.md)
- [Cross-Target Macro System in Sibilant](cross-target-macro-system-in-sibilant.md)
- [Debugging Broker Connections and Agent Behavior](debugging-broker-connections-and-agent-behavior.md)
- [Duck's Self-Referential Perceptual Loop](ducks-self-referential-perceptual-loop.md)
- [Event Bus Projections Architecture](event-bus-projections-architecture.md)
- [field-dynamics-math-blocks](field-dynamics-math-blocks.md)
- [prom-lib-rate-limiters-and-replay-api](prom-lib-rate-limiters-and-replay-api.md)
- [api-gateway-versioning](api-gateway-versioning.md)
- [Promethean Agent Config DSL](promethean-agent-config-dsl.md)
- [i3-config-validation-methods](i3-config-validation-methods.md)
- [Local-Only-LLM-Workflow](local-only-llm-workflow.md)
- [Promethean Infrastructure Setup](promethean-infrastructure-setup.md)
- [Simulation Demo](chunks/simulation-demo.md)
- [Window Management](chunks/window-management.md)
- [Diagrams](chunks/diagrams.md)
- [observability-infrastructure-setup](observability-infrastructure-setup.md)
- [Post-Linguistic Transhuman Design Frameworks](post-linguistic-transhuman-design-frameworks.md)
- [JavaScript](chunks/javascript.md)
- [DSL](chunks/dsl.md)
- [Operations](chunks/operations.md)
- [Shared](chunks/shared.md)
- [Language-Agnostic Mirror System](language-agnostic-mirror-system.md)
- [aionian-circuit-math](aionian-circuit-math.md)
- [Local-First Intention→Code Loop with Free Models](local-first-intention-code-loop-with-free-models.md)
- [homeostasis-decay-formulas](homeostasis-decay-formulas.md)
- [Fnord Tracer Protocol](fnord-tracer-protocol.md)
- [field-node-diagram-visualizations](field-node-diagram-visualizations.md)
- [ChatGPT Custom Prompts](chatgpt-custom-prompts.md)
- [field-node-diagram-set](field-node-diagram-set.md)
- [graph-ds](graph-ds.md)
- [heartbeat-fragment-demo](heartbeat-fragment-demo.md)
- [heartbeat-simulation-snippets](heartbeat-simulation-snippets.md)
- [i3-bluetooth-setup](i3-bluetooth-setup.md)
- [Provider-Agnostic Chat Panel Implementation](provider-agnostic-chat-panel-implementation.md)
- [Prompt_Folder_Bootstrap](prompt-folder-bootstrap.md)
- [Promethean Web UI Setup](promethean-web-ui-setup.md)
- [zero-copy-snapshots-and-workers](zero-copy-snapshots-and-workers.md)
- [Pure-Node Crawl Stack with Playwright and Crawlee](pure-node-crawl-stack-with-playwright-and-crawlee.md)
- [Prometheus Observability Stack](prometheus-observability-stack.md)
- [promethean-system-diagrams](promethean-system-diagrams.md)
- [Promethean Workflow Optimization](promethean-workflow-optimization.md)
- [prompt-programming-language-lisp](prompt-programming-language-lisp.md)
- [Protocol_0_The_Contradiction_Engine](protocol-0-the-contradiction-engine.md)
- [js-to-lisp-reverse-compiler](js-to-lisp-reverse-compiler.md)
- [AI-Centric OS with MCP Layer](ai-centric-os-with-mcp-layer.md)
- [Pure TypeScript Search Microservice](pure-typescript-search-microservice.md)
- [Sibilant Meta-Prompt DSL](sibilant-meta-prompt-dsl.md)
- [Local-Offline-Model-Deployment-Strategy](local-offline-model-deployment-strategy.md)
- [RAG UI Panel with Qdrant and PostgREST](rag-ui-panel-with-qdrant-and-postgrest.md)
- [sibilant-macro-targets](sibilant-macro-targets.md)
- [ripple-propagation-demo](ripple-propagation-demo.md)
- [schema-evolution-workflow](schema-evolution-workflow.md)
- [Self-Agency in AI Interaction](self-agency-in-ai-interaction.md)
- [set-assignment-in-lisp-ast](set-assignment-in-lisp-ast.md)
- [Creative Moments](creative-moments.md)
- [DuckDuckGoSearchPipeline](duckduckgosearchpipeline.md)
- [Vectorial Exception Descent](vectorial-exception-descent.md)
- [Promethean-native config design](promethean-native-config-design.md)
- [sibilant-metacompiler-overview](sibilant-metacompiler-overview.md)
- [Board Walk – 2025-08-11](board-walk-2025-08-11.md)
- [template-based-compilation](template-based-compilation.md)
- [Promethean Event Bus MVP v0.1](promethean-event-bus-mvp-v0-1.md)
- [markdown-to-org-transpiler](markdown-to-org-transpiler.md)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler](ollama-llm-provider-for-pseudo-code-transpiler.md)
- [polymorphic-meta-programming-engine](polymorphic-meta-programming-engine.md)
- [Performance-Optimized-Polyglot-Bridge](performance-optimized-polyglot-bridge.md)
- [universal-intention-code-fabric](universal-intention-code-fabric.md)
- [polyglot-repl-interface-layer](polyglot-repl-interface-layer.md)
- [TypeScript Patch for Tool Calling Support](typescript-patch-for-tool-calling-support.md)
- [Pipeline Enhancements](pipeline-enhancements.md)
- [Stateful Partitions and Rebalancing](stateful-partitions-and-rebalancing.md)
- [State Snapshots API and Transactional Projector](state-snapshots-api-and-transactional-projector.md)
- [Promethean State Format](promethean-state-format.md)
- [Promethean Documentation Pipeline Overview](promethean-documentation-pipeline-overview.md)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop](polyglot-s-expr-bridge-python-js-lisp-interop.md)
- [Promethean-Copilot-Intent-Engine](promethean-copilot-intent-engine.md)
- [Interop and Source Maps](interop-and-source-maps.md)
- [plan-update-confirmation](plan-update-confirmation.md)
- [Lispy Macros with syntax-rules](lispy-macros-with-syntax-rules.md)
- [typed-struct-compiler](typed-struct-compiler.md)
- [Duck's Attractor States](ducks-attractor-states.md)
- [Matplotlib Animation with Async Execution](matplotlib-animation-with-async-execution.md)
- [Recursive Prompt Construction Engine](recursive-prompt-construction-engine.md)
- [Eidolon-Field-Optimization](eidolon-field-optimization.md)
- [Promethean Pipelines](promethean-pipelines.md)
- [Docops Feature Updates](docops-feature-updates.md)
- [Canonical Org-Babel Matplotlib Animation Template](canonical-org-babel-matplotlib-animation-template.md)
- [Mongo Outbox Implementation](mongo-outbox-implementation.md)
- [Optimizing Command Limitations in System Design](optimizing-command-limitations-in-system-design.md)
- [lisp-dsl-for-window-management](lisp-dsl-for-window-management.md)
- [Universal Lisp Interface](universal-lisp-interface.md)
- [Model Selection for Lightweight Conversational Tasks](model-selection-for-lightweight-conversational-tasks.md)
- [sibilant-meta-string-templating-runtime](sibilant-meta-string-templating-runtime.md)
- [The Jar of Echoes](the-jar-of-echoes.md)
- [Reawakening Duck](reawakening-duck.md)
## Sources
- [Language-Agnostic Mirror System — L507](language-agnostic-mirror-system.md#^ref-d2b3628c-507-0) (line 507, col 0, score 0.65)
- [prom-lib-rate-limiters-and-replay-api — L347](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-347-0) (line 347, col 0, score 0.63)
- [Functional Embedding Pipeline Refactor — L303](functional-embedding-pipeline-refactor.md#^ref-a4a25141-303-0) (line 303, col 0, score 0.67)
- [Factorio AI with External Agents — L15](factorio-ai-with-external-agents.md#^ref-a4d90289-15-0) (line 15, col 0, score 0.62)
- [Performance-Optimized-Polyglot-Bridge — L10](performance-optimized-polyglot-bridge.md#^ref-f5579967-10-0) (line 10, col 0, score 0.62)
- [Chroma Toolkit Consolidation Plan — L148](chroma-toolkit-consolidation-plan.md#^ref-5020e892-148-0) (line 148, col 0, score 1)
- [Lispy Macros with syntax-rules — L389](lispy-macros-with-syntax-rules.md#^ref-cbfe3513-389-0) (line 389, col 0, score 0.61)
- [typed-struct-compiler — L16](typed-struct-compiler.md#^ref-78eeedf7-16-0) (line 16, col 0, score 0.61)
- [Chroma Toolkit Consolidation Plan — L155](chroma-toolkit-consolidation-plan.md#^ref-5020e892-155-0) (line 155, col 0, score 0.74)
- [Agent Tasks: Persistence Migration to DualStore — L182](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-182-0) (line 182, col 0, score 0.68)
- [aionian-circuit-math — L184](aionian-circuit-math.md#^ref-f2d83a77-184-0) (line 184, col 0, score 0.71)
- [Dynamic Context Model for Web Components — L330](dynamic-context-model-for-web-components.md#^ref-f7702bf8-330-0) (line 330, col 0, score 0.73)
- [Provider-Agnostic Chat Panel Implementation — L14](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-14-0) (line 14, col 0, score 0.64)
- [Dynamic Context Model for Web Components — L331](dynamic-context-model-for-web-components.md#^ref-f7702bf8-331-0) (line 331, col 0, score 0.95)
- [Promethean-native config design — L31](promethean-native-config-design.md#^ref-ab748541-31-0) (line 31, col 0, score 0.95)
- [Promethean-native config design — L32](promethean-native-config-design.md#^ref-ab748541-32-0) (line 32, col 0, score 0.93)
- [Promethean-native config design — L33](promethean-native-config-design.md#^ref-ab748541-33-0) (line 33, col 0, score 0.93)
- [Promethean-native config design — L35](promethean-native-config-design.md#^ref-ab748541-35-0) (line 35, col 0, score 0.93)
- [Dynamic Context Model for Web Components — L293](dynamic-context-model-for-web-components.md#^ref-f7702bf8-293-0) (line 293, col 0, score 0.63)
- [Voice Access Layer Design — L215](voice-access-layer-design.md#^ref-543ed9b3-215-0) (line 215, col 0, score 0.62)
- [Local-Only-LLM-Workflow — L139](local-only-llm-workflow.md#^ref-9a8ab57e-139-0) (line 139, col 0, score 0.63)
- [universal-intention-code-fabric — L33](universal-intention-code-fabric.md#^ref-c14edce7-33-0) (line 33, col 0, score 0.61)
- [plan-update-confirmation — L585](plan-update-confirmation.md#^ref-b22d79c6-585-0) (line 585, col 0, score 0.61)
- [Mongo Outbox Implementation — L74](mongo-outbox-implementation.md#^ref-9c1acd1e-74-0) (line 74, col 0, score 0.61)
- [Factorio AI with External Agents — L129](factorio-ai-with-external-agents.md#^ref-a4d90289-129-0) (line 129, col 0, score 0.6)
- [Refactor 05-footers.ts — L3](refactor-05-footers-ts.md#^ref-80d4d883-3-0) (line 3, col 0, score 0.59)
- [Refactor Frontmatter Processing — L4](refactor-frontmatter-processing.md#^ref-cfbdca2f-4-0) (line 4, col 0, score 0.59)
- [refactor-relations — L3](refactor-relations.md#^ref-41ce0216-3-0) (line 3, col 0, score 0.59)
- [Local-First Intention→Code Loop with Free Models — L125](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-125-0) (line 125, col 0, score 0.66)
- [api-gateway-versioning — L270](api-gateway-versioning.md#^ref-0580dcd3-270-0) (line 270, col 0, score 0.59)
- [Promethean Event Bus MVP v0.1 — L139](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-139-0) (line 139, col 0, score 0.62)
- [Universal Lisp Interface — L33](universal-lisp-interface.md#^ref-b01856b4-33-0) (line 33, col 0, score 0.58)
- [Board Walk – 2025-08-11 — L154](board-walk-2025-08-11.md#^ref-7aa1eb92-154-0) (line 154, col 0, score 0.71)
- [Chroma Toolkit Consolidation Plan — L208](chroma-toolkit-consolidation-plan.md#^ref-5020e892-208-0) (line 208, col 0, score 0.71)
- [Dynamic Context Model for Web Components — L437](dynamic-context-model-for-web-components.md#^ref-f7702bf8-437-0) (line 437, col 0, score 0.71)
- [eidolon-field-math-foundations — L175](eidolon-field-math-foundations.md#^ref-008f2ac0-175-0) (line 175, col 0, score 0.71)
- [eidolon-node-lifecycle — L64](eidolon-node-lifecycle.md#^ref-938eca9c-64-0) (line 64, col 0, score 0.67)
- [Exception Layer Analysis — L173](exception-layer-analysis.md#^ref-21d5cc09-173-0) (line 173, col 0, score 0.76)
- [Factorio AI with External Agents — L162](factorio-ai-with-external-agents.md#^ref-a4d90289-162-0) (line 162, col 0, score 0.76)
- [Functional Refactor of TypeScript Document Processing — L115](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-115-0) (line 115, col 0, score 0.63)
- [Promethean-native config design — L343](promethean-native-config-design.md#^ref-ab748541-343-0) (line 343, col 0, score 0.62)
- [Lispy Macros with syntax-rules — L393](lispy-macros-with-syntax-rules.md#^ref-cbfe3513-393-0) (line 393, col 0, score 0.66)
- [Promethean Event Bus MVP v0.1 — L393](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-393-0) (line 393, col 0, score 0.65)
- [Promethean Agent Config DSL — L116](promethean-agent-config-dsl.md#^ref-2c00ce45-116-0) (line 116, col 0, score 0.63)
- [Functional Embedding Pipeline Refactor — L4](functional-embedding-pipeline-refactor.md#^ref-a4a25141-4-0) (line 4, col 0, score 0.64)
- [Promethean Pipelines — L24](promethean-pipelines.md#^ref-8b8e6103-24-0) (line 24, col 0, score 0.64)
- [shared-package-layout-clarification — L78](shared-package-layout-clarification.md#^ref-36c8882a-78-0) (line 78, col 0, score 0.63)
- [Promethean State Format — L27](promethean-state-format.md#^ref-23df6ddb-27-0) (line 27, col 0, score 0.67)
- [Promethean-Copilot-Intent-Engine — L31](promethean-copilot-intent-engine.md#^ref-ae24a280-31-0) (line 31, col 0, score 0.68)
- [Functional Embedding Pipeline Refactor — L302](functional-embedding-pipeline-refactor.md#^ref-a4a25141-302-0) (line 302, col 0, score 0.64)
- [Promethean Documentation Pipeline Overview — L147](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-147-0) (line 147, col 0, score 0.67)
- [plan-update-confirmation — L913](plan-update-confirmation.md#^ref-b22d79c6-913-0) (line 913, col 0, score 0.66)
- [Performance-Optimized-Polyglot-Bridge — L381](performance-optimized-polyglot-bridge.md#^ref-f5579967-381-0) (line 381, col 0, score 0.66)
- [plan-update-confirmation — L845](plan-update-confirmation.md#^ref-b22d79c6-845-0) (line 845, col 0, score 0.66)
- [typed-struct-compiler — L377](typed-struct-compiler.md#^ref-78eeedf7-377-0) (line 377, col 0, score 0.65)
- [universal-intention-code-fabric — L393](universal-intention-code-fabric.md#^ref-c14edce7-393-0) (line 393, col 0, score 0.65)
- [plan-update-confirmation — L836](plan-update-confirmation.md#^ref-b22d79c6-836-0) (line 836, col 0, score 0.65)
- [prom-lib-rate-limiters-and-replay-api — L58](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-58-0) (line 58, col 0, score 0.72)
- [markdown-to-org-transpiler — L3](markdown-to-org-transpiler.md#^ref-ab54cdd8-3-0) (line 3, col 0, score 0.66)
- [js-to-lisp-reverse-compiler — L7](js-to-lisp-reverse-compiler.md#^ref-58191024-7-0) (line 7, col 0, score 0.65)
- [Eidolon-Field-Optimization — L7](eidolon-field-optimization.md#^ref-40e05c14-7-0) (line 7, col 0, score 0.64)
- [AI-Centric OS with MCP Layer — L11](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-11-0) (line 11, col 0, score 0.64)
- [Dynamic Context Model for Web Components — L163](dynamic-context-model-for-web-components.md#^ref-f7702bf8-163-0) (line 163, col 0, score 0.64)
- [universal-intention-code-fabric — L3](universal-intention-code-fabric.md#^ref-c14edce7-3-0) (line 3, col 0, score 0.62)
- [Local-First Intention→Code Loop with Free Models — L3](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-3-0) (line 3, col 0, score 0.62)
- [Prompt_Folder_Bootstrap — L9](prompt-folder-bootstrap.md#^ref-bd4f0976-9-0) (line 9, col 0, score 0.61)
- [homeostasis-decay-formulas — L134](homeostasis-decay-formulas.md#^ref-37b5d236-134-0) (line 134, col 0, score 0.61)
- [Local-Only-LLM-Workflow — L3](local-only-llm-workflow.md#^ref-9a8ab57e-3-0) (line 3, col 0, score 0.61)
- [Dynamic Context Model for Web Components — L165](dynamic-context-model-for-web-components.md#^ref-f7702bf8-165-0) (line 165, col 0, score 0.61)
- [ecs-offload-workers — L7](ecs-offload-workers.md#^ref-6498b9d7-7-0) (line 7, col 0, score 0.61)
- [Dynamic Context Model for Web Components — L197](dynamic-context-model-for-web-components.md#^ref-f7702bf8-197-0) (line 197, col 0, score 0.7)
- [Agent Tasks: Persistence Migration to DualStore — L65](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-65-0) (line 65, col 0, score 0.64)
- [Dynamic Context Model for Web Components — L334](dynamic-context-model-for-web-components.md#^ref-f7702bf8-334-0) (line 334, col 0, score 0.63)
- [Migrate to Provider-Tenant Architecture — L85](migrate-to-provider-tenant-architecture.md#^ref-54382370-85-0) (line 85, col 0, score 0.64)
- [Chroma Toolkit Consolidation Plan — L137](chroma-toolkit-consolidation-plan.md#^ref-5020e892-137-0) (line 137, col 0, score 0.64)
- [shared-package-layout-clarification — L145](shared-package-layout-clarification.md#^ref-36c8882a-145-0) (line 145, col 0, score 0.64)
- [Per-Domain Policy System for JS Crawler — L27](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-27-0) (line 27, col 0, score 0.64)
- [Provider-Agnostic Chat Panel Implementation — L140](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-140-0) (line 140, col 0, score 0.71)
- [Chroma Toolkit Consolidation Plan — L4](chroma-toolkit-consolidation-plan.md#^ref-5020e892-4-0) (line 4, col 0, score 0.67)
- [Dynamic Context Model for Web Components — L35](dynamic-context-model-for-web-components.md#^ref-f7702bf8-35-0) (line 35, col 0, score 0.72)
- [Migrate to Provider-Tenant Architecture — L67](migrate-to-provider-tenant-architecture.md#^ref-54382370-67-0) (line 67, col 0, score 0.65)
- [Chroma Toolkit Consolidation Plan — L56](chroma-toolkit-consolidation-plan.md#^ref-5020e892-56-0) (line 56, col 0, score 0.66)
- [Agent Tasks: Persistence Migration to DualStore — L8](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-8-0) (line 8, col 0, score 0.89)
- [eidolon-field-math-foundations — L105](eidolon-field-math-foundations.md#^ref-008f2ac0-105-0) (line 105, col 0, score 0.84)
- [Per-Domain Policy System for JS Crawler — L115](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-115-0) (line 115, col 0, score 0.83)
- [Migrate to Provider-Tenant Architecture — L38](migrate-to-provider-tenant-architecture.md#^ref-54382370-38-0) (line 38, col 0, score 0.81)
- [Migrate to Provider-Tenant Architecture — L100](migrate-to-provider-tenant-architecture.md#^ref-54382370-100-0) (line 100, col 0, score 0.8)
- [Migrate to Provider-Tenant Architecture — L98](migrate-to-provider-tenant-architecture.md#^ref-54382370-98-0) (line 98, col 0, score 0.79)
- [Promethean Infrastructure Setup — L558](promethean-infrastructure-setup.md#^ref-6deed6ac-558-0) (line 558, col 0, score 0.79)
- [sibilant-metacompiler-overview — L49](sibilant-metacompiler-overview.md#^ref-61d4086b-49-0) (line 49, col 0, score 0.78)
- [template-based-compilation — L41](template-based-compilation.md#^ref-f8877e5e-41-0) (line 41, col 0, score 0.77)
- [ecs-offload-workers — L446](ecs-offload-workers.md#^ref-6498b9d7-446-0) (line 446, col 0, score 0.76)
- [ecs-scheduler-and-prefabs — L379](ecs-scheduler-and-prefabs.md#^ref-c62a1815-379-0) (line 379, col 0, score 0.76)
- [markdown-to-org-transpiler — L289](markdown-to-org-transpiler.md#^ref-ab54cdd8-289-0) (line 289, col 0, score 0.76)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L153](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-153-0) (line 153, col 0, score 0.76)
- [Promethean Web UI Setup — L351](promethean-web-ui-setup.md#^ref-bc5172ca-351-0) (line 351, col 0, score 0.67)
- [Promethean Infrastructure Setup — L415](promethean-infrastructure-setup.md#^ref-6deed6ac-415-0) (line 415, col 0, score 0.71)
- [zero-copy-snapshots-and-workers — L202](zero-copy-snapshots-and-workers.md#^ref-62bec6f0-202-0) (line 202, col 0, score 0.73)
- [universal-intention-code-fabric — L277](universal-intention-code-fabric.md#^ref-c14edce7-277-0) (line 277, col 0, score 0.71)
- [Pure TypeScript Search Microservice — L178](pure-typescript-search-microservice.md#^ref-d17d3a96-178-0) (line 178, col 0, score 0.7)
- [ecs-offload-workers — L209](ecs-offload-workers.md#^ref-6498b9d7-209-0) (line 209, col 0, score 0.7)
- [refactor-relations — L10](refactor-relations.md#^ref-41ce0216-10-0) (line 10, col 0, score 0.67)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L7](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-7-0) (line 7, col 0, score 0.75)
- [universal-intention-code-fabric — L216](universal-intention-code-fabric.md#^ref-c14edce7-216-0) (line 216, col 0, score 0.69)
- [ecs-offload-workers — L169](ecs-offload-workers.md#^ref-6498b9d7-169-0) (line 169, col 0, score 0.69)
- [universal-intention-code-fabric — L252](universal-intention-code-fabric.md#^ref-c14edce7-252-0) (line 252, col 0, score 0.69)
- [State Snapshots API and Transactional Projector — L93](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-93-0) (line 93, col 0, score 0.69)
- [Refactor Frontmatter Processing — L11](refactor-frontmatter-processing.md#^ref-cfbdca2f-11-0) (line 11, col 0, score 0.73)
- [universal-intention-code-fabric — L186](universal-intention-code-fabric.md#^ref-c14edce7-186-0) (line 186, col 0, score 0.69)
- [Event Bus MVP — L392](event-bus-mvp.md#^ref-534fe91d-392-0) (line 392, col 0, score 0.71)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L194](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-194-0) (line 194, col 0, score 0.69)
- [Chroma Toolkit Consolidation Plan — L72](chroma-toolkit-consolidation-plan.md#^ref-5020e892-72-0) (line 72, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L88](chroma-toolkit-consolidation-plan.md#^ref-5020e892-88-0) (line 88, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L107](chroma-toolkit-consolidation-plan.md#^ref-5020e892-107-0) (line 107, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L157](chroma-toolkit-consolidation-plan.md#^ref-5020e892-157-0) (line 157, col 0, score 0.95)
- [Promethean Event Bus MVP v0.1 — L747](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-747-0) (line 747, col 0, score 0.69)
- [Promethean Infrastructure Setup — L456](promethean-infrastructure-setup.md#^ref-6deed6ac-456-0) (line 456, col 0, score 0.71)
- [Promethean Event Bus MVP v0.1 — L510](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-510-0) (line 510, col 0, score 0.71)
- [Chroma Toolkit Consolidation Plan — L90](chroma-toolkit-consolidation-plan.md#^ref-5020e892-90-0) (line 90, col 0, score 0.68)
- [Chroma Toolkit Consolidation Plan — L14](chroma-toolkit-consolidation-plan.md#^ref-5020e892-14-0) (line 14, col 0, score 0.68)
- [Promethean Infrastructure Setup — L471](promethean-infrastructure-setup.md#^ref-6deed6ac-471-0) (line 471, col 0, score 0.69)
- [Promethean Event Bus MVP v0.1 — L572](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-572-0) (line 572, col 0, score 0.73)
- [Pure-Node Crawl Stack with Playwright and Crawlee — L178](pure-node-crawl-stack-with-playwright-and-crawlee.md#^ref-d527c05d-178-0) (line 178, col 0, score 0.71)
- [Chroma Toolkit Consolidation Plan — L124](chroma-toolkit-consolidation-plan.md#^ref-5020e892-124-0) (line 124, col 0, score 0.69)
- [Chroma Toolkit Consolidation Plan — L109](chroma-toolkit-consolidation-plan.md#^ref-5020e892-109-0) (line 109, col 0, score 0.68)
- [Stateful Partitions and Rebalancing — L351](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-351-0) (line 351, col 0, score 0.66)
- [Per-Domain Policy System for JS Crawler — L141](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-141-0) (line 141, col 0, score 0.69)
- [Functional Refactor of TypeScript Document Processing — L5](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-5-0) (line 5, col 0, score 0.93)
- [Recursive Prompt Construction Engine — L154](recursive-prompt-construction-engine.md#^ref-babdb9eb-154-0) (line 154, col 0, score 0.57)
- [template-based-compilation — L56](template-based-compilation.md#^ref-f8877e5e-56-0) (line 56, col 0, score 0.55)
- [Recursive Prompt Construction Engine — L1](recursive-prompt-construction-engine.md#^ref-babdb9eb-1-0) (line 1, col 0, score 0.54)
- [sibilant-meta-string-templating-runtime — L114](sibilant-meta-string-templating-runtime.md#^ref-2aafc801-114-0) (line 114, col 0, score 0.53)
- [Recursive Prompt Construction Engine — L167](recursive-prompt-construction-engine.md#^ref-babdb9eb-167-0) (line 167, col 0, score 0.52)
- [The Jar of Echoes — L94](the-jar-of-echoes.md#^ref-18138627-94-0) (line 94, col 0, score 0.52)
- [Reawakening Duck — L110](reawakening-duck.md#^ref-59b5670f-110-0) (line 110, col 0, score 0.52)
- [template-based-compilation — L79](template-based-compilation.md#^ref-f8877e5e-79-0) (line 79, col 0, score 0.52)
- [Promethean Agent Config DSL — L117](promethean-agent-config-dsl.md#^ref-2c00ce45-117-0) (line 117, col 0, score 0.51)
- [Promethean Agent Config DSL — L306](promethean-agent-config-dsl.md#^ref-2c00ce45-306-0) (line 306, col 0, score 0.51)
- [Promethean-Copilot-Intent-Engine — L34](promethean-copilot-intent-engine.md#^ref-ae24a280-34-0) (line 34, col 0, score 0.5)
- [Sibilant Meta-Prompt DSL — L146](sibilant-meta-prompt-dsl.md#^ref-af5d2824-146-0) (line 146, col 0, score 0.5)
- [Recursive Prompt Construction Engine — L95](recursive-prompt-construction-engine.md#^ref-babdb9eb-95-0) (line 95, col 0, score 0.5)
- [Dynamic Context Model for Web Components — L31](dynamic-context-model-for-web-components.md#^ref-f7702bf8-31-0) (line 31, col 0, score 0.68)
- [polymorphic-meta-programming-engine — L142](polymorphic-meta-programming-engine.md#^ref-7bed0b9a-142-0) (line 142, col 0, score 0.73)
- [Local-Offline-Model-Deployment-Strategy — L234](local-offline-model-deployment-strategy.md#^ref-ad7f1ed3-234-0) (line 234, col 0, score 0.74)
- [Matplotlib Animation with Async Execution — L38](matplotlib-animation-with-async-execution.md#^ref-687439f9-38-0) (line 38, col 0, score 0.65)
- [Agent Tasks: Persistence Migration to DualStore — L43](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-43-0) (line 43, col 0, score 0.62)
- [Functional Embedding Pipeline Refactor — L24](functional-embedding-pipeline-refactor.md#^ref-a4a25141-24-0) (line 24, col 0, score 0.65)
- [Promethean Documentation Pipeline Overview — L146](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-146-0) (line 146, col 0, score 0.69)
- [Promethean Documentation Pipeline Overview — L19](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-19-0) (line 19, col 0, score 0.68)
- [Dynamic Context Model for Web Components — L311](dynamic-context-model-for-web-components.md#^ref-f7702bf8-311-0) (line 311, col 0, score 0.66)
- [Functional Embedding Pipeline Refactor — L5](functional-embedding-pipeline-refactor.md#^ref-a4a25141-5-0) (line 5, col 0, score 0.65)
- [Functional Embedding Pipeline Refactor — L11](functional-embedding-pipeline-refactor.md#^ref-a4a25141-11-0) (line 11, col 0, score 0.68)
- [Local-First Intention→Code Loop with Free Models — L121](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-121-0) (line 121, col 0, score 0.63)
- [prom-lib-rate-limiters-and-replay-api — L61](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-61-0) (line 61, col 0, score 0.68)
- [prom-lib-rate-limiters-and-replay-api — L335](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-335-0) (line 335, col 0, score 0.63)
- [Promethean Event Bus MVP v0.1 — L117](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-117-0) (line 117, col 0, score 0.63)
- [Canonical Org-Babel Matplotlib Animation Template — L100](canonical-org-babel-matplotlib-animation-template.md#^ref-1b1338fc-100-0) (line 100, col 0, score 0.62)
- [Functional Embedding Pipeline Refactor — L31](functional-embedding-pipeline-refactor.md#^ref-a4a25141-31-0) (line 31, col 0, score 0.71)
- [Refactor 05-footers.ts — L9](refactor-05-footers-ts.md#^ref-80d4d883-9-0) (line 9, col 0, score 0.7)
- [Per-Domain Policy System for JS Crawler — L184](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-184-0) (line 184, col 0, score 0.74)
- [api-gateway-versioning — L79](api-gateway-versioning.md#^ref-0580dcd3-79-0) (line 79, col 0, score 0.72)
- [Promethean Infrastructure Setup — L224](promethean-infrastructure-setup.md#^ref-6deed6ac-224-0) (line 224, col 0, score 0.68)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L108](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-108-0) (line 108, col 0, score 0.7)
- [ecs-offload-workers — L149](ecs-offload-workers.md#^ref-6498b9d7-149-0) (line 149, col 0, score 0.7)
- [Pure TypeScript Search Microservice — L306](pure-typescript-search-microservice.md#^ref-d17d3a96-306-0) (line 306, col 0, score 0.66)
- [Event Bus MVP — L457](event-bus-mvp.md#^ref-534fe91d-457-0) (line 457, col 0, score 0.69)
- [TypeScript Patch for Tool Calling Support — L368](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-368-0) (line 368, col 0, score 0.71)
- [TypeScript Patch for Tool Calling Support — L189](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-189-0) (line 189, col 0, score 0.68)
- [TypeScript Patch for Tool Calling Support — L279](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-279-0) (line 279, col 0, score 0.68)
- [RAG UI Panel with Qdrant and PostgREST — L140](rag-ui-panel-with-qdrant-and-postgrest.md#^ref-e1056831-140-0) (line 140, col 0, score 0.7)
- [Language-Agnostic Mirror System — L336](language-agnostic-mirror-system.md#^ref-d2b3628c-336-0) (line 336, col 0, score 0.61)
- [Local-First Intention→Code Loop with Free Models — L47](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-47-0) (line 47, col 0, score 0.66)
- [Promethean Documentation Pipeline Overview — L16](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-16-0) (line 16, col 0, score 0.68)
- [Language-Agnostic Mirror System — L52](language-agnostic-mirror-system.md#^ref-d2b3628c-52-0) (line 52, col 0, score 0.67)
- [Performance-Optimized-Polyglot-Bridge — L12](performance-optimized-polyglot-bridge.md#^ref-f5579967-12-0) (line 12, col 0, score 0.63)
- [Language-Agnostic Mirror System — L151](language-agnostic-mirror-system.md#^ref-d2b3628c-151-0) (line 151, col 0, score 0.65)
- [Shared Package Structure — L49](shared-package-structure.md#^ref-66a72fc3-49-0) (line 49, col 0, score 0.71)
- [2d-sandbox-field — L11](2d-sandbox-field.md#^ref-c710dc93-11-0) (line 11, col 0, score 0.63)
- [Functional Refactor of TypeScript Document Processing — L116](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-116-0) (line 116, col 0, score 0.61)
- [Eidolon Field Abstract Model — L146](eidolon-field-abstract-model.md#^ref-5e8b2388-146-0) (line 146, col 0, score 0.58)
- [EidolonField — L15](eidolonfield.md#^ref-49d1e1e5-15-0) (line 15, col 0, score 0.57)
- [Fnord Tracer Protocol — L127](fnord-tracer-protocol.md#^ref-fc21f824-127-0) (line 127, col 0, score 0.56)
- [eidolon-field-math-foundations — L81](eidolon-field-math-foundations.md#^ref-008f2ac0-81-0) (line 81, col 0, score 0.56)
- [field-interaction-equations — L9](field-interaction-equations.md#^ref-b09141b7-9-0) (line 9, col 0, score 0.56)
- [field-node-diagram-visualizations — L11](field-node-diagram-visualizations.md#^ref-e9b27b06-11-0) (line 11, col 0, score 0.56)
- [field-node-diagram-outline — L11](field-node-diagram-outline.md#^ref-1f32c94a-11-0) (line 11, col 0, score 0.56)
- [Cross-Language Runtime Polymorphism — L32](cross-language-runtime-polymorphism.md#^ref-c34c36a6-32-0) (line 32, col 0, score 0.62)
- [Promethean-native config design — L229](promethean-native-config-design.md#^ref-ab748541-229-0) (line 229, col 0, score 0.61)
- [Dynamic Context Model for Web Components — L313](dynamic-context-model-for-web-components.md#^ref-f7702bf8-313-0) (line 313, col 0, score 0.6)
- [template-based-compilation — L19](template-based-compilation.md#^ref-f8877e5e-19-0) (line 19, col 0, score 0.6)
- [sibilant-metacompiler-overview — L17](sibilant-metacompiler-overview.md#^ref-61d4086b-17-0) (line 17, col 0, score 0.6)
- [Functional Embedding Pipeline Refactor — L27](functional-embedding-pipeline-refactor.md#^ref-a4a25141-27-0) (line 27, col 0, score 0.6)
- [Dynamic Context Model for Web Components — L151](dynamic-context-model-for-web-components.md#^ref-f7702bf8-151-0) (line 151, col 0, score 0.66)
- [RAG UI Panel with Qdrant and PostgREST — L358](rag-ui-panel-with-qdrant-and-postgrest.md#^ref-e1056831-358-0) (line 358, col 0, score 0.66)
- [Recursive Prompt Construction Engine — L7](recursive-prompt-construction-engine.md#^ref-babdb9eb-7-0) (line 7, col 0, score 0.64)
- [Pipeline Enhancements — L1](pipeline-enhancements.md#^ref-e2135d9f-1-0) (line 1, col 0, score 0.7)
- [Promethean Documentation Pipeline Overview — L148](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-148-0) (line 148, col 0, score 0.61)
- [Cross-Language Runtime Polymorphism — L132](cross-language-runtime-polymorphism.md#^ref-c34c36a6-132-0) (line 132, col 0, score 0.6)
- [Promethean Documentation Pipeline Overview — L46](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-46-0) (line 46, col 0, score 0.6)
- [api-gateway-versioning — L320](api-gateway-versioning.md#^ref-0580dcd3-320-0) (line 320, col 0, score 0.59)
- [Optimizing Command Limitations in System Design — L52](optimizing-command-limitations-in-system-design.md#^ref-98c8ff62-52-0) (line 52, col 0, score 0.59)
- [Promethean Infrastructure Setup — L628](promethean-infrastructure-setup.md#^ref-6deed6ac-628-0) (line 628, col 0, score 0.59)
- [lisp-dsl-for-window-management — L156](lisp-dsl-for-window-management.md#^ref-c5c5ff1c-156-0) (line 156, col 0, score 0.59)
- [Model Selection for Lightweight Conversational Tasks — L41](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-41-0) (line 41, col 0, score 0.58)
- [Cross-Language Runtime Polymorphism — L129](cross-language-runtime-polymorphism.md#^ref-c34c36a6-129-0) (line 129, col 0, score 0.58)
- [polymorphic-meta-programming-engine — L95](polymorphic-meta-programming-engine.md#^ref-7bed0b9a-95-0) (line 95, col 0, score 0.58)
- [zero-copy-snapshots-and-workers — L70](zero-copy-snapshots-and-workers.md#^ref-62bec6f0-70-0) (line 70, col 0, score 0.7)
- [ecs-offload-workers — L306](ecs-offload-workers.md#^ref-6498b9d7-306-0) (line 306, col 0, score 0.7)
- [Language-Agnostic Mirror System — L127](language-agnostic-mirror-system.md#^ref-d2b3628c-127-0) (line 127, col 0, score 0.7)
- [compiler-kit-foundations — L140](compiler-kit-foundations.md#^ref-01b21543-140-0) (line 140, col 0, score 0.7)
- [Performance-Optimized-Polyglot-Bridge — L170](performance-optimized-polyglot-bridge.md#^ref-f5579967-170-0) (line 170, col 0, score 0.68)
- [compiler-kit-foundations — L31](compiler-kit-foundations.md#^ref-01b21543-31-0) (line 31, col 0, score 0.68)
- [Promethean Infrastructure Setup — L485](promethean-infrastructure-setup.md#^ref-6deed6ac-485-0) (line 485, col 0, score 0.68)
- [Agent Tasks: Persistence Migration to DualStore — L103](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-103-0) (line 103, col 0, score 0.61)
- [Agent Tasks: Persistence Migration to DualStore — L92](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-92-0) (line 92, col 0, score 0.61)
- [AI-Centric OS with MCP Layer — L17](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-17-0) (line 17, col 0, score 0.6)
- [sibilant-macro-targets — L133](sibilant-macro-targets.md#^ref-c5c9a5c6-133-0) (line 133, col 0, score 0.6)
- [Shared Package Structure — L51](shared-package-structure.md#^ref-66a72fc3-51-0) (line 51, col 0, score 0.7)
- [Migrate to Provider-Tenant Architecture — L160](migrate-to-provider-tenant-architecture.md#^ref-54382370-160-0) (line 160, col 0, score 0.66)
- [Interop and Source Maps — L470](interop-and-source-maps.md#^ref-cdfac40c-470-0) (line 470, col 0, score 0.66)
- [Interop and Source Maps — L68](interop-and-source-maps.md#^ref-cdfac40c-68-0) (line 68, col 0, score 0.66)
- [Chroma Toolkit Consolidation Plan — L74](chroma-toolkit-consolidation-plan.md#^ref-5020e892-74-0) (line 74, col 0, score 0.65)
- [Performance-Optimized-Polyglot-Bridge — L414](performance-optimized-polyglot-bridge.md#^ref-f5579967-414-0) (line 414, col 0, score 0.71)
- [Cross-Language Runtime Polymorphism — L119](cross-language-runtime-polymorphism.md#^ref-c34c36a6-119-0) (line 119, col 0, score 0.65)
- [Factorio AI with External Agents — L90](factorio-ai-with-external-agents.md#^ref-a4d90289-90-0) (line 90, col 0, score 0.62)
- [Cross-Language Runtime Polymorphism — L193](cross-language-runtime-polymorphism.md#^ref-c34c36a6-193-0) (line 193, col 0, score 0.61)
- [plan-update-confirmation — L550](plan-update-confirmation.md#^ref-b22d79c6-550-0) (line 550, col 0, score 0.61)
- [plan-update-confirmation — L470](plan-update-confirmation.md#^ref-b22d79c6-470-0) (line 470, col 0, score 0.6)
- [Interop and Source Maps — L83](interop-and-source-maps.md#^ref-cdfac40c-83-0) (line 83, col 0, score 0.6)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L26](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-26-0) (line 26, col 0, score 0.6)
- [Migrate to Provider-Tenant Architecture — L64](migrate-to-provider-tenant-architecture.md#^ref-54382370-64-0) (line 64, col 0, score 0.73)
- [Duck's Attractor States — L47](ducks-attractor-states.md#^ref-13951643-47-0) (line 47, col 0, score 0.65)
- [Promethean-Copilot-Intent-Engine — L33](promethean-copilot-intent-engine.md#^ref-ae24a280-33-0) (line 33, col 0, score 0.62)
- [Promethean-Copilot-Intent-Engine — L9](promethean-copilot-intent-engine.md#^ref-ae24a280-9-0) (line 9, col 0, score 0.61)
- [Promethean-native config design — L11](promethean-native-config-design.md#^ref-ab748541-11-0) (line 11, col 0, score 0.61)
- [Local-Only-LLM-Workflow — L159](local-only-llm-workflow.md#^ref-9a8ab57e-159-0) (line 159, col 0, score 0.64)
- [Performance-Optimized-Polyglot-Bridge — L14](performance-optimized-polyglot-bridge.md#^ref-f5579967-14-0) (line 14, col 0, score 0.63)
- [Docops Feature Updates — L12](docops-feature-updates.md#^ref-2792d448-12-0) (line 12, col 0, score 0.62)
- [Pure TypeScript Search Microservice — L3](pure-typescript-search-microservice.md#^ref-d17d3a96-3-0) (line 3, col 0, score 0.62)
- [Stateful Partitions and Rebalancing — L513](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-513-0) (line 513, col 0, score 0.64)
- [Promethean-Copilot-Intent-Engine — L10](promethean-copilot-intent-engine.md#^ref-ae24a280-10-0) (line 10, col 0, score 0.63)
- [AI-Centric OS with MCP Layer — L13](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-13-0) (line 13, col 0, score 0.63)
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
- [Shared Package Structure — L159](shared-package-structure.md#^ref-66a72fc3-159-0) (line 159, col 0, score 0.83)
- [shared-package-layout-clarification — L161](shared-package-layout-clarification.md#^ref-36c8882a-161-0) (line 161, col 0, score 0.82)
- [Voice Access Layer Design — L302](voice-access-layer-design.md#^ref-543ed9b3-302-0) (line 302, col 0, score 0.82)
- [eidolon-node-lifecycle — L21](eidolon-node-lifecycle.md#^ref-938eca9c-21-0) (line 21, col 0, score 0.79)
- [Factorio AI with External Agents — L141](factorio-ai-with-external-agents.md#^ref-a4d90289-141-0) (line 141, col 0, score 0.79)
- [Migrate to Provider-Tenant Architecture — L261](migrate-to-provider-tenant-architecture.md#^ref-54382370-261-0) (line 261, col 0, score 0.78)
- [polyglot-repl-interface-layer — L146](polyglot-repl-interface-layer.md#^ref-9c79206d-146-0) (line 146, col 0, score 0.71)
- [Promethean Infrastructure Setup — L93](promethean-infrastructure-setup.md#^ref-6deed6ac-93-0) (line 93, col 0, score 0.7)
- [Promethean-native config design — L380](promethean-native-config-design.md#^ref-ab748541-380-0) (line 380, col 0, score 0.7)
- [Prometheus Observability Stack — L493](prometheus-observability-stack.md#^ref-e90b5a16-493-0) (line 493, col 0, score 0.69)
- [api-gateway-versioning — L277](api-gateway-versioning.md#^ref-0580dcd3-277-0) (line 277, col 0, score 0.68)
- [Promethean Infrastructure Setup — L554](promethean-infrastructure-setup.md#^ref-6deed6ac-554-0) (line 554, col 0, score 0.68)
- [Exception Layer Analysis — L76](exception-layer-analysis.md#^ref-21d5cc09-76-0) (line 76, col 0, score 0.64)
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
- [eidolon-node-lifecycle — L63](eidolon-node-lifecycle.md#^ref-938eca9c-63-0) (line 63, col 0, score 1)
- [EidolonField — L269](eidolonfield.md#^ref-49d1e1e5-269-0) (line 269, col 0, score 1)
- [Event Bus MVP — L566](event-bus-mvp.md#^ref-534fe91d-566-0) (line 566, col 0, score 1)
- [Event Bus Projections Architecture — L185](event-bus-projections-architecture.md#^ref-cf6b9b17-185-0) (line 185, col 0, score 1)
- [Exception Layer Analysis — L165](exception-layer-analysis.md#^ref-21d5cc09-165-0) (line 165, col 0, score 1)
- [Factorio AI with External Agents — L160](factorio-ai-with-external-agents.md#^ref-a4d90289-160-0) (line 160, col 0, score 1)
- [field-dynamics-math-blocks — L165](field-dynamics-math-blocks.md#^ref-7cfc230d-165-0) (line 165, col 0, score 1)
- [field-interaction-equations — L184](field-interaction-equations.md#^ref-b09141b7-184-0) (line 184, col 0, score 1)
- [field-node-diagram-outline — L132](field-node-diagram-outline.md#^ref-1f32c94a-132-0) (line 132, col 0, score 1)
- [Simulation Demo — L32](chunks/simulation-demo.md#^ref-557309a3-32-0) (line 32, col 0, score 1)
- [Tooling — L26](chunks/tooling.md#^ref-6cb4943e-26-0) (line 26, col 0, score 1)
- [Window Management — L36](chunks/window-management.md#^ref-9e8ae388-36-0) (line 36, col 0, score 1)
- [compiler-kit-foundations — L639](compiler-kit-foundations.md#^ref-01b21543-639-0) (line 639, col 0, score 1)
- [Creative Moments — L10](creative-moments.md#^ref-10d98225-10-0) (line 10, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L258](cross-language-runtime-polymorphism.md#^ref-c34c36a6-258-0) (line 258, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L215](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-215-0) (line 215, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L50](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-50-0) (line 50, col 0, score 1)
- [DuckDuckGoSearchPipeline — L16](duckduckgosearchpipeline.md#^ref-e979c50f-16-0) (line 16, col 0, score 1)
- [ChatGPT Custom Prompts — L22](chatgpt-custom-prompts.md#^ref-930054b3-22-0) (line 22, col 0, score 1)
- [Functional Embedding Pipeline Refactor — L316](functional-embedding-pipeline-refactor.md#^ref-a4a25141-316-0) (line 316, col 0, score 1)
- [Functional Refactor of TypeScript Document Processing — L1](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-1-0) (line 1, col 0, score 0.8)
- [Functional Embedding Pipeline Refactor — L309](functional-embedding-pipeline-refactor.md#^ref-a4a25141-309-0) (line 309, col 0, score 0.8)
- [Migrate to Provider-Tenant Architecture — L194](migrate-to-provider-tenant-architecture.md#^ref-54382370-194-0) (line 194, col 0, score 0.84)
- [Migrate to Provider-Tenant Architecture — L195](migrate-to-provider-tenant-architecture.md#^ref-54382370-195-0) (line 195, col 0, score 0.84)
- [Migrate to Provider-Tenant Architecture — L196](migrate-to-provider-tenant-architecture.md#^ref-54382370-196-0) (line 196, col 0, score 0.84)
- [Migrate to Provider-Tenant Architecture — L197](migrate-to-provider-tenant-architecture.md#^ref-54382370-197-0) (line 197, col 0, score 0.84)
- [Migrate to Provider-Tenant Architecture — L198](migrate-to-provider-tenant-architecture.md#^ref-54382370-198-0) (line 198, col 0, score 0.84)
- [zero-copy-snapshots-and-workers — L363](zero-copy-snapshots-and-workers.md#^ref-62bec6f0-363-0) (line 363, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L220](chroma-toolkit-consolidation-plan.md#^ref-5020e892-220-0) (line 220, col 0, score 1)
- [Functional Refactor of TypeScript Document Processing — L147](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-147-0) (line 147, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L340](migrate-to-provider-tenant-architecture.md#^ref-54382370-340-0) (line 340, col 0, score 1)
- [Sibilant Meta-Prompt DSL — L243](sibilant-meta-prompt-dsl.md#^ref-af5d2824-243-0) (line 243, col 0, score 1)
- [field-node-diagram-outline — L111](field-node-diagram-outline.md#^ref-1f32c94a-111-0) (line 111, col 0, score 1)
- [field-node-diagram-set — L144](field-node-diagram-set.md#^ref-22b989d5-144-0) (line 144, col 0, score 1)
- [field-node-diagram-visualizations — L94](field-node-diagram-visualizations.md#^ref-e9b27b06-94-0) (line 94, col 0, score 1)
- [Fnord Tracer Protocol — L258](fnord-tracer-protocol.md#^ref-fc21f824-258-0) (line 258, col 0, score 1)
- [graph-ds — L398](graph-ds.md#^ref-6620e2f2-398-0) (line 398, col 0, score 1)
- [heartbeat-fragment-demo — L110](heartbeat-fragment-demo.md#^ref-dd00677a-110-0) (line 110, col 0, score 1)
- [heartbeat-simulation-snippets — L99](heartbeat-simulation-snippets.md#^ref-23e221e9-99-0) (line 99, col 0, score 1)
- [homeostasis-decay-formulas — L151](homeostasis-decay-formulas.md#^ref-37b5d236-151-0) (line 151, col 0, score 1)
- [i3-bluetooth-setup — L119](i3-bluetooth-setup.md#^ref-5e408692-119-0) (line 119, col 0, score 1)
- [i3-config-validation-methods — L67](i3-config-validation-methods.md#^ref-d28090ac-67-0) (line 67, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L274](migrate-to-provider-tenant-architecture.md#^ref-54382370-274-0) (line 274, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L489](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-489-0) (line 489, col 0, score 1)
- [Promethean Agent Config DSL — L326](promethean-agent-config-dsl.md#^ref-2c00ce45-326-0) (line 326, col 0, score 1)
- [Promethean Infrastructure Setup — L579](promethean-infrastructure-setup.md#^ref-6deed6ac-579-0) (line 579, col 0, score 1)
- [Pure-Node Crawl Stack with Playwright and Crawlee — L441](pure-node-crawl-stack-with-playwright-and-crawlee.md#^ref-d527c05d-441-0) (line 441, col 0, score 1)
- [shared-package-layout-clarification — L164](shared-package-layout-clarification.md#^ref-36c8882a-164-0) (line 164, col 0, score 1)
- [Vectorial Exception Descent — L175](vectorial-exception-descent.md#^ref-d771154e-175-0) (line 175, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L130](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-130-0) (line 130, col 0, score 1)
- [api-gateway-versioning — L303](api-gateway-versioning.md#^ref-0580dcd3-303-0) (line 303, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L174](chroma-toolkit-consolidation-plan.md#^ref-5020e892-174-0) (line 174, col 0, score 1)
- [eidolon-field-math-foundations — L134](eidolon-field-math-foundations.md#^ref-008f2ac0-134-0) (line 134, col 0, score 1)
- [i3-config-validation-methods — L82](i3-config-validation-methods.md#^ref-d28090ac-82-0) (line 82, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L267](migrate-to-provider-tenant-architecture.md#^ref-54382370-267-0) (line 267, col 0, score 1)
- [prom-lib-rate-limiters-and-replay-api — L391](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-391-0) (line 391, col 0, score 1)
- [Promethean Agent Config DSL — L333](promethean-agent-config-dsl.md#^ref-2c00ce45-333-0) (line 333, col 0, score 1)
- [Diagrams — L46](chunks/diagrams.md#^ref-45cd25b5-46-0) (line 46, col 0, score 1)
- [i3-config-validation-methods — L53](i3-config-validation-methods.md#^ref-d28090ac-53-0) (line 53, col 0, score 1)
- [Local-Only-LLM-Workflow — L180](local-only-llm-workflow.md#^ref-9a8ab57e-180-0) (line 180, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L276](migrate-to-provider-tenant-architecture.md#^ref-54382370-276-0) (line 276, col 0, score 1)
- [observability-infrastructure-setup — L376](observability-infrastructure-setup.md#^ref-b4e64f8c-376-0) (line 376, col 0, score 1)
- [Post-Linguistic Transhuman Design Frameworks — L89](post-linguistic-transhuman-design-frameworks.md#^ref-6bcff92c-89-0) (line 89, col 0, score 1)
- [Promethean Agent Config DSL — L358](promethean-agent-config-dsl.md#^ref-2c00ce45-358-0) (line 358, col 0, score 1)
- [Promethean Infrastructure Setup — L574](promethean-infrastructure-setup.md#^ref-6deed6ac-574-0) (line 574, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L158](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-158-0) (line 158, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L196](chroma-toolkit-consolidation-plan.md#^ref-5020e892-196-0) (line 196, col 0, score 1)
- [Dynamic Context Model for Web Components — L414](dynamic-context-model-for-web-components.md#^ref-f7702bf8-414-0) (line 414, col 0, score 1)
- [Event Bus MVP — L550](event-bus-mvp.md#^ref-534fe91d-550-0) (line 550, col 0, score 1)
- [i3-bluetooth-setup — L102](i3-bluetooth-setup.md#^ref-5e408692-102-0) (line 102, col 0, score 1)
- [Local-First Intention→Code Loop with Free Models — L142](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-142-0) (line 142, col 0, score 1)
- [Local-Only-LLM-Workflow — L195](local-only-llm-workflow.md#^ref-9a8ab57e-195-0) (line 195, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L271](migrate-to-provider-tenant-architecture.md#^ref-54382370-271-0) (line 271, col 0, score 1)
- [Functional Refactor of TypeScript Document Processing — L148](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-148-0) (line 148, col 0, score 0.63)
- [Refactor Frontmatter Processing — L1](refactor-frontmatter-processing.md#^ref-cfbdca2f-1-0) (line 1, col 0, score 0.71)
- [AI-Centric OS with MCP Layer — L406](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-406-0) (line 406, col 0, score 1)
- [Diagrams — L25](chunks/diagrams.md#^ref-45cd25b5-25-0) (line 25, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L214](cross-language-runtime-polymorphism.md#^ref-c34c36a6-214-0) (line 214, col 0, score 1)
- [Dynamic Context Model for Web Components — L390](dynamic-context-model-for-web-components.md#^ref-f7702bf8-390-0) (line 390, col 0, score 1)
- [eidolon-field-math-foundations — L147](eidolon-field-math-foundations.md#^ref-008f2ac0-147-0) (line 147, col 0, score 1)
- [Event Bus MVP — L553](event-bus-mvp.md#^ref-534fe91d-553-0) (line 553, col 0, score 1)
- [field-interaction-equations — L159](field-interaction-equations.md#^ref-b09141b7-159-0) (line 159, col 0, score 1)
- [Functional Embedding Pipeline Refactor — L315](functional-embedding-pipeline-refactor.md#^ref-a4a25141-315-0) (line 315, col 0, score 1)
- [i3-bluetooth-setup — L105](i3-bluetooth-setup.md#^ref-5e408692-105-0) (line 105, col 0, score 1)
- [js-to-lisp-reverse-compiler — L412](js-to-lisp-reverse-compiler.md#^ref-58191024-412-0) (line 412, col 0, score 1)
- [Local-Offline-Model-Deployment-Strategy — L292](local-offline-model-deployment-strategy.md#^ref-ad7f1ed3-292-0) (line 292, col 0, score 1)
- [Functional Refactor of TypeScript Document Processing — L149](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-149-0) (line 149, col 0, score 1)
- [Refactor 05-footers.ts — L1](refactor-05-footers-ts.md#^ref-80d4d883-1-0) (line 1, col 0, score 0.93)
- [2d-sandbox-field — L202](2d-sandbox-field.md#^ref-c710dc93-202-0) (line 202, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L144](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-144-0) (line 144, col 0, score 1)
- [aionian-circuit-math — L182](aionian-circuit-math.md#^ref-f2d83a77-182-0) (line 182, col 0, score 1)
- [Diagrams — L16](chunks/diagrams.md#^ref-45cd25b5-16-0) (line 16, col 0, score 1)
- [JavaScript — L45](chunks/javascript.md#^ref-c1618c66-45-0) (line 45, col 0, score 1)
- [Math Fundamentals — L38](chunks/math-fundamentals.md#^ref-c6e87433-38-0) (line 38, col 0, score 1)
- [Simulation Demo — L15](chunks/simulation-demo.md#^ref-557309a3-15-0) (line 15, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L250](cross-language-runtime-polymorphism.md#^ref-c34c36a6-250-0) (line 250, col 0, score 1)
- [Eidolon Field Abstract Model — L201](eidolon-field-abstract-model.md#^ref-5e8b2388-201-0) (line 201, col 0, score 1)
- [Functional Refactor of TypeScript Document Processing — L150](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-150-0) (line 150, col 0, score 1)
- [Language-Agnostic Mirror System — L566](language-agnostic-mirror-system.md#^ref-d2b3628c-566-0) (line 566, col 0, score 1)
- [refactor-relations — L1](refactor-relations.md#^ref-41ce0216-1-0) (line 1, col 0, score 0.83)
- [DSL — L44](chunks/dsl.md#^ref-e87bc036-44-0) (line 44, col 0, score 1)
- [JavaScript — L48](chunks/javascript.md#^ref-c1618c66-48-0) (line 48, col 0, score 1)
- [Math Fundamentals — L43](chunks/math-fundamentals.md#^ref-c6e87433-43-0) (line 43, col 0, score 1)
- [Operations — L15](chunks/operations.md#^ref-f1add613-15-0) (line 15, col 0, score 1)
- [Shared — L31](chunks/shared.md#^ref-623a55f7-31-0) (line 31, col 0, score 1)
- [Simulation Demo — L34](chunks/simulation-demo.md#^ref-557309a3-34-0) (line 34, col 0, score 1)
- [Tooling — L28](chunks/tooling.md#^ref-6cb4943e-28-0) (line 28, col 0, score 1)
- [Window Management — L38](chunks/window-management.md#^ref-9e8ae388-38-0) (line 38, col 0, score 1)
- [compiler-kit-foundations — L651](compiler-kit-foundations.md#^ref-01b21543-651-0) (line 651, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L263](cross-language-runtime-polymorphism.md#^ref-c34c36a6-263-0) (line 263, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L219](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-219-0) (line 219, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L62](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-62-0) (line 62, col 0, score 1)
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->

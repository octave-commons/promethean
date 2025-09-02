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
you’ve got way too much state mutation and IO mixed into control flow. here’s a functional pass that: ^ref-a4a25141-1-0

* isolates IO at the edges ^ref-a4a25141-3-0
* keeps the “core” as pure mappers/reducers ^ref-a4a25141-4-0
* adds safe caching via content-hash (back-compatible with your old cache) ^ref-a4a25141-5-0
* bounds concurrency so ollama doesn’t get dogpiled ^ref-a4a25141-6-0
* keeps output files and types the same where it matters ^ref-a4a25141-7-0

quick mental model: ^ref-a4a25141-9-0

```
files
  -> read+parse (IO)
    -> filter invalid
      -> chunkify (pure)
        -> embed with memoized cache + p-limit (IO)
          -> groupBy docUuid (pure)
            -> write caches (IO)
```
^ref-a4a25141-11-0

### what changed (and why)
 ^ref-a4a25141-23-0
* **pure helpers**: `toChunks`, `groupBy`, `buildDocsByUuid`, `sha1`. ^ref-a4a25141-24-0
* **cache validity**: embedding cache entries now optionally store `{hash, embedding}`; old `number[]` entries continue to work without recompute. if text changes, we recompute. ^ref-a4a25141-25-0
* **parallelism**: tiny `limit()` to cap concurrent POSTs. ^ref-a4a25141-26-0
* **error boundaries**: doc-level try/catch so one bad file doesn’t kill the run. ^ref-a4a25141-27-0
* **immutability**: we derive new maps and merge into previous caches instead of mutating in place.

---
 ^ref-a4a25141-31-0
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
^ref-a4a25141-31-0
```
^ref-a4a25141-32-0
 ^ref-a4a25141-302-0
### notes you’ll care about ^ref-a4a25141-302-0
 ^ref-a4a25141-303-0 ^ref-a4a25141-304-0
* **cache semantics**: `embeddings.json` can now hold either `number[]` (legacy) or `{ hash, embedding }`. that means you won’t churn embeddings on first run, and you’ll only recompute when the chunk text actually changed. ^ref-a4a25141-304-0 ^ref-a4a25141-305-0
* **determinism**: chunk ids are still `${uuid}:${i}` to stay compatible with anything downstream that relies on that shape. ^ref-a4a25141-305-0
* **bounded pressure**: `--concurrency` (default 4). tune it to your box; NPUs/GPUs don’t like a stampede. ^ref-a4a25141-307-0
* **blast radius**: one corrupt file won’t nuke the run; it logs and keeps going. ^ref-a4a25141-307-0
 ^ref-a4a25141-309-0
if you want to go even more functional, we can make the “runner” pass in *all* side-effectors (`readFile`, `postEmbed`, `writeJSON`) as injected deps and test the whole pipeline with pure data. but this is already a big step up without over-engineering. ^ref-a4a25141-309-0

\#refactor #functional #typescript #ollama #embeddings #docs-pipeline<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
## Related content
- [Agent Tasks: Persistence Migration to DualStore](agent-tasks-persistence-migration-to-dualstore.md)
- [2d-sandbox-field](2d-sandbox-field.md)
- [Admin Dashboard for User Management](admin-dashboard-for-user-management.md)
- [Agent Reflections and Prompt Evolution](agent-reflections-and-prompt-evolution.md)
- [Migrate to Provider-Tenant Architecture](migrate-to-provider-tenant-architecture.md)
- [Functional Refactor of TypeScript Document Processing](functional-refactor-of-typescript-document-processing.md)
- [Chroma-Embedding-Refactor](chroma-embedding-refactor.md)
- [Chroma Toolkit Consolidation Plan](chroma-toolkit-consolidation-plan.md)
- [Sibilant Meta-Prompt DSL](sibilant-meta-prompt-dsl.md)
- [compiler-kit-foundations](compiler-kit-foundations.md)
- [field-node-diagram-set](field-node-diagram-set.md)
- [Cross-Language Runtime Polymorphism](cross-language-runtime-polymorphism.md)
- [field-dynamics-math-blocks](field-dynamics-math-blocks.md)
- [Dynamic Context Model for Web Components](dynamic-context-model-for-web-components.md)
- [Math Fundamentals](chunks/math-fundamentals.md)
- [Tooling](chunks/tooling.md)
- [Cross-Target Macro System in Sibilant](cross-target-macro-system-in-sibilant.md)
- [ecs-offload-workers](ecs-offload-workers.md)
- [ecs-scheduler-and-prefabs](ecs-scheduler-and-prefabs.md)
- [Exception Layer Analysis](exception-layer-analysis.md)
- [Event Bus MVP](event-bus-mvp.md)
- [field-interaction-equations](field-interaction-equations.md)
- [eidolon-node-lifecycle](eidolon-node-lifecycle.md)
- [EidolonField](eidolonfield.md)
- [Event Bus Projections Architecture](event-bus-projections-architecture.md)
- [Factorio AI with External Agents](factorio-ai-with-external-agents.md)
- [field-node-diagram-outline](field-node-diagram-outline.md)
- [Debugging Broker Connections and Agent Behavior](debugging-broker-connections-and-agent-behavior.md)
- [JavaScript](chunks/javascript.md)
- [Duck's Self-Referential Perceptual Loop](ducks-self-referential-perceptual-loop.md)
- [Shared](chunks/shared.md)
- [Simulation Demo](chunks/simulation-demo.md)
- [Window Management](chunks/window-management.md)
- [Creative Moments](creative-moments.md)
- [Diagrams](chunks/diagrams.md)
- [DSL](chunks/dsl.md)
- [Operations](chunks/operations.md)
- [ChatGPT Custom Prompts](chatgpt-custom-prompts.md)
- [promethean-system-diagrams](promethean-system-diagrams.md)
- [Shared Package Structure](shared-package-structure.md)
- [eidolon-field-math-foundations](eidolon-field-math-foundations.md)
- [Prompt_Folder_Bootstrap](prompt-folder-bootstrap.md)
- [Pure-Node Crawl Stack with Playwright and Crawlee](pure-node-crawl-stack-with-playwright-and-crawlee.md)
- [Protocol_0_The_Contradiction_Engine](protocol-0-the-contradiction-engine.md)
- [Prometheus Observability Stack](prometheus-observability-stack.md)
- [Board Walk – 2025-08-11](board-walk-2025-08-11.md)
- [Promethean Web UI Setup](promethean-web-ui-setup.md)
- [Provider-Agnostic Chat Panel Implementation](provider-agnostic-chat-panel-implementation.md)
- [Promethean Workflow Optimization](promethean-workflow-optimization.md)
- [prompt-programming-language-lisp](prompt-programming-language-lisp.md)
- [aionian-circuit-math](aionian-circuit-math.md)
- [Self-Agency in AI Interaction](self-agency-in-ai-interaction.md)
- [Pure TypeScript Search Microservice](pure-typescript-search-microservice.md)
- [sibilant-macro-targets](sibilant-macro-targets.md)
- [api-gateway-versioning](api-gateway-versioning.md)
- [RAG UI Panel with Qdrant and PostgREST](rag-ui-panel-with-qdrant-and-postgrest.md)
- [schema-evolution-workflow](schema-evolution-workflow.md)
- [ripple-propagation-demo](ripple-propagation-demo.md)
- [set-assignment-in-lisp-ast](set-assignment-in-lisp-ast.md)
- [shared-package-layout-clarification](shared-package-layout-clarification.md)
- [i3-bluetooth-setup](i3-bluetooth-setup.md)
- [DuckDuckGoSearchPipeline](duckduckgosearchpipeline.md)
- [Refactor 05-footers.ts](refactor-05-footers-ts.md)
- [Promethean Documentation Pipeline Overview](promethean-documentation-pipeline-overview.md)
- [refactor-relations](refactor-relations.md)
- [Refactor Frontmatter Processing](refactor-frontmatter-processing.md)
- [Local-First Intention→Code Loop with Free Models](local-first-intention-code-loop-with-free-models.md)
- [Language-Agnostic Mirror System](language-agnostic-mirror-system.md)
- [State Snapshots API and Transactional Projector](state-snapshots-api-and-transactional-projector.md)
- [Performance-Optimized-Polyglot-Bridge](performance-optimized-polyglot-bridge.md)
- [Per-Domain Policy System for JS Crawler](per-domain-policy-system-for-js-crawler.md)
- [Promethean Infrastructure Setup](promethean-infrastructure-setup.md)
- [Local-Only-LLM-Workflow](local-only-llm-workflow.md)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler](ollama-llm-provider-for-pseudo-code-transpiler.md)
- [Promethean State Format](promethean-state-format.md)
- [Promethean Event Bus MVP v0.1](promethean-event-bus-mvp-v0-1.md)
- [WebSocket Gateway Implementation](websocket-gateway-implementation.md)
- [Vectorial Exception Descent](vectorial-exception-descent.md)
- [Promethean Agent DSL TS Scaffold](promethean-agent-dsl-ts-scaffold.md)
- [Promethean-Copilot-Intent-Engine](promethean-copilot-intent-engine.md)
- [Layer1SurvivabilityEnvelope](layer1survivabilityenvelope.md)
- [universal-intention-code-fabric](universal-intention-code-fabric.md)
- [Promethean-native config design](promethean-native-config-design.md)
- [TypeScript Patch for Tool Calling Support](typescript-patch-for-tool-calling-support.md)
- [System Scheduler with Resource-Aware DAG](system-scheduler-with-resource-aware-dag.md)
- [Docops Feature Updates](docops-feature-updates.md)
- [Promethean Pipelines](promethean-pipelines.md)
- [Interop and Source Maps](interop-and-source-maps.md)
- [graph-ds](graph-ds.md)
- [typed-struct-compiler](typed-struct-compiler.md)
- [Promethean Dev Workflow Update](promethean-dev-workflow-update.md)
- [The Jar of Echoes](the-jar-of-echoes.md)
- [plan-update-confirmation](plan-update-confirmation.md)
- [Voice Access Layer Design](voice-access-layer-design.md)
- [prom-lib-rate-limiters-and-replay-api](prom-lib-rate-limiters-and-replay-api.md)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop](polyglot-s-expr-bridge-python-js-lisp-interop.md)
- [AI-Centric OS with MCP Layer](ai-centric-os-with-mcp-layer.md)
- [Promethean Full-Stack Docker Setup](promethean-full-stack-docker-setup.md)
- [Fnord Tracer Protocol](fnord-tracer-protocol.md)
- [js-to-lisp-reverse-compiler](js-to-lisp-reverse-compiler.md)
- [Stateful Partitions and Rebalancing](stateful-partitions-and-rebalancing.md)
- [Mongo Outbox Implementation](mongo-outbox-implementation.md)
- [layer-1-uptime-diagrams](layer-1-uptime-diagrams.md)
- [template-based-compilation](template-based-compilation.md)
- [Promethean Agent Config DSL](promethean-agent-config-dsl.md)
- [Model Upgrade Calm-Down Guide](model-upgrade-calm-down-guide.md)
- [polymorphic-meta-programming-engine](polymorphic-meta-programming-engine.md)
- [Ghostly Smoke Interference](ghostly-smoke-interference.md)
- [windows-tiling-with-autohotkey](windows-tiling-with-autohotkey.md)
- [Lisp-Compiler-Integration](lisp-compiler-integration.md)
- [Services](chunks/services.md)
- [Lispy Macros with syntax-rules](lispy-macros-with-syntax-rules.md)
- [zero-copy-snapshots-and-workers](zero-copy-snapshots-and-workers.md)
## Sources
- [universal-intention-code-fabric — L417](universal-intention-code-fabric.md#^ref-c14edce7-417-0) (line 417, col 0, score 0.61)
- [compiler-kit-foundations — L599](compiler-kit-foundations.md#^ref-01b21543-599-0) (line 599, col 0, score 0.62)
- [layer-1-uptime-diagrams — L102](layer-1-uptime-diagrams.md#^ref-4127189a-102-0) (line 102, col 0, score 0.62)
- [Functional Refactor of TypeScript Document Processing — L114](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-114-0) (line 114, col 0, score 0.83)
- [template-based-compilation — L60](template-based-compilation.md#^ref-f8877e5e-60-0) (line 60, col 0, score 0.61)
- [field-node-diagram-set — L102](field-node-diagram-set.md#^ref-22b989d5-102-0) (line 102, col 0, score 0.6)
- [promethean-system-diagrams — L116](promethean-system-diagrams.md#^ref-b51e19b4-116-0) (line 116, col 0, score 0.6)
- [State Snapshots API and Transactional Projector — L216](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-216-0) (line 216, col 0, score 0.6)
- [State Snapshots API and Transactional Projector — L130](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-130-0) (line 130, col 0, score 0.59)
- [State Snapshots API and Transactional Projector — L3](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-3-0) (line 3, col 0, score 0.61)
- [windows-tiling-with-autohotkey — L78](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-78-0) (line 78, col 0, score 0.59)
- [Cross-Language Runtime Polymorphism — L1](cross-language-runtime-polymorphism.md#^ref-c34c36a6-1-0) (line 1, col 0, score 0.61)
- [Promethean State Format — L72](promethean-state-format.md#^ref-23df6ddb-72-0) (line 72, col 0, score 0.7)
- [Functional Refactor of TypeScript Document Processing — L115](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-115-0) (line 115, col 0, score 0.67)
- [Layer1SurvivabilityEnvelope — L75](layer1survivabilityenvelope.md#^ref-64a9f9f9-75-0) (line 75, col 0, score 0.55)
- [Migrate to Provider-Tenant Architecture — L88](migrate-to-provider-tenant-architecture.md#^ref-54382370-88-0) (line 88, col 0, score 0.55)
- [Layer1SurvivabilityEnvelope — L50](layer1survivabilityenvelope.md#^ref-64a9f9f9-50-0) (line 50, col 0, score 0.54)
- [Shared Package Structure — L148](shared-package-structure.md#^ref-66a72fc3-148-0) (line 148, col 0, score 0.53)
- [Lispy Macros with syntax-rules — L392](lispy-macros-with-syntax-rules.md#^ref-cbfe3513-392-0) (line 392, col 0, score 0.53)
- [Interop and Source Maps — L8](interop-and-source-maps.md#^ref-cdfac40c-8-0) (line 8, col 0, score 0.53)
- [Interop and Source Maps — L3](interop-and-source-maps.md#^ref-cdfac40c-3-0) (line 3, col 0, score 0.53)
- [field-dynamics-math-blocks — L21](field-dynamics-math-blocks.md#^ref-7cfc230d-21-0) (line 21, col 0, score 0.53)
- [graph-ds — L354](graph-ds.md#^ref-6620e2f2-354-0) (line 354, col 0, score 0.66)
- [Chroma-Embedding-Refactor — L6](chroma-embedding-refactor.md#^ref-8b256935-6-0) (line 6, col 0, score 0.66)
- [eidolon-field-math-foundations — L5](eidolon-field-math-foundations.md#^ref-008f2ac0-5-0) (line 5, col 0, score 0.64)
- [Promethean-Copilot-Intent-Engine — L3](promethean-copilot-intent-engine.md#^ref-ae24a280-3-0) (line 3, col 0, score 0.63)
- [Performance-Optimized-Polyglot-Bridge — L418](performance-optimized-polyglot-bridge.md#^ref-f5579967-418-0) (line 418, col 0, score 0.7)
- [Promethean-native config design — L343](promethean-native-config-design.md#^ref-ab748541-343-0) (line 343, col 0, score 0.6)
- [Lisp-Compiler-Integration — L531](lisp-compiler-integration.md#^ref-cfee6d36-531-0) (line 531, col 0, score 0.58)
- [universal-intention-code-fabric — L419](universal-intention-code-fabric.md#^ref-c14edce7-419-0) (line 419, col 0, score 0.58)
- [Promethean Documentation Pipeline Overview — L19](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-19-0) (line 19, col 0, score 0.59)
- [Local-First Intention→Code Loop with Free Models — L121](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-121-0) (line 121, col 0, score 0.62)
- [Docops Feature Updates — L12](docops-feature-updates.md#^ref-2792d448-12-0) (line 12, col 0, score 0.66)
- [Chroma-Embedding-Refactor — L297](chroma-embedding-refactor.md#^ref-8b256935-297-0) (line 297, col 0, score 0.67)
- [WebSocket Gateway Implementation — L618](websocket-gateway-implementation.md#^ref-e811123d-618-0) (line 618, col 0, score 0.65)
- [Dynamic Context Model for Web Components — L315](dynamic-context-model-for-web-components.md#^ref-f7702bf8-315-0) (line 315, col 0, score 0.68)
- [Local-Only-LLM-Workflow — L159](local-only-llm-workflow.md#^ref-9a8ab57e-159-0) (line 159, col 0, score 0.67)
- [Chroma-Embedding-Refactor — L105](chroma-embedding-refactor.md#^ref-8b256935-105-0) (line 105, col 0, score 0.66)
- [Math Fundamentals — L34](chunks/math-fundamentals.md#^ref-c6e87433-34-0) (line 34, col 0, score 0.57)
- [Services — L22](chunks/services.md#^ref-75ea4a6a-22-0) (line 22, col 0, score 0.57)
- [Shared — L29](chunks/shared.md#^ref-623a55f7-29-0) (line 29, col 0, score 0.57)
- [Simulation Demo — L23](chunks/simulation-demo.md#^ref-557309a3-23-0) (line 23, col 0, score 0.57)
- [Tooling — L16](chunks/tooling.md#^ref-6cb4943e-16-0) (line 16, col 0, score 0.57)
- [Window Management — L25](chunks/window-management.md#^ref-9e8ae388-25-0) (line 25, col 0, score 0.57)
- [compiler-kit-foundations — L627](compiler-kit-foundations.md#^ref-01b21543-627-0) (line 627, col 0, score 0.57)
- [Cross-Target Macro System in Sibilant — L171](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-171-0) (line 171, col 0, score 0.57)
- [plan-update-confirmation — L874](plan-update-confirmation.md#^ref-b22d79c6-874-0) (line 874, col 0, score 0.63)
- [Prompt_Folder_Bootstrap — L145](prompt-folder-bootstrap.md#^ref-bd4f0976-145-0) (line 145, col 0, score 0.65)
- [plan-update-confirmation — L650](plan-update-confirmation.md#^ref-b22d79c6-650-0) (line 650, col 0, score 0.62)
- [plan-update-confirmation — L662](plan-update-confirmation.md#^ref-b22d79c6-662-0) (line 662, col 0, score 0.62)
- [plan-update-confirmation — L674](plan-update-confirmation.md#^ref-b22d79c6-674-0) (line 674, col 0, score 0.62)
- [Migrate to Provider-Tenant Architecture — L41](migrate-to-provider-tenant-architecture.md#^ref-54382370-41-0) (line 41, col 0, score 0.62)
- [Functional Refactor of TypeScript Document Processing — L1](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-1-0) (line 1, col 0, score 0.8)
- [Pure-Node Crawl Stack with Playwright and Crawlee — L402](pure-node-crawl-stack-with-playwright-and-crawlee.md#^ref-d527c05d-402-0) (line 402, col 0, score 0.6)
- [polymorphic-meta-programming-engine — L147](polymorphic-meta-programming-engine.md#^ref-7bed0b9a-147-0) (line 147, col 0, score 0.6)
- [Functional Refactor of TypeScript Document Processing — L113](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-113-0) (line 113, col 0, score 0.6)
- [plan-update-confirmation — L827](plan-update-confirmation.md#^ref-b22d79c6-827-0) (line 827, col 0, score 0.59)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L332](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-332-0) (line 332, col 0, score 0.59)
- [Promethean Agent Config DSL — L116](promethean-agent-config-dsl.md#^ref-2c00ce45-116-0) (line 116, col 0, score 0.59)
- [Self-Agency in AI Interaction — L22](self-agency-in-ai-interaction.md#^ref-49a9a860-22-0) (line 22, col 0, score 0.68)
- [The Jar of Echoes — L83](the-jar-of-echoes.md#^ref-18138627-83-0) (line 83, col 0, score 0.65)
- [Protocol_0_The_Contradiction_Engine — L92](protocol-0-the-contradiction-engine.md#^ref-9a93a756-92-0) (line 92, col 0, score 0.63)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L143](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-143-0) (line 143, col 0, score 0.62)
- [Prometheus Observability Stack — L530](prometheus-observability-stack.md#^ref-e90b5a16-530-0) (line 530, col 0, score 0.6)
- [Pure-Node Crawl Stack with Playwright and Crawlee — L448](pure-node-crawl-stack-with-playwright-and-crawlee.md#^ref-d527c05d-448-0) (line 448, col 0, score 0.6)
- [Pure TypeScript Search Microservice — L547](pure-typescript-search-microservice.md#^ref-d17d3a96-547-0) (line 547, col 0, score 0.6)
- [Sibilant Meta-Prompt DSL — L217](sibilant-meta-prompt-dsl.md#^ref-af5d2824-217-0) (line 217, col 0, score 0.6)
- [Prompt_Folder_Bootstrap — L15](prompt-folder-bootstrap.md#^ref-bd4f0976-15-0) (line 15, col 0, score 0.59)
- [Prompt_Folder_Bootstrap — L140](prompt-folder-bootstrap.md#^ref-bd4f0976-140-0) (line 140, col 0, score 0.58)
- [Functional Refactor of TypeScript Document Processing — L5](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-5-0) (line 5, col 0, score 0.73)
- [refactor-relations — L10](refactor-relations.md#^ref-41ce0216-10-0) (line 10, col 0, score 0.69)
- [Chroma-Embedding-Refactor — L111](chroma-embedding-refactor.md#^ref-8b256935-111-0) (line 111, col 0, score 0.7)
- [Promethean Documentation Pipeline Overview — L16](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-16-0) (line 16, col 0, score 0.66)
- [Language-Agnostic Mirror System — L27](language-agnostic-mirror-system.md#^ref-d2b3628c-27-0) (line 27, col 0, score 0.66)
- [State Snapshots API and Transactional Projector — L321](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-321-0) (line 321, col 0, score 0.65)
- [Dynamic Context Model for Web Components — L311](dynamic-context-model-for-web-components.md#^ref-f7702bf8-311-0) (line 311, col 0, score 0.59)
- [Migrate to Provider-Tenant Architecture — L40](migrate-to-provider-tenant-architecture.md#^ref-54382370-40-0) (line 40, col 0, score 0.86)
- [Chroma Toolkit Consolidation Plan — L12](chroma-toolkit-consolidation-plan.md#^ref-5020e892-12-0) (line 12, col 0, score 0.84)
- [Sibilant Meta-Prompt DSL — L158](sibilant-meta-prompt-dsl.md#^ref-af5d2824-158-0) (line 158, col 0, score 0.83)
- [Per-Domain Policy System for JS Crawler — L180](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-180-0) (line 180, col 0, score 0.69)
- [Migrate to Provider-Tenant Architecture — L102](migrate-to-provider-tenant-architecture.md#^ref-54382370-102-0) (line 102, col 0, score 0.68)
- [Promethean Dev Workflow Update — L47](promethean-dev-workflow-update.md#^ref-03a5578f-47-0) (line 47, col 0, score 0.66)
- [Board Walk – 2025-08-11 — L103](board-walk-2025-08-11.md#^ref-7aa1eb92-103-0) (line 103, col 0, score 0.65)
- [Dynamic Context Model for Web Components — L331](dynamic-context-model-for-web-components.md#^ref-f7702bf8-331-0) (line 331, col 0, score 0.51)
- [Promethean-native config design — L31](promethean-native-config-design.md#^ref-ab748541-31-0) (line 31, col 0, score 0.65)
- [WebSocket Gateway Implementation — L473](websocket-gateway-implementation.md#^ref-e811123d-473-0) (line 473, col 0, score 0.67)
- [Promethean Documentation Pipeline Overview — L146](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-146-0) (line 146, col 0, score 0.66)
- [Promethean State Format — L26](promethean-state-format.md#^ref-23df6ddb-26-0) (line 26, col 0, score 0.65)
- [Promethean-native config design — L65](promethean-native-config-design.md#^ref-ab748541-65-0) (line 65, col 0, score 0.64)
- [prom-lib-rate-limiters-and-replay-api — L1](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-1-0) (line 1, col 0, score 0.64)
- [ecs-offload-workers — L3](ecs-offload-workers.md#^ref-6498b9d7-3-0) (line 3, col 0, score 0.63)
- [Performance-Optimized-Polyglot-Bridge — L13](performance-optimized-polyglot-bridge.md#^ref-f5579967-13-0) (line 13, col 0, score 0.62)
- [ecs-scheduler-and-prefabs — L381](ecs-scheduler-and-prefabs.md#^ref-c62a1815-381-0) (line 381, col 0, score 0.62)
- [System Scheduler with Resource-Aware DAG — L379](system-scheduler-with-resource-aware-dag.md#^ref-ba244286-379-0) (line 379, col 0, score 0.62)
- [Mongo Outbox Implementation — L148](mongo-outbox-implementation.md#^ref-9c1acd1e-148-0) (line 148, col 0, score 0.62)
- [Promethean Event Bus MVP v0.1 — L15](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-15-0) (line 15, col 0, score 0.62)
- [Promethean State Format — L27](promethean-state-format.md#^ref-23df6ddb-27-0) (line 27, col 0, score 0.61)
- [Promethean Documentation Pipeline Overview — L147](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-147-0) (line 147, col 0, score 0.61)
- [Exception Layer Analysis — L11](exception-layer-analysis.md#^ref-21d5cc09-11-0) (line 11, col 0, score 0.68)
- [sibilant-macro-targets — L12](sibilant-macro-targets.md#^ref-c5c9a5c6-12-0) (line 12, col 0, score 0.64)
- [Vectorial Exception Descent — L125](vectorial-exception-descent.md#^ref-d771154e-125-0) (line 125, col 0, score 0.67)
- [Exception Layer Analysis — L3](exception-layer-analysis.md#^ref-21d5cc09-3-0) (line 3, col 0, score 0.67)
- [universal-intention-code-fabric — L395](universal-intention-code-fabric.md#^ref-c14edce7-395-0) (line 395, col 0, score 0.6)
- [Vectorial Exception Descent — L136](vectorial-exception-descent.md#^ref-d771154e-136-0) (line 136, col 0, score 0.65)
- [plan-update-confirmation — L136](plan-update-confirmation.md#^ref-b22d79c6-136-0) (line 136, col 0, score 0.65)
- [universal-intention-code-fabric — L26](universal-intention-code-fabric.md#^ref-c14edce7-26-0) (line 26, col 0, score 0.59)
- [Vectorial Exception Descent — L14](vectorial-exception-descent.md#^ref-d771154e-14-0) (line 14, col 0, score 0.65)
- [universal-intention-code-fabric — L392](universal-intention-code-fabric.md#^ref-c14edce7-392-0) (line 392, col 0, score 0.64)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L132](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-132-0) (line 132, col 0, score 0.64)
- [Refactor 05-footers.ts — L6](refactor-05-footers-ts.md#^ref-80d4d883-6-0) (line 6, col 0, score 0.74)
- [Refactor Frontmatter Processing — L7](refactor-frontmatter-processing.md#^ref-cfbdca2f-7-0) (line 7, col 0, score 0.74)
- [refactor-relations — L6](refactor-relations.md#^ref-41ce0216-6-0) (line 6, col 0, score 0.74)
- [Migrate to Provider-Tenant Architecture — L160](migrate-to-provider-tenant-architecture.md#^ref-54382370-160-0) (line 160, col 0, score 0.68)
- [Migrate to Provider-Tenant Architecture — L243](migrate-to-provider-tenant-architecture.md#^ref-54382370-243-0) (line 243, col 0, score 0.65)
- [Refactor 05-footers.ts — L9](refactor-05-footers-ts.md#^ref-80d4d883-9-0) (line 9, col 0, score 0.76)
- [Refactor Frontmatter Processing — L11](refactor-frontmatter-processing.md#^ref-cfbdca2f-11-0) (line 11, col 0, score 0.68)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L108](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-108-0) (line 108, col 0, score 0.7)
- [Per-Domain Policy System for JS Crawler — L141](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-141-0) (line 141, col 0, score 0.68)
- [Promethean Infrastructure Setup — L485](promethean-infrastructure-setup.md#^ref-6deed6ac-485-0) (line 485, col 0, score 0.68)
- [Event Bus MVP — L457](event-bus-mvp.md#^ref-534fe91d-457-0) (line 457, col 0, score 0.68)
- [Per-Domain Policy System for JS Crawler — L184](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-184-0) (line 184, col 0, score 0.67)
- [Promethean-native config design — L160](promethean-native-config-design.md#^ref-ab748541-160-0) (line 160, col 0, score 0.67)
- [TypeScript Patch for Tool Calling Support — L368](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-368-0) (line 368, col 0, score 0.66)
- [Promethean-native config design — L32](promethean-native-config-design.md#^ref-ab748541-32-0) (line 32, col 0, score 0.54)
- [Promethean-native config design — L33](promethean-native-config-design.md#^ref-ab748541-33-0) (line 33, col 0, score 0.54)
- [Promethean-native config design — L35](promethean-native-config-design.md#^ref-ab748541-35-0) (line 35, col 0, score 0.54)
- [Chroma-Embedding-Refactor — L64](chroma-embedding-refactor.md#^ref-8b256935-64-0) (line 64, col 0, score 0.52)
- [Chroma-Embedding-Refactor — L109](chroma-embedding-refactor.md#^ref-8b256935-109-0) (line 109, col 0, score 0.52)
- [Chroma-Embedding-Refactor — L258](chroma-embedding-refactor.md#^ref-8b256935-258-0) (line 258, col 0, score 0.52)
- [Chroma Toolkit Consolidation Plan — L72](chroma-toolkit-consolidation-plan.md#^ref-5020e892-72-0) (line 72, col 0, score 0.52)
- [Chroma Toolkit Consolidation Plan — L88](chroma-toolkit-consolidation-plan.md#^ref-5020e892-88-0) (line 88, col 0, score 0.52)
- [Chroma Toolkit Consolidation Plan — L107](chroma-toolkit-consolidation-plan.md#^ref-5020e892-107-0) (line 107, col 0, score 0.52)
- [Chroma Toolkit Consolidation Plan — L148](chroma-toolkit-consolidation-plan.md#^ref-5020e892-148-0) (line 148, col 0, score 0.52)
- [api-gateway-versioning — L274](api-gateway-versioning.md#^ref-0580dcd3-274-0) (line 274, col 0, score 0.51)
- [Local-First Intention→Code Loop with Free Models — L23](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-23-0) (line 23, col 0, score 0.67)
- [Language-Agnostic Mirror System — L336](language-agnostic-mirror-system.md#^ref-d2b3628c-336-0) (line 336, col 0, score 0.68)
- [Interop and Source Maps — L85](interop-and-source-maps.md#^ref-cdfac40c-85-0) (line 85, col 0, score 0.66)
- [typed-struct-compiler — L16](typed-struct-compiler.md#^ref-78eeedf7-16-0) (line 16, col 0, score 0.66)
- [compiler-kit-foundations — L471](compiler-kit-foundations.md#^ref-01b21543-471-0) (line 471, col 0, score 0.65)
- [Language-Agnostic Mirror System — L151](language-agnostic-mirror-system.md#^ref-d2b3628c-151-0) (line 151, col 0, score 0.65)
- [Promethean Agent DSL TS Scaffold — L107](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-107-0) (line 107, col 0, score 0.65)
- [Promethean Web UI Setup — L415](promethean-web-ui-setup.md#^ref-bc5172ca-415-0) (line 415, col 0, score 0.69)
- [Chroma-Embedding-Refactor — L260](chroma-embedding-refactor.md#^ref-8b256935-260-0) (line 260, col 0, score 0.64)
- [Performance-Optimized-Polyglot-Bridge — L170](performance-optimized-polyglot-bridge.md#^ref-f5579967-170-0) (line 170, col 0, score 0.71)
- [api-gateway-versioning — L277](api-gateway-versioning.md#^ref-0580dcd3-277-0) (line 277, col 0, score 0.69)
- [Promethean Infrastructure Setup — L554](promethean-infrastructure-setup.md#^ref-6deed6ac-554-0) (line 554, col 0, score 0.69)
- [RAG UI Panel with Qdrant and PostgREST — L140](rag-ui-panel-with-qdrant-and-postgrest.md#^ref-e1056831-140-0) (line 140, col 0, score 0.7)
- [Promethean-Copilot-Intent-Engine — L30](promethean-copilot-intent-engine.md#^ref-ae24a280-30-0) (line 30, col 0, score 0.67)
- [Provider-Agnostic Chat Panel Implementation — L140](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-140-0) (line 140, col 0, score 0.69)
- [Provider-Agnostic Chat Panel Implementation — L183](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-183-0) (line 183, col 0, score 0.71)
- [Promethean Infrastructure Setup — L224](promethean-infrastructure-setup.md#^ref-6deed6ac-224-0) (line 224, col 0, score 0.71)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L7](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-7-0) (line 7, col 0, score 0.69)
- [Promethean Event Bus MVP v0.1 — L510](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-510-0) (line 510, col 0, score 0.7)
- [Promethean Event Bus MVP v0.1 — L222](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-222-0) (line 222, col 0, score 0.69)
- [Provider-Agnostic Chat Panel Implementation — L26](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-26-0) (line 26, col 0, score 0.68)
- [Promethean Event Bus MVP v0.1 — L604](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-604-0) (line 604, col 0, score 0.68)
- [api-gateway-versioning — L79](api-gateway-versioning.md#^ref-0580dcd3-79-0) (line 79, col 0, score 0.68)
- [Local-First Intention→Code Loop with Free Models — L47](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-47-0) (line 47, col 0, score 0.63)
- [State Snapshots API and Transactional Projector — L9](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-9-0) (line 9, col 0, score 0.69)
- [Provider-Agnostic Chat Panel Implementation — L84](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-84-0) (line 84, col 0, score 0.71)
- [Pure-Node Crawl Stack with Playwright and Crawlee — L223](pure-node-crawl-stack-with-playwright-and-crawlee.md#^ref-d527c05d-223-0) (line 223, col 0, score 0.7)
- [Promethean Web UI Setup — L351](promethean-web-ui-setup.md#^ref-bc5172ca-351-0) (line 351, col 0, score 0.7)
- [schema-evolution-workflow — L243](schema-evolution-workflow.md#^ref-d8059b6a-243-0) (line 243, col 0, score 0.65)
- [Promethean Documentation Pipeline Overview — L15](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-15-0) (line 15, col 0, score 0.63)
- [Stateful Partitions and Rebalancing — L351](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-351-0) (line 351, col 0, score 0.62)
- [RAG UI Panel with Qdrant and PostgREST — L172](rag-ui-panel-with-qdrant-and-postgrest.md#^ref-e1056831-172-0) (line 172, col 0, score 0.67)
- [plan-update-confirmation — L836](plan-update-confirmation.md#^ref-b22d79c6-836-0) (line 836, col 0, score 0.62)
- [Promethean Agent DSL TS Scaffold — L525](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-525-0) (line 525, col 0, score 0.67)
- [ecs-scheduler-and-prefabs — L7](ecs-scheduler-and-prefabs.md#^ref-c62a1815-7-0) (line 7, col 0, score 0.66)
- [System Scheduler with Resource-Aware DAG — L5](system-scheduler-with-resource-aware-dag.md#^ref-ba244286-5-0) (line 5, col 0, score 0.66)
- [Language-Agnostic Mirror System — L30](language-agnostic-mirror-system.md#^ref-d2b3628c-30-0) (line 30, col 0, score 0.69)
- [Chroma-Embedding-Refactor — L250](chroma-embedding-refactor.md#^ref-8b256935-250-0) (line 250, col 0, score 0.68)
- [Language-Agnostic Mirror System — L508](language-agnostic-mirror-system.md#^ref-d2b3628c-508-0) (line 508, col 0, score 0.67)
- [Agent Tasks: Persistence Migration to DualStore — L26](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-26-0) (line 26, col 0, score 0.67)
- [Dynamic Context Model for Web Components — L189](dynamic-context-model-for-web-components.md#^ref-f7702bf8-189-0) (line 189, col 0, score 0.73)
- [Language-Agnostic Mirror System — L507](language-agnostic-mirror-system.md#^ref-d2b3628c-507-0) (line 507, col 0, score 0.72)
- [Local-First Intention→Code Loop with Free Models — L120](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-120-0) (line 120, col 0, score 0.71)
- [Chroma-Embedding-Refactor — L248](chroma-embedding-refactor.md#^ref-8b256935-248-0) (line 248, col 0, score 0.66)
- [Dynamic Context Model for Web Components — L313](dynamic-context-model-for-web-components.md#^ref-f7702bf8-313-0) (line 313, col 0, score 0.66)
- [Layer1SurvivabilityEnvelope — L73](layer1survivabilityenvelope.md#^ref-64a9f9f9-73-0) (line 73, col 0, score 0.67)
- [field-interaction-equations — L126](field-interaction-equations.md#^ref-b09141b7-126-0) (line 126, col 0, score 0.66)
- [Voice Access Layer Design — L202](voice-access-layer-design.md#^ref-543ed9b3-202-0) (line 202, col 0, score 0.62)
- [prom-lib-rate-limiters-and-replay-api — L83](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-83-0) (line 83, col 0, score 0.64)
- [Promethean Full-Stack Docker Setup — L3](promethean-full-stack-docker-setup.md#^ref-2c2b48ca-3-0) (line 3, col 0, score 0.63)
- [field-dynamics-math-blocks — L101](field-dynamics-math-blocks.md#^ref-7cfc230d-101-0) (line 101, col 0, score 0.62)
- [prom-lib-rate-limiters-and-replay-api — L73](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-73-0) (line 73, col 0, score 0.62)
- [Exception Layer Analysis — L130](exception-layer-analysis.md#^ref-21d5cc09-130-0) (line 130, col 0, score 0.61)
- [Model Upgrade Calm-Down Guide — L52](model-upgrade-calm-down-guide.md#^ref-db74343f-52-0) (line 52, col 0, score 0.6)
- [layer-1-uptime-diagrams — L29](layer-1-uptime-diagrams.md#^ref-4127189a-29-0) (line 29, col 0, score 0.6)
- [Ghostly Smoke Interference — L1](ghostly-smoke-interference.md#^ref-b6ae7dfa-1-0) (line 1, col 0, score 0.59)
- [Layer1SurvivabilityEnvelope — L84](layer1survivabilityenvelope.md#^ref-64a9f9f9-84-0) (line 84, col 0, score 0.59)
- [Promethean Agent Config DSL — L292](promethean-agent-config-dsl.md#^ref-2c00ce45-292-0) (line 292, col 0, score 0.61)
- [Promethean Pipelines — L1](promethean-pipelines.md#^ref-8b8e6103-1-0) (line 1, col 0, score 0.66)
- [Functional Refactor of TypeScript Document Processing — L118](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-118-0) (line 118, col 0, score 0.65)
- [AI-Centric OS with MCP Layer — L1](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-1-0) (line 1, col 0, score 0.63)
- [Fnord Tracer Protocol — L168](fnord-tracer-protocol.md#^ref-fc21f824-168-0) (line 168, col 0, score 0.63)
- [js-to-lisp-reverse-compiler — L406](js-to-lisp-reverse-compiler.md#^ref-58191024-406-0) (line 406, col 0, score 0.62)
- [schema-evolution-workflow — L478](schema-evolution-workflow.md#^ref-d8059b6a-478-0) (line 478, col 0, score 0.62)
- [Fnord Tracer Protocol — L238](fnord-tracer-protocol.md#^ref-fc21f824-238-0) (line 238, col 0, score 0.61)
- [Fnord Tracer Protocol — L13](fnord-tracer-protocol.md#^ref-fc21f824-13-0) (line 13, col 0, score 0.61)
- [TypeScript Patch for Tool Calling Support — L359](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-359-0) (line 359, col 0, score 0.61)
- [Promethean Pipelines — L87](promethean-pipelines.md#^ref-8b8e6103-87-0) (line 87, col 0, score 0.61)
- [Functional Refactor of TypeScript Document Processing — L116](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-116-0) (line 116, col 0, score 0.61)
- [Chroma-Embedding-Refactor — L324](chroma-embedding-refactor.md#^ref-8b256935-324-0) (line 324, col 0, score 0.8)
- [Chroma Toolkit Consolidation Plan — L220](chroma-toolkit-consolidation-plan.md#^ref-5020e892-220-0) (line 220, col 0, score 0.8)
- [Functional Refactor of TypeScript Document Processing — L147](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-147-0) (line 147, col 0, score 0.8)
- [Migrate to Provider-Tenant Architecture — L340](migrate-to-provider-tenant-architecture.md#^ref-54382370-340-0) (line 340, col 0, score 0.8)
- [Sibilant Meta-Prompt DSL — L243](sibilant-meta-prompt-dsl.md#^ref-af5d2824-243-0) (line 243, col 0, score 0.8)
- [ChatGPT Custom Prompts — L22](chatgpt-custom-prompts.md#^ref-930054b3-22-0) (line 22, col 0, score 1)
- [Chroma-Embedding-Refactor — L322](chroma-embedding-refactor.md#^ref-8b256935-322-0) (line 322, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L194](migrate-to-provider-tenant-architecture.md#^ref-54382370-194-0) (line 194, col 0, score 0.72)
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
- [field-node-diagram-set — L166](field-node-diagram-set.md#^ref-22b989d5-166-0) (line 166, col 0, score 1)
- [Simulation Demo — L32](chunks/simulation-demo.md#^ref-557309a3-32-0) (line 32, col 0, score 1)
- [Tooling — L26](chunks/tooling.md#^ref-6cb4943e-26-0) (line 26, col 0, score 1)
- [Window Management — L36](chunks/window-management.md#^ref-9e8ae388-36-0) (line 36, col 0, score 1)
- [compiler-kit-foundations — L639](compiler-kit-foundations.md#^ref-01b21543-639-0) (line 639, col 0, score 1)
- [Creative Moments — L10](creative-moments.md#^ref-10d98225-10-0) (line 10, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L258](cross-language-runtime-polymorphism.md#^ref-c34c36a6-258-0) (line 258, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L215](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-215-0) (line 215, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L50](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-50-0) (line 50, col 0, score 1)
- [DuckDuckGoSearchPipeline — L16](duckduckgosearchpipeline.md#^ref-e979c50f-16-0) (line 16, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L129](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-129-0) (line 129, col 0, score 1)
- [api-gateway-versioning — L315](api-gateway-versioning.md#^ref-0580dcd3-315-0) (line 315, col 0, score 1)
- [Chroma-Embedding-Refactor — L331](chroma-embedding-refactor.md#^ref-8b256935-331-0) (line 331, col 0, score 1)
- [Diagrams — L25](chunks/diagrams.md#^ref-45cd25b5-25-0) (line 25, col 0, score 1)
- [Tooling — L24](chunks/tooling.md#^ref-6cb4943e-24-0) (line 24, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L214](cross-language-runtime-polymorphism.md#^ref-c34c36a6-214-0) (line 214, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L173](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-173-0) (line 173, col 0, score 1)
- [Dynamic Context Model for Web Components — L390](dynamic-context-model-for-web-components.md#^ref-f7702bf8-390-0) (line 390, col 0, score 1)
- [eidolon-field-math-foundations — L147](eidolon-field-math-foundations.md#^ref-008f2ac0-147-0) (line 147, col 0, score 1)
- [Event Bus MVP — L553](event-bus-mvp.md#^ref-534fe91d-553-0) (line 553, col 0, score 1)
- [field-interaction-equations — L159](field-interaction-equations.md#^ref-b09141b7-159-0) (line 159, col 0, score 1)
- [i3-bluetooth-setup — L105](i3-bluetooth-setup.md#^ref-5e408692-105-0) (line 105, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L195](migrate-to-provider-tenant-architecture.md#^ref-54382370-195-0) (line 195, col 0, score 0.72)
- [Migrate to Provider-Tenant Architecture — L196](migrate-to-provider-tenant-architecture.md#^ref-54382370-196-0) (line 196, col 0, score 0.72)
- [Migrate to Provider-Tenant Architecture — L197](migrate-to-provider-tenant-architecture.md#^ref-54382370-197-0) (line 197, col 0, score 0.72)
- [Migrate to Provider-Tenant Architecture — L198](migrate-to-provider-tenant-architecture.md#^ref-54382370-198-0) (line 198, col 0, score 0.72)
- [ChatGPT Custom Prompts — L9](chatgpt-custom-prompts.md#^ref-930054b3-9-0) (line 9, col 0, score 0.71)
- [Agent Tasks: Persistence Migration to DualStore — L182](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-182-0) (line 182, col 0, score 1)
- [aionian-circuit-math — L184](aionian-circuit-math.md#^ref-f2d83a77-184-0) (line 184, col 0, score 1)
- [Board Walk – 2025-08-11 — L154](board-walk-2025-08-11.md#^ref-7aa1eb92-154-0) (line 154, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L208](chroma-toolkit-consolidation-plan.md#^ref-5020e892-208-0) (line 208, col 0, score 1)
- [Dynamic Context Model for Web Components — L437](dynamic-context-model-for-web-components.md#^ref-f7702bf8-437-0) (line 437, col 0, score 1)
- [eidolon-field-math-foundations — L175](eidolon-field-math-foundations.md#^ref-008f2ac0-175-0) (line 175, col 0, score 1)
- [Exception Layer Analysis — L173](exception-layer-analysis.md#^ref-21d5cc09-173-0) (line 173, col 0, score 1)
- [Factorio AI with External Agents — L162](factorio-ai-with-external-agents.md#^ref-a4d90289-162-0) (line 162, col 0, score 1)
- [Functional Refactor of TypeScript Document Processing — L145](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-145-0) (line 145, col 0, score 1)
- [JavaScript — L19](chunks/javascript.md#^ref-c1618c66-19-0) (line 19, col 0, score 1)
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
- [zero-copy-snapshots-and-workers — L363](zero-copy-snapshots-and-workers.md#^ref-62bec6f0-363-0) (line 363, col 0, score 0.47)
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

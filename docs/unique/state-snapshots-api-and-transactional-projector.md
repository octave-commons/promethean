---
uuid: 509e1cd5-367c-4a9d-a61b-cef2e85d42ce
created_at: 2025.08.08.20.08.83.md
filename: State Snapshots API and Transactional Projector
description: >-
  Implements HTTP-based state snapshots with ETags for versioning and a
  transactional projector for atomic multi-collection updates. Includes
  time-travel queries and a dev harness for end-to-end testing.
tags:
  - state
  - snapshots
  - api
  - transactional
  - projector
  - time-travel
  - dev
  - harness
related_to_title: []
related_to_uuid: []
references: []
---
Note: Consolidated here → ../notes/services/state-snapshots-transactional-projector-timetravel-devharness.md

Alright, **Part 7**: **State Snapshots API**, **Transactional Projector**, **Time-Travel queries**, and a tiny **Dev Harness** for end-to-end tests. Paste ’em under `shared/js/prom-lib/` (plus one `tests/` file). ^ref-509e1cd5-3-0

---

# State Snapshots API (HTTP with ETags)

```ts
// shared/js/prom-lib/snapshots/api.ts
import express from "express";
import type { Db } from "mongodb";
import crypto from "crypto";

export interface SnapshotApiOptions {
  collection: string;              // e.g., "processes.snapshot"
  keyField?: string;               // default "_key"
  bodyLimit?: string;              // default "200kb"
  maxAgeSeconds?: number;          // default 5 (client cache)
}

function etagOf(doc: any) {
  const s = JSON.stringify(doc);
  return '"' + crypto.createHash("sha1").update(s).digest("hex") + '"';
}

export function startSnapshotApi(db: Db, port = 8091, opts: SnapshotApiOptions) {
  const app = express();
  app.set("etag", false);
  app.use(express.json({ limit: opts.bodyLimit ?? "200kb" }));

  const coll = db.collection(opts.collection);
  const keyField = opts.keyField ?? "_key";
  const cacheCtl = `public, max-age=${opts.maxAgeSeconds ?? 5}`;

  // GET /snap/:key
  app.get("/snap/:key", async (req, res) => {
    const key = req.params.key;
    const doc = await coll.findOne({ [keyField]: key });
    if (!doc) return res.status(404).json({ error: "not_found" });

    const etag = etagOf({ ...doc, _id: undefined });
    if (req.headers["if-none-match"] === etag) {
      return res.status(304).end();
    }
    res.setHeader("ETag", etag);
    res.setHeader("Cache-Control", cacheCtl);
    res.json(doc);
  });

  // GET /list?offset=0&limit=100&status=alive
  app.get("/list", async (req, res) => {
    const limit = Math.min(Number(req.query.limit ?? 100), 1000);
    const offset = Number(req.query.offset ?? 0);
    const q: any = {};
    // simple filters
    for (const k of Object.keys(req.query)) {
      if (["limit","offset"].includes(k)) continue;
      q[k] = req.query[k];
    }
    const cursor = coll.find(q).sort({ _ts: -1 }).skip(offset).limit(limit);
    const items = await cursor.toArray();
    res.setHeader("Cache-Control", "no-store");
    res.json({ offset, limit, count: items.length, items });
  });

  // HEAD /snap/:key (for cheap freshness checks)
  app.head("/snap/:key", async (req, res) => {
    const key = req.params.key;
    const doc = await coll.findOne({ [keyField]: key }, { projection: { _id: 0, _ts: 1 } });
    if (!doc) return res.status(404).end();
    const etag = etagOf(doc);
    if (req.headers["if-none-match"] === etag) return res.status(304).end();
    res.setHeader("ETag", etag);
    res.setHeader("Cache-Control", cacheCtl);
    res.status(200).end();
  });

  return app.listen(port, () => console.log(`[snapshot-api] on :${port} (${opts.collection})`));
}
```
^ref-509e1cd5-9-0
 ^ref-509e1cd5-83-0
**Indexes you want on the snapshot collection:**

* `{ _key: 1 } unique` ^ref-509e1cd5-86-0
* Optional filter fields (e.g., `{ status: 1 }`)
* `{ _ts: -1 }`

---

# Transactional Projector (multi-collection, atomic)
 ^ref-509e1cd5-93-0
```ts
// shared/js/prom-lib/projectors/transactional.ts
import type { Db, ClientSession } from "mongodb";
import type { EventBus, EventRecord } from "../event/types";

export interface TxnProjectorOpts<E=any> {
  topic: string;
  group: string;
  handler: (e: EventRecord<E>, db: Db, s: ClientSession) => Promise<void>;
  from?: "earliest" | "latest";
  retries?: number;
}

export async function startTransactionalProjector<E=any>(bus: EventBus, db: Db, opts: TxnProjectorOpts<E>) {
  const from = opts.from ?? "earliest";
  const retries = opts.retries ?? 3;

  return bus.subscribe(opts.topic, opts.group, async (e) => {
    for (let i=0; i<=retries; i++) {
      const s = db.client.startSession();
      try {
        await s.withTransaction(async () => {
          await opts.handler(e, db, s);
        }, { writeConcern: { w: "majority" } });
        // success → exit retry loop
        return;
      } catch (err) {
        if (i === retries) throw err;
        await new Promise(r => setTimeout(r, 100 * (i+1)));
      } finally {
        await s.endSession();
      }
    }
  }, { from, manualAck: false, batchSize: 200 });
}
^ref-509e1cd5-93-0
``` ^ref-509e1cd5-130-0

**Usage example (process state → processes + stats):** ^ref-509e1cd5-132-0

```ts
// services/js/projectors/process.txn.ts
import { startTransactionalProjector } from "../../shared/js/prom-lib/projectors/transactional";
import { MongoEventBus } from "../../shared/js/prom-lib/event/mongo";

export async function startProcessTxnProjector(bus: MongoEventBus, db: any) {
  await startTransactionalProjector(bus, db, {
    topic: "process.state",
    group: "processes.txn",
    async handler(e, db, s) {
      const p = e.payload as any;
      // Collection A: upsert processes
      await db.collection("processes").updateOne(
        { _key: p.processId },
        { $set: { ...p, _key: p.processId, _ts: e.ts } },
        { upsert: true, session: s }
      );
      // Collection B: aggregate a simple host counter (idempotent upsert)
      await db.collection("host_stats").updateOne(
        { _key: p.host },
        { $setOnInsert: { _key: p.host }, $inc: { seen: 1 }, $set: { last_ts: e.ts } },
        { upsert: true, session: s }
      );
    },
  });
^ref-509e1cd5-132-0
}
```
 ^ref-509e1cd5-162-0
**Mermaid (ack-after-commit):**

```mermaid
sequenceDiagram
  participant Bus as EventBus
  participant Proj as Txn Projector
  participant DB as Mongo
  Bus-->>Proj: EVENT
  Proj->>DB: startSession + withTransaction
^ref-509e1cd5-162-0
  DB-->>Proj: commit
  Proj-->>Bus: (auto-ack from subscribe)
```

--- ^ref-509e1cd5-177-0

# Time-Travel Query Helper (reconstruct state at T) ^ref-509e1cd5-179-0

Works with compaction topics (latest-by-key) + periodic snapshots.

```ts
// shared/js/prom-lib/timetravel/reconstruct.ts
import type { MongoEventStore } from "../event/mongo";
import type { EventRecord } from "../event/types";

export interface ReconstructOpts<T=any> {
  topic: string;                // e.g., "process.state"
  snapshotTopic?: string;       // e.g., "process.state.snapshot" (optional)
  key: string;                  // entity key
  atTs: number;                 // target timestamp (epoch ms)
  apply: (prev: T | null, e: EventRecord<T>) => T | null; // reducer: apply event->state
  // fetchSnapshot: override to load nearest <= atTs (if not using events-only)
  fetchSnapshot?: (key: string, upTo: number) => Promise<{ state: T | null, ts: number } | null>;
}

export async function reconstructAt<T=any>(store: MongoEventStore, opts: ReconstructOpts<T>) {
  let baseState: T | null = null;
  let baseTs = 0;

  // optional snapshot as baseline
  if (opts.fetchSnapshot) {
    const snap = await opts.fetchSnapshot(opts.key, opts.atTs);
    if (snap) { baseState = snap.state; baseTs = snap.ts; }
  }

  // scan events after baseline up to atTs
  const events = await store.scan(opts.topic, { ts: baseTs, limit: 1_000_000 });
  for (const e of events) {
    if (e.ts > opts.atTs) break;
    if (e.key !== opts.key) continue;
    baseState = opts.apply(baseState, e as EventRecord<T>);
    baseTs = e.ts;
^ref-509e1cd5-179-0
  } ^ref-509e1cd5-216-0
  return { state: baseState, ts: baseTs };
}
```
^ref-509e1cd5-218-0

**Example reducer (process.state is full upsert):**

```ts
// shared/js/prom-lib/timetravel/examples.ts
import { reconstructAt } from "./reconstruct";
import { MongoEventStore } from "../event/mongo";

export async function processAt(store: MongoEventStore, processId: string, atTs: number) {
  return reconstructAt(store, {
    topic: "process.state",
    key: processId,
^ref-509e1cd5-218-0
    atTs, ^ref-509e1cd5-233-0
    apply: (_prev, e) => e.payload as any
  });
}
^ref-509e1cd5-235-0
^ref-509e1cd5-233-0
```
^ref-509e1cd5-233-0
^ref-509e1cd5-235-0 ^ref-509e1cd5-242-0
^ref-509e1cd5-233-0 ^ref-509e1cd5-242-0

**Mermaid:**

^ref-509e1cd5-235-0
```mermaid ^ref-509e1cd5-242-0
flowchart LR
  Snap[Snapshot <= T] --> Base
^ref-509e1cd5-242-0 ^ref-509e1cd5-248-0
  Base -->|scan events (Base.ts..T)| Reduce
^ref-509e1cd5-248-0
  Reduce --> State[State@T]
^ref-509e1cd5-248-0
```

> If you don’t have snapshots, set `fetchSnapshot` to `null` and it’ll reconstruct purely from events (longer scans).

---

# Dev Harness (spin in-memory bus + fake services)

```ts
// shared/js/prom-lib/dev/harness.ts
import { InMemoryEventBus } from "../event/memory";
import { startWSGateway } from "../ws/server";
import { startHttpPublisher } from "../http/publish";
import { startProcessProjector } from "../examples/process/projector";

export interface Harness {
  bus: InMemoryEventBus;
  stop(): Promise<void>;
}

export async function startHarness({ wsPort = 9090, httpPort = 9091 } = {}): Promise<Harness> {
  const bus = new InMemoryEventBus();

  const wss = startWSGateway(bus, wsPort, { auth: async () => ({ ok: true }) });
  const http = startHttpPublisher(bus, httpPort);
  const stopProj = await startProcessProjector(bus);

  return {
    bus,
    async stop() {
^ref-509e1cd5-248-0
      await new Promise(r => (http as any).close(r)); ^ref-509e1cd5-278-0
      wss.close();
      stopProj();
^ref-509e1cd5-280-0
^ref-509e1cd5-278-0
    }
^ref-509e1cd5-280-0
^ref-509e1cd5-278-0
  };
^ref-509e1cd5-280-0
^ref-509e1cd5-278-0
}
```

**Integration test (Jest)**

```ts
// tests/dev.harness.int.test.ts
import { startHarness } from "../shared/js/prom-lib/dev/harness";

test("harness end-to-end", async () => {
  const h = await startHarness({ wsPort: 9190, httpPort: 9191 });

  // publish a heartbeat and wait a tick
  await h.bus.publish("heartbeat.received", { pid: 1, name: "stt", host: "local", cpu_pct: 1, mem_mb: 2 });
  await new Promise(r => setTimeout(r, 50));
^ref-509e1cd5-280-0

  // ensure projector emitted process.state
^ref-509e1cd5-303-0
  const cur = await h.bus.getCursor("process.state", "process-projector"); // from projector group
^ref-509e1cd5-303-0
  expect(cur).toBeTruthy();
^ref-509e1cd5-319-0 ^ref-509e1cd5-320-0
^ref-509e1cd5-318-0 ^ref-509e1cd5-321-0
^ref-509e1cd5-317-0
^ref-509e1cd5-303-0
^ref-509e1cd5-299-0
 ^ref-509e1cd5-325-0
  await h.stop(); ^ref-509e1cd5-317-0
}, 10_000); ^ref-509e1cd5-318-0
``` ^ref-509e1cd5-319-0

---

# Sibilant sprinkles (pseudo)

^ref-509e1cd5-303-0
```lisp
; shared/sibilant/prom/snapshots.sib (pseudo)
^ref-509e1cd5-321-0
^ref-509e1cd5-320-0
^ref-509e1cd5-319-0
^ref-509e1cd5-318-0 ^ref-509e1cd5-325-0
^ref-509e1cd5-317-0
(defn start-snapshot-api [db port coll] ^ref-509e1cd5-327-0
^ref-509e1cd5-333-0
^ref-509e1cd5-330-0
^ref-509e1cd5-329-0
^ref-509e1cd5-328-0
^ref-509e1cd5-327-0 ^ref-509e1cd5-338-0
^ref-509e1cd5-338-0
^ref-509e1cd5-333-0
^ref-509e1cd5-330-0
^ref-509e1cd5-329-0
^ref-509e1cd5-328-0
^ref-509e1cd5-327-0 ^ref-509e1cd5-353-0
^ref-509e1cd5-325-0
^ref-509e1cd5-321-0
^ref-509e1cd5-320-0
  (startSnapshotApi db port {:collection coll})) ^ref-509e1cd5-328-0
 ^ref-509e1cd5-317-0 ^ref-509e1cd5-329-0
; transactional projector macro-ish feel ^ref-509e1cd5-318-0 ^ref-509e1cd5-330-0
(defmacro def-txn-projector [topic group & body] ^ref-509e1cd5-319-0
  `(startTransactionalProjector bus db {:topic ~topic :group ~group :handler (fn [e db s] ~@body)})) ^ref-509e1cd5-320-0
``` ^ref-509e1cd5-321-0 ^ref-509e1cd5-333-0

---

# Kanban adds ^ref-509e1cd5-325-0 ^ref-509e1cd5-366-0
 ^ref-509e1cd5-338-0
* [ ] Expose **Snapshot API** for `processes` (collection `processes`) ^ref-509e1cd5-327-0 ^ref-509e1cd5-353-0
* [ ] Add `process.txn` projector to upsert `processes` + `host_stats` atomically ^ref-509e1cd5-328-0
* [ ] Implement `timetravel.processAt(processId, T)` in a small CLI for debugging ^ref-509e1cd5-329-0
* [ ] Add `dev.harness.int.test.ts` to CI integration stage ^ref-509e1cd5-330-0
* [ ] Document ETag semantics and cache headers for `/snap/:key`

--- ^ref-509e1cd5-333-0

Want **Part 8** next? I can deliver:

* **Multi-tenant topics** (namespace + policy isolation),
* **SLO monitor** (lag, ack time, error rate with alarms), ^ref-509e1cd5-338-0
* **Bulk replayer** (topic→topic with filter/map),
* and **JS/Hy generators** to autowire schemas/topics → typed clients + validators.<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
## Related content
- [prom-lib-rate-limiters-and-replay-api](prom-lib-rate-limiters-and-replay-api.md)
- [schema-evolution-workflow](schema-evolution-workflow.md)
- [WebSocket Gateway Implementation](websocket-gateway-implementation.md)
- [Services](chunks/services.md)
- [Unique Info Dump Index](unique-info-dump-index.md)
- [Mongo Outbox Implementation](mongo-outbox-implementation.md)
- [Stateful Partitions and Rebalancing](stateful-partitions-and-rebalancing.md)
- [Event Bus MVP](event-bus-mvp.md)
- [Promethean Event Bus MVP v0.1](promethean-event-bus-mvp-v0-1.md)
- [archetype-ecs](archetype-ecs.md)
- [aionian-circuit-math](aionian-circuit-math.md)
- [Diagrams](chunks/diagrams.md)
- [DSL](chunks/dsl.md)
- [Event Bus Projections Architecture](event-bus-projections-architecture.md)
- [Chroma Toolkit Consolidation Plan](chroma-toolkit-consolidation-plan.md)
- [Agent Tasks: Persistence Migration to DualStore](agent-tasks-persistence-migration-to-dualstore.md)
- [ecs-offload-workers](ecs-offload-workers.md)
- [observability-infrastructure-setup](observability-infrastructure-setup.md)
- [Migrate to Provider-Tenant Architecture](migrate-to-provider-tenant-architecture.md)
- [Cross-Language Runtime Polymorphism](cross-language-runtime-polymorphism.md)
- [ecs-scheduler-and-prefabs](ecs-scheduler-and-prefabs.md)
- [zero-copy-snapshots-and-workers](zero-copy-snapshots-and-workers.md)
- [obsidian-ignore-node-modules-regex](obsidian-ignore-node-modules-regex.md)
- [sibilant-metacompiler-overview](sibilant-metacompiler-overview.md)
- [api-gateway-versioning](api-gateway-versioning.md)
- [AI-Centric OS with MCP Layer](ai-centric-os-with-mcp-layer.md)
- [JavaScript](chunks/javascript.md)
- [Agent Reflections and Prompt Evolution](agent-reflections-and-prompt-evolution.md)
- [Admin Dashboard for User Management](admin-dashboard-for-user-management.md)
- [Debugging Broker Connections and Agent Behavior](debugging-broker-connections-and-agent-behavior.md)
- [Local-First Intention→Code Loop with Free Models](local-first-intention-code-loop-with-free-models.md)
- [Interop and Source Maps](interop-and-source-maps.md)
- [Tooling](chunks/tooling.md)
- [Board Walk – 2025-08-11](board-walk-2025-08-11.md)
- [compiler-kit-foundations](compiler-kit-foundations.md)
- [Canonical Org-Babel Matplotlib Animation Template](canonical-org-babel-matplotlib-animation-template.md)
- [2d-sandbox-field](2d-sandbox-field.md)
- [Math Fundamentals](chunks/math-fundamentals.md)
- [Sibilant Meta-Prompt DSL](sibilant-meta-prompt-dsl.md)
- [System Scheduler with Resource-Aware DAG](system-scheduler-with-resource-aware-dag.md)
- [typed-struct-compiler](typed-struct-compiler.md)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop](polyglot-s-expr-bridge-python-js-lisp-interop.md)
- [sibilant-macro-targets](sibilant-macro-targets.md)
- [polymorphic-meta-programming-engine](polymorphic-meta-programming-engine.md)
- [pm2-orchestration-patterns](pm2-orchestration-patterns.md)
- [sibilant-meta-string-templating-runtime](sibilant-meta-string-templating-runtime.md)
- [template-based-compilation](template-based-compilation.md)
- [ts-to-lisp-transpiler](ts-to-lisp-transpiler.md)
- [Dynamic Context Model for Web Components](dynamic-context-model-for-web-components.md)
- [eidolon-field-math-foundations](eidolon-field-math-foundations.md)
- [Cross-Target Macro System in Sibilant](cross-target-macro-system-in-sibilant.md)
- [Duck's Self-Referential Perceptual Loop](ducks-self-referential-perceptual-loop.md)
- [Eidolon Field Abstract Model](eidolon-field-abstract-model.md)
- [Per-Domain Policy System for JS Crawler](per-domain-policy-system-for-js-crawler.md)
- [Promethean Agent Config DSL](promethean-agent-config-dsl.md)
- [balanced-bst](balanced-bst.md)
- [Exception Layer Analysis](exception-layer-analysis.md)
- [Model Selection for Lightweight Conversational Tasks](model-selection-for-lightweight-conversational-tasks.md)
- [field-dynamics-math-blocks](field-dynamics-math-blocks.md)
- [EidolonField](eidolonfield.md)
- [Shared](chunks/shared.md)
- [Simulation Demo](chunks/simulation-demo.md)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler](ollama-llm-provider-for-pseudo-code-transpiler.md)
- [eidolon-node-lifecycle](eidolon-node-lifecycle.md)
- [field-interaction-equations](field-interaction-equations.md)
- [field-node-diagram-outline](field-node-diagram-outline.md)
- [Window Management](chunks/window-management.md)
- [markdown-to-org-transpiler](markdown-to-org-transpiler.md)
- [Factorio AI with External Agents](factorio-ai-with-external-agents.md)
- [AI-First-OS-Model-Context-Protocol](ai-first-os-model-context-protocol.md)
- [ParticleSimulationWithCanvasAndFFmpeg](particlesimulationwithcanvasandffmpeg.md)
- [Matplotlib Animation with Async Execution](matplotlib-animation-with-async-execution.md)
- [Obsidian Templating Plugins Integration Guide](obsidian-templating-plugins-integration-guide.md)
- [heartbeat-fragment-demo](heartbeat-fragment-demo.md)
- [heartbeat-simulation-snippets](heartbeat-simulation-snippets.md)
- [Prompt_Folder_Bootstrap](prompt-folder-bootstrap.md)
- [prompt-programming-language-lisp](prompt-programming-language-lisp.md)
- [graph-ds](graph-ds.md)
- [i3-bluetooth-setup](i3-bluetooth-setup.md)
- [Promethean-native config design](promethean-native-config-design.md)
- [Board Automation Improvements](board-automation-improvements.md)
- [field-node-diagram-visualizations](field-node-diagram-visualizations.md)
- [field-node-diagram-set](field-node-diagram-set.md)
- [Duck's Attractor States](ducks-attractor-states.md)
- [Promethean_Eidolon_Synchronicity_Model](promethean-eidolon-synchronicity-model.md)
- [Promethean Infrastructure Setup](promethean-infrastructure-setup.md)
- [promethean-system-diagrams](promethean-system-diagrams.md)
- [Promethean Web UI Setup](promethean-web-ui-setup.md)
- [Language-Agnostic Mirror System](language-agnostic-mirror-system.md)
- [Fnord Tracer Protocol](fnord-tracer-protocol.md)
- [mystery-lisp-search-session](mystery-lisp-search-session.md)
- [Local-Only-LLM-Workflow](local-only-llm-workflow.md)
- [Lispy Macros with syntax-rules](lispy-macros-with-syntax-rules.md)
- [Creative Moments](creative-moments.md)
- [Performance-Optimized-Polyglot-Bridge](performance-optimized-polyglot-bridge.md)
- [Operations](chunks/operations.md)
- [layer-1-uptime-diagrams](layer-1-uptime-diagrams.md)
- [Pure-Node Crawl Stack with Playwright and Crawlee](pure-node-crawl-stack-with-playwright-and-crawlee.md)
- [Lisp-Compiler-Integration](lisp-compiler-integration.md)
- [Shared Package Structure](shared-package-structure.md)
- [lisp-dsl-for-window-management](lisp-dsl-for-window-management.md)
- [ripple-propagation-demo](ripple-propagation-demo.md)
- [i3-config-validation-methods](i3-config-validation-methods.md)
- [Local-Offline-Model-Deployment-Strategy](local-offline-model-deployment-strategy.md)
- [Promethean Workflow Optimization](promethean-workflow-optimization.md)
- [Prometheus Observability Stack](prometheus-observability-stack.md)
- [Protocol_0_The_Contradiction_Engine](protocol-0-the-contradiction-engine.md)
- [Provider-Agnostic Chat Panel Implementation](provider-agnostic-chat-panel-implementation.md)
- [Pure TypeScript Search Microservice](pure-typescript-search-microservice.md)
- [Functional Embedding Pipeline Refactor](functional-embedding-pipeline-refactor.md)
- [RAG UI Panel with Qdrant and PostgREST](rag-ui-panel-with-qdrant-and-postgrest.md)
- [Chroma-Embedding-Refactor](chroma-embedding-refactor.md)
- [homeostasis-decay-formulas](homeostasis-decay-formulas.md)
- [Redirecting Standard Error](redirecting-standard-error.md)
- [shared-package-layout-clarification](shared-package-layout-clarification.md)
- [komorebi-group-window-hack](komorebi-group-window-hack.md)
- [Recursive Prompt Construction Engine](recursive-prompt-construction-engine.md)
- [Self-Agency in AI Interaction](self-agency-in-ai-interaction.md)
- [set-assignment-in-lisp-ast](set-assignment-in-lisp-ast.md)
- [DuckDuckGoSearchPipeline](duckduckgosearchpipeline.md)
- [Layer1SurvivabilityEnvelope](layer1survivabilityenvelope.md)
- [refactor-relations](refactor-relations.md)
- [Promethean Pipelines](promethean-pipelines.md)
- [TypeScript Patch for Tool Calling Support](typescript-patch-for-tool-calling-support.md)
- [Promethean Documentation Pipeline Overview](promethean-documentation-pipeline-overview.md)
- [universal-intention-code-fabric](universal-intention-code-fabric.md)
- [js-to-lisp-reverse-compiler](js-to-lisp-reverse-compiler.md)
- [Refactor Frontmatter Processing](refactor-frontmatter-processing.md)
- [Model Upgrade Calm-Down Guide](model-upgrade-calm-down-guide.md)
- [Promethean State Format](promethean-state-format.md)
- [plan-update-confirmation](plan-update-confirmation.md)
- [promethean-requirements](promethean-requirements.md)
- [Voice Access Layer Design](voice-access-layer-design.md)
- [Smoke Resonance Visualizations](smoke-resonance-visualizations.md)
- [Ice Box Reorganization](ice-box-reorganization.md)
## Sources
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
- [prom-lib-rate-limiters-and-replay-api — L1](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-1-0) (line 1, col 0, score 0.74)
- [schema-evolution-workflow — L3](schema-evolution-workflow.md#^ref-d8059b6a-3-0) (line 3, col 0, score 0.65)
- [Stateful Partitions and Rebalancing — L3](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-3-0) (line 3, col 0, score 0.74)
- [Services — L6](chunks/services.md#^ref-75ea4a6a-6-0) (line 6, col 0, score 0.72)
- [Unique Info Dump Index — L40](unique-info-dump-index.md#^ref-30ec3ba6-40-0) (line 40, col 0, score 0.72)
- [Services — L9](chunks/services.md#^ref-75ea4a6a-9-0) (line 9, col 0, score 0.7)
- [ecs-scheduler-and-prefabs — L420](ecs-scheduler-and-prefabs.md#^ref-c62a1815-420-0) (line 420, col 0, score 0.7)
- [Event Bus MVP — L552](event-bus-mvp.md#^ref-534fe91d-552-0) (line 552, col 0, score 0.7)
- [heartbeat-fragment-demo — L123](heartbeat-fragment-demo.md#^ref-dd00677a-123-0) (line 123, col 0, score 0.7)
- [heartbeat-simulation-snippets — L115](heartbeat-simulation-snippets.md#^ref-23e221e9-115-0) (line 115, col 0, score 0.7)
- [Mongo Outbox Implementation — L323](mongo-outbox-implementation.md#^ref-9c1acd1e-323-0) (line 323, col 0, score 0.74)
- [WebSocket Gateway Implementation — L333](websocket-gateway-implementation.md#^ref-e811123d-333-0) (line 333, col 0, score 0.71)
- [Stateful Partitions and Rebalancing — L351](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-351-0) (line 351, col 0, score 0.72)
- [prom-lib-rate-limiters-and-replay-api — L106](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-106-0) (line 106, col 0, score 0.71)
- [Event Bus MVP — L284](event-bus-mvp.md#^ref-534fe91d-284-0) (line 284, col 0, score 0.74)
- [schema-evolution-workflow — L243](schema-evolution-workflow.md#^ref-d8059b6a-243-0) (line 243, col 0, score 0.74)
- [Language-Agnostic Mirror System — L109](language-agnostic-mirror-system.md#^ref-d2b3628c-109-0) (line 109, col 0, score 0.71)
- [zero-copy-snapshots-and-workers — L70](zero-copy-snapshots-and-workers.md#^ref-62bec6f0-70-0) (line 70, col 0, score 0.7)
- [prom-lib-rate-limiters-and-replay-api — L194](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-194-0) (line 194, col 0, score 0.72)
- [Promethean Event Bus MVP v0.1 — L733](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-733-0) (line 733, col 0, score 0.7)
- [WebSocket Gateway Implementation — L533](websocket-gateway-implementation.md#^ref-e811123d-533-0) (line 533, col 0, score 0.7)
- [Mongo Outbox Implementation — L381](mongo-outbox-implementation.md#^ref-9c1acd1e-381-0) (line 381, col 0, score 0.69)
- [Mongo Outbox Implementation — L74](mongo-outbox-implementation.md#^ref-9c1acd1e-74-0) (line 74, col 0, score 0.71)
- [prom-lib-rate-limiters-and-replay-api — L45](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-45-0) (line 45, col 0, score 0.68)
- [schema-evolution-workflow — L475](schema-evolution-workflow.md#^ref-d8059b6a-475-0) (line 475, col 0, score 0.67)
- [Pure TypeScript Search Microservice — L378](pure-typescript-search-microservice.md#^ref-d17d3a96-378-0) (line 378, col 0, score 0.72)
- [refactor-relations — L10](refactor-relations.md#^ref-41ce0216-10-0) (line 10, col 0, score 0.71)
- [Functional Embedding Pipeline Refactor — L31](functional-embedding-pipeline-refactor.md#^ref-a4a25141-31-0) (line 31, col 0, score 0.65)
- [Promethean Event Bus MVP v0.1 — L510](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-510-0) (line 510, col 0, score 0.71)
- [RAG UI Panel with Qdrant and PostgREST — L172](rag-ui-panel-with-qdrant-and-postgrest.md#^ref-e1056831-172-0) (line 172, col 0, score 0.7)
- [Per-Domain Policy System for JS Crawler — L184](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-184-0) (line 184, col 0, score 0.7)
- [Pure-Node Crawl Stack with Playwright and Crawlee — L178](pure-node-crawl-stack-with-playwright-and-crawlee.md#^ref-d527c05d-178-0) (line 178, col 0, score 0.65)
- [Refactor Frontmatter Processing — L11](refactor-frontmatter-processing.md#^ref-cfbdca2f-11-0) (line 11, col 0, score 0.69)
- [Pure TypeScript Search Microservice — L227](pure-typescript-search-microservice.md#^ref-d17d3a96-227-0) (line 227, col 0, score 0.64)
- [TypeScript Patch for Tool Calling Support — L35](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-35-0) (line 35, col 0, score 0.71)
- [Event Bus MVP — L99](event-bus-mvp.md#^ref-534fe91d-99-0) (line 99, col 0, score 0.68)
- [universal-intention-code-fabric — L277](universal-intention-code-fabric.md#^ref-c14edce7-277-0) (line 277, col 0, score 0.7)
- [prom-lib-rate-limiters-and-replay-api — L326](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-326-0) (line 326, col 0, score 0.63)
- [Promethean Event Bus MVP v0.1 — L102](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-102-0) (line 102, col 0, score 0.75)
- [prom-lib-rate-limiters-and-replay-api — L338](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-338-0) (line 338, col 0, score 0.67)
- [prom-lib-rate-limiters-and-replay-api — L178](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-178-0) (line 178, col 0, score 0.7)
- [Migrate to Provider-Tenant Architecture — L160](migrate-to-provider-tenant-architecture.md#^ref-54382370-160-0) (line 160, col 0, score 0.69)
- [Model Upgrade Calm-Down Guide — L30](model-upgrade-calm-down-guide.md#^ref-db74343f-30-0) (line 30, col 0, score 0.68)
- [Migrate to Provider-Tenant Architecture — L66](migrate-to-provider-tenant-architecture.md#^ref-54382370-66-0) (line 66, col 0, score 0.68)
- [Layer1SurvivabilityEnvelope — L148](layer1survivabilityenvelope.md#^ref-64a9f9f9-148-0) (line 148, col 0, score 0.76)
- [Agent Reflections and Prompt Evolution — L101](agent-reflections-and-prompt-evolution.md#^ref-bb7f0835-101-0) (line 101, col 0, score 0.68)
- [Prompt_Folder_Bootstrap — L60](prompt-folder-bootstrap.md#^ref-bd4f0976-60-0) (line 60, col 0, score 0.69)
- [Promethean Event Bus MVP v0.1 — L827](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-827-0) (line 827, col 0, score 0.67)
- [Promethean Event Bus MVP v0.1 — L98](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-98-0) (line 98, col 0, score 0.66)
- [sibilant-metacompiler-overview — L65](sibilant-metacompiler-overview.md#^ref-61d4086b-65-0) (line 65, col 0, score 0.66)
- [js-to-lisp-reverse-compiler — L383](js-to-lisp-reverse-compiler.md#^ref-58191024-383-0) (line 383, col 0, score 0.64)
- [Sibilant Meta-Prompt DSL — L109](sibilant-meta-prompt-dsl.md#^ref-af5d2824-109-0) (line 109, col 0, score 0.64)
- [js-to-lisp-reverse-compiler — L382](js-to-lisp-reverse-compiler.md#^ref-58191024-382-0) (line 382, col 0, score 0.63)
- [Eidolon Field Abstract Model — L152](eidolon-field-abstract-model.md#^ref-5e8b2388-152-0) (line 152, col 0, score 0.63)
- [Board Walk – 2025-08-11 — L60](board-walk-2025-08-11.md#^ref-7aa1eb92-60-0) (line 60, col 0, score 0.63)
- [Promethean Event Bus MVP v0.1 — L747](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-747-0) (line 747, col 0, score 0.73)
- [WebSocket Gateway Implementation — L473](websocket-gateway-implementation.md#^ref-e811123d-473-0) (line 473, col 0, score 0.74)
- [Stateful Partitions and Rebalancing — L417](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-417-0) (line 417, col 0, score 0.69)
- [schema-evolution-workflow — L201](schema-evolution-workflow.md#^ref-d8059b6a-201-0) (line 201, col 0, score 0.78)
- [prom-lib-rate-limiters-and-replay-api — L226](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-226-0) (line 226, col 0, score 0.7)
- [schema-evolution-workflow — L161](schema-evolution-workflow.md#^ref-d8059b6a-161-0) (line 161, col 0, score 0.75)
- [WebSocket Gateway Implementation — L219](websocket-gateway-implementation.md#^ref-e811123d-219-0) (line 219, col 0, score 0.68)
- [Mongo Outbox Implementation — L37](mongo-outbox-implementation.md#^ref-9c1acd1e-37-0) (line 37, col 0, score 0.75)
- [Event Bus MVP — L392](event-bus-mvp.md#^ref-534fe91d-392-0) (line 392, col 0, score 0.74)
- [WebSocket Gateway Implementation — L447](websocket-gateway-implementation.md#^ref-e811123d-447-0) (line 447, col 0, score 0.7)
- [Promethean Agent Config DSL — L172](promethean-agent-config-dsl.md#^ref-2c00ce45-172-0) (line 172, col 0, score 0.66)
- [plan-update-confirmation — L886](plan-update-confirmation.md#^ref-b22d79c6-886-0) (line 886, col 0, score 0.62)
- [ecs-scheduler-and-prefabs — L338](ecs-scheduler-and-prefabs.md#^ref-c62a1815-338-0) (line 338, col 0, score 0.66)
- [Prompt_Folder_Bootstrap — L24](prompt-folder-bootstrap.md#^ref-bd4f0976-24-0) (line 24, col 0, score 0.66)
- [Prompt_Folder_Bootstrap — L42](prompt-folder-bootstrap.md#^ref-bd4f0976-42-0) (line 42, col 0, score 0.66)
- [Prompt_Folder_Bootstrap — L66](prompt-folder-bootstrap.md#^ref-bd4f0976-66-0) (line 66, col 0, score 0.66)
- [Prompt_Folder_Bootstrap — L84](prompt-folder-bootstrap.md#^ref-bd4f0976-84-0) (line 84, col 0, score 0.66)
- [Prompt_Folder_Bootstrap — L103](prompt-folder-bootstrap.md#^ref-bd4f0976-103-0) (line 103, col 0, score 0.66)
- [Prompt_Folder_Bootstrap — L130](prompt-folder-bootstrap.md#^ref-bd4f0976-130-0) (line 130, col 0, score 0.66)
- [Prompt_Folder_Bootstrap — L152](prompt-folder-bootstrap.md#^ref-bd4f0976-152-0) (line 152, col 0, score 0.66)
- [System Scheduler with Resource-Aware DAG — L336](system-scheduler-with-resource-aware-dag.md#^ref-ba244286-336-0) (line 336, col 0, score 0.66)
- [Stateful Partitions and Rebalancing — L448](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-448-0) (line 448, col 0, score 0.73)
- [schema-evolution-workflow — L393](schema-evolution-workflow.md#^ref-d8059b6a-393-0) (line 393, col 0, score 0.71)
- [Event Bus Projections Architecture — L54](event-bus-projections-architecture.md#^ref-cf6b9b17-54-0) (line 54, col 0, score 0.72)
- [Promethean Pipelines — L20](promethean-pipelines.md#^ref-8b8e6103-20-0) (line 20, col 0, score 0.65)
- [WebSocket Gateway Implementation — L560](websocket-gateway-implementation.md#^ref-e811123d-560-0) (line 560, col 0, score 0.75)
- [Mongo Outbox Implementation — L451](mongo-outbox-implementation.md#^ref-9c1acd1e-451-0) (line 451, col 0, score 0.71)
- [schema-evolution-workflow — L476](schema-evolution-workflow.md#^ref-d8059b6a-476-0) (line 476, col 0, score 0.68)
- [Promethean Event Bus MVP v0.1 — L294](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-294-0) (line 294, col 0, score 0.71)
- [prom-lib-rate-limiters-and-replay-api — L90](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-90-0) (line 90, col 0, score 1)
- [schema-evolution-workflow — L130](schema-evolution-workflow.md#^ref-d8059b6a-130-0) (line 130, col 0, score 1)
- [schema-evolution-workflow — L222](schema-evolution-workflow.md#^ref-d8059b6a-222-0) (line 222, col 0, score 1)
- [Mongo Outbox Implementation — L305](mongo-outbox-implementation.md#^ref-9c1acd1e-305-0) (line 305, col 0, score 0.84)
- [Stateful Partitions and Rebalancing — L185](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-185-0) (line 185, col 0, score 0.82)
- [Stateful Partitions and Rebalancing — L326](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-326-0) (line 326, col 0, score 0.77)
- [Dynamic Context Model for Web Components — L376](dynamic-context-model-for-web-components.md#^ref-f7702bf8-376-0) (line 376, col 0, score 0.77)
- [Event Bus Projections Architecture — L3](event-bus-projections-architecture.md#^ref-cf6b9b17-3-0) (line 3, col 0, score 0.71)
- [Chroma-Embedding-Refactor — L64](chroma-embedding-refactor.md#^ref-8b256935-64-0) (line 64, col 0, score 0.69)
- [Chroma-Embedding-Refactor — L109](chroma-embedding-refactor.md#^ref-8b256935-109-0) (line 109, col 0, score 0.69)
- [Chroma-Embedding-Refactor — L258](chroma-embedding-refactor.md#^ref-8b256935-258-0) (line 258, col 0, score 0.69)
- [Chroma Toolkit Consolidation Plan — L72](chroma-toolkit-consolidation-plan.md#^ref-5020e892-72-0) (line 72, col 0, score 0.69)
- [Chroma Toolkit Consolidation Plan — L88](chroma-toolkit-consolidation-plan.md#^ref-5020e892-88-0) (line 88, col 0, score 0.69)
- [Chroma Toolkit Consolidation Plan — L107](chroma-toolkit-consolidation-plan.md#^ref-5020e892-107-0) (line 107, col 0, score 0.69)
- [Chroma Toolkit Consolidation Plan — L148](chroma-toolkit-consolidation-plan.md#^ref-5020e892-148-0) (line 148, col 0, score 0.69)
- [WebSocket Gateway Implementation — L296](websocket-gateway-implementation.md#^ref-e811123d-296-0) (line 296, col 0, score 0.78)
- [Promethean Event Bus MVP v0.1 — L197](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-197-0) (line 197, col 0, score 0.78)
- [Event Bus MVP — L434](event-bus-mvp.md#^ref-534fe91d-434-0) (line 434, col 0, score 0.76)
- [Stateful Partitions and Rebalancing — L328](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-328-0) (line 328, col 0, score 0.66)
- [schema-evolution-workflow — L224](schema-evolution-workflow.md#^ref-d8059b6a-224-0) (line 224, col 0, score 0.7)
- [Event Bus Projections Architecture — L5](event-bus-projections-architecture.md#^ref-cf6b9b17-5-0) (line 5, col 0, score 0.68)
- [layer-1-uptime-diagrams — L122](layer-1-uptime-diagrams.md#^ref-4127189a-122-0) (line 122, col 0, score 0.68)
- [Fnord Tracer Protocol — L214](fnord-tracer-protocol.md#^ref-fc21f824-214-0) (line 214, col 0, score 0.67)
- [prom-lib-rate-limiters-and-replay-api — L368](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-368-0) (line 368, col 0, score 0.67)
- [Promethean Event Bus MVP v0.1 — L395](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-395-0) (line 395, col 0, score 0.66)
- [WebSocket Gateway Implementation — L318](websocket-gateway-implementation.md#^ref-e811123d-318-0) (line 318, col 0, score 0.86)
- [prom-lib-rate-limiters-and-replay-api — L329](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-329-0) (line 329, col 0, score 0.66)
- [Event Bus MVP — L536](event-bus-mvp.md#^ref-534fe91d-536-0) (line 536, col 0, score 0.79)
- [Event Bus MVP — L365](event-bus-mvp.md#^ref-534fe91d-365-0) (line 365, col 0, score 0.77)
- [Event Bus MVP — L359](event-bus-mvp.md#^ref-534fe91d-359-0) (line 359, col 0, score 0.74)
- [Stateful Partitions and Rebalancing — L513](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-513-0) (line 513, col 0, score 0.64)
- [Promethean Event Bus MVP v0.1 — L371](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-371-0) (line 371, col 0, score 0.7)
- [WebSocket Gateway Implementation — L1](websocket-gateway-implementation.md#^ref-e811123d-1-0) (line 1, col 0, score 0.68)
- [WebSocket Gateway Implementation — L617](websocket-gateway-implementation.md#^ref-e811123d-617-0) (line 617, col 0, score 0.64)
- [Event Bus MVP — L7](event-bus-mvp.md#^ref-534fe91d-7-0) (line 7, col 0, score 0.72)
- [WebSocket Gateway Implementation — L322](websocket-gateway-implementation.md#^ref-e811123d-322-0) (line 322, col 0, score 0.68)
- [schema-evolution-workflow — L289](schema-evolution-workflow.md#^ref-d8059b6a-289-0) (line 289, col 0, score 0.73)
- [WebSocket Gateway Implementation — L56](websocket-gateway-implementation.md#^ref-e811123d-56-0) (line 56, col 0, score 0.74)
- [compiler-kit-foundations — L359](compiler-kit-foundations.md#^ref-01b21543-359-0) (line 359, col 0, score 0.69)
- [js-to-lisp-reverse-compiler — L13](js-to-lisp-reverse-compiler.md#^ref-58191024-13-0) (line 13, col 0, score 0.66)
- [Local-First Intention→Code Loop with Free Models — L47](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-47-0) (line 47, col 0, score 0.68)
- [prom-lib-rate-limiters-and-replay-api — L65](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-65-0) (line 65, col 0, score 0.67)
- [balanced-bst — L3](balanced-bst.md#^ref-d3e7db72-3-0) (line 3, col 0, score 0.66)
- [Lisp-Compiler-Integration — L188](lisp-compiler-integration.md#^ref-cfee6d36-188-0) (line 188, col 0, score 0.66)
- [ecs-scheduler-and-prefabs — L7](ecs-scheduler-and-prefabs.md#^ref-c62a1815-7-0) (line 7, col 0, score 0.66)
- [api-gateway-versioning — L278](api-gateway-versioning.md#^ref-0580dcd3-278-0) (line 278, col 0, score 0.73)
- [Layer1SurvivabilityEnvelope — L84](layer1survivabilityenvelope.md#^ref-64a9f9f9-84-0) (line 84, col 0, score 0.6)
- [WebSocket Gateway Implementation — L443](websocket-gateway-implementation.md#^ref-e811123d-443-0) (line 443, col 0, score 0.64)
- [Layer1SurvivabilityEnvelope — L63](layer1survivabilityenvelope.md#^ref-64a9f9f9-63-0) (line 63, col 0, score 0.63)
- [Chroma-Embedding-Refactor — L106](chroma-embedding-refactor.md#^ref-8b256935-106-0) (line 106, col 0, score 0.67)
- [layer-1-uptime-diagrams — L143](layer-1-uptime-diagrams.md#^ref-4127189a-143-0) (line 143, col 0, score 0.62)
- [prompt-programming-language-lisp — L18](prompt-programming-language-lisp.md#^ref-d41a06d1-18-0) (line 18, col 0, score 0.62)
- [universal-intention-code-fabric — L26](universal-intention-code-fabric.md#^ref-c14edce7-26-0) (line 26, col 0, score 0.62)
- [Agent Tasks: Persistence Migration to DualStore — L45](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-45-0) (line 45, col 0, score 0.61)
- [Agent Tasks: Persistence Migration to DualStore — L26](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-26-0) (line 26, col 0, score 0.61)
- [homeostasis-decay-formulas — L11](homeostasis-decay-formulas.md#^ref-37b5d236-11-0) (line 11, col 0, score 0.58)
- [Chroma Toolkit Consolidation Plan — L139](chroma-toolkit-consolidation-plan.md#^ref-5020e892-139-0) (line 139, col 0, score 0.74)
- [Promethean Pipelines — L58](promethean-pipelines.md#^ref-8b8e6103-58-0) (line 58, col 0, score 0.71)
- [ecs-scheduler-and-prefabs — L352](ecs-scheduler-and-prefabs.md#^ref-c62a1815-352-0) (line 352, col 0, score 0.68)
- [System Scheduler with Resource-Aware DAG — L350](system-scheduler-with-resource-aware-dag.md#^ref-ba244286-350-0) (line 350, col 0, score 0.68)
- [Stateful Partitions and Rebalancing — L187](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-187-0) (line 187, col 0, score 0.68)
- [Lisp-Compiler-Integration — L13](lisp-compiler-integration.md#^ref-cfee6d36-13-0) (line 13, col 0, score 0.68)
- [Language-Agnostic Mirror System — L11](language-agnostic-mirror-system.md#^ref-d2b3628c-11-0) (line 11, col 0, score 0.68)
- [Redirecting Standard Error — L7](redirecting-standard-error.md#^ref-b3555ede-7-0) (line 7, col 0, score 0.67)
- [RAG UI Panel with Qdrant and PostgREST — L336](rag-ui-panel-with-qdrant-and-postgrest.md#^ref-e1056831-336-0) (line 336, col 0, score 0.66)
- [schema-evolution-workflow — L132](schema-evolution-workflow.md#^ref-d8059b6a-132-0) (line 132, col 0, score 0.66)
- [universal-intention-code-fabric — L9](universal-intention-code-fabric.md#^ref-c14edce7-9-0) (line 9, col 0, score 0.66)
- [archetype-ecs — L423](archetype-ecs.md#^ref-8f4c1e86-423-0) (line 423, col 0, score 0.65)
- [schema-evolution-workflow — L477](schema-evolution-workflow.md#^ref-d8059b6a-477-0) (line 477, col 0, score 0.66)
- [schema-evolution-workflow — L469](schema-evolution-workflow.md#^ref-d8059b6a-469-0) (line 469, col 0, score 0.71)
- [typed-struct-compiler — L355](typed-struct-compiler.md#^ref-78eeedf7-355-0) (line 355, col 0, score 0.69)
- [prom-lib-rate-limiters-and-replay-api — L328](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-328-0) (line 328, col 0, score 0.66)
- [Promethean State Format — L26](promethean-state-format.md#^ref-23df6ddb-26-0) (line 26, col 0, score 0.68)
- [prom-lib-rate-limiters-and-replay-api — L335](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-335-0) (line 335, col 0, score 0.66)
- [schema-evolution-workflow — L25](schema-evolution-workflow.md#^ref-d8059b6a-25-0) (line 25, col 0, score 0.65)
- [Event Bus MVP — L258](event-bus-mvp.md#^ref-534fe91d-258-0) (line 258, col 0, score 0.74)
- [prom-lib-rate-limiters-and-replay-api — L260](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-260-0) (line 260, col 0, score 0.71)
- [prom-lib-rate-limiters-and-replay-api — L282](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-282-0) (line 282, col 0, score 0.68)
- [Stateful Partitions and Rebalancing — L166](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-166-0) (line 166, col 0, score 0.72)
- [ecs-offload-workers — L169](ecs-offload-workers.md#^ref-6498b9d7-169-0) (line 169, col 0, score 0.72)
- [Event Bus MVP — L471](event-bus-mvp.md#^ref-534fe91d-471-0) (line 471, col 0, score 0.7)
- [Stateful Partitions and Rebalancing — L267](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-267-0) (line 267, col 0, score 0.71)
- [TypeScript Patch for Tool Calling Support — L359](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-359-0) (line 359, col 0, score 0.69)
- [schema-evolution-workflow — L478](schema-evolution-workflow.md#^ref-d8059b6a-478-0) (line 478, col 0, score 0.69)
- [TypeScript Patch for Tool Calling Support — L436](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-436-0) (line 436, col 0, score 0.68)
- [TypeScript Patch for Tool Calling Support — L269](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-269-0) (line 269, col 0, score 0.67)
- [Migrate to Provider-Tenant Architecture — L69](migrate-to-provider-tenant-architecture.md#^ref-54382370-69-0) (line 69, col 0, score 0.66)
- [Language-Agnostic Mirror System — L526](language-agnostic-mirror-system.md#^ref-d2b3628c-526-0) (line 526, col 0, score 0.64)
- [Migrate to Provider-Tenant Architecture — L242](migrate-to-provider-tenant-architecture.md#^ref-54382370-242-0) (line 242, col 0, score 0.62)
- [Migrate to Provider-Tenant Architecture — L107](migrate-to-provider-tenant-architecture.md#^ref-54382370-107-0) (line 107, col 0, score 0.62)
- [Migrate to Provider-Tenant Architecture — L156](migrate-to-provider-tenant-architecture.md#^ref-54382370-156-0) (line 156, col 0, score 0.6)
- [Migrate to Provider-Tenant Architecture — L208](migrate-to-provider-tenant-architecture.md#^ref-54382370-208-0) (line 208, col 0, score 0.6)
- [universal-intention-code-fabric — L384](universal-intention-code-fabric.md#^ref-c14edce7-384-0) (line 384, col 0, score 0.6)
- [Promethean Event Bus MVP v0.1 — L787](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-787-0) (line 787, col 0, score 0.7)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L359](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-359-0) (line 359, col 0, score 0.68)
- [Event Bus MVP — L370](event-bus-mvp.md#^ref-534fe91d-370-0) (line 370, col 0, score 0.68)
- [Event Bus MVP — L509](event-bus-mvp.md#^ref-534fe91d-509-0) (line 509, col 0, score 0.79)
- [schema-evolution-workflow — L450](schema-evolution-workflow.md#^ref-d8059b6a-450-0) (line 450, col 0, score 0.78)
- [Stateful Partitions and Rebalancing — L499](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-499-0) (line 499, col 0, score 0.77)
- [archetype-ecs — L441](archetype-ecs.md#^ref-8f4c1e86-441-0) (line 441, col 0, score 0.72)
- [graph-ds — L343](graph-ds.md#^ref-6620e2f2-343-0) (line 343, col 0, score 0.72)
- [Mongo Outbox Implementation — L551](mongo-outbox-implementation.md#^ref-9c1acd1e-551-0) (line 551, col 0, score 0.7)
- [Exception Layer Analysis — L110](exception-layer-analysis.md#^ref-21d5cc09-110-0) (line 110, col 0, score 0.77)
- [Promethean Documentation Pipeline Overview — L71](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-71-0) (line 71, col 0, score 0.71)
- [prom-lib-rate-limiters-and-replay-api — L378](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-378-0) (line 378, col 0, score 0.69)
- [Chroma-Embedding-Refactor — L5](chroma-embedding-refactor.md#^ref-8b256935-5-0) (line 5, col 0, score 0.69)
- [schema-evolution-workflow — L463](schema-evolution-workflow.md#^ref-d8059b6a-463-0) (line 463, col 0, score 0.69)
- [RAG UI Panel with Qdrant and PostgREST — L358](rag-ui-panel-with-qdrant-and-postgrest.md#^ref-e1056831-358-0) (line 358, col 0, score 0.65)
- [Agent Tasks: Persistence Migration to DualStore — L8](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-8-0) (line 8, col 0, score 0.65)
- [i3-bluetooth-setup — L74](i3-bluetooth-setup.md#^ref-5e408692-74-0) (line 74, col 0, score 0.73)
- [Promethean-native config design — L363](promethean-native-config-design.md#^ref-ab748541-363-0) (line 363, col 0, score 0.72)
- [Model Selection for Lightweight Conversational Tasks — L105](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-105-0) (line 105, col 0, score 0.7)
- [Agent Tasks: Persistence Migration to DualStore — L25](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-25-0) (line 25, col 0, score 0.69)
- [Interop and Source Maps — L317](interop-and-source-maps.md#^ref-cdfac40c-317-0) (line 317, col 0, score 0.68)
- [Promethean Documentation Pipeline Overview — L147](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-147-0) (line 147, col 0, score 0.67)
- [js-to-lisp-reverse-compiler — L397](js-to-lisp-reverse-compiler.md#^ref-58191024-397-0) (line 397, col 0, score 0.67)
- [promethean-requirements — L4](promethean-requirements.md#^ref-95205cd3-4-0) (line 4, col 0, score 0.66)
- [mystery-lisp-search-session — L99](mystery-lisp-search-session.md#^ref-513dc4c7-99-0) (line 99, col 0, score 0.65)
- [Promethean-native config design — L32](promethean-native-config-design.md#^ref-ab748541-32-0) (line 32, col 0, score 0.63)
- [schema-evolution-workflow — L381](schema-evolution-workflow.md#^ref-d8059b6a-381-0) (line 381, col 0, score 0.85)
- [shared-package-layout-clarification — L157](shared-package-layout-clarification.md#^ref-36c8882a-157-0) (line 157, col 0, score 0.7)
- [Mongo Outbox Implementation — L537](mongo-outbox-implementation.md#^ref-9c1acd1e-537-0) (line 537, col 0, score 0.59)
- [schema-evolution-workflow — L468](schema-evolution-workflow.md#^ref-d8059b6a-468-0) (line 468, col 0, score 0.65)
- [TypeScript Patch for Tool Calling Support — L434](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-434-0) (line 434, col 0, score 0.64)
- [Chroma-Embedding-Refactor — L26](chroma-embedding-refactor.md#^ref-8b256935-26-0) (line 26, col 0, score 0.64)
- [Migrate to Provider-Tenant Architecture — L88](migrate-to-provider-tenant-architecture.md#^ref-54382370-88-0) (line 88, col 0, score 0.64)
- [Language-Agnostic Mirror System — L513](language-agnostic-mirror-system.md#^ref-d2b3628c-513-0) (line 513, col 0, score 0.63)
- [Shared Package Structure — L148](shared-package-structure.md#^ref-66a72fc3-148-0) (line 148, col 0, score 0.63)
- [Promethean Documentation Pipeline Overview — L16](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-16-0) (line 16, col 0, score 0.66)
- [Functional Embedding Pipeline Refactor — L11](functional-embedding-pipeline-refactor.md#^ref-a4a25141-11-0) (line 11, col 0, score 0.65)
- [Promethean Documentation Pipeline Overview — L13](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-13-0) (line 13, col 0, score 0.65)
- [Functional Embedding Pipeline Refactor — L302](functional-embedding-pipeline-refactor.md#^ref-a4a25141-302-0) (line 302, col 0, score 0.64)
- [Promethean Event Bus MVP v0.1 — L287](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-287-0) (line 287, col 0, score 0.64)
- [Mongo Outbox Implementation — L379](mongo-outbox-implementation.md#^ref-9c1acd1e-379-0) (line 379, col 0, score 0.63)
- [Dynamic Context Model for Web Components — L315](dynamic-context-model-for-web-components.md#^ref-f7702bf8-315-0) (line 315, col 0, score 0.63)
- [schema-evolution-workflow — L473](schema-evolution-workflow.md#^ref-d8059b6a-473-0) (line 473, col 0, score 0.84)
- [Stateful Partitions and Rebalancing — L520](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-520-0) (line 520, col 0, score 0.81)
- [prom-lib-rate-limiters-and-replay-api — L373](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-373-0) (line 373, col 0, score 0.73)
- [WebSocket Gateway Implementation — L623](websocket-gateway-implementation.md#^ref-e811123d-623-0) (line 623, col 0, score 0.72)
- [Mongo Outbox Implementation — L542](mongo-outbox-implementation.md#^ref-9c1acd1e-542-0) (line 542, col 0, score 0.7)
- [field-dynamics-math-blocks — L123](field-dynamics-math-blocks.md#^ref-7cfc230d-123-0) (line 123, col 0, score 0.63)
- [Smoke Resonance Visualizations — L74](smoke-resonance-visualizations.md#^ref-ac9d3ac5-74-0) (line 74, col 0, score 0.62)
- [Event Bus MVP — L543](event-bus-mvp.md#^ref-534fe91d-543-0) (line 543, col 0, score 0.62)
- [Interop and Source Maps — L5](interop-and-source-maps.md#^ref-cdfac40c-5-0) (line 5, col 0, score 0.61)
- [aionian-circuit-math — L135](aionian-circuit-math.md#^ref-f2d83a77-135-0) (line 135, col 0, score 0.61)
- [EidolonField — L228](eidolonfield.md#^ref-49d1e1e5-228-0) (line 228, col 0, score 0.6)
- [Ice Box Reorganization — L55](ice-box-reorganization.md#^ref-291c7d91-55-0) (line 55, col 0, score 0.6)
- [Event Bus MVP — L530](event-bus-mvp.md#^ref-534fe91d-530-0) (line 530, col 0, score 0.6)
- [2d-sandbox-field — L180](2d-sandbox-field.md#^ref-c710dc93-180-0) (line 180, col 0, score 0.6)
- [Eidolon Field Abstract Model — L176](eidolon-field-abstract-model.md#^ref-5e8b2388-176-0) (line 176, col 0, score 0.6)
- [Exception Layer Analysis — L134](exception-layer-analysis.md#^ref-21d5cc09-134-0) (line 134, col 0, score 0.6)
- [Migrate to Provider-Tenant Architecture — L166](migrate-to-provider-tenant-architecture.md#^ref-54382370-166-0) (line 166, col 0, score 0.67)
- [Migrate to Provider-Tenant Architecture — L85](migrate-to-provider-tenant-architecture.md#^ref-54382370-85-0) (line 85, col 0, score 0.65)
- [Shared Package Structure — L159](shared-package-structure.md#^ref-66a72fc3-159-0) (line 159, col 0, score 0.65)
- [Mongo Outbox Implementation — L148](mongo-outbox-implementation.md#^ref-9c1acd1e-148-0) (line 148, col 0, score 0.64)
- [Promethean Event Bus MVP v0.1 — L108](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-108-0) (line 108, col 0, score 0.63)
- [Promethean Event Bus MVP v0.1 — L106](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-106-0) (line 106, col 0, score 0.63)
- [Voice Access Layer Design — L299](voice-access-layer-design.md#^ref-543ed9b3-299-0) (line 299, col 0, score 0.63)
- [Migrate to Provider-Tenant Architecture — L261](migrate-to-provider-tenant-architecture.md#^ref-54382370-261-0) (line 261, col 0, score 0.62)
- [Migrate to Provider-Tenant Architecture — L22](migrate-to-provider-tenant-architecture.md#^ref-54382370-22-0) (line 22, col 0, score 0.62)
- [Promethean Event Bus MVP v0.1 — L104](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-104-0) (line 104, col 0, score 0.62)
- [sibilant-macro-targets — L15](sibilant-macro-targets.md#^ref-c5c9a5c6-15-0) (line 15, col 0, score 0.62)
- [layer-1-uptime-diagrams — L9](layer-1-uptime-diagrams.md#^ref-4127189a-9-0) (line 9, col 0, score 0.63)
- [aionian-circuit-math — L24](aionian-circuit-math.md#^ref-f2d83a77-24-0) (line 24, col 0, score 0.61)
- [Voice Access Layer Design — L13](voice-access-layer-design.md#^ref-543ed9b3-13-0) (line 13, col 0, score 0.61)
- [Fnord Tracer Protocol — L129](fnord-tracer-protocol.md#^ref-fc21f824-129-0) (line 129, col 0, score 0.6)
- [Promethean Event Bus MVP v0.1 — L358](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-358-0) (line 358, col 0, score 0.59)
- [layer-1-uptime-diagrams — L81](layer-1-uptime-diagrams.md#^ref-4127189a-81-0) (line 81, col 0, score 0.59)
- [Promethean Event Bus MVP v0.1 — L333](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-333-0) (line 333, col 0, score 0.58)
- [aionian-circuit-math — L110](aionian-circuit-math.md#^ref-f2d83a77-110-0) (line 110, col 0, score 0.57)
- [Promethean Event Bus MVP v0.1 — L119](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-119-0) (line 119, col 0, score 0.68)
- [Stateful Partitions and Rebalancing — L516](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-516-0) (line 516, col 0, score 0.66)
- [RAG UI Panel with Qdrant and PostgREST — L329](rag-ui-panel-with-qdrant-and-postgrest.md#^ref-e1056831-329-0) (line 329, col 0, score 0.63)
- [Migrate to Provider-Tenant Architecture — L80](migrate-to-provider-tenant-architecture.md#^ref-54382370-80-0) (line 80, col 0, score 0.63)
- [RAG UI Panel with Qdrant and PostgREST — L327](rag-ui-panel-with-qdrant-and-postgrest.md#^ref-e1056831-327-0) (line 327, col 0, score 0.62)
- [prom-lib-rate-limiters-and-replay-api — L351](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-351-0) (line 351, col 0, score 0.62)
- [archetype-ecs — L418](archetype-ecs.md#^ref-8f4c1e86-418-0) (line 418, col 0, score 0.61)
- [Ice Box Reorganization — L59](ice-box-reorganization.md#^ref-291c7d91-59-0) (line 59, col 0, score 0.61)
- [schema-evolution-workflow — L311](schema-evolution-workflow.md#^ref-d8059b6a-311-0) (line 311, col 0, score 0.69)
- [AI-Centric OS with MCP Layer — L40](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-40-0) (line 40, col 0, score 0.68)
- [prom-lib-rate-limiters-and-replay-api — L377](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-377-0) (line 377, col 0, score 0.68)
- [Stateful Partitions and Rebalancing — L202](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-202-0) (line 202, col 0, score 0.66)
- [Promethean Agent Config DSL — L3](promethean-agent-config-dsl.md#^ref-2c00ce45-3-0) (line 3, col 0, score 0.65)
- [plan-update-confirmation — L787](plan-update-confirmation.md#^ref-b22d79c6-787-0) (line 787, col 0, score 0.64)
- [Promethean Agent Config DSL — L11](promethean-agent-config-dsl.md#^ref-2c00ce45-11-0) (line 11, col 0, score 0.64)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L489](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-489-0) (line 489, col 0, score 0.64)
- [WebSocket Gateway Implementation — L628](websocket-gateway-implementation.md#^ref-e811123d-628-0) (line 628, col 0, score 0.64)
- [Agent Tasks: Persistence Migration to DualStore — L134](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-134-0) (line 134, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L164](chroma-toolkit-consolidation-plan.md#^ref-5020e892-164-0) (line 164, col 0, score 1)
- [Services — L18](chunks/services.md#^ref-75ea4a6a-18-0) (line 18, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L230](cross-language-runtime-polymorphism.md#^ref-c34c36a6-230-0) (line 230, col 0, score 1)
- [ecs-offload-workers — L483](ecs-offload-workers.md#^ref-6498b9d7-483-0) (line 483, col 0, score 1)
- [eidolon-field-math-foundations — L148](eidolon-field-math-foundations.md#^ref-008f2ac0-148-0) (line 148, col 0, score 1)
- [Event Bus MVP — L549](event-bus-mvp.md#^ref-534fe91d-549-0) (line 549, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L282](migrate-to-provider-tenant-architecture.md#^ref-54382370-282-0) (line 282, col 0, score 1)
- [Services — L10](chunks/services.md#^ref-75ea4a6a-10-0) (line 10, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L209](cross-language-runtime-polymorphism.md#^ref-c34c36a6-209-0) (line 209, col 0, score 1)
- [ecs-offload-workers — L486](ecs-offload-workers.md#^ref-6498b9d7-486-0) (line 486, col 0, score 1)
- [Event Bus MVP — L548](event-bus-mvp.md#^ref-534fe91d-548-0) (line 548, col 0, score 1)
- [Mongo Outbox Implementation — L552](mongo-outbox-implementation.md#^ref-9c1acd1e-552-0) (line 552, col 0, score 1)
- [prom-lib-rate-limiters-and-replay-api — L382](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-382-0) (line 382, col 0, score 1)
- [Promethean Event Bus MVP v0.1 — L913](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-913-0) (line 913, col 0, score 1)
- [Stateful Partitions and Rebalancing — L527](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-527-0) (line 527, col 0, score 1)
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
- [Agent Tasks: Persistence Migration to DualStore — L172](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-172-0) (line 172, col 0, score 1)
- [AI-Centric OS with MCP Layer — L424](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-424-0) (line 424, col 0, score 1)
- [aionian-circuit-math — L183](aionian-circuit-math.md#^ref-f2d83a77-183-0) (line 183, col 0, score 1)
- [api-gateway-versioning — L310](api-gateway-versioning.md#^ref-0580dcd3-310-0) (line 310, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L211](chroma-toolkit-consolidation-plan.md#^ref-5020e892-211-0) (line 211, col 0, score 1)
- [Diagrams — L23](chunks/diagrams.md#^ref-45cd25b5-23-0) (line 23, col 0, score 1)
- [DSL — L27](chunks/dsl.md#^ref-e87bc036-27-0) (line 27, col 0, score 1)
- [JavaScript — L29](chunks/javascript.md#^ref-c1618c66-29-0) (line 29, col 0, score 1)
- [Math Fundamentals — L39](chunks/math-fundamentals.md#^ref-c6e87433-39-0) (line 39, col 0, score 1)
- [Shared — L28](chunks/shared.md#^ref-623a55f7-28-0) (line 28, col 0, score 1)
- [Simulation Demo — L29](chunks/simulation-demo.md#^ref-557309a3-29-0) (line 29, col 0, score 1)
- [Tooling — L14](chunks/tooling.md#^ref-6cb4943e-14-0) (line 14, col 0, score 1)
- [field-node-diagram-visualizations — L89](field-node-diagram-visualizations.md#^ref-e9b27b06-89-0) (line 89, col 0, score 1)
- [graph-ds — L373](graph-ds.md#^ref-6620e2f2-373-0) (line 373, col 0, score 1)
- [heartbeat-fragment-demo — L99](heartbeat-fragment-demo.md#^ref-dd00677a-99-0) (line 99, col 0, score 1)
- [heartbeat-simulation-snippets — L86](heartbeat-simulation-snippets.md#^ref-23e221e9-86-0) (line 86, col 0, score 1)
- [homeostasis-decay-formulas — L154](homeostasis-decay-formulas.md#^ref-37b5d236-154-0) (line 154, col 0, score 1)
- [Interop and Source Maps — L518](interop-and-source-maps.md#^ref-cdfac40c-518-0) (line 518, col 0, score 1)
- [komorebi-group-window-hack — L205](komorebi-group-window-hack.md#^ref-dd89372d-205-0) (line 205, col 0, score 1)
- [layer-1-uptime-diagrams — L166](layer-1-uptime-diagrams.md#^ref-4127189a-166-0) (line 166, col 0, score 1)
- [Lisp-Compiler-Integration — L558](lisp-compiler-integration.md#^ref-cfee6d36-558-0) (line 558, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L152](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-152-0) (line 152, col 0, score 1)
- [api-gateway-versioning — L294](api-gateway-versioning.md#^ref-0580dcd3-294-0) (line 294, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L191](chroma-toolkit-consolidation-plan.md#^ref-5020e892-191-0) (line 191, col 0, score 1)
- [Services — L11](chunks/services.md#^ref-75ea4a6a-11-0) (line 11, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L228](cross-language-runtime-polymorphism.md#^ref-c34c36a6-228-0) (line 228, col 0, score 1)
- [ecs-offload-workers — L465](ecs-offload-workers.md#^ref-6498b9d7-465-0) (line 465, col 0, score 1)
- [Event Bus MVP — L547](event-bus-mvp.md#^ref-534fe91d-547-0) (line 547, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L312](migrate-to-provider-tenant-architecture.md#^ref-54382370-312-0) (line 312, col 0, score 1)
- [Services — L12](chunks/services.md#^ref-75ea4a6a-12-0) (line 12, col 0, score 1)
- [Event Bus MVP — L551](event-bus-mvp.md#^ref-534fe91d-551-0) (line 551, col 0, score 1)
- [Mongo Outbox Implementation — L557](mongo-outbox-implementation.md#^ref-9c1acd1e-557-0) (line 557, col 0, score 1)
- [prom-lib-rate-limiters-and-replay-api — L386](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-386-0) (line 386, col 0, score 1)
- [Promethean Event Bus MVP v0.1 — L890](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-890-0) (line 890, col 0, score 1)
- [Promethean-native config design — L389](promethean-native-config-design.md#^ref-ab748541-389-0) (line 389, col 0, score 1)
- [schema-evolution-workflow — L482](schema-evolution-workflow.md#^ref-d8059b6a-482-0) (line 482, col 0, score 1)
- [Unique Info Dump Index — L92](unique-info-dump-index.md#^ref-30ec3ba6-92-0) (line 92, col 0, score 1)
- [Agent Reflections and Prompt Evolution — L145](agent-reflections-and-prompt-evolution.md#^ref-bb7f0835-145-0) (line 145, col 0, score 1)
- [Local-Only-LLM-Workflow — L212](local-only-llm-workflow.md#^ref-9a8ab57e-212-0) (line 212, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L291](migrate-to-provider-tenant-architecture.md#^ref-54382370-291-0) (line 291, col 0, score 1)
- [Model Selection for Lightweight Conversational Tasks — L155](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-155-0) (line 155, col 0, score 1)
- [Mongo Outbox Implementation — L550](mongo-outbox-implementation.md#^ref-9c1acd1e-550-0) (line 550, col 0, score 1)
- [observability-infrastructure-setup — L368](observability-infrastructure-setup.md#^ref-b4e64f8c-368-0) (line 368, col 0, score 1)
- [obsidian-ignore-node-modules-regex — L72](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-72-0) (line 72, col 0, score 1)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L201](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-201-0) (line 201, col 0, score 1)
- [polymorphic-meta-programming-engine — L246](polymorphic-meta-programming-engine.md#^ref-7bed0b9a-246-0) (line 246, col 0, score 1)
- [prom-lib-rate-limiters-and-replay-api — L384](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-384-0) (line 384, col 0, score 1)
- [Promethean Agent Config DSL — L329](promethean-agent-config-dsl.md#^ref-2c00ce45-329-0) (line 329, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L135](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-135-0) (line 135, col 0, score 1)
- [ecs-offload-workers — L481](ecs-offload-workers.md#^ref-6498b9d7-481-0) (line 481, col 0, score 1)
- [ecs-scheduler-and-prefabs — L418](ecs-scheduler-and-prefabs.md#^ref-c62a1815-418-0) (line 418, col 0, score 1)
- [eidolon-node-lifecycle — L49](eidolon-node-lifecycle.md#^ref-938eca9c-49-0) (line 49, col 0, score 1)
- [Event Bus MVP — L545](event-bus-mvp.md#^ref-534fe91d-545-0) (line 545, col 0, score 1)
- [Event Bus Projections Architecture — L148](event-bus-projections-architecture.md#^ref-cf6b9b17-148-0) (line 148, col 0, score 1)
- [Fnord Tracer Protocol — L242](fnord-tracer-protocol.md#^ref-fc21f824-242-0) (line 242, col 0, score 1)
- [i3-bluetooth-setup — L104](i3-bluetooth-setup.md#^ref-5e408692-104-0) (line 104, col 0, score 1)
- [layer-1-uptime-diagrams — L173](layer-1-uptime-diagrams.md#^ref-4127189a-173-0) (line 173, col 0, score 1)
- [Local-First Intention→Code Loop with Free Models — L147](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-147-0) (line 147, col 0, score 1)
- [Exception Layer Analysis — L172](exception-layer-analysis.md#^ref-21d5cc09-172-0) (line 172, col 0, score 1)
- [field-dynamics-math-blocks — L154](field-dynamics-math-blocks.md#^ref-7cfc230d-154-0) (line 154, col 0, score 1)
- [field-interaction-equations — L164](field-interaction-equations.md#^ref-b09141b7-164-0) (line 164, col 0, score 1)
- [field-node-diagram-outline — L120](field-node-diagram-outline.md#^ref-1f32c94a-120-0) (line 120, col 0, score 1)
- [field-node-diagram-set — L149](field-node-diagram-set.md#^ref-22b989d5-149-0) (line 149, col 0, score 1)
- [field-node-diagram-visualizations — L99](field-node-diagram-visualizations.md#^ref-e9b27b06-99-0) (line 99, col 0, score 1)
- [graph-ds — L365](graph-ds.md#^ref-6620e2f2-365-0) (line 365, col 0, score 1)
- [heartbeat-fragment-demo — L111](heartbeat-fragment-demo.md#^ref-dd00677a-111-0) (line 111, col 0, score 1)
- [heartbeat-simulation-snippets — L101](heartbeat-simulation-snippets.md#^ref-23e221e9-101-0) (line 101, col 0, score 1)
- [Diagrams — L13](chunks/diagrams.md#^ref-45cd25b5-13-0) (line 13, col 0, score 1)
- [DSL — L15](chunks/dsl.md#^ref-e87bc036-15-0) (line 15, col 0, score 1)
- [JavaScript — L18](chunks/javascript.md#^ref-c1618c66-18-0) (line 18, col 0, score 1)
- [Math Fundamentals — L14](chunks/math-fundamentals.md#^ref-c6e87433-14-0) (line 14, col 0, score 1)
- [Services — L14](chunks/services.md#^ref-75ea4a6a-14-0) (line 14, col 0, score 1)
- [Shared — L7](chunks/shared.md#^ref-623a55f7-7-0) (line 7, col 0, score 1)
- [Simulation Demo — L10](chunks/simulation-demo.md#^ref-557309a3-10-0) (line 10, col 0, score 1)
- [Tooling — L9](chunks/tooling.md#^ref-6cb4943e-9-0) (line 9, col 0, score 1)
- [Window Management — L15](chunks/window-management.md#^ref-9e8ae388-15-0) (line 15, col 0, score 1)
- [aionian-circuit-math — L165](aionian-circuit-math.md#^ref-f2d83a77-165-0) (line 165, col 0, score 1)
- [api-gateway-versioning — L319](api-gateway-versioning.md#^ref-0580dcd3-319-0) (line 319, col 0, score 1)
- [Canonical Org-Babel Matplotlib Animation Template — L116](canonical-org-babel-matplotlib-animation-template.md#^ref-1b1338fc-116-0) (line 116, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L209](chroma-toolkit-consolidation-plan.md#^ref-5020e892-209-0) (line 209, col 0, score 1)
- [DSL — L13](chunks/dsl.md#^ref-e87bc036-13-0) (line 13, col 0, score 1)
- [Math Fundamentals — L16](chunks/math-fundamentals.md#^ref-c6e87433-16-0) (line 16, col 0, score 1)
- [Services — L16](chunks/services.md#^ref-75ea4a6a-16-0) (line 16, col 0, score 1)
- [Shared — L5](chunks/shared.md#^ref-623a55f7-5-0) (line 5, col 0, score 1)
- [Simulation Demo — L12](chunks/simulation-demo.md#^ref-557309a3-12-0) (line 12, col 0, score 1)
- [Language-Agnostic Mirror System — L538](language-agnostic-mirror-system.md#^ref-d2b3628c-538-0) (line 538, col 0, score 1)
- [layer-1-uptime-diagrams — L178](layer-1-uptime-diagrams.md#^ref-4127189a-178-0) (line 178, col 0, score 1)
- [Lisp-Compiler-Integration — L550](lisp-compiler-integration.md#^ref-cfee6d36-550-0) (line 550, col 0, score 1)
- [lisp-dsl-for-window-management — L223](lisp-dsl-for-window-management.md#^ref-c5c5ff1c-223-0) (line 223, col 0, score 1)
- [Lispy Macros with syntax-rules — L406](lispy-macros-with-syntax-rules.md#^ref-cbfe3513-406-0) (line 406, col 0, score 1)
- [Local-First Intention→Code Loop with Free Models — L168](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-168-0) (line 168, col 0, score 1)
- [Local-Only-LLM-Workflow — L201](local-only-llm-workflow.md#^ref-9a8ab57e-201-0) (line 201, col 0, score 1)
- [markdown-to-org-transpiler — L323](markdown-to-org-transpiler.md#^ref-ab54cdd8-323-0) (line 323, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L496](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-496-0) (line 496, col 0, score 1)
- [ripple-propagation-demo — L118](ripple-propagation-demo.md#^ref-8430617b-118-0) (line 118, col 0, score 1)
- [EidolonField — L257](eidolonfield.md#^ref-49d1e1e5-257-0) (line 257, col 0, score 1)
- [Event Bus MVP — L558](event-bus-mvp.md#^ref-534fe91d-558-0) (line 558, col 0, score 1)
- [Factorio AI with External Agents — L147](factorio-ai-with-external-agents.md#^ref-a4d90289-147-0) (line 147, col 0, score 1)
- [field-node-diagram-outline — L116](field-node-diagram-outline.md#^ref-1f32c94a-116-0) (line 116, col 0, score 1)
- [field-node-diagram-set — L147](field-node-diagram-set.md#^ref-22b989d5-147-0) (line 147, col 0, score 1)
- [field-node-diagram-visualizations — L96](field-node-diagram-visualizations.md#^ref-e9b27b06-96-0) (line 96, col 0, score 1)
- [Fnord Tracer Protocol — L249](fnord-tracer-protocol.md#^ref-fc21f824-249-0) (line 249, col 0, score 1)
- [graph-ds — L368](graph-ds.md#^ref-6620e2f2-368-0) (line 368, col 0, score 1)
- [heartbeat-fragment-demo — L115](heartbeat-fragment-demo.md#^ref-dd00677a-115-0) (line 115, col 0, score 1)
- [heartbeat-simulation-snippets — L104](heartbeat-simulation-snippets.md#^ref-23e221e9-104-0) (line 104, col 0, score 1)
- [Pure TypeScript Search Microservice — L538](pure-typescript-search-microservice.md#^ref-d17d3a96-538-0) (line 538, col 0, score 1)
- [RAG UI Panel with Qdrant and PostgREST — L374](rag-ui-panel-with-qdrant-and-postgrest.md#^ref-e1056831-374-0) (line 374, col 0, score 1)
- [Recursive Prompt Construction Engine — L200](recursive-prompt-construction-engine.md#^ref-babdb9eb-200-0) (line 200, col 0, score 1)
- [Redirecting Standard Error — L31](redirecting-standard-error.md#^ref-b3555ede-31-0) (line 31, col 0, score 1)
- [ripple-propagation-demo — L120](ripple-propagation-demo.md#^ref-8430617b-120-0) (line 120, col 0, score 1)
- [schema-evolution-workflow — L502](schema-evolution-workflow.md#^ref-d8059b6a-502-0) (line 502, col 0, score 1)
- [Self-Agency in AI Interaction — L53](self-agency-in-ai-interaction.md#^ref-49a9a860-53-0) (line 53, col 0, score 1)
- [set-assignment-in-lisp-ast — L161](set-assignment-in-lisp-ast.md#^ref-c5fba0a0-161-0) (line 161, col 0, score 1)
- [shared-package-layout-clarification — L185](shared-package-layout-clarification.md#^ref-36c8882a-185-0) (line 185, col 0, score 1)
- [Shared Package Structure — L181](shared-package-structure.md#^ref-66a72fc3-181-0) (line 181, col 0, score 1)
- [sibilant-macro-targets — L173](sibilant-macro-targets.md#^ref-c5c9a5c6-173-0) (line 173, col 0, score 1)
- [Math Fundamentals — L20](chunks/math-fundamentals.md#^ref-c6e87433-20-0) (line 20, col 0, score 1)
- [Services — L20](chunks/services.md#^ref-75ea4a6a-20-0) (line 20, col 0, score 1)
- [compiler-kit-foundations — L620](compiler-kit-foundations.md#^ref-01b21543-620-0) (line 620, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L237](cross-language-runtime-polymorphism.md#^ref-c34c36a6-237-0) (line 237, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L40](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-40-0) (line 40, col 0, score 1)
- [Dynamic Context Model for Web Components — L401](dynamic-context-model-for-web-components.md#^ref-f7702bf8-401-0) (line 401, col 0, score 1)
- [ecs-scheduler-and-prefabs — L386](ecs-scheduler-and-prefabs.md#^ref-c62a1815-386-0) (line 386, col 0, score 1)
- [eidolon-field-math-foundations — L127](eidolon-field-math-foundations.md#^ref-008f2ac0-127-0) (line 127, col 0, score 1)
- [Event Bus MVP — L557](event-bus-mvp.md#^ref-534fe91d-557-0) (line 557, col 0, score 1)
- [AI-Centric OS with MCP Layer — L407](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-407-0) (line 407, col 0, score 1)
- [api-gateway-versioning — L284](api-gateway-versioning.md#^ref-0580dcd3-284-0) (line 284, col 0, score 1)
- [Services — L21](chunks/services.md#^ref-75ea4a6a-21-0) (line 21, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L43](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-43-0) (line 43, col 0, score 1)
- [Dynamic Context Model for Web Components — L407](dynamic-context-model-for-web-components.md#^ref-f7702bf8-407-0) (line 407, col 0, score 1)
- [eidolon-field-math-foundations — L167](eidolon-field-math-foundations.md#^ref-008f2ac0-167-0) (line 167, col 0, score 1)
- [i3-bluetooth-setup — L123](i3-bluetooth-setup.md#^ref-5e408692-123-0) (line 123, col 0, score 1)
- [i3-config-validation-methods — L78](i3-config-validation-methods.md#^ref-d28090ac-78-0) (line 78, col 0, score 1)
- [Local-Offline-Model-Deployment-Strategy — L295](local-offline-model-deployment-strategy.md#^ref-ad7f1ed3-295-0) (line 295, col 0, score 1)
- [api-gateway-versioning — L315](api-gateway-versioning.md#^ref-0580dcd3-315-0) (line 315, col 0, score 1)
- [Chroma-Embedding-Refactor — L331](chroma-embedding-refactor.md#^ref-8b256935-331-0) (line 331, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L167](chroma-toolkit-consolidation-plan.md#^ref-5020e892-167-0) (line 167, col 0, score 1)
- [Diagrams — L25](chunks/diagrams.md#^ref-45cd25b5-25-0) (line 25, col 0, score 1)
- [Tooling — L24](chunks/tooling.md#^ref-6cb4943e-24-0) (line 24, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L173](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-173-0) (line 173, col 0, score 1)
- [Dynamic Context Model for Web Components — L390](dynamic-context-model-for-web-components.md#^ref-f7702bf8-390-0) (line 390, col 0, score 1)
- [eidolon-field-math-foundations — L147](eidolon-field-math-foundations.md#^ref-008f2ac0-147-0) (line 147, col 0, score 1)
- [Event Bus MVP — L553](event-bus-mvp.md#^ref-534fe91d-553-0) (line 553, col 0, score 1)
- [field-interaction-equations — L159](field-interaction-equations.md#^ref-b09141b7-159-0) (line 159, col 0, score 1)
- [Functional Embedding Pipeline Refactor — L315](functional-embedding-pipeline-refactor.md#^ref-a4a25141-315-0) (line 315, col 0, score 1)
- [Math Fundamentals — L34](chunks/math-fundamentals.md#^ref-c6e87433-34-0) (line 34, col 0, score 1)
- [Services — L22](chunks/services.md#^ref-75ea4a6a-22-0) (line 22, col 0, score 1)
- [Shared — L29](chunks/shared.md#^ref-623a55f7-29-0) (line 29, col 0, score 1)
- [Simulation Demo — L23](chunks/simulation-demo.md#^ref-557309a3-23-0) (line 23, col 0, score 1)
- [Tooling — L16](chunks/tooling.md#^ref-6cb4943e-16-0) (line 16, col 0, score 1)
- [Window Management — L25](chunks/window-management.md#^ref-9e8ae388-25-0) (line 25, col 0, score 1)
- [compiler-kit-foundations — L627](compiler-kit-foundations.md#^ref-01b21543-627-0) (line 627, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L171](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-171-0) (line 171, col 0, score 1)
- [Duck's Attractor States — L81](ducks-attractor-states.md#^ref-13951643-81-0) (line 81, col 0, score 1)
- [JavaScript — L11](chunks/javascript.md#^ref-c1618c66-11-0) (line 11, col 0, score 1)
- [ecs-offload-workers — L457](ecs-offload-workers.md#^ref-6498b9d7-457-0) (line 457, col 0, score 1)
- [ecs-scheduler-and-prefabs — L419](ecs-scheduler-and-prefabs.md#^ref-c62a1815-419-0) (line 419, col 0, score 1)
- [Interop and Source Maps — L534](interop-and-source-maps.md#^ref-cdfac40c-534-0) (line 534, col 0, score 1)
- [Lisp-Compiler-Integration — L539](lisp-compiler-integration.md#^ref-cfee6d36-539-0) (line 539, col 0, score 1)
- [Lispy Macros with syntax-rules — L412](lispy-macros-with-syntax-rules.md#^ref-cbfe3513-412-0) (line 412, col 0, score 1)
- [System Scheduler with Resource-Aware DAG — L410](system-scheduler-with-resource-aware-dag.md#^ref-ba244286-410-0) (line 410, col 0, score 1)
- [Unique Info Dump Index — L72](unique-info-dump-index.md#^ref-30ec3ba6-72-0) (line 72, col 0, score 1)
- [Tooling — L7](chunks/tooling.md#^ref-6cb4943e-7-0) (line 7, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L227](cross-language-runtime-polymorphism.md#^ref-c34c36a6-227-0) (line 227, col 0, score 1)
- [ecs-scheduler-and-prefabs — L421](ecs-scheduler-and-prefabs.md#^ref-c62a1815-421-0) (line 421, col 0, score 1)
- [Local-First Intention→Code Loop with Free Models — L156](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-156-0) (line 156, col 0, score 1)
- [pm2-orchestration-patterns — L250](pm2-orchestration-patterns.md#^ref-51932e7b-250-0) (line 250, col 0, score 1)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L532](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-532-0) (line 532, col 0, score 1)
- [polymorphic-meta-programming-engine — L226](polymorphic-meta-programming-engine.md#^ref-7bed0b9a-226-0) (line 226, col 0, score 1)
- [Promethean Event Bus MVP v0.1 — L920](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-920-0) (line 920, col 0, score 1)
- [aionian-circuit-math — L174](aionian-circuit-math.md#^ref-f2d83a77-174-0) (line 174, col 0, score 1)
- [DSL — L25](chunks/dsl.md#^ref-e87bc036-25-0) (line 25, col 0, score 1)
- [compiler-kit-foundations — L610](compiler-kit-foundations.md#^ref-01b21543-610-0) (line 610, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L203](cross-language-runtime-polymorphism.md#^ref-c34c36a6-203-0) (line 203, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L169](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-169-0) (line 169, col 0, score 1)
- [field-dynamics-math-blocks — L158](field-dynamics-math-blocks.md#^ref-7cfc230d-158-0) (line 158, col 0, score 1)
- [field-interaction-equations — L175](field-interaction-equations.md#^ref-b09141b7-175-0) (line 175, col 0, score 1)
- [layer-1-uptime-diagrams — L183](layer-1-uptime-diagrams.md#^ref-4127189a-183-0) (line 183, col 0, score 1)
- [2d-sandbox-field — L225](2d-sandbox-field.md#^ref-c710dc93-225-0) (line 225, col 0, score 1)
- [Admin Dashboard for User Management — L49](admin-dashboard-for-user-management.md#^ref-2901a3e9-49-0) (line 49, col 0, score 1)
- [Agent Reflections and Prompt Evolution — L150](agent-reflections-and-prompt-evolution.md#^ref-bb7f0835-150-0) (line 150, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L163](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-163-0) (line 163, col 0, score 1)
- [AI-First-OS-Model-Context-Protocol — L9](ai-first-os-model-context-protocol.md#^ref-618198f4-9-0) (line 9, col 0, score 1)
- [aionian-circuit-math — L179](aionian-circuit-math.md#^ref-f2d83a77-179-0) (line 179, col 0, score 1)
- [api-gateway-versioning — L304](api-gateway-versioning.md#^ref-0580dcd3-304-0) (line 304, col 0, score 1)
- [archetype-ecs — L479](archetype-ecs.md#^ref-8f4c1e86-479-0) (line 479, col 0, score 1)
- [balanced-bst — L295](balanced-bst.md#^ref-d3e7db72-295-0) (line 295, col 0, score 1)
- [Promethean_Eidolon_Synchronicity_Model — L74](promethean-eidolon-synchronicity-model.md#^ref-2d6e5553-74-0) (line 74, col 0, score 1)
- [Promethean Event Bus MVP v0.1 — L929](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-929-0) (line 929, col 0, score 1)
- [Promethean Infrastructure Setup — L597](promethean-infrastructure-setup.md#^ref-6deed6ac-597-0) (line 597, col 0, score 1)
- [Promethean-native config design — L421](promethean-native-config-design.md#^ref-ab748541-421-0) (line 421, col 0, score 1)
- [promethean-system-diagrams — L217](promethean-system-diagrams.md#^ref-b51e19b4-217-0) (line 217, col 0, score 1)
- [Promethean Web UI Setup — L629](promethean-web-ui-setup.md#^ref-bc5172ca-629-0) (line 629, col 0, score 1)
- [Prompt_Folder_Bootstrap — L193](prompt-folder-bootstrap.md#^ref-bd4f0976-193-0) (line 193, col 0, score 1)
- [prompt-programming-language-lisp — L107](prompt-programming-language-lisp.md#^ref-d41a06d1-107-0) (line 107, col 0, score 1)
- [Simulation Demo — L32](chunks/simulation-demo.md#^ref-557309a3-32-0) (line 32, col 0, score 1)
- [Tooling — L26](chunks/tooling.md#^ref-6cb4943e-26-0) (line 26, col 0, score 1)
- [Window Management — L36](chunks/window-management.md#^ref-9e8ae388-36-0) (line 36, col 0, score 1)
- [compiler-kit-foundations — L639](compiler-kit-foundations.md#^ref-01b21543-639-0) (line 639, col 0, score 1)
- [Creative Moments — L10](creative-moments.md#^ref-10d98225-10-0) (line 10, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L258](cross-language-runtime-polymorphism.md#^ref-c34c36a6-258-0) (line 258, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L215](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-215-0) (line 215, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L50](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-50-0) (line 50, col 0, score 1)
- [DuckDuckGoSearchPipeline — L16](duckduckgosearchpipeline.md#^ref-e979c50f-16-0) (line 16, col 0, score 1)
- [eidolon-node-lifecycle — L63](eidolon-node-lifecycle.md#^ref-938eca9c-63-0) (line 63, col 0, score 1)
- [EidolonField — L269](eidolonfield.md#^ref-49d1e1e5-269-0) (line 269, col 0, score 1)
- [Event Bus MVP — L566](event-bus-mvp.md#^ref-534fe91d-566-0) (line 566, col 0, score 1)
- [Event Bus Projections Architecture — L185](event-bus-projections-architecture.md#^ref-cf6b9b17-185-0) (line 185, col 0, score 1)
- [Exception Layer Analysis — L165](exception-layer-analysis.md#^ref-21d5cc09-165-0) (line 165, col 0, score 1)
- [Factorio AI with External Agents — L160](factorio-ai-with-external-agents.md#^ref-a4d90289-160-0) (line 160, col 0, score 1)
- [field-dynamics-math-blocks — L165](field-dynamics-math-blocks.md#^ref-7cfc230d-165-0) (line 165, col 0, score 1)
- [field-interaction-equations — L184](field-interaction-equations.md#^ref-b09141b7-184-0) (line 184, col 0, score 1)
- [field-node-diagram-outline — L132](field-node-diagram-outline.md#^ref-1f32c94a-132-0) (line 132, col 0, score 1)
- [markdown-to-org-transpiler — L318](markdown-to-org-transpiler.md#^ref-ab54cdd8-318-0) (line 318, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L322](migrate-to-provider-tenant-architecture.md#^ref-54382370-322-0) (line 322, col 0, score 1)
- [Mongo Outbox Implementation — L579](mongo-outbox-implementation.md#^ref-9c1acd1e-579-0) (line 579, col 0, score 1)
- [observability-infrastructure-setup — L369](observability-infrastructure-setup.md#^ref-b4e64f8c-369-0) (line 369, col 0, score 1)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L183](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-183-0) (line 183, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L483](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-483-0) (line 483, col 0, score 1)
- [polymorphic-meta-programming-engine — L241](polymorphic-meta-programming-engine.md#^ref-7bed0b9a-241-0) (line 241, col 0, score 1)
- [prom-lib-rate-limiters-and-replay-api — L415](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-415-0) (line 415, col 0, score 1)
- [Promethean Agent Config DSL — L352](promethean-agent-config-dsl.md#^ref-2c00ce45-352-0) (line 352, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L214](chroma-toolkit-consolidation-plan.md#^ref-5020e892-214-0) (line 214, col 0, score 1)
- [Tooling — L18](chunks/tooling.md#^ref-6cb4943e-18-0) (line 18, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L226](cross-language-runtime-polymorphism.md#^ref-c34c36a6-226-0) (line 226, col 0, score 1)
- [ecs-offload-workers — L473](ecs-offload-workers.md#^ref-6498b9d7-473-0) (line 473, col 0, score 1)
- [ecs-scheduler-and-prefabs — L399](ecs-scheduler-and-prefabs.md#^ref-c62a1815-399-0) (line 399, col 0, score 1)
- [eidolon-field-math-foundations — L146](eidolon-field-math-foundations.md#^ref-008f2ac0-146-0) (line 146, col 0, score 1)
- [Event Bus MVP — L556](event-bus-mvp.md#^ref-534fe91d-556-0) (line 556, col 0, score 1)
- [i3-bluetooth-setup — L106](i3-bluetooth-setup.md#^ref-5e408692-106-0) (line 106, col 0, score 1)
- [Language-Agnostic Mirror System — L532](language-agnostic-mirror-system.md#^ref-d2b3628c-532-0) (line 532, col 0, score 1)
- [Lispy Macros with syntax-rules — L399](lispy-macros-with-syntax-rules.md#^ref-cbfe3513-399-0) (line 399, col 0, score 1)
- [Local-Only-LLM-Workflow — L183](local-only-llm-workflow.md#^ref-9a8ab57e-183-0) (line 183, col 0, score 1)
- [markdown-to-org-transpiler — L306](markdown-to-org-transpiler.md#^ref-ab54cdd8-306-0) (line 306, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L314](migrate-to-provider-tenant-architecture.md#^ref-54382370-314-0) (line 314, col 0, score 1)
- [mystery-lisp-search-session — L127](mystery-lisp-search-session.md#^ref-513dc4c7-127-0) (line 127, col 0, score 1)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L171](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-171-0) (line 171, col 0, score 1)
- [ParticleSimulationWithCanvasAndFFmpeg — L255](particlesimulationwithcanvasandffmpeg.md#^ref-e018dd7a-255-0) (line 255, col 0, score 1)
- [Performance-Optimized-Polyglot-Bridge — L448](performance-optimized-polyglot-bridge.md#^ref-f5579967-448-0) (line 448, col 0, score 1)
- [DSL — L26](chunks/dsl.md#^ref-e87bc036-26-0) (line 26, col 0, score 1)
- [ecs-scheduler-and-prefabs — L433](ecs-scheduler-and-prefabs.md#^ref-c62a1815-433-0) (line 433, col 0, score 1)
- [Event Bus MVP — L577](event-bus-mvp.md#^ref-534fe91d-577-0) (line 577, col 0, score 1)
- [Local-First Intention→Code Loop with Free Models — L174](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-174-0) (line 174, col 0, score 1)
- [Local-Only-LLM-Workflow — L211](local-only-llm-workflow.md#^ref-9a8ab57e-211-0) (line 211, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L334](migrate-to-provider-tenant-architecture.md#^ref-54382370-334-0) (line 334, col 0, score 1)
- [Mongo Outbox Implementation — L581](mongo-outbox-implementation.md#^ref-9c1acd1e-581-0) (line 581, col 0, score 1)
- [observability-infrastructure-setup — L397](observability-infrastructure-setup.md#^ref-b4e64f8c-397-0) (line 397, col 0, score 1)
- [obsidian-ignore-node-modules-regex — L48](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-48-0) (line 48, col 0, score 1)
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
- [sibilant-macro-targets — L172](sibilant-macro-targets.md#^ref-c5c9a5c6-172-0) (line 172, col 0, score 1)
- [Sibilant Meta-Prompt DSL — L205](sibilant-meta-prompt-dsl.md#^ref-af5d2824-205-0) (line 205, col 0, score 1)
- [sibilant-meta-string-templating-runtime — L137](sibilant-meta-string-templating-runtime.md#^ref-2aafc801-137-0) (line 137, col 0, score 1)
- [sibilant-metacompiler-overview — L90](sibilant-metacompiler-overview.md#^ref-61d4086b-90-0) (line 90, col 0, score 1)
- [System Scheduler with Resource-Aware DAG — L394](system-scheduler-with-resource-aware-dag.md#^ref-ba244286-394-0) (line 394, col 0, score 1)
- [template-based-compilation — L104](template-based-compilation.md#^ref-f8877e5e-104-0) (line 104, col 0, score 1)
- [ts-to-lisp-transpiler — L8](ts-to-lisp-transpiler.md#^ref-ba11486b-8-0) (line 8, col 0, score 1)
- [typed-struct-compiler — L384](typed-struct-compiler.md#^ref-78eeedf7-384-0) (line 384, col 0, score 1)
- [Unique Info Dump Index — L103](unique-info-dump-index.md#^ref-30ec3ba6-103-0) (line 103, col 0, score 1)
- [Agent Reflections and Prompt Evolution — L138](agent-reflections-and-prompt-evolution.md#^ref-bb7f0835-138-0) (line 138, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L193](chroma-toolkit-consolidation-plan.md#^ref-5020e892-193-0) (line 193, col 0, score 1)
- [Diagrams — L43](chunks/diagrams.md#^ref-45cd25b5-43-0) (line 43, col 0, score 1)
- [Services — L41](chunks/services.md#^ref-75ea4a6a-41-0) (line 41, col 0, score 1)
- [ecs-scheduler-and-prefabs — L417](ecs-scheduler-and-prefabs.md#^ref-c62a1815-417-0) (line 417, col 0, score 1)
- [eidolon-node-lifecycle — L62](eidolon-node-lifecycle.md#^ref-938eca9c-62-0) (line 62, col 0, score 1)
- [Event Bus MVP — L583](event-bus-mvp.md#^ref-534fe91d-583-0) (line 583, col 0, score 1)
- [Event Bus Projections Architecture — L182](event-bus-projections-architecture.md#^ref-cf6b9b17-182-0) (line 182, col 0, score 1)
- [Fnord Tracer Protocol — L266](fnord-tracer-protocol.md#^ref-fc21f824-266-0) (line 266, col 0, score 1)
- [i3-bluetooth-setup — L128](i3-bluetooth-setup.md#^ref-5e408692-128-0) (line 128, col 0, score 1)
- [layer-1-uptime-diagrams — L193](layer-1-uptime-diagrams.md#^ref-4127189a-193-0) (line 193, col 0, score 1)
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
- [markdown-to-org-transpiler — L313](markdown-to-org-transpiler.md#^ref-ab54cdd8-313-0) (line 313, col 0, score 1)
- [Matplotlib Animation with Async Execution — L79](matplotlib-animation-with-async-execution.md#^ref-687439f9-79-0) (line 79, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L299](migrate-to-provider-tenant-architecture.md#^ref-54382370-299-0) (line 299, col 0, score 1)
- [Model Selection for Lightweight Conversational Tasks — L151](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-151-0) (line 151, col 0, score 1)
- [Mongo Outbox Implementation — L587](mongo-outbox-implementation.md#^ref-9c1acd1e-587-0) (line 587, col 0, score 1)
- [obsidian-ignore-node-modules-regex — L77](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-77-0) (line 77, col 0, score 1)
- [Obsidian Templating Plugins Integration Guide — L120](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-120-0) (line 120, col 0, score 1)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L179](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-179-0) (line 179, col 0, score 1)
- [ParticleSimulationWithCanvasAndFFmpeg — L282](particlesimulationwithcanvasandffmpeg.md#^ref-e018dd7a-282-0) (line 282, col 0, score 1)
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

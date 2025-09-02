---
uuid: 6620e2f2-de6d-45d8-a722-5d26e160b370
created_at: 2025.08.08.21.08.92.md
filename: graph-ds
description: >-
  A reusable, generic graph implementation with BFS/DFS, Dijkstra, A*,
  topological sort, connected components, and JSON serialization. Supports
  directed/undirected graphs with per-node/edge metadata and optional weights.
tags:
  - graph
  - data-structure
  - bfs
  - dfs
  - dijkstra
  - a-star
  - topo-sort
  - connected-components
  - scc
  - json
  - reusable
  - batteries-included
related_to_title: []
related_to_uuid: []
references: []
---
Note: Consolidated here → ../notes/js/graph-ds.md ^ref-6620e2f2-1-0

Heard. Here’s a clean, **reusable Graph** you can drop in as `shared/js/prom-lib/ds/graph.ts`. It’s generic, fast, and batteries-included (BFS/DFS, Dijkstra, A\*, topo sort, CC/SCC, JSON import/export). Works for directed or undirected graphs, supports per-node/edge metadata, and keeps weights optional. ^ref-6620e2f2-3-0

```ts
// shared/js/prom-lib/ds/graph.ts
// MIT. Zero deps. Node + browser safe.

export type Id = string | number;

export interface NodeRecord<ND = unknown> {
  id: Id;
  data?: ND;
}

export interface EdgeRecord<ED = unknown> {
  u: Id;
  v: Id;
  weight?: number; // default = 1
  data?: ED;
}

type EdgeCell<ED> = { weight: number; data?: ED };

export class Graph<ND = unknown, ED = unknown> {
  readonly directed: boolean;
  private nodesMap = new Map<Id, ND | undefined>();
  // adjacency: u -> (v -> {weight,data})
  private adj = new Map<Id, Map<Id, EdgeCell<ED>>>();

  constructor(opts: { directed?: boolean } = {}) {
    this.directed = !!opts.directed;
  }

  //#region node ops
  addNode(id: Id, data?: ND): this {
    if (!this.nodesMap.has(id)) this.nodesMap.set(id, data);
    else if (data !== undefined) this.nodesMap.set(id, data);
    if (!this.adj.has(id)) this.adj.set(id, new Map());
    return this;
  }
  hasNode(id: Id): boolean { return this.nodesMap.has(id); }
  getNode(id: Id): ND | undefined { return this.nodesMap.get(id); }
  setNodeData(id: Id, data: ND): void {
    if (!this.nodesMap.has(id)) throw new Error(`node ${String(id)} not found`);
    this.nodesMap.set(id, data);
  }
  removeNode(id: Id): void {
    if (!this.nodes()) return;
    // remove outgoing
    this.adj.get(id)?.clear();
    this.adj.delete(id);
    // remove incoming
    for (const [, m] of this.adj) m.delete(id);
    this.nodesMap.delete(id);
  }
  countNodes(): number { return this.nodesMap.size; }
  *nodes(): IterableIterator<NodeRecord<ND>> {
    for (const [id, data] of this.nodesMap) yield { id, data };
  }
  //#endregion

  //#region edge ops
  addEdge(u: Id, v: Id, opts: { weight?: number; data?: ED; overwrite?: boolean } = {}): this {
    const w = opts.weight ?? 1;
    this.addNode(u); this.addNode(v);
    const row = this.adj.get(u)!;
    if (!row.has(v) || opts.overwrite) row.set(v, { weight: w, data: opts.data });
    if (!this.directed) {
      const back = this.adj.get(v)!;
      if (!back.has(u) || opts.overwrite) back.set(u, { weight: w, data: opts.data });
    }
    return this;
  }
  hasEdge(u: Id, v: Id): boolean { return this.adj.get(u)?.has(v) ?? false; }
  removeEdge(u: Id, v: Id): void {
    this.adj.get(u)?.delete(v);
    if (!this.directed) this.adj.get(v)?.delete(u);
  }
  getEdge(u: Id, v: Id): EdgeRecord<ED> | undefined {
    const cell = this.adj.get(u)?.get(v);
    if (!cell) return undefined;
    return { u, v, weight: cell.weight, data: cell.data };
  }
  neighbors(u: Id): IterableIterator<[Id, EdgeCell<ED>]> {
    return (this.adj.get(u) ?? new Map()).entries();
  }
  degree(u: Id): number { return this.adj.get(u)?.size ?? 0; }
  *edges(): IterableIterator<EdgeRecord<ED>> {
    for (const [u, row] of this.adj) {
      for (const [v, cell] of row) {
        if (!this.directed && String(u) > String(v)) continue; // avoid dup
        yield { u, v, weight: cell.weight, data: cell.data };
      }
    }
  }
  //#endregion

  //#region traversals
  bfs(start: Id, stop?: (id: Id) => boolean): { parent: Map<Id, Id | null>, order: Id[] } {
    if (!this.hasNode(start)) throw new Error(`start node ${String(start)} missing`);
    const q: Id[] = [start];
    const parent = new Map<Id, Id | null>([[start, null]]);
    const order: Id[] = [];
    while (q.length) {
      const u = q.shift()!;
      order.push(u);
      if (stop && stop(u)) break;
      for (const [v] of this.neighbors(u)) {
        if (!parent.has(v)) { parent.set(v, u); q.push(v); }
      }
    }
    return { parent, order };
  }

  dfs(start: Id, stop?: (id: Id) => boolean): { parent: Map<Id, Id | null>, order: Id[] } {
    if (!this.hasNode(start)) throw new Error(`start node ${String(start)} missing`);
    const st: Id[] = [start];
    const parent = new Map<Id, Id | null>([[start, null]]);
    const order: Id[] = [];
    while (st.length) {
      const u = st.pop()!;
      order.push(u);
      if (stop && stop(u)) break;
      for (const [v] of Array.from(this.neighbors(u)).reverse()) {
        if (!parent.has(v)) { parent.set(v, u); st.push(v); }
      }
    }
    return { parent, order };
  }
  //#endregion

  //#region shortest paths
  shortestPathDijkstra(src: Id, dst?: Id, weightOf?: (u: Id, v: Id, w: number) => number) {
    const dist = new Map<Id, number>();
    const prev = new Map<Id, Id | null>();
    const pq = new MinHeap<[Id, number]>((a, b) => a[1] - b[1]);

    for (const { id } of this.nodes()) { dist.set(id, Infinity); prev.set(id, null); }
    if (!this.hasNode(src)) throw new Error(`src ${String(src)} missing`);
    dist.set(src, 0); pq.push([src, 0]);

    while (!pq.empty()) {
      const [u, d] = pq.pop()!;
      if (d !== dist.get(u)) continue; // stale
      if (dst !== undefined && u === dst) break;
      for (const [v, cell] of this.neighbors(u)) {
        const w = weightOf ? weightOf(u, v, cell.weight) : cell.weight;
        const nd = d + w;
        if (nd < (dist.get(v) ?? Infinity)) {
          dist.set(v, nd); prev.set(v, u); pq.push([v, nd]);
        }
      }
    }

    const pathTo = (target: Id) => {
      if (!isFinite(dist.get(target) ?? Infinity)) return { distance: Infinity, path: [] as Id[] };
      const path: Id[] = [];
      for (let cur: Id | null = target; cur != null; cur = prev.get(cur) ?? null) path.push(cur);
      path.reverse();
      return { distance: dist.get(target)!, path };
    };

    return dst !== undefined ? pathTo(dst) : { dist, prev, pathTo };
  }

  aStar(src: Id, dst: Id, h: (id: Id) => number, weightOf?: (u: Id, v: Id, w: number) => number) {
    const g = new Map<Id, number>(); // cost so far
    const prev = new Map<Id, Id | null>();
    const open = new MinHeap<[Id, number]>((a, b) => a[1] - b[1]); // f = g + h
    for (const { id } of this.nodes()) { g.set(id, Infinity); prev.set(id, null); }
    g.set(src, 0); open.push([src, h(src)]);

    while (!open.empty()) {
      const [u] = open.pop()!;
      if (u === dst) break;
      const gu = g.get(u)!;
      for (const [v, cell] of this.neighbors(u)) {
        const w = weightOf ? weightOf(u, v, cell.weight) : cell.weight;
        const cand = gu + w;
        if (cand < (g.get(v) ?? Infinity)) {
          g.set(v, cand); prev.set(v, u);
          open.push([v, cand + h(v)]);
        }
      }
    }

    const path: Id[] = [];
    if (isFinite(g.get(dst) ?? Infinity)) {
      for (let cur: Id | null = dst; cur != null; cur = prev.get(cur) ?? null) path.push(cur);
      path.reverse();
    }
    return { distance: g.get(dst) ?? Infinity, path };
  }
  //#endregion

  //#region structure / analysis
  topologicalSort(): Id[] {
    if (!this.directed) throw new Error("topologicalSort requires directed graph");
    const indeg = new Map<Id, number>();
    for (const { id } of this.nodes()) indeg.set(id, 0);
    for (const { u, v } of this.edges()) indeg.set(v, (indeg.get(v) ?? 0) + 1);
    const q: Id[] = [];
    for (const [id, d] of indeg) if (d === 0) q.push(id);
    const out: Id[] = [];
    while (q.length) {
      const u = q.shift()!;
      out.push(u);
      for (const [v] of this.neighbors(u)) {
        indeg.set(v, (indeg.get(v) ?? 0) - 1);
        if ((indeg.get(v) ?? 0) === 0) q.push(v);
      }
    }
    if (out.length !== this.countNodes()) throw new Error("graph has at least one cycle");
    return out;
  }

  connectedComponents(): Id[][] {
    if (this.directed) throw new Error("connectedComponents expects undirected graph");
    const seen = new Set<Id>();
    const comps: Id[][] = [];
    for (const { id } of this.nodes()) {
      if (seen.has(id)) continue;
      const { order } = this.bfs(id);
      for (const v of order) seen.add(v);
      comps.push(order);
    }
    return comps;
  }

  stronglyConnectedComponents(): Id[][] {
    if (!this.directed) throw new Error("SCC expects directed graph");
    // Kosaraju
    const order: Id[] = [];
    const seen = new Set<Id>();
    const dfs1 = (u: Id) => {
      seen.add(u);
      for (const [v] of this.neighbors(u)) if (!seen.has(v)) dfs1(v);
      order.push(u);
    };
    for (const { id } of this.nodes()) if (!seen.has(id)) dfs1(id);

    // transpose
    const gt = new Graph<ND, ED>({ directed: true });
    for (const { id, data } of this.nodes()) gt.addNode(id, data);
    for (const { u, v, weight, data } of this.edges()) gt.addEdge(v, u, { weight, data });

    const comps: Id[][] = [];
    const seen2 = new Set<Id>();
    const dfs2 = (g: Graph<ND, ED>, u: Id, acc: Id[]) => {
      seen2.add(u); acc.push(u);
      for (const [v] of g.neighbors(u)) if (!seen2.has(v)) dfs2(g, v, acc);
    };
    for (let i = order.length - 1; i >= 0; i--) {
      const u = order[i];
      if (!seen2.has(u)) { const acc: Id[] = []; dfs2(gt, u, acc); comps.push(acc); }
    }
    return comps;
  }
  //#endregion

  //#region serialization / utils
  toJSON(): { directed: boolean; nodes: NodeRecord<ND>[]; edges: EdgeRecord<ED>[] } {
    return {
      directed: this.directed,
      nodes: Array.from(this.nodes()),
      edges: Array.from(this.edges())
    };
  }
  static fromJSON<ND = unknown, ED = unknown>(j: {
    directed: boolean; nodes: NodeRecord<ND>[]; edges: EdgeRecord<ED>[];
  }): Graph<ND, ED> {
    const g = new Graph<ND, ED>({ directed: j.directed });
    for (const n of j.nodes) g.addNode(n.id, n.data);
    for (const e of j.edges) g.addEdge(e.u, e.v, { weight: e.weight, data: e.data });
    return g;
  }
  clone(): Graph<ND, ED> { return Graph.fromJSON(this.toJSON()); }
  //#endregion
}

// Tiny binary heap for Dijkstra/A*
class MinHeap<T> {
  private a: T[] = [];
  private cmp: (x: T, y: T) => number;
  constructor(cmp: (x: T, y: T) => number) { this.cmp = cmp; }
  size() { return this.a.length; }
  empty() { return this.a.length === 0; }
  push(v: T) { this.a.push(v); this.up(this.a.length - 1); }
  pop(): T | undefined {
    if (!this.a.length) return undefined;
    const top = this.a[0], end = this.a.pop()!;
    if (this.a.length) { this.a[0] = end; this.down(0); }
    return top;
  }
  private up(i: number) {
    while (i) {
      const p = ((i - 1) >> 1);
      if (this.cmp(this.a[i], this.a[p]) >= 0) break;
      [this.a[i], this.a[p]] = [this.a[p], this.a[i]];
      i = p;
    }
  }
  private down(i: number) {
    const n = this.a.length;
    while (true) {
      let l = (i << 1) + 1, r = l + 1, s = i;
      if (l < n && this.cmp(this.a[l], this.a[s]) < 0) s = l;
      if (r < n && this.cmp(this.a[r], this.a[s]) < 0) s = r;
      if (s === i) break;
      [this.a[i], this.a[s]] = [this.a[s], this.a[i]];
      i = s;
    }
  }
}
```
^ref-6620e2f2-5-0

## Quick usage
 ^ref-6620e2f2-320-0
```ts
import { Graph } from "./graph";

// Undirected, unweighted
const g = new Graph<{label: string}, {kind: string}>({ directed: false });
g.addNode("A", {label:"alpha"})
 .addNode("B", {label:"beta"})
 .addEdge("A","B",{ data:{kind:"line"} });

console.log([...g.nodes()]);   // [{ id:"A", data:{...}}, { id:"B", ...}]
console.log([...g.edges()]);   // [{ u:"A", v:"B", weight:1, data:{kind:"line"}}]

const { parent, order } = g.bfs("A");

// Directed + weighted
const dg = new Graph({ directed: true });
dg.addEdge("s","a",{weight:2}).addEdge("a","b",{weight:3}).addEdge("s","b",{weight:10});
const sp = dg.shortestPathDijkstra("s","b");
console.log(sp.distance, sp.path); // 5, ["s","a","b"]
^ref-6620e2f2-320-0
```

## Sibilant-style sugar (pseudo) ^ref-6620e2f2-343-0

```lisp
; shared/sibilant/prom/ds/graph.sib (pseudo)
(defn make-graph [& {:directed false}] (new Graph {:directed directed}))
(defn add-node! [g id data] (.addNode g id data))
(defn add-edge! [g u v & {:weight 1 :data nil}] (.addEdge g u v {:weight weight :data data}))
(defn bfs [g start] (.bfs g start))
^ref-6620e2f2-343-0
(defn dijkstra [g src dst] (.shortestPathDijkstra g src dst))
```
 ^ref-6620e2f2-354-0
## Notes ^ref-6620e2f2-355-0
 ^ref-6620e2f2-356-0
* All core ops are **O(1)** average (Map). ^ref-6620e2f2-357-0
* `bfs/dfs`: **O(V+E)** ^ref-6620e2f2-358-0
* `dijkstra`: **O((V+E) log V)** (binary heap) ^ref-6620e2f2-359-0
* `aStar`: same, with heuristic.
* `topologicalSort`: errors on cycles by design. ^ref-6620e2f2-361-0
* `connectedComponents`: for undirected only; use `stronglyConnectedComponents` on directed.
 ^ref-6620e2f2-363-0
Want add-ons (Louvain community detection, MST, bipartite checks, or a persistent/immutable version)? Say the word and I’ll bolt them on.<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
## Related content
- [promethean-system-diagrams](promethean-system-diagrams.md)
- [layer-1-uptime-diagrams](layer-1-uptime-diagrams.md)
- [archetype-ecs](archetype-ecs.md)
- [eidolon-node-lifecycle](eidolon-node-lifecycle.md)
- [typed-struct-compiler](typed-struct-compiler.md)
- [Event Bus Projections Architecture](event-bus-projections-architecture.md)
- [Agent Tasks: Persistence Migration to DualStore](agent-tasks-persistence-migration-to-dualstore.md)
- [field-node-diagram-outline](field-node-diagram-outline.md)
- [template-based-compilation](template-based-compilation.md)
- [compiler-kit-foundations](compiler-kit-foundations.md)
- [Unique Info Dump Index](unique-info-dump-index.md)
- [2d-sandbox-field](2d-sandbox-field.md)
- [Eidolon Field Abstract Model](eidolon-field-abstract-model.md)
- [EidolonField](eidolonfield.md)
- [JavaScript](chunks/javascript.md)
- [ecs-offload-workers](ecs-offload-workers.md)
- [ecs-scheduler-and-prefabs](ecs-scheduler-and-prefabs.md)
- [Language-Agnostic Mirror System](language-agnostic-mirror-system.md)
- [Factorio AI with External Agents](factorio-ai-with-external-agents.md)
- [field-node-diagram-set](field-node-diagram-set.md)
- [balanced-bst](balanced-bst.md)
- [AI-Centric OS with MCP Layer](ai-centric-os-with-mcp-layer.md)
- [AI-First-OS-Model-Context-Protocol](ai-first-os-model-context-protocol.md)
- [Admin Dashboard for User Management](admin-dashboard-for-user-management.md)
- [api-gateway-versioning](api-gateway-versioning.md)
- [Diagrams](chunks/diagrams.md)
- [aionian-circuit-math](aionian-circuit-math.md)
- [DSL](chunks/dsl.md)
- [Window Management](chunks/window-management.md)
- [Agent Reflections and Prompt Evolution](agent-reflections-and-prompt-evolution.md)
- [Board Automation Improvements](board-automation-improvements.md)
- [Operations](chunks/operations.md)
- [Chroma Toolkit Consolidation Plan](chroma-toolkit-consolidation-plan.md)
- [Simulation Demo](chunks/simulation-demo.md)
- [Math Fundamentals](chunks/math-fundamentals.md)
- [eidolon-field-math-foundations](eidolon-field-math-foundations.md)
- [Board Walk – 2025-08-11](board-walk-2025-08-11.md)
- [Cross-Language Runtime Polymorphism](cross-language-runtime-polymorphism.md)
- [ts-to-lisp-transpiler](ts-to-lisp-transpiler.md)
- [System Scheduler with Resource-Aware DAG](system-scheduler-with-resource-aware-dag.md)
- [State Snapshots API and Transactional Projector](state-snapshots-api-and-transactional-projector.md)
- [sibilant-macro-targets](sibilant-macro-targets.md)
- [Sibilant Meta-Prompt DSL](sibilant-meta-prompt-dsl.md)
- [sibilant-meta-string-templating-runtime](sibilant-meta-string-templating-runtime.md)
- [sibilant-metacompiler-overview](sibilant-metacompiler-overview.md)
- [Event Bus MVP](event-bus-mvp.md)
- [Dynamic Context Model for Web Components](dynamic-context-model-for-web-components.md)
- [Cross-Target Macro System in Sibilant](cross-target-macro-system-in-sibilant.md)
- [Debugging Broker Connections and Agent Behavior](debugging-broker-connections-and-agent-behavior.md)
- [Services](chunks/services.md)
- [field-node-diagram-visualizations](field-node-diagram-visualizations.md)
- [Mongo Outbox Implementation](mongo-outbox-implementation.md)
- [ParticleSimulationWithCanvasAndFFmpeg](particlesimulationwithcanvasandffmpeg.md)
- [markdown-to-org-transpiler](markdown-to-org-transpiler.md)
- [plan-update-confirmation](plan-update-confirmation.md)
- [polymorphic-meta-programming-engine](polymorphic-meta-programming-engine.md)
- [Layer1SurvivabilityEnvelope](layer1survivabilityenvelope.md)
- [field-interaction-equations](field-interaction-equations.md)
- [Model Selection for Lightweight Conversational Tasks](model-selection-for-lightweight-conversational-tasks.md)
- [Tooling](chunks/tooling.md)
- [Exception Layer Analysis](exception-layer-analysis.md)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler](ollama-llm-provider-for-pseudo-code-transpiler.md)
- [heartbeat-fragment-demo](heartbeat-fragment-demo.md)
- [field-dynamics-math-blocks](field-dynamics-math-blocks.md)
- [Duck's Attractor States](ducks-attractor-states.md)
- [Duck's Self-Referential Perceptual Loop](ducks-self-referential-perceptual-loop.md)
- [Migrate to Provider-Tenant Architecture](migrate-to-provider-tenant-architecture.md)
- [Obsidian ChatGPT Plugin Integration Guide](obsidian-chatgpt-plugin-integration-guide.md)
- [Obsidian ChatGPT Plugin Integration](obsidian-chatgpt-plugin-integration.md)
- [Obsidian Templating Plugins Integration Guide](obsidian-templating-plugins-integration-guide.md)
- [Shared](chunks/shared.md)
- [Matplotlib Animation with Async Execution](matplotlib-animation-with-async-execution.md)
- [obsidian-ignore-node-modules-regex](obsidian-ignore-node-modules-regex.md)
- [Promethean Event Bus MVP v0.1](promethean-event-bus-mvp-v0-1.md)
- [Promethean Infrastructure Setup](promethean-infrastructure-setup.md)
- [Promethean-native config design](promethean-native-config-design.md)
- [Creative Moments](creative-moments.md)
- [DuckDuckGoSearchPipeline](duckduckgosearchpipeline.md)
- [Prompt_Folder_Bootstrap](prompt-folder-bootstrap.md)
- [heartbeat-simulation-snippets](heartbeat-simulation-snippets.md)
- [homeostasis-decay-formulas](homeostasis-decay-formulas.md)
- [Promethean Web UI Setup](promethean-web-ui-setup.md)
- [prompt-programming-language-lisp](prompt-programming-language-lisp.md)
- [Promethean_Eidolon_Synchronicity_Model](promethean-eidolon-synchronicity-model.md)
- [Post-Linguistic Transhuman Design Frameworks](post-linguistic-transhuman-design-frameworks.md)
- [Promethean Agent Config DSL](promethean-agent-config-dsl.md)
- [Promethean Chat Activity Report](promethean-chat-activity-report.md)
- [Canonical Org-Babel Matplotlib Animation Template](canonical-org-babel-matplotlib-animation-template.md)
- [zero-copy-snapshots-and-workers](zero-copy-snapshots-and-workers.md)
- [Fnord Tracer Protocol](fnord-tracer-protocol.md)
- [Model Upgrade Calm-Down Guide](model-upgrade-calm-down-guide.md)
- [NPU Voice Code and Sensory Integration](npu-voice-code-and-sensory-integration.md)
- [observability-infrastructure-setup](observability-infrastructure-setup.md)
- [OpenAPI Validation Report](openapi-validation-report.md)
- [Optimizing Command Limitations in System Design](optimizing-command-limitations-in-system-design.md)
- [pm2-orchestration-patterns](pm2-orchestration-patterns.md)
- [Local-Offline-Model-Deployment-Strategy](local-offline-model-deployment-strategy.md)
- [Mindful Prioritization](mindful-prioritization.md)
- [MindfulRobotIntegration](mindfulrobotintegration.md)
- [Chroma-Embedding-Refactor](chroma-embedding-refactor.md)
- [i3-bluetooth-setup](i3-bluetooth-setup.md)
- [i3-config-validation-methods](i3-config-validation-methods.md)
- [Prometheus Observability Stack](prometheus-observability-stack.md)
- [Interop and Source Maps](interop-and-source-maps.md)
- [Pure-Node Crawl Stack with Playwright and Crawlee](pure-node-crawl-stack-with-playwright-and-crawlee.md)
- [Per-Domain Policy System for JS Crawler](per-domain-policy-system-for-js-crawler.md)
- [Lispy Macros with syntax-rules](lispy-macros-with-syntax-rules.md)
- [Lisp-Compiler-Integration](lisp-compiler-integration.md)
- [komorebi-group-window-hack](komorebi-group-window-hack.md)
- [Local-First Intention→Code Loop with Free Models](local-first-intention-code-loop-with-free-models.md)
- [ripple-propagation-demo](ripple-propagation-demo.md)
- [Shared Package Structure](shared-package-structure.md)
- [lisp-dsl-for-window-management](lisp-dsl-for-window-management.md)
- [Promethean Workflow Optimization](promethean-workflow-optimization.md)
- [Protocol_0_The_Contradiction_Engine](protocol-0-the-contradiction-engine.md)
- [Provider-Agnostic Chat Panel Implementation](provider-agnostic-chat-panel-implementation.md)
- [Local-Only-LLM-Workflow](local-only-llm-workflow.md)
- [Pure TypeScript Search Microservice](pure-typescript-search-microservice.md)
- [RAG UI Panel with Qdrant and PostgREST](rag-ui-panel-with-qdrant-and-postgrest.md)
- [schema-evolution-workflow](schema-evolution-workflow.md)
- [Self-Agency in AI Interaction](self-agency-in-ai-interaction.md)
- [set-assignment-in-lisp-ast](set-assignment-in-lisp-ast.md)
- [shared-package-layout-clarification](shared-package-layout-clarification.md)
- [Stateful Partitions and Rebalancing](stateful-partitions-and-rebalancing.md)
- [Performance-Optimized-Polyglot-Bridge](performance-optimized-polyglot-bridge.md)
- [refactor-relations](refactor-relations.md)
- [Promethean Agent DSL TS Scaffold](promethean-agent-dsl-ts-scaffold.md)
- [Promethean-Copilot-Intent-Engine](promethean-copilot-intent-engine.md)
- [Functional Refactor of TypeScript Document Processing](functional-refactor-of-typescript-document-processing.md)
- [js-to-lisp-reverse-compiler](js-to-lisp-reverse-compiler.md)
- [file-watcher-auth-fix](file-watcher-auth-fix.md)
- [Functional Embedding Pipeline Refactor](functional-embedding-pipeline-refactor.md)
- [Promethean Pipelines](promethean-pipelines.md)
- [Promethean State Format](promethean-state-format.md)
- [Promethean Pipelines: Local TypeScript-First Workflow](promethean-pipelines-local-typescript-first-workflow.md)
- [TypeScript Patch for Tool Calling Support](typescript-patch-for-tool-calling-support.md)
- [universal-intention-code-fabric](universal-intention-code-fabric.md)
- [mystery-lisp-search-session](mystery-lisp-search-session.md)
- [Vectorial Exception Descent](vectorial-exception-descent.md)
## Sources
- [promethean-system-diagrams — L1](promethean-system-diagrams.md#^ref-b51e19b4-1-0) (line 1, col 0, score 0.81)
- [layer-1-uptime-diagrams — L1](layer-1-uptime-diagrams.md#^ref-4127189a-1-0) (line 1, col 0, score 0.79)
- [archetype-ecs — L1](archetype-ecs.md#^ref-8f4c1e86-1-0) (line 1, col 0, score 0.79)
- [eidolon-node-lifecycle — L1](eidolon-node-lifecycle.md#^ref-938eca9c-1-0) (line 1, col 0, score 0.79)
- [typed-struct-compiler — L1](typed-struct-compiler.md#^ref-78eeedf7-1-0) (line 1, col 0, score 0.78)
- [template-based-compilation — L1](template-based-compilation.md#^ref-f8877e5e-1-0) (line 1, col 0, score 0.78)
- [Event Bus Projections Architecture — L1](event-bus-projections-architecture.md#^ref-cf6b9b17-1-0) (line 1, col 0, score 0.78)
- [ts-to-lisp-transpiler — L1](ts-to-lisp-transpiler.md#^ref-ba11486b-1-0) (line 1, col 0, score 0.77)
- [compiler-kit-foundations — L1](compiler-kit-foundations.md#^ref-01b21543-1-0) (line 1, col 0, score 0.77)
- [JavaScript — L5](chunks/javascript.md#^ref-c1618c66-5-0) (line 5, col 0, score 0.77)
- [Unique Info Dump Index — L31](unique-info-dump-index.md#^ref-30ec3ba6-31-0) (line 31, col 0, score 0.77)
- [field-node-diagram-outline — L1](field-node-diagram-outline.md#^ref-1f32c94a-1-0) (line 1, col 0, score 0.76)
- [field-node-diagram-set — L1](field-node-diagram-set.md#^ref-22b989d5-1-0) (line 1, col 0, score 0.76)
- [field-node-diagram-visualizations — L1](field-node-diagram-visualizations.md#^ref-e9b27b06-1-0) (line 1, col 0, score 0.76)
- [Promethean-Copilot-Intent-Engine — L28](promethean-copilot-intent-engine.md#^ref-ae24a280-28-0) (line 28, col 0, score 0.68)
- [Agent Tasks: Persistence Migration to DualStore — L70](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-70-0) (line 70, col 0, score 0.63)
- [Admin Dashboard for User Management — L24](admin-dashboard-for-user-management.md#^ref-2901a3e9-24-0) (line 24, col 0, score 0.62)
- [balanced-bst — L3](balanced-bst.md#^ref-d3e7db72-3-0) (line 3, col 0, score 0.7)
- [Promethean-Copilot-Intent-Engine — L26](promethean-copilot-intent-engine.md#^ref-ae24a280-26-0) (line 26, col 0, score 0.65)
- [Event Bus Projections Architecture — L3](event-bus-projections-architecture.md#^ref-cf6b9b17-3-0) (line 3, col 0, score 0.65)
- [Mongo Outbox Implementation — L379](mongo-outbox-implementation.md#^ref-9c1acd1e-379-0) (line 379, col 0, score 0.64)
- [ParticleSimulationWithCanvasAndFFmpeg — L1](particlesimulationwithcanvasandffmpeg.md#^ref-e018dd7a-1-0) (line 1, col 0, score 0.65)
- [Promethean Pipelines: Local TypeScript-First Workflow — L3](promethean-pipelines-local-typescript-first-workflow.md#^ref-6b63edca-3-0) (line 3, col 0, score 0.64)
- [archetype-ecs — L3](archetype-ecs.md#^ref-8f4c1e86-3-0) (line 3, col 0, score 0.64)
- [Prometheus Observability Stack — L498](prometheus-observability-stack.md#^ref-e90b5a16-498-0) (line 498, col 0, score 0.64)
- [Language-Agnostic Mirror System — L507](language-agnostic-mirror-system.md#^ref-d2b3628c-507-0) (line 507, col 0, score 0.63)
- [Interop and Source Maps — L3](interop-and-source-maps.md#^ref-cdfac40c-3-0) (line 3, col 0, score 0.7)
- [typed-struct-compiler — L10](typed-struct-compiler.md#^ref-78eeedf7-10-0) (line 10, col 0, score 0.68)
- [markdown-to-org-transpiler — L7](markdown-to-org-transpiler.md#^ref-ab54cdd8-7-0) (line 7, col 0, score 0.67)
- [archetype-ecs — L7](archetype-ecs.md#^ref-8f4c1e86-7-0) (line 7, col 0, score 0.62)
- [ecs-offload-workers — L449](ecs-offload-workers.md#^ref-6498b9d7-449-0) (line 449, col 0, score 0.65)
- [markdown-to-org-transpiler — L1](markdown-to-org-transpiler.md#^ref-ab54cdd8-1-0) (line 1, col 0, score 0.64)
- [ecs-scheduler-and-prefabs — L7](ecs-scheduler-and-prefabs.md#^ref-c62a1815-7-0) (line 7, col 0, score 0.66)
- [System Scheduler with Resource-Aware DAG — L5](system-scheduler-with-resource-aware-dag.md#^ref-ba244286-5-0) (line 5, col 0, score 0.66)
- [typed-struct-compiler — L16](typed-struct-compiler.md#^ref-78eeedf7-16-0) (line 16, col 0, score 0.63)
- [Chroma Toolkit Consolidation Plan — L122](chroma-toolkit-consolidation-plan.md#^ref-5020e892-122-0) (line 122, col 0, score 0.75)
- [Promethean Event Bus MVP v0.1 — L423](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-423-0) (line 423, col 0, score 0.69)
- [ecs-offload-workers — L209](ecs-offload-workers.md#^ref-6498b9d7-209-0) (line 209, col 0, score 0.69)
- [Promethean Agent DSL TS Scaffold — L557](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-557-0) (line 557, col 0, score 0.65)
- [zero-copy-snapshots-and-workers — L15](zero-copy-snapshots-and-workers.md#^ref-62bec6f0-15-0) (line 15, col 0, score 0.68)
- [Pure TypeScript Search Microservice — L155](pure-typescript-search-microservice.md#^ref-d17d3a96-155-0) (line 155, col 0, score 0.68)
- [Pure-Node Crawl Stack with Playwright and Crawlee — L178](pure-node-crawl-stack-with-playwright-and-crawlee.md#^ref-d527c05d-178-0) (line 178, col 0, score 0.67)
- [Pure TypeScript Search Microservice — L178](pure-typescript-search-microservice.md#^ref-d17d3a96-178-0) (line 178, col 0, score 0.65)
- [Promethean Agent DSL TS Scaffold — L160](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-160-0) (line 160, col 0, score 0.67)
- [Performance-Optimized-Polyglot-Bridge — L170](performance-optimized-polyglot-bridge.md#^ref-f5579967-170-0) (line 170, col 0, score 0.74)
- [Event Bus MVP — L99](event-bus-mvp.md#^ref-534fe91d-99-0) (line 99, col 0, score 0.67)
- [Event Bus MVP — L7](event-bus-mvp.md#^ref-534fe91d-7-0) (line 7, col 0, score 0.67)
- [Per-Domain Policy System for JS Crawler — L141](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-141-0) (line 141, col 0, score 0.64)
- [plan-update-confirmation — L650](plan-update-confirmation.md#^ref-b22d79c6-650-0) (line 650, col 0, score 0.67)
- [plan-update-confirmation — L662](plan-update-confirmation.md#^ref-b22d79c6-662-0) (line 662, col 0, score 0.67)
- [Per-Domain Policy System for JS Crawler — L184](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-184-0) (line 184, col 0, score 0.69)
- [Interop and Source Maps — L85](interop-and-source-maps.md#^ref-cdfac40c-85-0) (line 85, col 0, score 0.69)
- [ecs-offload-workers — L75](ecs-offload-workers.md#^ref-6498b9d7-75-0) (line 75, col 0, score 0.61)
- [Stateful Partitions and Rebalancing — L351](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-351-0) (line 351, col 0, score 0.65)
- [ParticleSimulationWithCanvasAndFFmpeg — L30](particlesimulationwithcanvasandffmpeg.md#^ref-e018dd7a-30-0) (line 30, col 0, score 0.65)
- [EidolonField — L81](eidolonfield.md#^ref-49d1e1e5-81-0) (line 81, col 0, score 0.64)
- [compiler-kit-foundations — L166](compiler-kit-foundations.md#^ref-01b21543-166-0) (line 166, col 0, score 0.68)
- [Promethean Agent DSL TS Scaffold — L107](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-107-0) (line 107, col 0, score 0.65)
- [refactor-relations — L10](refactor-relations.md#^ref-41ce0216-10-0) (line 10, col 0, score 0.69)
- [RAG UI Panel with Qdrant and PostgREST — L172](rag-ui-panel-with-qdrant-and-postgrest.md#^ref-e1056831-172-0) (line 172, col 0, score 0.64)
- [Language-Agnostic Mirror System — L336](language-agnostic-mirror-system.md#^ref-d2b3628c-336-0) (line 336, col 0, score 0.69)
- [compiler-kit-foundations — L359](compiler-kit-foundations.md#^ref-01b21543-359-0) (line 359, col 0, score 0.7)
- [compiler-kit-foundations — L50](compiler-kit-foundations.md#^ref-01b21543-50-0) (line 50, col 0, score 0.64)
- [Lispy Macros with syntax-rules — L9](lispy-macros-with-syntax-rules.md#^ref-cbfe3513-9-0) (line 9, col 0, score 0.65)
- [Language-Agnostic Mirror System — L151](language-agnostic-mirror-system.md#^ref-d2b3628c-151-0) (line 151, col 0, score 0.67)
- [Stateful Partitions and Rebalancing — L202](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-202-0) (line 202, col 0, score 0.65)
- [Lisp-Compiler-Integration — L188](lisp-compiler-integration.md#^ref-cfee6d36-188-0) (line 188, col 0, score 0.65)
- [compiler-kit-foundations — L471](compiler-kit-foundations.md#^ref-01b21543-471-0) (line 471, col 0, score 0.63)
- [polymorphic-meta-programming-engine — L157](polymorphic-meta-programming-engine.md#^ref-7bed0b9a-157-0) (line 157, col 0, score 0.64)
- [Promethean Agent DSL TS Scaffold — L389](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-389-0) (line 389, col 0, score 0.63)
- [Performance-Optimized-Polyglot-Bridge — L22](performance-optimized-polyglot-bridge.md#^ref-f5579967-22-0) (line 22, col 0, score 0.69)
- [Promethean Agent DSL TS Scaffold — L568](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-568-0) (line 568, col 0, score 0.62)
- [field-node-diagram-set — L24](field-node-diagram-set.md#^ref-22b989d5-24-0) (line 24, col 0, score 0.61)
- [Promethean Agent DSL TS Scaffold — L417](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-417-0) (line 417, col 0, score 0.68)
- [Lispy Macros with syntax-rules — L243](lispy-macros-with-syntax-rules.md#^ref-cbfe3513-243-0) (line 243, col 0, score 0.65)
- [2d-sandbox-field — L31](2d-sandbox-field.md#^ref-c710dc93-31-0) (line 31, col 0, score 0.64)
- [Chroma Toolkit Consolidation Plan — L124](chroma-toolkit-consolidation-plan.md#^ref-5020e892-124-0) (line 124, col 0, score 0.69)
- [Chroma-Embedding-Refactor — L111](chroma-embedding-refactor.md#^ref-8b256935-111-0) (line 111, col 0, score 0.67)
- [Functional Refactor of TypeScript Document Processing — L5](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-5-0) (line 5, col 0, score 0.66)
- [js-to-lisp-reverse-compiler — L340](js-to-lisp-reverse-compiler.md#^ref-58191024-340-0) (line 340, col 0, score 0.66)
- [balanced-bst — L268](balanced-bst.md#^ref-d3e7db72-268-0) (line 268, col 0, score 0.66)
- [file-watcher-auth-fix — L31](file-watcher-auth-fix.md#^ref-9044701b-31-0) (line 31, col 0, score 0.66)
- [Interop and Source Maps — L482](interop-and-source-maps.md#^ref-cdfac40c-482-0) (line 482, col 0, score 0.66)
- [typed-struct-compiler — L304](typed-struct-compiler.md#^ref-78eeedf7-304-0) (line 304, col 0, score 0.65)
- [Chroma Toolkit Consolidation Plan — L74](chroma-toolkit-consolidation-plan.md#^ref-5020e892-74-0) (line 74, col 0, score 0.65)
- [komorebi-group-window-hack — L132](komorebi-group-window-hack.md#^ref-dd89372d-132-0) (line 132, col 0, score 0.65)
- [Lispy Macros with syntax-rules — L365](lispy-macros-with-syntax-rules.md#^ref-cbfe3513-365-0) (line 365, col 0, score 0.65)
- [Lisp-Compiler-Integration — L491](lisp-compiler-integration.md#^ref-cfee6d36-491-0) (line 491, col 0, score 0.65)
- [Promethean Agent DSL TS Scaffold — L588](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-588-0) (line 588, col 0, score 0.64)
- [Promethean Infrastructure Setup — L456](promethean-infrastructure-setup.md#^ref-6deed6ac-456-0) (line 456, col 0, score 0.64)
- [archetype-ecs — L441](archetype-ecs.md#^ref-8f4c1e86-441-0) (line 441, col 0, score 0.75)
- [Stateful Partitions and Rebalancing — L499](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-499-0) (line 499, col 0, score 0.75)
- [State Snapshots API and Transactional Projector — L303](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-303-0) (line 303, col 0, score 0.72)
- [schema-evolution-workflow — L450](schema-evolution-workflow.md#^ref-d8059b6a-450-0) (line 450, col 0, score 0.7)
- [archetype-ecs — L457](archetype-ecs.md#^ref-8f4c1e86-457-0) (line 457, col 0, score 0.69)
- [JavaScript — L21](chunks/javascript.md#^ref-c1618c66-21-0) (line 21, col 0, score 0.69)
- [compiler-kit-foundations — L626](compiler-kit-foundations.md#^ref-01b21543-626-0) (line 626, col 0, score 0.69)
- [ecs-offload-workers — L488](ecs-offload-workers.md#^ref-6498b9d7-488-0) (line 488, col 0, score 0.69)
- [ecs-scheduler-and-prefabs — L412](ecs-scheduler-and-prefabs.md#^ref-c62a1815-412-0) (line 412, col 0, score 0.69)
- [Language-Agnostic Mirror System — L547](language-agnostic-mirror-system.md#^ref-d2b3628c-547-0) (line 547, col 0, score 0.69)
- [Functional Embedding Pipeline Refactor — L4](functional-embedding-pipeline-refactor.md#^ref-a4a25141-4-0) (line 4, col 0, score 0.66)
- [balanced-bst — L288](balanced-bst.md#^ref-d3e7db72-288-0) (line 288, col 0, score 0.65)
- [Layer1SurvivabilityEnvelope — L38](layer1survivabilityenvelope.md#^ref-64a9f9f9-38-0) (line 38, col 0, score 0.6)
- [field-interaction-equations — L64](field-interaction-equations.md#^ref-b09141b7-64-0) (line 64, col 0, score 0.6)
- [Performance-Optimized-Polyglot-Bridge — L415](performance-optimized-polyglot-bridge.md#^ref-f5579967-415-0) (line 415, col 0, score 0.59)
- [Promethean-Copilot-Intent-Engine — L3](promethean-copilot-intent-engine.md#^ref-ae24a280-3-0) (line 3, col 0, score 0.58)
- [eidolon-field-math-foundations — L5](eidolon-field-math-foundations.md#^ref-008f2ac0-5-0) (line 5, col 0, score 0.57)
- [Local-First Intention→Code Loop with Free Models — L118](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-118-0) (line 118, col 0, score 0.57)
- [Promethean Event Bus MVP v0.1 — L19](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-19-0) (line 19, col 0, score 0.57)
- [AI-First-OS-Model-Context-Protocol — L15](ai-first-os-model-context-protocol.md#^ref-618198f4-15-0) (line 15, col 0, score 0.56)
- [Chroma-Embedding-Refactor — L64](chroma-embedding-refactor.md#^ref-8b256935-64-0) (line 64, col 0, score 0.67)
- [Chroma-Embedding-Refactor — L109](chroma-embedding-refactor.md#^ref-8b256935-109-0) (line 109, col 0, score 0.67)
- [Chroma-Embedding-Refactor — L258](chroma-embedding-refactor.md#^ref-8b256935-258-0) (line 258, col 0, score 0.67)
- [Chroma Toolkit Consolidation Plan — L72](chroma-toolkit-consolidation-plan.md#^ref-5020e892-72-0) (line 72, col 0, score 0.67)
- [Chroma Toolkit Consolidation Plan — L88](chroma-toolkit-consolidation-plan.md#^ref-5020e892-88-0) (line 88, col 0, score 0.67)
- [Chroma Toolkit Consolidation Plan — L107](chroma-toolkit-consolidation-plan.md#^ref-5020e892-107-0) (line 107, col 0, score 0.67)
- [Chroma Toolkit Consolidation Plan — L148](chroma-toolkit-consolidation-plan.md#^ref-5020e892-148-0) (line 148, col 0, score 0.67)
- [Chroma Toolkit Consolidation Plan — L162](chroma-toolkit-consolidation-plan.md#^ref-5020e892-162-0) (line 162, col 0, score 0.64)
- [Model Selection for Lightweight Conversational Tasks — L53](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-53-0) (line 53, col 0, score 0.71)
- [Dynamic Context Model for Web Components — L331](dynamic-context-model-for-web-components.md#^ref-f7702bf8-331-0) (line 331, col 0, score 0.63)
- [Promethean-native config design — L31](promethean-native-config-design.md#^ref-ab748541-31-0) (line 31, col 0, score 0.71)
- [AI-Centric OS with MCP Layer — L179](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-179-0) (line 179, col 0, score 0.64)
- [mystery-lisp-search-session — L102](mystery-lisp-search-session.md#^ref-513dc4c7-102-0) (line 102, col 0, score 0.63)
- [Simulation Demo — L32](chunks/simulation-demo.md#^ref-557309a3-32-0) (line 32, col 0, score 1)
- [Tooling — L26](chunks/tooling.md#^ref-6cb4943e-26-0) (line 26, col 0, score 1)
- [Window Management — L36](chunks/window-management.md#^ref-9e8ae388-36-0) (line 36, col 0, score 1)
- [compiler-kit-foundations — L639](compiler-kit-foundations.md#^ref-01b21543-639-0) (line 639, col 0, score 1)
- [Creative Moments — L10](creative-moments.md#^ref-10d98225-10-0) (line 10, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L258](cross-language-runtime-polymorphism.md#^ref-c34c36a6-258-0) (line 258, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L215](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-215-0) (line 215, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L50](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-50-0) (line 50, col 0, score 1)
- [DuckDuckGoSearchPipeline — L16](duckduckgosearchpipeline.md#^ref-e979c50f-16-0) (line 16, col 0, score 1)
- [Vectorial Exception Descent — L136](vectorial-exception-descent.md#^ref-d771154e-136-0) (line 136, col 0, score 0.61)
- [plan-update-confirmation — L496](plan-update-confirmation.md#^ref-b22d79c6-496-0) (line 496, col 0, score 0.6)
- [Promethean-native config design — L32](promethean-native-config-design.md#^ref-ab748541-32-0) (line 32, col 0, score 0.6)
- [Promethean-native config design — L33](promethean-native-config-design.md#^ref-ab748541-33-0) (line 33, col 0, score 0.6)
- [Promethean-native config design — L35](promethean-native-config-design.md#^ref-ab748541-35-0) (line 35, col 0, score 0.6)
- [Exception Layer Analysis — L11](exception-layer-analysis.md#^ref-21d5cc09-11-0) (line 11, col 0, score 0.6)
- [ecs-scheduler-and-prefabs — L338](ecs-scheduler-and-prefabs.md#^ref-c62a1815-338-0) (line 338, col 0, score 0.7)
- [Prompt_Folder_Bootstrap — L24](prompt-folder-bootstrap.md#^ref-bd4f0976-24-0) (line 24, col 0, score 0.7)
- [Prompt_Folder_Bootstrap — L42](prompt-folder-bootstrap.md#^ref-bd4f0976-42-0) (line 42, col 0, score 0.7)
- [Prompt_Folder_Bootstrap — L66](prompt-folder-bootstrap.md#^ref-bd4f0976-66-0) (line 66, col 0, score 0.7)
- [Prompt_Folder_Bootstrap — L84](prompt-folder-bootstrap.md#^ref-bd4f0976-84-0) (line 84, col 0, score 0.7)
- [Prompt_Folder_Bootstrap — L103](prompt-folder-bootstrap.md#^ref-bd4f0976-103-0) (line 103, col 0, score 0.7)
- [Prompt_Folder_Bootstrap — L130](prompt-folder-bootstrap.md#^ref-bd4f0976-130-0) (line 130, col 0, score 0.7)
- [Prompt_Folder_Bootstrap — L152](prompt-folder-bootstrap.md#^ref-bd4f0976-152-0) (line 152, col 0, score 0.7)
- [System Scheduler with Resource-Aware DAG — L336](system-scheduler-with-resource-aware-dag.md#^ref-ba244286-336-0) (line 336, col 0, score 0.7)
- [api-gateway-versioning — L280](api-gateway-versioning.md#^ref-0580dcd3-280-0) (line 280, col 0, score 0.68)
- [Chroma-Embedding-Refactor — L26](chroma-embedding-refactor.md#^ref-8b256935-26-0) (line 26, col 0, score 0.67)
- [Agent Tasks: Persistence Migration to DualStore — L84](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-84-0) (line 84, col 0, score 0.67)
- [Agent Tasks: Persistence Migration to DualStore — L8](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-8-0) (line 8, col 0, score 0.65)
- [State Snapshots API and Transactional Projector — L3](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-3-0) (line 3, col 0, score 0.66)
- [Promethean Pipelines — L87](promethean-pipelines.md#^ref-8b8e6103-87-0) (line 87, col 0, score 0.66)
- [Agent Tasks: Persistence Migration to DualStore — L92](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-92-0) (line 92, col 0, score 0.65)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L1](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-1-0) (line 1, col 0, score 0.65)
- [Promethean State Format — L27](promethean-state-format.md#^ref-23df6ddb-27-0) (line 27, col 0, score 0.64)
- [compiler-kit-foundations — L3](compiler-kit-foundations.md#^ref-01b21543-3-0) (line 3, col 0, score 0.64)
- [TypeScript Patch for Tool Calling Support — L443](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-443-0) (line 443, col 0, score 0.64)
- [universal-intention-code-fabric — L26](universal-intention-code-fabric.md#^ref-c14edce7-26-0) (line 26, col 0, score 0.64)
- [Agent Tasks: Persistence Migration to DualStore — L133](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-133-0) (line 133, col 0, score 1)
- [Diagrams — L19](chunks/diagrams.md#^ref-45cd25b5-19-0) (line 19, col 0, score 1)
- [eidolon-node-lifecycle — L32](eidolon-node-lifecycle.md#^ref-938eca9c-32-0) (line 32, col 0, score 1)
- [Event Bus Projections Architecture — L147](event-bus-projections-architecture.md#^ref-cf6b9b17-147-0) (line 147, col 0, score 1)
- [field-node-diagram-outline — L101](field-node-diagram-outline.md#^ref-1f32c94a-101-0) (line 101, col 0, score 1)
- [field-node-diagram-set — L137](field-node-diagram-set.md#^ref-22b989d5-137-0) (line 137, col 0, score 1)
- [field-node-diagram-visualizations — L87](field-node-diagram-visualizations.md#^ref-e9b27b06-87-0) (line 87, col 0, score 1)
- [heartbeat-fragment-demo — L100](heartbeat-fragment-demo.md#^ref-dd00677a-100-0) (line 100, col 0, score 1)
- [2d-sandbox-field — L197](2d-sandbox-field.md#^ref-c710dc93-197-0) (line 197, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L178](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-178-0) (line 178, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L216](chroma-toolkit-consolidation-plan.md#^ref-5020e892-216-0) (line 216, col 0, score 1)
- [Diagrams — L17](chunks/diagrams.md#^ref-45cd25b5-17-0) (line 17, col 0, score 1)
- [Eidolon Field Abstract Model — L194](eidolon-field-abstract-model.md#^ref-5e8b2388-194-0) (line 194, col 0, score 1)
- [eidolon-node-lifecycle — L33](eidolon-node-lifecycle.md#^ref-938eca9c-33-0) (line 33, col 0, score 1)
- [EidolonField — L247](eidolonfield.md#^ref-49d1e1e5-247-0) (line 247, col 0, score 1)
- [Event Bus MVP — L580](event-bus-mvp.md#^ref-534fe91d-580-0) (line 580, col 0, score 1)
- [Exception Layer Analysis — L172](exception-layer-analysis.md#^ref-21d5cc09-172-0) (line 172, col 0, score 1)
- [field-dynamics-math-blocks — L154](field-dynamics-math-blocks.md#^ref-7cfc230d-154-0) (line 154, col 0, score 1)
- [field-interaction-equations — L164](field-interaction-equations.md#^ref-b09141b7-164-0) (line 164, col 0, score 1)
- [field-node-diagram-outline — L120](field-node-diagram-outline.md#^ref-1f32c94a-120-0) (line 120, col 0, score 1)
- [field-node-diagram-set — L149](field-node-diagram-set.md#^ref-22b989d5-149-0) (line 149, col 0, score 1)
- [field-node-diagram-visualizations — L99](field-node-diagram-visualizations.md#^ref-e9b27b06-99-0) (line 99, col 0, score 1)
- [heartbeat-fragment-demo — L111](heartbeat-fragment-demo.md#^ref-dd00677a-111-0) (line 111, col 0, score 1)
- [heartbeat-simulation-snippets — L101](heartbeat-simulation-snippets.md#^ref-23e221e9-101-0) (line 101, col 0, score 1)
- [homeostasis-decay-formulas — L161](homeostasis-decay-formulas.md#^ref-37b5d236-161-0) (line 161, col 0, score 1)
- [2d-sandbox-field — L202](2d-sandbox-field.md#^ref-c710dc93-202-0) (line 202, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L144](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-144-0) (line 144, col 0, score 1)
- [aionian-circuit-math — L182](aionian-circuit-math.md#^ref-f2d83a77-182-0) (line 182, col 0, score 1)
- [Chroma-Embedding-Refactor — L333](chroma-embedding-refactor.md#^ref-8b256935-333-0) (line 333, col 0, score 1)
- [Diagrams — L16](chunks/diagrams.md#^ref-45cd25b5-16-0) (line 16, col 0, score 1)
- [JavaScript — L45](chunks/javascript.md#^ref-c1618c66-45-0) (line 45, col 0, score 1)
- [Math Fundamentals — L38](chunks/math-fundamentals.md#^ref-c6e87433-38-0) (line 38, col 0, score 1)
- [Simulation Demo — L15](chunks/simulation-demo.md#^ref-557309a3-15-0) (line 15, col 0, score 1)
- [archetype-ecs — L459](archetype-ecs.md#^ref-8f4c1e86-459-0) (line 459, col 0, score 1)
- [JavaScript — L15](chunks/javascript.md#^ref-c1618c66-15-0) (line 15, col 0, score 1)
- [compiler-kit-foundations — L612](compiler-kit-foundations.md#^ref-01b21543-612-0) (line 612, col 0, score 1)
- [ecs-offload-workers — L490](ecs-offload-workers.md#^ref-6498b9d7-490-0) (line 490, col 0, score 1)
- [ecs-scheduler-and-prefabs — L414](ecs-scheduler-and-prefabs.md#^ref-c62a1815-414-0) (line 414, col 0, score 1)
- [template-based-compilation — L115](template-based-compilation.md#^ref-f8877e5e-115-0) (line 115, col 0, score 1)
- [Unique Info Dump Index — L98](unique-info-dump-index.md#^ref-30ec3ba6-98-0) (line 98, col 0, score 1)
- [zero-copy-snapshots-and-workers — L379](zero-copy-snapshots-and-workers.md#^ref-62bec6f0-379-0) (line 379, col 0, score 1)
- [EidolonField — L257](eidolonfield.md#^ref-49d1e1e5-257-0) (line 257, col 0, score 1)
- [Event Bus MVP — L558](event-bus-mvp.md#^ref-534fe91d-558-0) (line 558, col 0, score 1)
- [Factorio AI with External Agents — L147](factorio-ai-with-external-agents.md#^ref-a4d90289-147-0) (line 147, col 0, score 1)
- [field-node-diagram-outline — L116](field-node-diagram-outline.md#^ref-1f32c94a-116-0) (line 116, col 0, score 1)
- [field-node-diagram-set — L147](field-node-diagram-set.md#^ref-22b989d5-147-0) (line 147, col 0, score 1)
- [field-node-diagram-visualizations — L96](field-node-diagram-visualizations.md#^ref-e9b27b06-96-0) (line 96, col 0, score 1)
- [Fnord Tracer Protocol — L249](fnord-tracer-protocol.md#^ref-fc21f824-249-0) (line 249, col 0, score 1)
- [heartbeat-fragment-demo — L115](heartbeat-fragment-demo.md#^ref-dd00677a-115-0) (line 115, col 0, score 1)
- [heartbeat-simulation-snippets — L104](heartbeat-simulation-snippets.md#^ref-23e221e9-104-0) (line 104, col 0, score 1)
- [layer-1-uptime-diagrams — L170](layer-1-uptime-diagrams.md#^ref-4127189a-170-0) (line 170, col 0, score 1)
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
- [2d-sandbox-field — L196](2d-sandbox-field.md#^ref-c710dc93-196-0) (line 196, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L137](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-137-0) (line 137, col 0, score 1)
- [Diagrams — L34](chunks/diagrams.md#^ref-45cd25b5-34-0) (line 34, col 0, score 1)
- [JavaScript — L46](chunks/javascript.md#^ref-c1618c66-46-0) (line 46, col 0, score 1)
- [Math Fundamentals — L41](chunks/math-fundamentals.md#^ref-c6e87433-41-0) (line 41, col 0, score 1)
- [Simulation Demo — L16](chunks/simulation-demo.md#^ref-557309a3-16-0) (line 16, col 0, score 1)
- [Duck's Attractor States — L75](ducks-attractor-states.md#^ref-13951643-75-0) (line 75, col 0, score 1)
- [Duck's Self-Referential Perceptual Loop — L48](ducks-self-referential-perceptual-loop.md#^ref-71726f04-48-0) (line 48, col 0, score 1)
- [Eidolon Field Abstract Model — L193](eidolon-field-abstract-model.md#^ref-5e8b2388-193-0) (line 193, col 0, score 1)
- [eidolon-field-math-foundations — L135](eidolon-field-math-foundations.md#^ref-008f2ac0-135-0) (line 135, col 0, score 1)
- [eidolon-node-lifecycle — L30](eidolon-node-lifecycle.md#^ref-938eca9c-30-0) (line 30, col 0, score 1)
- [aionian-circuit-math — L153](aionian-circuit-math.md#^ref-f2d83a77-153-0) (line 153, col 0, score 1)
- [JavaScript — L24](chunks/javascript.md#^ref-c1618c66-24-0) (line 24, col 0, score 1)
- [Math Fundamentals — L26](chunks/math-fundamentals.md#^ref-c6e87433-26-0) (line 26, col 0, score 1)
- [compiler-kit-foundations — L607](compiler-kit-foundations.md#^ref-01b21543-607-0) (line 607, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L201](cross-language-runtime-polymorphism.md#^ref-c34c36a6-201-0) (line 201, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L166](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-166-0) (line 166, col 0, score 1)
- [Dynamic Context Model for Web Components — L416](dynamic-context-model-for-web-components.md#^ref-f7702bf8-416-0) (line 416, col 0, score 1)
- [field-interaction-equations — L153](field-interaction-equations.md#^ref-b09141b7-153-0) (line 153, col 0, score 1)
- [Interop and Source Maps — L535](interop-and-source-maps.md#^ref-cdfac40c-535-0) (line 535, col 0, score 1)
- [komorebi-group-window-hack — L202](komorebi-group-window-hack.md#^ref-dd89372d-202-0) (line 202, col 0, score 1)
- [sibilant-macro-targets — L172](sibilant-macro-targets.md#^ref-c5c9a5c6-172-0) (line 172, col 0, score 1)
- [Sibilant Meta-Prompt DSL — L205](sibilant-meta-prompt-dsl.md#^ref-af5d2824-205-0) (line 205, col 0, score 1)
- [sibilant-meta-string-templating-runtime — L137](sibilant-meta-string-templating-runtime.md#^ref-2aafc801-137-0) (line 137, col 0, score 1)
- [sibilant-metacompiler-overview — L90](sibilant-metacompiler-overview.md#^ref-61d4086b-90-0) (line 90, col 0, score 1)
- [State Snapshots API and Transactional Projector — L366](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-366-0) (line 366, col 0, score 1)
- [System Scheduler with Resource-Aware DAG — L394](system-scheduler-with-resource-aware-dag.md#^ref-ba244286-394-0) (line 394, col 0, score 1)
- [template-based-compilation — L104](template-based-compilation.md#^ref-f8877e5e-104-0) (line 104, col 0, score 1)
- [ts-to-lisp-transpiler — L8](ts-to-lisp-transpiler.md#^ref-ba11486b-8-0) (line 8, col 0, score 1)
- [typed-struct-compiler — L384](typed-struct-compiler.md#^ref-78eeedf7-384-0) (line 384, col 0, score 1)
- [field-node-diagram-visualizations — L89](field-node-diagram-visualizations.md#^ref-e9b27b06-89-0) (line 89, col 0, score 1)
- [heartbeat-fragment-demo — L99](heartbeat-fragment-demo.md#^ref-dd00677a-99-0) (line 99, col 0, score 1)
- [heartbeat-simulation-snippets — L86](heartbeat-simulation-snippets.md#^ref-23e221e9-86-0) (line 86, col 0, score 1)
- [homeostasis-decay-formulas — L154](homeostasis-decay-formulas.md#^ref-37b5d236-154-0) (line 154, col 0, score 1)
- [Interop and Source Maps — L518](interop-and-source-maps.md#^ref-cdfac40c-518-0) (line 518, col 0, score 1)
- [komorebi-group-window-hack — L205](komorebi-group-window-hack.md#^ref-dd89372d-205-0) (line 205, col 0, score 1)
- [layer-1-uptime-diagrams — L166](layer-1-uptime-diagrams.md#^ref-4127189a-166-0) (line 166, col 0, score 1)
- [Lisp-Compiler-Integration — L558](lisp-compiler-integration.md#^ref-cfee6d36-558-0) (line 558, col 0, score 1)
- [lisp-dsl-for-window-management — L219](lisp-dsl-for-window-management.md#^ref-c5c5ff1c-219-0) (line 219, col 0, score 1)
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
- [layer-1-uptime-diagrams — L161](layer-1-uptime-diagrams.md#^ref-4127189a-161-0) (line 161, col 0, score 1)
- [Layer1SurvivabilityEnvelope — L164](layer1survivabilityenvelope.md#^ref-64a9f9f9-164-0) (line 164, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L289](migrate-to-provider-tenant-architecture.md#^ref-54382370-289-0) (line 289, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration Guide — L44](obsidian-chatgpt-plugin-integration-guide.md#^ref-1d3d6c3a-44-0) (line 44, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration — L42](obsidian-chatgpt-plugin-integration.md#^ref-ca8e1399-42-0) (line 42, col 0, score 1)
- [Obsidian Templating Plugins Integration Guide — L101](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-101-0) (line 101, col 0, score 1)
- [ParticleSimulationWithCanvasAndFFmpeg — L248](particlesimulationwithcanvasandffmpeg.md#^ref-e018dd7a-248-0) (line 248, col 0, score 1)
- [plan-update-confirmation — L1007](plan-update-confirmation.md#^ref-b22d79c6-1007-0) (line 1007, col 0, score 1)
- [polymorphic-meta-programming-engine — L221](polymorphic-meta-programming-engine.md#^ref-7bed0b9a-221-0) (line 221, col 0, score 1)
- [2d-sandbox-field — L194](2d-sandbox-field.md#^ref-c710dc93-194-0) (line 194, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L194](chroma-toolkit-consolidation-plan.md#^ref-5020e892-194-0) (line 194, col 0, score 1)
- [Diagrams — L41](chunks/diagrams.md#^ref-45cd25b5-41-0) (line 41, col 0, score 1)
- [Math Fundamentals — L29](chunks/math-fundamentals.md#^ref-c6e87433-29-0) (line 29, col 0, score 1)
- [compiler-kit-foundations — L649](compiler-kit-foundations.md#^ref-01b21543-649-0) (line 649, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L225](cross-language-runtime-polymorphism.md#^ref-c34c36a6-225-0) (line 225, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L192](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-192-0) (line 192, col 0, score 1)
- [Duck's Attractor States — L74](ducks-attractor-states.md#^ref-13951643-74-0) (line 74, col 0, score 1)
- [Duck's Self-Referential Perceptual Loop — L47](ducks-self-referential-perceptual-loop.md#^ref-71726f04-47-0) (line 47, col 0, score 1)
- [Dynamic Context Model for Web Components — L406](dynamic-context-model-for-web-components.md#^ref-f7702bf8-406-0) (line 406, col 0, score 1)
- [Eidolon Field Abstract Model — L195](eidolon-field-abstract-model.md#^ref-5e8b2388-195-0) (line 195, col 0, score 1)
- [Promethean_Eidolon_Synchronicity_Model — L74](promethean-eidolon-synchronicity-model.md#^ref-2d6e5553-74-0) (line 74, col 0, score 1)
- [Promethean Event Bus MVP v0.1 — L929](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-929-0) (line 929, col 0, score 1)
- [Promethean Infrastructure Setup — L597](promethean-infrastructure-setup.md#^ref-6deed6ac-597-0) (line 597, col 0, score 1)
- [Promethean-native config design — L421](promethean-native-config-design.md#^ref-ab748541-421-0) (line 421, col 0, score 1)
- [promethean-system-diagrams — L217](promethean-system-diagrams.md#^ref-b51e19b4-217-0) (line 217, col 0, score 1)
- [Promethean Web UI Setup — L629](promethean-web-ui-setup.md#^ref-bc5172ca-629-0) (line 629, col 0, score 1)
- [Prompt_Folder_Bootstrap — L193](prompt-folder-bootstrap.md#^ref-bd4f0976-193-0) (line 193, col 0, score 1)
- [prompt-programming-language-lisp — L107](prompt-programming-language-lisp.md#^ref-d41a06d1-107-0) (line 107, col 0, score 1)
- [Math Fundamentals — L20](chunks/math-fundamentals.md#^ref-c6e87433-20-0) (line 20, col 0, score 1)
- [Services — L20](chunks/services.md#^ref-75ea4a6a-20-0) (line 20, col 0, score 1)
- [compiler-kit-foundations — L620](compiler-kit-foundations.md#^ref-01b21543-620-0) (line 620, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L237](cross-language-runtime-polymorphism.md#^ref-c34c36a6-237-0) (line 237, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L40](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-40-0) (line 40, col 0, score 1)
- [Dynamic Context Model for Web Components — L401](dynamic-context-model-for-web-components.md#^ref-f7702bf8-401-0) (line 401, col 0, score 1)
- [ecs-scheduler-and-prefabs — L386](ecs-scheduler-and-prefabs.md#^ref-c62a1815-386-0) (line 386, col 0, score 1)
- [eidolon-field-math-foundations — L127](eidolon-field-math-foundations.md#^ref-008f2ac0-127-0) (line 127, col 0, score 1)
- [Event Bus MVP — L557](event-bus-mvp.md#^ref-534fe91d-557-0) (line 557, col 0, score 1)
- [archetype-ecs — L456](archetype-ecs.md#^ref-8f4c1e86-456-0) (line 456, col 0, score 1)
- [DSL — L18](chunks/dsl.md#^ref-e87bc036-18-0) (line 18, col 0, score 1)
- [JavaScript — L27](chunks/javascript.md#^ref-c1618c66-27-0) (line 27, col 0, score 1)
- [compiler-kit-foundations — L616](compiler-kit-foundations.md#^ref-01b21543-616-0) (line 616, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L198](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-198-0) (line 198, col 0, score 1)
- [Dynamic Context Model for Web Components — L408](dynamic-context-model-for-web-components.md#^ref-f7702bf8-408-0) (line 408, col 0, score 1)
- [ecs-offload-workers — L489](ecs-offload-workers.md#^ref-6498b9d7-489-0) (line 489, col 0, score 1)
- [ecs-scheduler-and-prefabs — L415](ecs-scheduler-and-prefabs.md#^ref-c62a1815-415-0) (line 415, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L139](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-139-0) (line 139, col 0, score 1)
- [Simulation Demo — L17](chunks/simulation-demo.md#^ref-557309a3-17-0) (line 17, col 0, score 1)
- [Eidolon Field Abstract Model — L203](eidolon-field-abstract-model.md#^ref-5e8b2388-203-0) (line 203, col 0, score 1)
- [eidolon-node-lifecycle — L31](eidolon-node-lifecycle.md#^ref-938eca9c-31-0) (line 31, col 0, score 1)
- [Event Bus Projections Architecture — L156](event-bus-projections-architecture.md#^ref-cf6b9b17-156-0) (line 156, col 0, score 1)
- [Factorio AI with External Agents — L146](factorio-ai-with-external-agents.md#^ref-a4d90289-146-0) (line 146, col 0, score 1)
- [field-node-diagram-outline — L99](field-node-diagram-outline.md#^ref-1f32c94a-99-0) (line 99, col 0, score 1)
- [field-node-diagram-visualizations — L85](field-node-diagram-visualizations.md#^ref-e9b27b06-85-0) (line 85, col 0, score 1)
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
- [aionian-circuit-math — L165](aionian-circuit-math.md#^ref-f2d83a77-165-0) (line 165, col 0, score 1)
- [api-gateway-versioning — L319](api-gateway-versioning.md#^ref-0580dcd3-319-0) (line 319, col 0, score 1)
- [Canonical Org-Babel Matplotlib Animation Template — L116](canonical-org-babel-matplotlib-animation-template.md#^ref-1b1338fc-116-0) (line 116, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L209](chroma-toolkit-consolidation-plan.md#^ref-5020e892-209-0) (line 209, col 0, score 1)
- [DSL — L13](chunks/dsl.md#^ref-e87bc036-13-0) (line 13, col 0, score 1)
- [Math Fundamentals — L16](chunks/math-fundamentals.md#^ref-c6e87433-16-0) (line 16, col 0, score 1)
- [Services — L16](chunks/services.md#^ref-75ea4a6a-16-0) (line 16, col 0, score 1)
- [Shared — L5](chunks/shared.md#^ref-623a55f7-5-0) (line 5, col 0, score 1)
- [Simulation Demo — L12](chunks/simulation-demo.md#^ref-557309a3-12-0) (line 12, col 0, score 1)
- [Diagrams — L13](chunks/diagrams.md#^ref-45cd25b5-13-0) (line 13, col 0, score 1)
- [DSL — L15](chunks/dsl.md#^ref-e87bc036-15-0) (line 15, col 0, score 1)
- [JavaScript — L18](chunks/javascript.md#^ref-c1618c66-18-0) (line 18, col 0, score 1)
- [Math Fundamentals — L14](chunks/math-fundamentals.md#^ref-c6e87433-14-0) (line 14, col 0, score 1)
- [Services — L14](chunks/services.md#^ref-75ea4a6a-14-0) (line 14, col 0, score 1)
- [Shared — L7](chunks/shared.md#^ref-623a55f7-7-0) (line 7, col 0, score 1)
- [Simulation Demo — L10](chunks/simulation-demo.md#^ref-557309a3-10-0) (line 10, col 0, score 1)
- [Tooling — L9](chunks/tooling.md#^ref-6cb4943e-9-0) (line 9, col 0, score 1)
- [Window Management — L15](chunks/window-management.md#^ref-9e8ae388-15-0) (line 15, col 0, score 1)
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
- [2d-sandbox-field — L217](2d-sandbox-field.md#^ref-c710dc93-217-0) (line 217, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L173](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-173-0) (line 173, col 0, score 1)
- [aionian-circuit-math — L181](aionian-circuit-math.md#^ref-f2d83a77-181-0) (line 181, col 0, score 1)
- [Diagrams — L33](chunks/diagrams.md#^ref-45cd25b5-33-0) (line 33, col 0, score 1)
- [DSL — L40](chunks/dsl.md#^ref-e87bc036-40-0) (line 40, col 0, score 1)
- [JavaScript — L30](chunks/javascript.md#^ref-c1618c66-30-0) (line 30, col 0, score 1)
- [Math Fundamentals — L27](chunks/math-fundamentals.md#^ref-c6e87433-27-0) (line 27, col 0, score 1)
- [Services — L39](chunks/services.md#^ref-75ea4a6a-39-0) (line 39, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L248](cross-language-runtime-polymorphism.md#^ref-c34c36a6-248-0) (line 248, col 0, score 1)
- [Eidolon Field Abstract Model — L205](eidolon-field-abstract-model.md#^ref-5e8b2388-205-0) (line 205, col 0, score 1)
- [eidolon-field-math-foundations — L172](eidolon-field-math-foundations.md#^ref-008f2ac0-172-0) (line 172, col 0, score 1)
- [markdown-to-org-transpiler — L313](markdown-to-org-transpiler.md#^ref-ab54cdd8-313-0) (line 313, col 0, score 1)
- [Matplotlib Animation with Async Execution — L79](matplotlib-animation-with-async-execution.md#^ref-687439f9-79-0) (line 79, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L299](migrate-to-provider-tenant-architecture.md#^ref-54382370-299-0) (line 299, col 0, score 1)
- [Model Selection for Lightweight Conversational Tasks — L151](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-151-0) (line 151, col 0, score 1)
- [Mongo Outbox Implementation — L587](mongo-outbox-implementation.md#^ref-9c1acd1e-587-0) (line 587, col 0, score 1)
- [obsidian-ignore-node-modules-regex — L77](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-77-0) (line 77, col 0, score 1)
- [Obsidian Templating Plugins Integration Guide — L120](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-120-0) (line 120, col 0, score 1)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L179](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-179-0) (line 179, col 0, score 1)
- [ParticleSimulationWithCanvasAndFFmpeg — L282](particlesimulationwithcanvasandffmpeg.md#^ref-e018dd7a-282-0) (line 282, col 0, score 1)
- [field-node-diagram-outline — L111](field-node-diagram-outline.md#^ref-1f32c94a-111-0) (line 111, col 0, score 1)
- [field-node-diagram-set — L144](field-node-diagram-set.md#^ref-22b989d5-144-0) (line 144, col 0, score 1)
- [field-node-diagram-visualizations — L94](field-node-diagram-visualizations.md#^ref-e9b27b06-94-0) (line 94, col 0, score 1)
- [Fnord Tracer Protocol — L258](fnord-tracer-protocol.md#^ref-fc21f824-258-0) (line 258, col 0, score 1)
- [heartbeat-fragment-demo — L110](heartbeat-fragment-demo.md#^ref-dd00677a-110-0) (line 110, col 0, score 1)
- [heartbeat-simulation-snippets — L99](heartbeat-simulation-snippets.md#^ref-23e221e9-99-0) (line 99, col 0, score 1)
- [homeostasis-decay-formulas — L151](homeostasis-decay-formulas.md#^ref-37b5d236-151-0) (line 151, col 0, score 1)
- [i3-bluetooth-setup — L119](i3-bluetooth-setup.md#^ref-5e408692-119-0) (line 119, col 0, score 1)
- [i3-config-validation-methods — L77](i3-config-validation-methods.md#^ref-d28090ac-77-0) (line 77, col 0, score 1)
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
- [Math Fundamentals — L34](chunks/math-fundamentals.md#^ref-c6e87433-34-0) (line 34, col 0, score 1)
- [Services — L22](chunks/services.md#^ref-75ea4a6a-22-0) (line 22, col 0, score 1)
- [Shared — L29](chunks/shared.md#^ref-623a55f7-29-0) (line 29, col 0, score 1)
- [Simulation Demo — L23](chunks/simulation-demo.md#^ref-557309a3-23-0) (line 23, col 0, score 1)
- [Tooling — L16](chunks/tooling.md#^ref-6cb4943e-16-0) (line 16, col 0, score 1)
- [Window Management — L25](chunks/window-management.md#^ref-9e8ae388-25-0) (line 25, col 0, score 1)
- [compiler-kit-foundations — L627](compiler-kit-foundations.md#^ref-01b21543-627-0) (line 627, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L171](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-171-0) (line 171, col 0, score 1)
- [Duck's Attractor States — L81](ducks-attractor-states.md#^ref-13951643-81-0) (line 81, col 0, score 1)
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

---
uuid: d3e7db72-2e07-4dae-8920-0e07c499a1e5
created_at: 2025.08.08.21.08.99.md
filename: balanced-bst
description: >-
  A generic AVL tree implementation with Map-like API, supporting floor/ceil,
  rank/select, and range iteration in O(log n) time.
tags:
  - avl
  - balanced
  - bst
  - tree
  - map
  - iterable
  - rank
  - select
  - floor
  - ceil
related_to_title: []
related_to_uuid: []
references: []
---
Yup—here’s a tight, generic **balanced BST** (AVL) you can drop in as `shared/js/prom-lib/ds/bst.ts`. It behaves like a `Map` with extras: `floor/ceil`, `rank/select`, range iterators, and O(log n) ops. ^ref-d3e7db72-1-0

```ts
// shared/js/prom-lib/ds/bst.ts
// MIT. Zero deps. Node + browser safe.
// Balanced Binary Search Tree (AVL). Generic K,V with custom comparator.

export type Cmp<K> = (a: K, b: K) => number;

export function defaultCmp(a: any, b: any): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

class Node<K, V> {
  key: K;
  val: V;
  h = 1;     // height
  sz = 1;    // subtree size (for rank/select)
  left: Node<K, V> | null = null;
  right: Node<K, V> | null = null;
  constructor(key: K, val: V) { this.key = key; this.val = val; }
}

export class AVLTree<K, V> implements Iterable<[K, V]> {
  private root: Node<K, V> | null = null;
  private cmp: Cmp<K>;
  constructor(cmp: Cmp<K> = defaultCmp) { this.cmp = cmp; }

  //#region public API (Map-like)
  get size(): number { return this._sz(this.root); }
  clear(): void { this.root = null; }
  isEmpty(): boolean { return this.root === null; }

  has(key: K): boolean { return this.get(key) !== undefined; }

  get(key: K): V | undefined {
    let n = this.root;
    while (n) {
      const d = this.cmp(key, n.key);
      if (d === 0) return n.val;
      n = d < 0 ? n.left : n.right;
    }
    return undefined;
  }

  /** Set (upsert). Returns previous value if key existed. */
  set(key: K, val: V): V | undefined {
    let old: V | undefined;
    const rec = (n: Node<K,V> | null): Node<K,V> => {
      if (!n) return new Node(key, val);
      const d = this.cmp(key, n.key);
      if (d === 0) { old = n.val; n.val = val; return n; }
      if (d < 0) n.left = rec(n.left); else n.right = rec(n.right);
      return this._rebalance(this._fix(n));
    };
    this.root = rec(this.root);
    return old;
  }

  /** Delete by key. Returns removed value if present. */
  delete(key: K): V | undefined {
    let removed: V | undefined;
    const rec = (n: Node<K,V> | null): Node<K,V> | null => {
      if (!n) return null;
      const d = this.cmp(key, n.key);
      if (d < 0) { n.left = rec(n.left); return this._rebalance(this._fix(n)); }
      if (d > 0) { n.right = rec(n.right); return this._rebalance(this._fix(n)); }
      // found
      removed = n.val;
      if (!n.left) return n.right;
      if (!n.right) return n.left;
      // two children: swap with successor
      const s = this._minNode(n.right);
      n.key = s.key; n.val = s.val;
      n.right = this._deleteMin(n.right);
      return this._rebalance(this._fix(n));
    };
    this.root = rec(this.root);
    return removed;
  }

  /** Minimum entry */
  firstEntry(): [K, V] | undefined {
    const n = this._minNode(this.root);
    return n ? [n.key, n.val] : undefined;
  }
  /** Maximum entry */
  lastEntry(): [K, V] | undefined {
    const n = this._maxNode(this.root);
    return n ? [n.key, n.val] : undefined;
  }

  /** Greatest key <= given key */
  floor(key: K): [K, V] | undefined {
    let n = this.root, best: Node<K,V> | null = null;
    while (n) {
      const d = this.cmp(key, n.key);
      if (d === 0) return [n.key, n.val];
      if (d < 0) n = n.left; else { best = n; n = n.right; }
    }
    return best ? [best.key, best.val] : undefined;
  }
  /** Smallest key >= given key */
  ceil(key: K): [K, V] | undefined {
    let n = this.root, best: Node<K,V> | null = null;
    while (n) {
      const d = this.cmp(key, n.key);
      if (d === 0) return [n.key, n.val];
      if (d > 0) n = n.right; else { best = n; n = n.left; }
    }
    return best ? [best.key, best.val] : undefined;
  }

  /** Number of keys < given key */
  rank(key: K): number {
    let n = this.root, r = 0;
    while (n) {
      const d = this.cmp(key, n.key);
      if (d <= 0) n = n.left;
      else { r += 1 + this._sz(n.left); n = n.right; }
    }
    return r;
  }

  /** k-th (0-based) entry by order */
  select(k: number): [K, V] | undefined {
    if (k < 0 || k >= this.size) return undefined;
    let n = this.root;
    while (n) {
      const ls = this._sz(n.left);
      if (k < ls) n = n.left;
      else if (k > ls) { k -= ls + 1; n = n.right; }
      else return [n.key, n.val];
    }
    return undefined;
  }

  /** In-order traversal (ascending) */
  forEach(fn: (val: V, key: K) => void): void { this._inOrder(this.root, fn); }

  keys(): IterableIterator<K> {
    const it = this[Symbol.iterator]();
    return (function*() { for (const [k] of it) yield k; })();
  }
  values(): IterableIterator<V> {
    const it = this[Symbol.iterator]();
    return (function*() { for (const [,v] of it) yield v; })();
  }

  /** Range iterator: lo <= key <= hi (inclusive by default) */
  *range(lo: K, hi: K, opts: { inclusiveLo?: boolean; inclusiveHi?: boolean } = {}): IterableIterator<[K,V]> {
    const inclL = opts.inclusiveLo ?? true, inclH = opts.inclusiveHi ?? true;
    function cmpIn(cmp: Cmp<K>, k: K, lo: K, hi: K) {
      const dl = cmp(k, lo), dh = cmp(k, hi);
      return (inclL ? dl >= 0 : dl > 0) && (inclH ? dh <= 0 : dh < 0);
    }
    const stack: Node<K,V>[] = [];
    let n = this.root;
    while (n) { stack.push(n); n = this.cmp(lo, n.key) <= 0 ? n.left : n.right; }
    while (stack.length) {
      const cur = stack.pop()!;
      if (this.cmp(cur.key, lo) >= 0 && cur.left) {
        let t = cur.left;
        while (t) { stack.push(t); t = t.right; }
      }
      if (cmpIn(this.cmp, cur.key, lo, hi)) yield [cur.key, cur.val];
      if (this.cmp(cur.key, hi) < 0 && cur.right) {
        let t = cur.right;
        while (t) { stack.push(t); t = t.left; }
      }
    }
  }

  /** In-order iterator (ascending) */
  *[Symbol.iterator](): IterableIterator<[K, V]> {
    const st: Node<K,V>[] = [];
    let n = this.root;
    while (n) { st.push(n); n = n.left; }
    while (st.length) {
      const x = st.pop()!;
      yield [x.key, x.val];
      let r = x.right;
      while (r) { st.push(r); r = r.left; }
    }
  }

  /** Height (0 for empty, else node.h) */
  height(): number { return this.root ? this.root.h : 0; }

  /** Sanity checks (throws on violation) */
  validate(): void {
    const dfs = (n: Node<K,V> | null, min?: K, max?: K): [number, number] => {
      if (!n) return [0, 0];
      if (min !== undefined && this.cmp(n.key, min) <= 0) throw new Error("BST invariant (min) broken");
      if (max !== undefined && this.cmp(n.key, max) >= 0) throw new Error("BST invariant (max) broken");
      const [hl, sl] = dfs(n.left, min, n.key);
      const [hr, sr] = dfs(n.right, n.key, max);
      const h = Math.max(hl, hr) + 1;
      const sz = sl + sr + 1;
      const bf = hr - hl;
      if (Math.abs(bf) > 1) throw new Error("AVL balance broken");
      if (n.h !== h || n.sz !== sz) throw new Error("metadata out-of-sync");
      return [h, sz];
    };
    dfs(this.root);
  }
  //#endregion

  //#region internals
  private _h(n: Node<K,V> | null): number { return n ? n.h : 0; }
  private _sz(n: Node<K,V> | null): number { return n ? n.sz : 0; }
  private _fix(n: Node<K,V>): Node<K,V> { n.h = Math.max(this._h(n.left), this._h(n.right)) + 1; n.sz = this._sz(n.left) + this._sz(n.right) + 1; return n; }
  private _bf(n: Node<K,V>): number { return this._h(n.right) - this._h(n.left); }

  private _rotL(a: Node<K,V>): Node<K,V> {
    const b = a.right!; a.right = b.left; b.left = this._fix(a); return this._fix(b);
  }
  private _rotR(a: Node<K,V>): Node<K,V> {
    const b = a.left!; a.left = b.right; b.right = this._fix(a); return this._fix(b);
  }
  private _rebalance(n: Node<K,V>): Node<K,V> {
    const bf = this._bf(n);
    if (bf === 2) {
      if (this._bf(n.right!) < 0) n.right = this._rotR(n.right!);
      return this._rotL(n);
    }
    if (bf === -2) {
      if (this._bf(n.left!) > 0) n.left = this._rotL(n.left!);
      return this._rotR(n);
    }
    return n;
  }

  private _minNode(n: Node<K,V> | null): Node<K,V> {
    if (!n) throw new Error("empty");
    while (n.left) n = n.left;
    return n;
  }
  private _maxNode(n: Node<K,V> | null): Node<K,V> {
    if (!n) throw new Error("empty");
    while (n.right) n = n.right;
    return n;
  }
  private _deleteMin(n: Node<K,V> | null): Node<K,V> | null {
    if (!n) return null;
    if (!n.left) return n.right;
    n.left = this._deleteMin(n.left);
    return this._rebalance(this._fix(n));
  }
  //#endregion

  //#region builders / utils
  static fromPairs<K, V>(pairs: Iterable<[K, V]>, cmp: Cmp<K> = defaultCmp): AVLTree<K, V> {
    const t = new AVLTree<K,V>(cmp);
    for (const [k, v] of pairs) t.set(k, v);
    return t;
  }
  toArray(): [K, V][] { return Array.from(this); }
  //#endregion
}

// Convenience alias if you prefer the generic name
export const BST = AVLTree;
```
^ref-d3e7db72-3-0

## Quick usage
 ^ref-d3e7db72-268-0
```ts
import { AVLTree } from "./bst";

const t = new AVLTree<number, string>();
t.set(5, "e"); t.set(2, "b"); t.set(8, "h"); t.set(3, "c"); t.set(7, "g");

console.log(t.get(3));                 // "c"
console.log(t.firstEntry());           // [2,"b"]
console.log(t.lastEntry());            // [8,"h"]
console.log(t.floor(6));               // [5,"e"]
console.log(t.ceil(6));                // [7,"g"]
console.log(t.rank(7));                // 3 (there are 3 keys < 7)
console.log(t.select(2));              // [5,"e"]
console.log([...t.range(3,7)]);        // [[3,"c"],[5,"e"],[7,"g"]]
console.log([...t]);                   // in-order entries
t.validate();                          // throws if invariants broken
^ref-d3e7db72-268-0
```

## Notes ^ref-d3e7db72-288-0
 ^ref-d3e7db72-289-0
* All operations are **O(log n)** (AVL-balanced). ^ref-d3e7db72-290-0
* `rank/select` ride on subtree sizes; great for order-statistics queries. ^ref-d3e7db72-291-0
* Keys must be comparable; pass your own `cmp` for strings, dates, custom IDs, etc.
* If you want **multimap** semantics (duplicate keys), easiest path is to store an array value or make the value a small list. ^ref-d3e7db72-293-0

Want a **persistent/immutable** variant (functional tree), or a **Treap** / **Red-Black** flavor? I can drop those too.<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
## Related content
- [AI-Centric OS with MCP Layer](ai-centric-os-with-mcp-layer.md)
- [AI-First-OS-Model-Context-Protocol](ai-first-os-model-context-protocol.md)
- [Board Automation Improvements](board-automation-improvements.md)
- [Operations](chunks/operations.md)
- [Shared](chunks/shared.md)
- [Admin Dashboard for User Management](admin-dashboard-for-user-management.md)
- [Board Walk – 2025-08-11](board-walk-2025-08-11.md)
- [Dynamic Context Model for Web Components](dynamic-context-model-for-web-components.md)
- [Agent Tasks: Persistence Migration to DualStore](agent-tasks-persistence-migration-to-dualstore.md)
- [2d-sandbox-field](2d-sandbox-field.md)
- [Agent Reflections and Prompt Evolution](agent-reflections-and-prompt-evolution.md)
- [Event Bus Projections Architecture](event-bus-projections-architecture.md)
- [Factorio AI with External Agents](factorio-ai-with-external-agents.md)
- [archetype-ecs](archetype-ecs.md)
- [Event Bus MVP](event-bus-mvp.md)
- [EidolonField](eidolonfield.md)
- [field-node-diagram-outline](field-node-diagram-outline.md)
- [Chroma Toolkit Consolidation Plan](chroma-toolkit-consolidation-plan.md)
- [aionian-circuit-math](aionian-circuit-math.md)
- [api-gateway-versioning](api-gateway-versioning.md)
- [Diagrams](chunks/diagrams.md)
- [eidolon-node-lifecycle](eidolon-node-lifecycle.md)
- [Exception Layer Analysis](exception-layer-analysis.md)
- [field-dynamics-math-blocks](field-dynamics-math-blocks.md)
- [field-interaction-equations](field-interaction-equations.md)
- [DSL](chunks/dsl.md)
- [JavaScript](chunks/javascript.md)
- [Math Fundamentals](chunks/math-fundamentals.md)
- [Creative Moments](creative-moments.md)
- [Cross-Target Macro System in Sibilant](cross-target-macro-system-in-sibilant.md)
- [DuckDuckGoSearchPipeline](duckduckgosearchpipeline.md)
- [compiler-kit-foundations](compiler-kit-foundations.md)
- [plan-update-confirmation](plan-update-confirmation.md)
- [Cross-Language Runtime Polymorphism](cross-language-runtime-polymorphism.md)
- [Model Upgrade Calm-Down Guide](model-upgrade-calm-down-guide.md)
- [NPU Voice Code and Sensory Integration](npu-voice-code-and-sensory-integration.md)
- [observability-infrastructure-setup](observability-infrastructure-setup.md)
- [Obsidian Templating Plugins Integration Guide](obsidian-templating-plugins-integration-guide.md)
- [OpenAPI Validation Report](openapi-validation-report.md)
- [Optimizing Command Limitations in System Design](optimizing-command-limitations-in-system-design.md)
- [pm2-orchestration-patterns](pm2-orchestration-patterns.md)
- [Local-Offline-Model-Deployment-Strategy](local-offline-model-deployment-strategy.md)
- [Migrate to Provider-Tenant Architecture](migrate-to-provider-tenant-architecture.md)
- [Mindful Prioritization](mindful-prioritization.md)
- [MindfulRobotIntegration](mindfulrobotintegration.md)
- [Obsidian ChatGPT Plugin Integration Guide](obsidian-chatgpt-plugin-integration-guide.md)
- [Obsidian ChatGPT Plugin Integration](obsidian-chatgpt-plugin-integration.md)
- [Simulation Demo](chunks/simulation-demo.md)
- [Window Management](chunks/window-management.md)
- [zero-copy-snapshots-and-workers](zero-copy-snapshots-and-workers.md)
- [Pure-Node Crawl Stack with Playwright and Crawlee](pure-node-crawl-stack-with-playwright-and-crawlee.md)
- [Shared Package Structure](shared-package-structure.md)
- [promethean-system-diagrams](promethean-system-diagrams.md)
- [Promethean Web UI Setup](promethean-web-ui-setup.md)
- [Promethean Workflow Optimization](promethean-workflow-optimization.md)
- [Prometheus Observability Stack](prometheus-observability-stack.md)
- [Prompt_Folder_Bootstrap](prompt-folder-bootstrap.md)
- [prompt-programming-language-lisp](prompt-programming-language-lisp.md)
- [Protocol_0_The_Contradiction_Engine](protocol-0-the-contradiction-engine.md)
- [Provider-Agnostic Chat Panel Implementation](provider-agnostic-chat-panel-implementation.md)
- [Pure TypeScript Search Microservice](pure-typescript-search-microservice.md)
- [schema-evolution-workflow](schema-evolution-workflow.md)
- [set-assignment-in-lisp-ast](set-assignment-in-lisp-ast.md)
- [sibilant-macro-targets](sibilant-macro-targets.md)
- [RAG UI Panel with Qdrant and PostgREST](rag-ui-panel-with-qdrant-and-postgrest.md)
- [ripple-propagation-demo](ripple-propagation-demo.md)
- [Self-Agency in AI Interaction](self-agency-in-ai-interaction.md)
- [shared-package-layout-clarification](shared-package-layout-clarification.md)
- [Sibilant Meta-Prompt DSL](sibilant-meta-prompt-dsl.md)
- [Tooling](chunks/tooling.md)
- [Debugging Broker Connections and Agent Behavior](debugging-broker-connections-and-agent-behavior.md)
- [graph-ds](graph-ds.md)
- [Interop and Source Maps](interop-and-source-maps.md)
- [Stateful Partitions and Rebalancing](stateful-partitions-and-rebalancing.md)
- [Local-First Intention→Code Loop with Free Models](local-first-intention-code-loop-with-free-models.md)
- [Promethean Agent DSL TS Scaffold](promethean-agent-dsl-ts-scaffold.md)
- [Promethean-native config design](promethean-native-config-design.md)
- [Performance-Optimized-Polyglot-Bridge](performance-optimized-polyglot-bridge.md)
- [Lispy Macros with syntax-rules](lispy-macros-with-syntax-rules.md)
- [Lisp-Compiler-Integration](lisp-compiler-integration.md)
- [ParticleSimulationWithCanvasAndFFmpeg](particlesimulationwithcanvasandffmpeg.md)
- [ecs-scheduler-and-prefabs](ecs-scheduler-and-prefabs.md)
- [System Scheduler with Resource-Aware DAG](system-scheduler-with-resource-aware-dag.md)
- [Functional Embedding Pipeline Refactor](functional-embedding-pipeline-refactor.md)
- [prom-lib-rate-limiters-and-replay-api](prom-lib-rate-limiters-and-replay-api.md)
- [ecs-offload-workers](ecs-offload-workers.md)
- [Language-Agnostic Mirror System](language-agnostic-mirror-system.md)
- [polymorphic-meta-programming-engine](polymorphic-meta-programming-engine.md)
- [State Snapshots API and Transactional Projector](state-snapshots-api-and-transactional-projector.md)
- [Per-Domain Policy System for JS Crawler](per-domain-policy-system-for-js-crawler.md)
- [Promethean Event Bus MVP v0.1](promethean-event-bus-mvp-v0-1.md)
- [windows-tiling-with-autohotkey](windows-tiling-with-autohotkey.md)
- [Mongo Outbox Implementation](mongo-outbox-implementation.md)
- [Chroma-Embedding-Refactor](chroma-embedding-refactor.md)
- [universal-intention-code-fabric](universal-intention-code-fabric.md)
- [js-to-lisp-reverse-compiler](js-to-lisp-reverse-compiler.md)
- [typed-struct-compiler](typed-struct-compiler.md)
- [sibilant-metacompiler-overview](sibilant-metacompiler-overview.md)
- [Promethean Documentation Pipeline Overview](promethean-documentation-pipeline-overview.md)
- [markdown-to-org-transpiler](markdown-to-org-transpiler.md)
- [eidolon-field-math-foundations](eidolon-field-math-foundations.md)
- [WebSocket Gateway Implementation](websocket-gateway-implementation.md)
- [lisp-dsl-for-window-management](lisp-dsl-for-window-management.md)
- [obsidian-ignore-node-modules-regex](obsidian-ignore-node-modules-regex.md)
- [Refactor Frontmatter Processing](refactor-frontmatter-processing.md)
- [Refactor 05-footers.ts](refactor-05-footers-ts.md)
- [refactor-relations](refactor-relations.md)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop](polyglot-s-expr-bridge-python-js-lisp-interop.md)
- [homeostasis-decay-formulas](homeostasis-decay-formulas.md)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler](ollama-llm-provider-for-pseudo-code-transpiler.md)
- [Functional Refactor of TypeScript Document Processing](functional-refactor-of-typescript-document-processing.md)
- [Promethean Pipelines: Local TypeScript-First Workflow](promethean-pipelines-local-typescript-first-workflow.md)
- [Promethean-Copilot-Intent-Engine](promethean-copilot-intent-engine.md)
- [field-node-diagram-set](field-node-diagram-set.md)
- [Synchronicity Waves and Web](synchronicity-waves-and-web.md)
## Sources
- [Admin Dashboard for User Management — L55](admin-dashboard-for-user-management.md#^ref-2901a3e9-55-0) (line 55, col 0, score 0.71)
- [AI-Centric OS with MCP Layer — L414](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-414-0) (line 414, col 0, score 0.71)
- [AI-First-OS-Model-Context-Protocol — L10](ai-first-os-model-context-protocol.md#^ref-618198f4-10-0) (line 10, col 0, score 0.71)
- [Board Automation Improvements — L15](board-automation-improvements.md#^ref-ac60a1d6-15-0) (line 15, col 0, score 0.71)
- [Board Walk – 2025-08-11 — L144](board-walk-2025-08-11.md#^ref-7aa1eb92-144-0) (line 144, col 0, score 0.71)
- [Operations — L7](chunks/operations.md#^ref-f1add613-7-0) (line 7, col 0, score 0.71)
- [Shared — L15](chunks/shared.md#^ref-623a55f7-15-0) (line 15, col 0, score 0.71)
- [Creative Moments — L7](creative-moments.md#^ref-10d98225-7-0) (line 7, col 0, score 0.71)
- [Cross-Target Macro System in Sibilant — L210](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-210-0) (line 210, col 0, score 0.71)
- [DuckDuckGoSearchPipeline — L11](duckduckgosearchpipeline.md#^ref-e979c50f-11-0) (line 11, col 0, score 0.71)
- [Dynamic Context Model for Web Components — L424](dynamic-context-model-for-web-components.md#^ref-f7702bf8-424-0) (line 424, col 0, score 0.71)
- [Event Bus Projections Architecture — L170](event-bus-projections-architecture.md#^ref-cf6b9b17-170-0) (line 170, col 0, score 0.71)
- [Factorio AI with External Agents — L151](factorio-ai-with-external-agents.md#^ref-a4d90289-151-0) (line 151, col 0, score 0.71)
- [graph-ds — L5](graph-ds.md#^ref-6620e2f2-5-0) (line 5, col 0, score 0.69)
- [Stateful Partitions and Rebalancing — L351](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-351-0) (line 351, col 0, score 0.67)
- [Performance-Optimized-Polyglot-Bridge — L170](performance-optimized-polyglot-bridge.md#^ref-f5579967-170-0) (line 170, col 0, score 0.67)
- [zero-copy-snapshots-and-workers — L15](zero-copy-snapshots-and-workers.md#^ref-62bec6f0-15-0) (line 15, col 0, score 0.67)
- [Pure-Node Crawl Stack with Playwright and Crawlee — L178](pure-node-crawl-stack-with-playwright-and-crawlee.md#^ref-d527c05d-178-0) (line 178, col 0, score 0.66)
- [Pure TypeScript Search Microservice — L306](pure-typescript-search-microservice.md#^ref-d17d3a96-306-0) (line 306, col 0, score 0.66)
- [prom-lib-rate-limiters-and-replay-api — L9](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-9-0) (line 9, col 0, score 0.66)
- [archetype-ecs — L7](archetype-ecs.md#^ref-8f4c1e86-7-0) (line 7, col 0, score 0.63)
- [compiler-kit-foundations — L31](compiler-kit-foundations.md#^ref-01b21543-31-0) (line 31, col 0, score 0.66)
- [Per-Domain Policy System for JS Crawler — L184](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-184-0) (line 184, col 0, score 0.64)
- [Mongo Outbox Implementation — L381](mongo-outbox-implementation.md#^ref-9c1acd1e-381-0) (line 381, col 0, score 0.66)
- [graph-ds — L3](graph-ds.md#^ref-6620e2f2-3-0) (line 3, col 0, score 0.62)
- [universal-intention-code-fabric — L252](universal-intention-code-fabric.md#^ref-c14edce7-252-0) (line 252, col 0, score 0.65)
- [Language-Agnostic Mirror System — L109](language-agnostic-mirror-system.md#^ref-d2b3628c-109-0) (line 109, col 0, score 0.65)
- [Promethean Agent DSL TS Scaffold — L107](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-107-0) (line 107, col 0, score 0.62)
- [Promethean Agent DSL TS Scaffold — L308](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-308-0) (line 308, col 0, score 0.69)
- [typed-struct-compiler — L16](typed-struct-compiler.md#^ref-78eeedf7-16-0) (line 16, col 0, score 0.59)
- [ecs-scheduler-and-prefabs — L7](ecs-scheduler-and-prefabs.md#^ref-c62a1815-7-0) (line 7, col 0, score 0.67)
- [System Scheduler with Resource-Aware DAG — L5](system-scheduler-with-resource-aware-dag.md#^ref-ba244286-5-0) (line 5, col 0, score 0.67)
- [WebSocket Gateway Implementation — L473](websocket-gateway-implementation.md#^ref-e811123d-473-0) (line 473, col 0, score 0.63)
- [Event Bus MVP — L284](event-bus-mvp.md#^ref-534fe91d-284-0) (line 284, col 0, score 0.62)
- [Promethean Event Bus MVP v0.1 — L126](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-126-0) (line 126, col 0, score 0.65)
- [compiler-kit-foundations — L166](compiler-kit-foundations.md#^ref-01b21543-166-0) (line 166, col 0, score 0.6)
- [Promethean Agent DSL TS Scaffold — L349](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-349-0) (line 349, col 0, score 0.62)
- [EidolonField — L81](eidolonfield.md#^ref-49d1e1e5-81-0) (line 81, col 0, score 0.68)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L194](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-194-0) (line 194, col 0, score 0.61)
- [Interop and Source Maps — L21](interop-and-source-maps.md#^ref-cdfac40c-21-0) (line 21, col 0, score 0.62)
- [Interop and Source Maps — L85](interop-and-source-maps.md#^ref-cdfac40c-85-0) (line 85, col 0, score 0.71)
- [polymorphic-meta-programming-engine — L157](polymorphic-meta-programming-engine.md#^ref-7bed0b9a-157-0) (line 157, col 0, score 0.66)
- [zero-copy-snapshots-and-workers — L70](zero-copy-snapshots-and-workers.md#^ref-62bec6f0-70-0) (line 70, col 0, score 0.66)
- [Promethean Agent DSL TS Scaffold — L568](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-568-0) (line 568, col 0, score 0.65)
- [js-to-lisp-reverse-compiler — L13](js-to-lisp-reverse-compiler.md#^ref-58191024-13-0) (line 13, col 0, score 0.64)
- [sibilant-metacompiler-overview — L66](sibilant-metacompiler-overview.md#^ref-61d4086b-66-0) (line 66, col 0, score 0.64)
- [plan-update-confirmation — L868](plan-update-confirmation.md#^ref-b22d79c6-868-0) (line 868, col 0, score 0.64)
- [Stateful Partitions and Rebalancing — L202](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-202-0) (line 202, col 0, score 0.7)
- [plan-update-confirmation — L847](plan-update-confirmation.md#^ref-b22d79c6-847-0) (line 847, col 0, score 0.63)
- [Chroma-Embedding-Refactor — L64](chroma-embedding-refactor.md#^ref-8b256935-64-0) (line 64, col 0, score 0.63)
- [Chroma-Embedding-Refactor — L109](chroma-embedding-refactor.md#^ref-8b256935-109-0) (line 109, col 0, score 0.63)
- [Chroma-Embedding-Refactor — L258](chroma-embedding-refactor.md#^ref-8b256935-258-0) (line 258, col 0, score 0.63)
- [Event Bus MVP — L99](event-bus-mvp.md#^ref-534fe91d-99-0) (line 99, col 0, score 0.64)
- [markdown-to-org-transpiler — L7](markdown-to-org-transpiler.md#^ref-ab54cdd8-7-0) (line 7, col 0, score 0.64)
- [compiler-kit-foundations — L359](compiler-kit-foundations.md#^ref-01b21543-359-0) (line 359, col 0, score 0.66)
- [schema-evolution-workflow — L313](schema-evolution-workflow.md#^ref-d8059b6a-313-0) (line 313, col 0, score 0.67)
- [Functional Embedding Pipeline Refactor — L31](functional-embedding-pipeline-refactor.md#^ref-a4a25141-31-0) (line 31, col 0, score 0.66)
- [Language-Agnostic Mirror System — L336](language-agnostic-mirror-system.md#^ref-d2b3628c-336-0) (line 336, col 0, score 0.66)
- [State Snapshots API and Transactional Projector — L179](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-179-0) (line 179, col 0, score 0.61)
- [Pure-Node Crawl Stack with Playwright and Crawlee — L223](pure-node-crawl-stack-with-playwright-and-crawlee.md#^ref-d527c05d-223-0) (line 223, col 0, score 0.66)
- [Chroma-Embedding-Refactor — L111](chroma-embedding-refactor.md#^ref-8b256935-111-0) (line 111, col 0, score 0.65)
- [eidolon-field-math-foundations — L79](eidolon-field-math-foundations.md#^ref-008f2ac0-79-0) (line 79, col 0, score 0.64)
- [Factorio AI with External Agents — L26](factorio-ai-with-external-agents.md#^ref-a4d90289-26-0) (line 26, col 0, score 0.62)
- [obsidian-ignore-node-modules-regex — L38](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-38-0) (line 38, col 0, score 0.61)
- [field-node-diagram-outline — L44](field-node-diagram-outline.md#^ref-1f32c94a-44-0) (line 44, col 0, score 0.61)
- [Cross-Language Runtime Polymorphism — L23](cross-language-runtime-polymorphism.md#^ref-c34c36a6-23-0) (line 23, col 0, score 0.61)
- [Refactor Frontmatter Processing — L11](refactor-frontmatter-processing.md#^ref-cfbdca2f-11-0) (line 11, col 0, score 0.61)
- [homeostasis-decay-formulas — L97](homeostasis-decay-formulas.md#^ref-37b5d236-97-0) (line 97, col 0, score 0.6)
- [obsidian-ignore-node-modules-regex — L14](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-14-0) (line 14, col 0, score 0.6)
- [eidolon-field-math-foundations — L109](eidolon-field-math-foundations.md#^ref-008f2ac0-109-0) (line 109, col 0, score 0.6)
- [obsidian-ignore-node-modules-regex — L26](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-26-0) (line 26, col 0, score 0.59)
- [Promethean Agent DSL TS Scaffold — L142](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-142-0) (line 142, col 0, score 0.68)
- [field-node-diagram-set — L35](field-node-diagram-set.md#^ref-22b989d5-35-0) (line 35, col 0, score 0.59)
- [eidolon-field-math-foundations — L81](eidolon-field-math-foundations.md#^ref-008f2ac0-81-0) (line 81, col 0, score 0.59)
- [Local-First Intention→Code Loop with Free Models — L127](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-127-0) (line 127, col 0, score 0.69)
- [Promethean Agent DSL TS Scaffold — L160](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-160-0) (line 160, col 0, score 0.69)
- [schema-evolution-workflow — L9](schema-evolution-workflow.md#^ref-d8059b6a-9-0) (line 9, col 0, score 0.68)
- [Lispy Macros with syntax-rules — L9](lispy-macros-with-syntax-rules.md#^ref-cbfe3513-9-0) (line 9, col 0, score 0.67)
- [Lisp-Compiler-Integration — L27](lisp-compiler-integration.md#^ref-cfee6d36-27-0) (line 27, col 0, score 0.67)
- [ParticleSimulationWithCanvasAndFFmpeg — L30](particlesimulationwithcanvasandffmpeg.md#^ref-e018dd7a-30-0) (line 30, col 0, score 0.67)
- [ecs-offload-workers — L15](ecs-offload-workers.md#^ref-6498b9d7-15-0) (line 15, col 0, score 0.66)
- [Per-Domain Policy System for JS Crawler — L141](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-141-0) (line 141, col 0, score 0.66)
- [graph-ds — L320](graph-ds.md#^ref-6620e2f2-320-0) (line 320, col 0, score 0.66)
- [Promethean Agent DSL TS Scaffold — L488](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-488-0) (line 488, col 0, score 0.63)
- [set-assignment-in-lisp-ast — L25](set-assignment-in-lisp-ast.md#^ref-c5fba0a0-25-0) (line 25, col 0, score 0.62)
- [Promethean Event Bus MVP v0.1 — L733](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-733-0) (line 733, col 0, score 0.61)
- [sibilant-macro-targets — L17](sibilant-macro-targets.md#^ref-c5c9a5c6-17-0) (line 17, col 0, score 0.61)
- [plan-update-confirmation — L816](plan-update-confirmation.md#^ref-b22d79c6-816-0) (line 816, col 0, score 0.6)
- [typed-struct-compiler — L304](typed-struct-compiler.md#^ref-78eeedf7-304-0) (line 304, col 0, score 0.6)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L7](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-7-0) (line 7, col 0, score 0.6)
- [plan-update-confirmation — L733](plan-update-confirmation.md#^ref-b22d79c6-733-0) (line 733, col 0, score 0.6)
- [graph-ds — L356](graph-ds.md#^ref-6620e2f2-356-0) (line 356, col 0, score 0.65)
- [graph-ds — L355](graph-ds.md#^ref-6620e2f2-355-0) (line 355, col 0, score 0.62)
- [graph-ds — L354](graph-ds.md#^ref-6620e2f2-354-0) (line 354, col 0, score 0.6)
- [Local-First Intention→Code Loop with Free Models — L118](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-118-0) (line 118, col 0, score 0.59)
- [Chroma Toolkit Consolidation Plan — L162](chroma-toolkit-consolidation-plan.md#^ref-5020e892-162-0) (line 162, col 0, score 0.58)
- [homeostasis-decay-formulas — L36](homeostasis-decay-formulas.md#^ref-37b5d236-36-0) (line 36, col 0, score 0.58)
- [AI-First-OS-Model-Context-Protocol — L15](ai-first-os-model-context-protocol.md#^ref-618198f4-15-0) (line 15, col 0, score 0.58)
- [Board Automation Improvements — L19](board-automation-improvements.md#^ref-ac60a1d6-19-0) (line 19, col 0, score 0.58)
- [Shared — L20](chunks/shared.md#^ref-623a55f7-20-0) (line 20, col 0, score 0.58)
- [Promethean Event Bus MVP v0.1 — L832](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-832-0) (line 832, col 0, score 0.66)
- [Event Bus Projections Architecture — L5](event-bus-projections-architecture.md#^ref-cf6b9b17-5-0) (line 5, col 0, score 0.62)
- [Mongo Outbox Implementation — L547](mongo-outbox-implementation.md#^ref-9c1acd1e-547-0) (line 547, col 0, score 0.61)
- [Agent Tasks: Persistence Migration to DualStore — L70](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-70-0) (line 70, col 0, score 0.6)
- [EidolonField — L79](eidolonfield.md#^ref-49d1e1e5-79-0) (line 79, col 0, score 0.62)
- [Language-Agnostic Mirror System — L11](language-agnostic-mirror-system.md#^ref-d2b3628c-11-0) (line 11, col 0, score 0.6)
- [Promethean Pipelines: Local TypeScript-First Workflow — L219](promethean-pipelines-local-typescript-first-workflow.md#^ref-6b63edca-219-0) (line 219, col 0, score 0.59)
- [Promethean-Copilot-Intent-Engine — L28](promethean-copilot-intent-engine.md#^ref-ae24a280-28-0) (line 28, col 0, score 0.59)
- [Synchronicity Waves and Web — L48](synchronicity-waves-and-web.md#^ref-91295f3a-48-0) (line 48, col 0, score 0.59)
- [State Snapshots API and Transactional Projector — L83](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-83-0) (line 83, col 0, score 0.59)
- [Promethean-Copilot-Intent-Engine — L24](promethean-copilot-intent-engine.md#^ref-ae24a280-24-0) (line 24, col 0, score 0.58)
- [plan-update-confirmation — L890](plan-update-confirmation.md#^ref-b22d79c6-890-0) (line 890, col 0, score 0.74)
- [plan-update-confirmation — L874](plan-update-confirmation.md#^ref-b22d79c6-874-0) (line 874, col 0, score 0.68)
- [Promethean-native config design — L343](promethean-native-config-design.md#^ref-ab748541-343-0) (line 343, col 0, score 0.66)
- [plan-update-confirmation — L982](plan-update-confirmation.md#^ref-b22d79c6-982-0) (line 982, col 0, score 0.66)
- [windows-tiling-with-autohotkey — L11](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-11-0) (line 11, col 0, score 0.66)
- [plan-update-confirmation — L978](plan-update-confirmation.md#^ref-b22d79c6-978-0) (line 978, col 0, score 0.65)
- [Promethean Documentation Pipeline Overview — L146](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-146-0) (line 146, col 0, score 0.64)
- [windows-tiling-with-autohotkey — L19](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-19-0) (line 19, col 0, score 0.64)
- [lisp-dsl-for-window-management — L87](lisp-dsl-for-window-management.md#^ref-c5c5ff1c-87-0) (line 87, col 0, score 0.6)
- [Per-Domain Policy System for JS Crawler — L109](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-109-0) (line 109, col 0, score 0.63)
- [lisp-dsl-for-window-management — L6](lisp-dsl-for-window-management.md#^ref-c5c5ff1c-6-0) (line 6, col 0, score 0.63)
- [Functional Embedding Pipeline Refactor — L27](functional-embedding-pipeline-refactor.md#^ref-a4a25141-27-0) (line 27, col 0, score 0.62)
- [ecs-offload-workers — L442](ecs-offload-workers.md#^ref-6498b9d7-442-0) (line 442, col 0, score 0.61)
- [lisp-dsl-for-window-management — L158](lisp-dsl-for-window-management.md#^ref-c5c5ff1c-158-0) (line 158, col 0, score 0.61)
- [Functional Refactor of TypeScript Document Processing — L115](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-115-0) (line 115, col 0, score 0.59)
- [Chroma-Embedding-Refactor — L6](chroma-embedding-refactor.md#^ref-8b256935-6-0) (line 6, col 0, score 0.59)
- [Interop and Source Maps — L505](interop-and-source-maps.md#^ref-cdfac40c-505-0) (line 505, col 0, score 0.59)
- [graph-ds — L361](graph-ds.md#^ref-6620e2f2-361-0) (line 361, col 0, score 0.62)
- [Refactor 05-footers.ts — L6](refactor-05-footers-ts.md#^ref-80d4d883-6-0) (line 6, col 0, score 0.61)
- [Refactor Frontmatter Processing — L7](refactor-frontmatter-processing.md#^ref-cfbdca2f-7-0) (line 7, col 0, score 0.61)
- [refactor-relations — L6](refactor-relations.md#^ref-41ce0216-6-0) (line 6, col 0, score 0.61)
- [Agent Tasks: Persistence Migration to DualStore — L84](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-84-0) (line 84, col 0, score 0.61)
- [Agent Tasks: Persistence Migration to DualStore — L92](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-92-0) (line 92, col 0, score 0.61)
- [RAG UI Panel with Qdrant and PostgREST — L358](rag-ui-panel-with-qdrant-and-postgrest.md#^ref-e1056831-358-0) (line 358, col 0, score 0.6)
- [Performance-Optimized-Polyglot-Bridge — L375](performance-optimized-polyglot-bridge.md#^ref-f5579967-375-0) (line 375, col 0, score 0.6)
- [Functional Refactor of TypeScript Document Processing — L114](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-114-0) (line 114, col 0, score 0.6)
- [2d-sandbox-field — L225](2d-sandbox-field.md#^ref-c710dc93-225-0) (line 225, col 0, score 1)
- [Admin Dashboard for User Management — L49](admin-dashboard-for-user-management.md#^ref-2901a3e9-49-0) (line 49, col 0, score 1)
- [Agent Reflections and Prompt Evolution — L150](agent-reflections-and-prompt-evolution.md#^ref-bb7f0835-150-0) (line 150, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L163](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-163-0) (line 163, col 0, score 1)
- [AI-First-OS-Model-Context-Protocol — L9](ai-first-os-model-context-protocol.md#^ref-618198f4-9-0) (line 9, col 0, score 1)
- [aionian-circuit-math — L179](aionian-circuit-math.md#^ref-f2d83a77-179-0) (line 179, col 0, score 1)
- [api-gateway-versioning — L304](api-gateway-versioning.md#^ref-0580dcd3-304-0) (line 304, col 0, score 1)
- [archetype-ecs — L479](archetype-ecs.md#^ref-8f4c1e86-479-0) (line 479, col 0, score 1)
- [Board Automation Improvements — L13](board-automation-improvements.md#^ref-ac60a1d6-13-0) (line 13, col 0, score 1)
- [DuckDuckGoSearchPipeline — L10](duckduckgosearchpipeline.md#^ref-e979c50f-10-0) (line 10, col 0, score 1)
- [Event Bus Projections Architecture — L169](event-bus-projections-architecture.md#^ref-cf6b9b17-169-0) (line 169, col 0, score 1)
- [Model Upgrade Calm-Down Guide — L63](model-upgrade-calm-down-guide.md#^ref-db74343f-63-0) (line 63, col 0, score 1)
- [NPU Voice Code and Sensory Integration — L10](npu-voice-code-and-sensory-integration.md#^ref-5a02283e-10-0) (line 10, col 0, score 1)
- [observability-infrastructure-setup — L391](observability-infrastructure-setup.md#^ref-b4e64f8c-391-0) (line 391, col 0, score 1)
- [Obsidian Templating Plugins Integration Guide — L111](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-111-0) (line 111, col 0, score 1)
- [OpenAPI Validation Report — L29](openapi-validation-report.md#^ref-5c152b08-29-0) (line 29, col 0, score 1)
- [Optimizing Command Limitations in System Design — L36](optimizing-command-limitations-in-system-design.md#^ref-98c8ff62-36-0) (line 36, col 0, score 1)
- [plan-update-confirmation — L1013](plan-update-confirmation.md#^ref-b22d79c6-1013-0) (line 1013, col 0, score 1)
- [pm2-orchestration-patterns — L252](pm2-orchestration-patterns.md#^ref-51932e7b-252-0) (line 252, col 0, score 1)
- [Admin Dashboard for User Management — L45](admin-dashboard-for-user-management.md#^ref-2901a3e9-45-0) (line 45, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L170](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-170-0) (line 170, col 0, score 1)
- [AI-Centric OS with MCP Layer — L416](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-416-0) (line 416, col 0, score 1)
- [AI-First-OS-Model-Context-Protocol — L11](ai-first-os-model-context-protocol.md#^ref-618198f4-11-0) (line 11, col 0, score 1)
- [aionian-circuit-math — L178](aionian-circuit-math.md#^ref-f2d83a77-178-0) (line 178, col 0, score 1)
- [api-gateway-versioning — L312](api-gateway-versioning.md#^ref-0580dcd3-312-0) (line 312, col 0, score 1)
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
- [2d-sandbox-field — L222](2d-sandbox-field.md#^ref-c710dc93-222-0) (line 222, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L177](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-177-0) (line 177, col 0, score 1)
- [AI-Centric OS with MCP Layer — L426](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-426-0) (line 426, col 0, score 1)
- [AI-First-OS-Model-Context-Protocol — L16](ai-first-os-model-context-protocol.md#^ref-618198f4-16-0) (line 16, col 0, score 1)
- [Board Automation Improvements — L20](board-automation-improvements.md#^ref-ac60a1d6-20-0) (line 20, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L215](chroma-toolkit-consolidation-plan.md#^ref-5020e892-215-0) (line 215, col 0, score 1)
- [Diagrams — L11](chunks/diagrams.md#^ref-45cd25b5-11-0) (line 11, col 0, score 1)
- [Operations — L9](chunks/operations.md#^ref-f1add613-9-0) (line 9, col 0, score 1)
- [eidolon-node-lifecycle — L63](eidolon-node-lifecycle.md#^ref-938eca9c-63-0) (line 63, col 0, score 1)
- [EidolonField — L269](eidolonfield.md#^ref-49d1e1e5-269-0) (line 269, col 0, score 1)
- [Event Bus MVP — L566](event-bus-mvp.md#^ref-534fe91d-566-0) (line 566, col 0, score 1)
- [Event Bus Projections Architecture — L185](event-bus-projections-architecture.md#^ref-cf6b9b17-185-0) (line 185, col 0, score 1)
- [Exception Layer Analysis — L165](exception-layer-analysis.md#^ref-21d5cc09-165-0) (line 165, col 0, score 1)
- [Factorio AI with External Agents — L160](factorio-ai-with-external-agents.md#^ref-a4d90289-160-0) (line 160, col 0, score 1)
- [field-dynamics-math-blocks — L165](field-dynamics-math-blocks.md#^ref-7cfc230d-165-0) (line 165, col 0, score 1)
- [field-interaction-equations — L184](field-interaction-equations.md#^ref-b09141b7-184-0) (line 184, col 0, score 1)
- [field-node-diagram-outline — L132](field-node-diagram-outline.md#^ref-1f32c94a-132-0) (line 132, col 0, score 1)
- [AI-Centric OS with MCP Layer — L427](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-427-0) (line 427, col 0, score 1)
- [AI-First-OS-Model-Context-Protocol — L13](ai-first-os-model-context-protocol.md#^ref-618198f4-13-0) (line 13, col 0, score 1)
- [aionian-circuit-math — L158](aionian-circuit-math.md#^ref-f2d83a77-158-0) (line 158, col 0, score 1)
- [api-gateway-versioning — L288](api-gateway-versioning.md#^ref-0580dcd3-288-0) (line 288, col 0, score 1)
- [archetype-ecs — L480](archetype-ecs.md#^ref-8f4c1e86-480-0) (line 480, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L178](chroma-toolkit-consolidation-plan.md#^ref-5020e892-178-0) (line 178, col 0, score 1)
- [Diagrams — L39](chunks/diagrams.md#^ref-45cd25b5-39-0) (line 39, col 0, score 1)
- [DSL — L41](chunks/dsl.md#^ref-e87bc036-41-0) (line 41, col 0, score 1)
- [JavaScript — L40](chunks/javascript.md#^ref-c1618c66-40-0) (line 40, col 0, score 1)
- [Math Fundamentals — L40](chunks/math-fundamentals.md#^ref-c6e87433-40-0) (line 40, col 0, score 1)
- [zero-copy-snapshots-and-workers — L363](zero-copy-snapshots-and-workers.md#^ref-62bec6f0-363-0) (line 363, col 0, score 1)
- [Simulation Demo — L32](chunks/simulation-demo.md#^ref-557309a3-32-0) (line 32, col 0, score 1)
- [Tooling — L26](chunks/tooling.md#^ref-6cb4943e-26-0) (line 26, col 0, score 1)
- [Window Management — L36](chunks/window-management.md#^ref-9e8ae388-36-0) (line 36, col 0, score 1)
- [compiler-kit-foundations — L639](compiler-kit-foundations.md#^ref-01b21543-639-0) (line 639, col 0, score 1)
- [Creative Moments — L10](creative-moments.md#^ref-10d98225-10-0) (line 10, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L258](cross-language-runtime-polymorphism.md#^ref-c34c36a6-258-0) (line 258, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L215](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-215-0) (line 215, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L50](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-50-0) (line 50, col 0, score 1)
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
- [DuckDuckGoSearchPipeline — L16](duckduckgosearchpipeline.md#^ref-e979c50f-16-0) (line 16, col 0, score 1)
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

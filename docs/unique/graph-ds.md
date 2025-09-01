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
related_to_title:
  - promethean-system-diagrams
  - layer-1-uptime-diagrams
  - archetype-ecs
  - eidolon-node-lifecycle
  - typed-struct-compiler
  - Event Bus Projections Architecture
  - 'Agent Tasks: Persistence Migration to DualStore'
  - field-node-diagram-outline
  - template-based-compilation
  - compiler-kit-foundations
  - Unique Info Dump Index
  - 2d-sandbox-field
  - Eidolon Field Abstract Model
  - EidolonField
  - JavaScript
  - ecs-offload-workers
  - ecs-scheduler-and-prefabs
  - Language-Agnostic Mirror System
  - Factorio AI with External Agents
  - field-node-diagram-set
  - balanced-bst
  - AI-Centric OS with MCP Layer
  - AI-First-OS-Model-Context-Protocol
related_to_uuid:
  - b51e19b4-1326-4311-9798-33e972bf626c
  - 4127189a-e0ab-436f-8571-cc852b8e9add
  - 8f4c1e86-1236-4936-84ca-6ed7082af6b7
  - 938eca9c-97e2-4bcc-8653-b0ef1a5ac7a3
  - 78eeedf7-75bc-4692-a5a7-bb6857270621
  - cf6b9b17-bb91-4219-aa5c-172cba02b2da
  - 93d2ba51-8689-49ee-94e2-296092e48058
  - 1f32c94a-4da4-4266-8ac0-6c282cfb401f
  - f8877e5e-1e4f-4478-93cd-a0bf86d26a41
  - 01b21543-7e03-4129-8fe4-b6306be69dee
  - 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
  - c710dc93-9fec-471b-bdee-bedbd360c67f
  - 5e8b2388-022b-46cf-952c-36ae9b8f0037
  - 49d1e1e5-5d13-4955-8f6f-7676434ec462
  - c1618c66-f73a-4e04-9bfa-ef38755f7acc
  - 6498b9d7-bd35-4bd3-89fb-af1c415c3cd1
  - c62a1815-c43b-4a3b-88e6-d7fa008a155e
  - d2b3628c-6cad-4664-8551-94ef8280851d
  - a4d90289-798d-44a0-a8e8-a055ae12fb52
  - 22b989d5-f4aa-4880-8632-709c21830f83
  - d3e7db72-2e07-4dae-8920-0e07c499a1e5
  - 0f1f8cc1-b5a6-4307-a40d-78de3adafca2
  - 618198f4-cfad-4677-9df6-0640d8a97bae
references: []
---
Note: Consolidated here → ../notes/js/graph-ds.md

Heard. Here’s a clean, **reusable Graph** you can drop in as `shared/js/prom-lib/ds/graph.ts`. It’s generic, fast, and batteries-included (BFS/DFS, Dijkstra, A\*, topo sort, CC/SCC, JSON import/export). Works for directed or undirected graphs, supports per-node/edge metadata, and keeps weights optional.

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

## Quick usage

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
```

## Sibilant-style sugar (pseudo)

```lisp
; shared/sibilant/prom/ds/graph.sib (pseudo)
(defn make-graph [& {:directed false}] (new Graph {:directed directed}))
(defn add-node! [g id data] (.addNode g id data))
(defn add-edge! [g u v & {:weight 1 :data nil}] (.addEdge g u v {:weight weight :data data}))
(defn bfs [g start] (.bfs g start))
(defn dijkstra [g src dst] (.shortestPathDijkstra g src dst))
```

## Notes

* All core ops are **O(1)** average (Map).
* `bfs/dfs`: **O(V+E)**
* `dijkstra`: **O((V+E) log V)** (binary heap)
* `aStar`: same, with heuristic.
* `topologicalSort`: errors on cycles by design.
* `connectedComponents`: for undirected only; use `stronglyConnectedComponents` on directed.

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
## Sources
- _None_
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->

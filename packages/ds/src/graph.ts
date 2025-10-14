// shared/ts/prom-lib/ds/graph.ts
// GPL3. Zero deps. Node + browser safe.

export type Id = string | number;

export type NodeRecord<ND = unknown> = {
    id: Id;
    data?: ND;
};

// FSM-specific node data types
export interface StateNodeData {
    type: 'state';
    accepting?: boolean;
    initial?: boolean;
    final?: boolean;
    metadata?: Record<string, unknown>;
}

export interface TransitionEventData {
    type: 'transition';
    event?: string;
    guard?: string;
    action?: string;
    weight?: number;
    condition?: string;
}

// FSM-specific edge data type
export type TransitionEdgeData = TransitionEventData | undefined;

export type EdgeRecord<ED = unknown> = {
    u: Id;
    v: Id;
    weight?: number; // default = 1
    data?: ED;
};

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
    hasNode(id: Id): boolean {
        return this.nodesMap.has(id);
    }
    getNode(id: Id): ND | undefined {
        return this.nodesMap.get(id);
    }
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
    countNodes(): number {
        return this.nodesMap.size;
    }
    *nodes(): IterableIterator<NodeRecord<ND>> {
        for (const [id, data] of this.nodesMap) yield { id, data };
    }
    //#endregion

    //#region edge ops
    addEdge(u: Id, v: Id, opts: { weight?: number; data?: ED; overwrite?: boolean } = {}): this {
        const w = opts.weight ?? 1;
        this.addNode(u);
        this.addNode(v);
        const row = this.adj.get(u)!;
        if (!row.has(v) || opts.overwrite) row.set(v, { weight: w, data: opts.data });
        if (!this.directed) {
            const back = this.adj.get(v)!;
            if (!back.has(u) || opts.overwrite) back.set(u, { weight: w, data: opts.data });
        }
        return this;
    }
    hasEdge(u: Id, v: Id): boolean {
        return this.adj.get(u)?.has(v) ?? false;
    }
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
    degree(u: Id): number {
        return this.adj.get(u)?.size ?? 0;
    }
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
    bfs(start: Id, stop?: (id: Id) => boolean): { parent: Map<Id, Id | null>; order: Id[] } {
        if (!this.hasNode(start)) throw new Error(`start node ${String(start)} missing`);
        const q: Id[] = [start];
        const parent = new Map<Id, Id | null>([[start, null]]);
        const order: Id[] = [];
        while (q.length) {
            const u = q.shift()!;
            order.push(u);
            if (stop && stop(u)) break;
            for (const [v] of this.neighbors(u)) {
                if (!parent.has(v)) {
                    parent.set(v, u);
                    q.push(v);
                }
            }
        }
        return { parent, order };
    }

    dfs(start: Id, stop?: (id: Id) => boolean): { parent: Map<Id, Id | null>; order: Id[] } {
        if (!this.hasNode(start)) throw new Error(`start node ${String(start)} missing`);
        const st: Id[] = [start];
        const parent = new Map<Id, Id | null>([[start, null]]);
        const order: Id[] = [];
        while (st.length) {
            const u = st.pop()!;
            order.push(u);
            if (stop && stop(u)) break;
            for (const [v] of Array.from(this.neighbors(u)).reverse()) {
                if (!parent.has(v)) {
                    parent.set(v, u);
                    st.push(v);
                }
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

        for (const { id } of this.nodes()) {
            dist.set(id, Infinity);
            prev.set(id, null);
        }
        if (!this.hasNode(src)) throw new Error(`src ${String(src)} missing`);
        dist.set(src, 0);
        pq.push([src, 0]);

        while (!pq.empty()) {
            const [u, d] = pq.pop()!;
            if (d !== dist.get(u)) continue; // stale
            if (dst !== undefined && u === dst) break;
            for (const [v, cell] of this.neighbors(u)) {
                const w = weightOf ? weightOf(u, v, cell.weight) : cell.weight;
                const nd = d + w;
                if (nd < (dist.get(v) ?? Infinity)) {
                    dist.set(v, nd);
                    prev.set(v, u);
                    pq.push([v, nd]);
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
        for (const { id } of this.nodes()) {
            g.set(id, Infinity);
            prev.set(id, null);
        }
        g.set(src, 0);
        open.push([src, h(src)]);

        while (!open.empty()) {
            const [u] = open.pop()!;
            if (u === dst) break;
            const gu = g.get(u)!;
            for (const [v, cell] of this.neighbors(u)) {
                const w = weightOf ? weightOf(u, v, cell.weight) : cell.weight;
                const cand = gu + w;
                if (cand < (g.get(v) ?? Infinity)) {
                    g.set(v, cand);
                    prev.set(v, u);
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
        if (!this.directed) throw new Error('topologicalSort requires directed graph');
        const indeg = new Map<Id, number>();
        for (const { id } of this.nodes()) indeg.set(id, 0);
        for (const { v } of this.edges()) indeg.set(v, (indeg.get(v) ?? 0) + 1);
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
        if (out.length !== this.countNodes()) throw new Error('graph has at least one cycle');
        return out;
    }

    connectedComponents(): Id[][] {
        if (this.directed) throw new Error('connectedComponents expects undirected graph');
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
        if (!this.directed) throw new Error('SCC expects directed graph');
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
            seen2.add(u);
            acc.push(u);
            for (const [v] of g.neighbors(u)) if (!seen2.has(v)) dfs2(g, v, acc);
        };
        for (let i = order.length - 1; i >= 0; i--) {
            const u = order[i];
            if (!seen2.has(u)) {
                const acc: Id[] = [];
                dfs2(gt, u, acc);
                comps.push(acc);
            }
        }
        return comps;
    }
    //#endregion

    //#region serialization / utils
    toJSON(): {
        directed: boolean;
        nodes: NodeRecord<ND>[];
        edges: EdgeRecord<ED>[];
    } {
        return {
            directed: this.directed,
            nodes: Array.from(this.nodes()),
            edges: Array.from(this.edges()),
        };
    }
    static fromJSON<ND = unknown, ED = unknown>(j: {
        directed: boolean;
        nodes: NodeRecord<ND>[];
        edges: EdgeRecord<ED>[];
    }): Graph<ND, ED> {
        const g = new Graph<ND, ED>({ directed: j.directed });
        for (const n of j.nodes) g.addNode(n.id, n.data);
        for (const e of j.edges) g.addEdge(e.u, e.v, { weight: e.weight, data: e.data });
        return g;
    }
    clone(): Graph<ND, ED> {
        return Graph.fromJSON(this.toJSON());
    }
    //#endregion
}

//#region FSM-specific utility functions
/**
 * Create an FSM graph from basic Graph with state and transition data
 */
export function createFSMGraph<ND extends StateNodeData, ED extends TransitionEventData>(
    graph?: Graph<ND, ED>
): Graph<ND, ED> {
    return graph || new Graph<ND, ED>({ directed: true });
}

/**
 * Validate that a graph can be used as an FSM (has initial state, no cycles, etc.)
 */
export function validateFSMStructure<ND extends StateNodeData, ED extends TransitionEventData>(
    graph: Graph<ND, ED>
): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    const nodes = Array.from(graph.nodes());

    // Check for initial state
    const initialStates = nodes.filter(({ data }) => data?.initial);
    if (initialStates.length === 0) {
        errors.push('FSM must have exactly one initial state');
    } else if (initialStates.length > 1) {
        errors.push(`FSM must have exactly one initial state, found ${initialStates.length}`);
    }

    // Check for cycles in directed graph
    if (graph.directed) {
        try {
            graph.topologicalSort();
        } catch {
            errors.push('FSM contains cycles, which makes it non-deterministic');
        }
    }

    // Check for unreachable states
    if (initialStates.length === 1) {
        const initialId = initialStates[0].id;
        const reachable = graph.bfs(initialId).order;
        const unreachable = nodes.filter(({ id }) => !reachable.includes(id));
        if (unreachable.length > 0) {
            errors.push(`Unreachable states: ${unreachable.map(n => n.id).join(', ')}`);
        }
    }

    return {
        valid: errors.length === 0,
        errors
    };
}

/**
 * Export a graph as Mermaid flowchart for FSM visualization
 */
export function graphToMermaid<ND extends StateNodeData, ED extends TransitionEventData>(
    graph: Graph<ND, ED>
): string {
    const lines: string[] = graph.directed ? ['graph TD'] : ['graph LR'];

    // Add state definitions
    for (const { id, data } of graph.nodes()) {
        let label = id.toString();
        if (data?.initial) label = `((${label}))`; // Circle for initial
        else if (data?.accepting || data?.final) label = `(${label})`; // Rounded for final
        else label = `[${label}]`; // Square for regular states

        lines.push(`    ${id}${label}`);
    }

    // Add transitions
    for (const edge of graph.edges()) {
        let label = '';
        if (edge.data?.event) {
            label = `| ${edge.data.event}`;
            if (edge.data?.guard) label += ` [${edge.data.guard}]`;
            if (edge.data?.action) label += ` / ${edge.data.action}`;
        }
        const arrow = graph.directed ? '-->' : '---';
        lines.push(`    ${edge.u} ${arrow}${label} ${edge.v}`);
    }

    return lines.join('\n');
}
//#endregion

// Tiny binary heap for Dijkstra/A*
class MinHeap<T> {
    private a: T[] = [];
    private cmp: (x: T, y: T) => number;
    constructor(cmp: (x: T, y: T) => number) {
        this.cmp = cmp;
    }
    size() {
        return this.a.length;
    }
    empty() {
        return this.a.length === 0;
    }
    push(v: T) {
        this.a.push(v);
        this.up(this.a.length - 1);
    }
    pop(): T | undefined {
        if (!this.a.length) return undefined;
        const top = this.a[0],
            end = this.a.pop()!;
        if (this.a.length) {
            this.a[0] = end;
            this.down(0);
        }
        return top;
    }
    private up(i: number) {
        while (i) {
            const p = (i - 1) >> 1;
            if (this.cmp(this.a[i], this.a[p]) >= 0) break;
            [this.a[i], this.a[p]] = [this.a[p], this.a[i]];
            i = p;
        }
    }
    private down(i: number) {
        const n = this.a.length;
        while (true) {
            let l = (i << 1) + 1,
                r = l + 1,
                s = i;
            if (l < n && this.cmp(this.a[l], this.a[s]) < 0) s = l;
            if (r < n && this.cmp(this.a[r], this.a[s]) < 0) s = r;
            if (s === i) break;
            [this.a[i], this.a[s]] = [this.a[s], this.a[i]];
            i = s;
        }
    }
}

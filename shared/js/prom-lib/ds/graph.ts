export interface Node<T> {
  id: string;
  data?: T;
}

export interface Edge<E> {
  from: string;
  to: string;
  weight: number;
  data?: E;
}

interface BFSResult {
  order: string[];
}

interface DFSResult {
  order: string[];
}

interface DijkstraResult {
  distances: Record<string, number>;
  previous: Record<string, string | null>;
}

export class Graph<N = unknown, E = unknown> {
  readonly directed: boolean;
  private nodes: Map<string, N> = new Map();
  private edges: Map<string, Map<string, { weight: number; data?: E }>> =
    new Map();

  constructor(opts: { directed?: boolean } = {}) {
    this.directed = opts.directed ?? true;
  }

  addNode(id: string, data?: N): this {
    if (!this.nodes.has(id)) {
      this.nodes.set(id, data as N);
      this.edges.set(id, new Map());
    }
    return this;
  }

  addEdge(from: string, to: string, weight = 1, data?: E): this {
    if (!this.nodes.has(from) || !this.nodes.has(to)) {
      throw new Error("Both nodes must exist before adding an edge");
    }
    this.edges.get(from)!.set(to, { weight, data });
    if (!this.directed) {
      this.edges.get(to)!.set(from, { weight, data });
    }
    return this;
  }

  neighbors(id: string): string[] {
    return Array.from(this.edges.get(id)?.keys() ?? []);
  }

  bfs(start: string): BFSResult {
    const visited = new Set<string>();
    const queue: string[] = [start];
    const order: string[] = [];
    visited.add(start);
    while (queue.length) {
      const v = queue.shift()!;
      order.push(v);
      for (const n of this.neighbors(v)) {
        if (!visited.has(n)) {
          visited.add(n);
          queue.push(n);
        }
      }
    }
    return { order };
  }

  dfs(start: string): DFSResult {
    const visited = new Set<string>();
    const order: string[] = [];
    const visit = (v: string) => {
      visited.add(v);
      order.push(v);
      for (const n of this.neighbors(v)) {
        if (!visited.has(n)) visit(n);
      }
    };
    visit(start);
    return { order };
  }

  dijkstra(start: string): DijkstraResult {
    const distances: Record<string, number> = {};
    const previous: Record<string, string | null> = {};
    const pq = new Set<string>(this.nodes.keys());
    for (const n of pq) {
      distances[n] = n === start ? 0 : Infinity;
      previous[n] = null;
    }
    while (pq.size) {
      let u: string | null = null;
      let min = Infinity;
      for (const n of pq) {
        if (distances[n] < min) {
          min = distances[n];
          u = n;
        }
      }
      if (u === null) break;
      pq.delete(u);
      for (const [v, { weight }] of this.edges.get(u) ?? []) {
        const alt = distances[u] + weight;
        if (alt < distances[v]) {
          distances[v] = alt;
          previous[v] = u;
        }
      }
    }
    return { distances, previous };
  }

  topoSort(): string[] {
    if (!this.directed)
      throw new Error("Topological sort requires directed graph");
    const visited = new Set<string>();
    const temp = new Set<string>();
    const result: string[] = [];
    const visit = (n: string) => {
      if (temp.has(n)) throw new Error("Graph has cycles");
      if (!visited.has(n)) {
        temp.add(n);
        for (const m of this.neighbors(n)) visit(m);
        temp.delete(n);
        visited.add(n);
        result.push(n);
      }
    };
    for (const n of this.nodes.keys()) visit(n);
    return result.reverse();
  }

  connectedComponents(): string[][] {
    if (this.directed)
      throw new Error("Use stronglyConnectedComponents for directed graphs");
    const visited = new Set<string>();
    const comps: string[][] = [];
    for (const n of this.nodes.keys()) {
      if (!visited.has(n)) {
        const { order } = this.bfs(n);
        order.forEach((v) => visited.add(v));
        comps.push(order);
      }
    }
    return comps;
  }

  stronglyConnectedComponents(): string[][] {
    if (!this.directed) throw new Error("SCC only for directed graphs");
    const visited = new Set<string>();
    const stack: string[] = [];
    const dfs1 = (v: string) => {
      visited.add(v);
      for (const n of this.neighbors(v)) if (!visited.has(n)) dfs1(n);
      stack.push(v);
    };
    for (const n of this.nodes.keys()) if (!visited.has(n)) dfs1(n);
    // transpose graph
    const gt = new Graph<N, E>({ directed: true });
    for (const [id, data] of this.nodes) gt.addNode(id, data);
    for (const [u, outs] of this.edges)
      for (const [v, e] of outs) gt.addEdge(v, u, e.weight, e.data);
    visited.clear();
    const comps: string[][] = [];
    const dfs2 = (v: string, comp: string[]) => {
      visited.add(v);
      comp.push(v);
      for (const n of gt.neighbors(v)) if (!visited.has(n)) dfs2(n, comp);
    };
    while (stack.length) {
      const v = stack.pop()!;
      if (!visited.has(v)) {
        const comp: string[] = [];
        dfs2(v, comp);
        comps.push(comp);
      }
    }
    return comps;
  }

  toJSON(): { directed: boolean; nodes: Node<N>[]; edges: Edge<E>[] } {
    const nodes: Node<N>[] = [];
    for (const [id, data] of this.nodes) nodes.push({ id, data });
    const edges: Edge<E>[] = [];
    for (const [u, outs] of this.edges)
      for (const [v, e] of outs)
        edges.push({ from: u, to: v, weight: e.weight, data: e.data });
    return { directed: this.directed, nodes, edges };
  }

  static fromJSON<N = unknown, E = unknown>(json: {
    directed: boolean;
    nodes: Node<N>[];
    edges: Edge<E>[];
  }): Graph<N, E> {
    const g = new Graph<N, E>({ directed: json.directed });
    for (const n of json.nodes) g.addNode(n.id, n.data);
    for (const e of json.edges) g.addEdge(e.from, e.to, e.weight, e.data);
    return g;
  }
}

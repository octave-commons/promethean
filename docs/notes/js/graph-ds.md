Generic Graph DS for JS/TS: directed/undirected, node/edge metadata, BFS/DFS, Dijkstra, A*, topo sort, CC/SCC, JSON import/export. Zero deps, Node + browser safe.

Suggested path: `shared/js/prom-lib/ds/graph.ts`.

Usage:
```ts
import { Graph } from "./graph";
const g = new Graph({ directed: false });
g.addNode("A").addNode("B").addEdge("A","B");
const { order } = g.bfs("A");
```

Notes:
- BFS/DFS OV+E; Dijkstra/A* O(V+E) log V
- Topo sort errors on cycles (by design)
- SCC via Kosaraju

Related: [archetype-ecs] [../../unique/index|unique/index]

#tags: #js #algorithms #graph


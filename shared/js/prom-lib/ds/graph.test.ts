import { Graph } from "./graph";

describe("Graph", () => {
  test("bfs traverses undirected graph", () => {
    const g = new Graph({ directed: false });
    g.addEdge("A", "B").addEdge("B", "C");
    const { order } = g.bfs("A");
    expect(order).toEqual(["A", "B", "C"]);
  });

  test("shortestPathDijkstra finds shortest path", () => {
    const g = new Graph({ directed: true });
    g.addEdge("A", "B", { weight: 1 })
      .addEdge("A", "C", { weight: 5 })
      .addEdge("B", "C", { weight: 1 });
    const { distance, path } = g.shortestPathDijkstra("A", "C");
    expect(distance).toBe(2);
    expect(path).toEqual(["A", "B", "C"]);
  });
});

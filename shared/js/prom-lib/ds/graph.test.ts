import { Graph } from "./graph";

describe("Graph", () => {
  test("bfs traverses undirected graph", () => {
    const g = new Graph({ directed: false });
    g.addNode("A").addNode("B").addNode("C");
    g.addEdge("A", "B");
    g.addEdge("B", "C");
    const { order } = g.bfs("A");
    expect(order).toEqual(["A", "B", "C"]);
  });

  test("dijkstra finds shortest paths", () => {
    const g = new Graph({ directed: true });
    g.addNode("A").addNode("B").addNode("C");
    g.addEdge("A", "B", { weight: 1 });
    g.addEdge("A", "C", { weight: 5 });
    g.addEdge("B", "C", { weight: 1 });
    const res = g.shortestPathDijkstra("A", "C") as {
      distance: number;
      path: (string | number)[];
    };
    expect(res.distance).toBe(2);
  });
});

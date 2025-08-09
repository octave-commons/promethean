import { Graph } from "./graph";

describe("Graph", () => {
  test("bfs traverses undirected graph", () => {
    const g = new Graph({ directed: false });
    g.addNode("A").addNode("B").addNode("C");
    g.addEdge("A", "B").addEdge("B", "C");
    const { order } = g.bfs("A");
    expect(order).toEqual(["A", "B", "C"]);
  });

  test("dijkstra finds shortest paths", () => {
    const g = new Graph({ directed: true });
    g.addNode("A").addNode("B").addNode("C");
    g.addEdge("A", "B", 1).addEdge("A", "C", 5).addEdge("B", "C", 1);
    const { distances } = g.dijkstra("A");
    expect(distances["C"]).toBe(2);
  });
});

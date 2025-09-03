import test from 'ava';
import { Graph } from './graph.js';

test('Graph: bfs traverses undirected graph', (t) => {
    const g = new Graph({ directed: false });
    g.addNode('A').addNode('B').addNode('C');
    g.addEdge('A', 'B');
    g.addEdge('B', 'C');
    const { order } = g.bfs('A');
    t.deepEqual(order, ['A', 'B', 'C']);
});

test('Graph: dijkstra finds shortest paths', (t) => {
    const g = new Graph({ directed: true });
    g.addNode('A').addNode('B').addNode('C');
    g.addEdge('A', 'B', { weight: 1 });
    g.addEdge('A', 'C', { weight: 5 });
    g.addEdge('B', 'C', { weight: 1 });
    const res = g.shortestPathDijkstra('A', 'C') as {
        distance: number;
        path: (string | number)[];
    };
    t.is(res.distance, 2);
});

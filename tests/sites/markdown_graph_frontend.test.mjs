import test from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import { fetchGraph } from "../../sites/markdown-graph/graph.mjs";

test("fetchGraph collects nodes and links", async () => {
  const routes = {
    "/links/readme.md": { links: ["docs/a.md"] },
    "/links/docs/a.md": { links: [] },
  };

  const server = http.createServer((req, res) => {
    const data = routes[req.url];
    if (!data) {
      res.statusCode = 404;
      res.end();
      return;
    }
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(data));
  });

  await new Promise((resolve) => server.listen(0, resolve));
  const { port } = server.address();
  const baseUrl = `http://127.0.0.1:${port}`;
  const graph = await fetchGraph(baseUrl);
  server.close();

  assert.deepEqual(graph, {
    nodes: [{ id: "readme.md" }, { id: "docs/a.md" }],
    links: [{ source: "readme.md", target: "docs/a.md" }],
  });
});

// Fetch a transitive closure of markdown links starting at `readme.md`.
// Returns a simple `{ nodes, links }` object ready for ForceGraph.
export async function fetchGraph(baseUrl = "") {
  const visited = new Set();
  const nodes = [];
  const links = [];
  const queue = ["readme.md"];
  while (queue.length) {
    const path = queue.shift();
    if (visited.has(path)) continue;
    visited.add(path);
    nodes.push({ id: path });
    try {
      const res = await fetch(`${baseUrl}/links/${encodeURIComponent(path)}`);
      if (!res.ok) continue;
      const data = await res.json();
      for (const target of data.links || []) {
        links.push({ source: path, target });
        if (!visited.has(target)) queue.push(target);
      }
    } catch (err) {
      // Swallow network errors to allow partial graphs
    }
  }
  return { nodes, links };
}

// Render the graph into a DOM element or CSS selector.
// Uses the ForceGraph library loaded from a CDN at runtime.
export async function renderGraph(selector, baseUrl = "") {
  const ForceGraph = (
    await import("https://unpkg.com/force-graph@1.45.0/dist/force-graph.esm.js")
  ).default;
  const element =
    typeof selector === "string" ? document.querySelector(selector) : selector;
  const data = await fetchGraph(baseUrl);
  const graph = ForceGraph()(element);
  graph
    .graphData(data)
    .nodeId("id")
    .nodeLabel("id")
    .linkSource("source")
    .linkTarget("target");
  return graph;
}

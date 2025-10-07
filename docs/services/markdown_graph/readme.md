# Markdown Graph Service

Maintains a graph of markdown links and `#hashtags` using the shared DualStore $MongoDB + Chroma$ and ContextStore.

### Task Queue

- `markdown_graph.update` – enqueue `{ path, content }` to update the graph.

### Endpoints

- `GET /links/{path}` – return links from the given markdown file.
- `GET /hashtags/{tag}` – return all files referencing the tag.

Implemented in TypeScript at `services/ts/markdown-graph`. A `POST /update`
route remains for manual testing but production updates flow through the task
queue.

#markdown #service

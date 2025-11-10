# @promethean-os/opencode-hub

**GPL-3.0-only**

Continuously watches a directory tree (default `~/devel`) to detect *any* nested git work trees. For each repo found, it spawns an **opencode** server on a unique port, indexes sessions and GitHub issues/PRs into a RAG context store (via `@promethean-os/persistence`), and serves a **Shadow CLJS** UI as a universal hub.

## Highlights

- Zero-assumption discovery of nests-on-nests git repos (.git dir or file).
- Per‑repo **opencode** server lifecycle manager with dynamic port allocation.
- Hub API with **WebSocket** chat bus and HTTP proxy to each opencode instance.
- RAG indexing surface with GitHub issues/PRs per repo (requires `GITHUB_TOKEN` for best results).
- Agent adapter layer for `@promethean-os/pantheon` + task commits via `@promethean-os/kanban`.
- Shadow CLJS/Reagent front‑end at `/ui/`.

## Install

```bash
pnpm i
cp .env.example .env
# edit .env if needed
```

## Dev

In one terminal:

```bash
pnpm dev
```

In another (for the UI auto-compiler):

```bash
pnpm ui:watch
```

Then open: `http://localhost:${HUB_PORT:-4799}/ui/index.html`.

## Configure

- `ROOT_DIR` — root directory to watch. Default: `~/devel`.
- `OPENCODE_BIN`/`OPENCODE_ARGS` — how to run your opencode server; hub appends repo root and port.
- `OPENCODE_BASE_PORT` — starting port to allocate per-repo.
- `GITHUB_TOKEN` — GitHub API token for indexing issues and PRs.

## Notes

- The **persistence** and **pantheon/kanban** adapters are intentionally thin. Wire them to your packages' real APIs.
- The GitHub indexer is conservative (50 issues/PRs each). Tune as desired.
- The hub’s chat is a stub echo — replace with your enriched RAG + agent pipeline.

## Scripts

- `pnpm dev` — run hub (TS directly via `tsx`).
- `pnpm start` — same as dev for now.
- `pnpm build` — compile TS to `dist/`.
- `pnpm ui:watch` — `shadow-cljs watch app`.
- `pnpm ui:release` — `shadow-cljs release app`.

## Architecture

```mermaid
flowchart LR
  subgraph Watcher & Indexers
    D[Repo Discovery\n(chokidar + BFS)]
    G[GitHub Indexer\nissues + PRs]
    P[Persistence Sink\n@promethean-os/persistence]
  end

  subgraph Hub (Fastify)
    H[/REST + WS/]
    X[Reverse Proxy\n/per-repo -> opencode]
  end

  subgraph Agent Layer
    A[Pantheon Router]
    K[Kanban Tasks]
  end

  subgraph UI (Shadow CLJS/Reagent)
    U[Universal Panel]
  end

  D -->|spawn per repo| X
  D -->|emit sessions| P
  G -->|docs| P
  H <--> U
  H --> A --> K
  U --> H
  X --- H
```

---

*Built with assistance from an AI.*
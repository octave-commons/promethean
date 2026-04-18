# Quartz Garden — Cephalon Hive import graphs

This folder contains **file-level import graphs** (and higher-level subsystem summaries) so you can *see* how the Cephalon Hive codebase hangs together.

## What’s here

### Cephalon TS (packages/cephalon-ts/src)
- `cephalon-ts.imports.{dot,svg,png}` — full file→file import graph (tests excluded by default)
- `cephalon-ts.subsystems.{dot,svg,png}` — directory/subsystem summary graph (edge labels = number of cross-subsystem imports)
- `cephalon-ts.entry.*.{dot,svg,png}` — entrypoint-focused subgraphs (reachable imports from each entry file)

### JSON artifacts
- `cephalon-ts.imports.json` — nodes + edges (for building other visualizations)
- `cephalon-ts.subsystems.json` — aggregated subsystem view

## Regenerate

From repo root:

```bash
node services/cephalon-hive/quartz-garden/build-import-graphs.mjs \
  --root packages/cephalon-ts/src \
  --out services/cephalon-hive/quartz-garden
```

Include tests (makes the graph much noisier):

```bash
node services/cephalon-hive/quartz-garden/build-import-graphs.mjs --include-tests
```

## View

Open the generated `*.svg` or `*.png` files in your browser / image viewer.

Tip: start with `cephalon-ts.subsystems.svg` to get your bearings, then jump into the full graph.

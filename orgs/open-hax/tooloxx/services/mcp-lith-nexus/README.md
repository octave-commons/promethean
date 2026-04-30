# mcp-lith-nexus

Lith-first MCP server for this repository.

## What it does

- indexes Lith/Lisp/Markdown roots from `mcp.lith-nexus.config.lith`
- serves raw repo files and derived Nexus graph resources as Lith text
- exposes MCP tools for search, read, graph query, and deterministic write paths
- keeps writes in-repo so git remains the continuity medium
- reuses the `part64` Python-side Lith/Nexus snapshot so MCP queries the same first-class fact graph instead of a parallel index

## Commands

```bash
npm install
npm run typecheck
npm test
npm start
npm run start:http
```

By default the server uses stdio transport and the current working directory as the repo root.

Optional environment variables:

- `LITH_NEXUS_REPO_ROOT` - override the repo root to index
- `LITH_NEXUS_PYTHON_WORKDIR` - override the `part64` Python workdir used for snapshot generation
- `LITH_NEXUS_HTTP_HOST` - override the Streamable HTTP bind host
- `LITH_NEXUS_HTTP_PORT` - override the Streamable HTTP bind port
- `LITH_NEXUS_HTTP_PATH` - override the Streamable HTTP MCP path (default `/mcp`)

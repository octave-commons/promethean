# @promethean/mcp

Single MCP server module with composable, pure tools. ESM-only, Fastify HTTP transport + stdio.

## Run

```bash
export MCP_CONFIG_JSON='{"transport":"http","tools":["github.request","github.graphql","github.rate-limit"]}'
pnpm --filter @promethean/mcp dev
```

## Design

- Functional, pure tool factories (`(ctx) => { spec, invoke }`).
- No mutation. DI via `ToolContext`.
- ESM-only with `.js` import suffixes in TS source.
- Fastify HTTP transport and stdio transport.
- Tools are selected at runtime via `MCP_CONFIG_JSON`.

## Status

This is a scaffold extracted to consolidate multiple MCP servers into one package. GitHub tools live under `src/tools/github/*`.

# @promethean/mcp

Single MCP server module with composable, pure tools. ESM-only, Fastify HTTP transport + stdio.

## Run

### Config options

You can now configure via **file** or **env** (env kept for back-compat):

1. **Explicit file path** (highest precedence)
   ```bash
   pnpm --filter @promethean/mcp dev -- --config ./promethean.mcp.json
   # or
   pnpm --filter @promethean/mcp dev -- -c ./config/mcp.json
   ```
2. **Auto-detect** `promethean.mcp.json` by walking up from `cwd`.
3. **Legacy env**: `MCP_CONFIG_JSON` containing JSON.

### Example config file
```json
{
  "transport": "http",
  "tools": [
    "github.request",
    "github.graphql",
    "github.rate-limit",
    "files.list-directory",
    "files.tree-directory",
    "files.view-file",
    "files.write-content",
    "files.write-lines",
    "files.search",
    "discord.send-message",
    "discord.list-messages"
  ]
}
```

Run:
```bash
pnpm --filter @promethean/mcp dev -- --config ./promethean.mcp.json
```

## Design

- Functional, pure tool factories (`(ctx) => { spec, invoke }`).
- No mutation. DI via `ToolContext`.
- ESM-only with `.js` import suffixes in TS source.
- Fastify HTTP transport and stdio transport.
- Tools are selected at runtime via config file, autodetected, or `MCP_CONFIG_JSON`.

## Status

This is a scaffold extracted to consolidate multiple MCP servers into one package. GitHub tools live under `src/tools/github/*`.

## Tools
- files.search — grep-like content search returning path/line/snippet triples.
- discord.send-message — send a message to a Discord channel using the configured tenant + space URN.
- discord.list-messages — fetch paginated messages from a Discord channel.
- pnpm.install — run `pnpm install` with optional `--filter` targeting specific packages.
- pnpm.add — add dependencies, supporting workspace or filtered package scopes.
- pnpm.remove — remove dependencies from the workspace or filtered packages.
- pnpm.runScript — execute `pnpm run <script>` with optional extra args and filters.

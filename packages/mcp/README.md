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
    "files.search"
  ]
}
```

Run:
```bash
pnpm --filter @promethean/mcp dev -- --config ./promethean.mcp.json
```

### Exec command allowlist

`exec.run` executes only commands declared in an allowlist. The loader checks for:

1. `MCP_EXEC_CONFIG` → explicit JSON file path.
2. `MCP_EXEC_COMMANDS_JSON` → inline JSON payload.
3. Nearest `promethean.mcp.exec.json` when walking up from `cwd`.

Each config file looks like:

```json
{
  "defaultCwd": ".",
  "defaultTimeoutMs": 60000,
  "commands": [
    {
      "id": "git.status",
      "description": "Short git status from repo root",
      "command": "git",
      "args": ["status", "--short", "--branch"]
    }
  ]
}
```

Use `exec.list` to introspect the active allowlist at runtime.

## Design

- Functional, pure tool factories (`(ctx) => { spec, invoke }`).
- No mutation. DI via `ToolContext`.
- ESM-only with `.js` import suffixes in TS source.
- Fastify HTTP transport and stdio transport.
- Tools are selected at runtime via config file, autodetected, or `MCP_CONFIG_JSON`.

## Status

This is a scaffold extracted to consolidate multiple MCP servers into one package. GitHub tools live under `src/tools/github/*`.

## Tools
- exec.list — enumerate allowlisted shell commands and metadata.
- exec.run — run an allowlisted shell command with optional args when enabled.
- files.search — grep-like content search returning path/line/snippet triples.

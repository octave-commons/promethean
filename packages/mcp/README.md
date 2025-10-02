# @promethean/mcp

Single MCP server module with composable, pure tools. ESM-only, Fastify HTTP transport + stdio.

## Run

### Unified configuration

`@promethean/mcp` reads a single JSON manifest and optionally merges an EDN proxy catalog when the HTTP transport is active. The
loader resolves configuration in the following order (highest precedence first):

1. `--config` / `-c` CLI flag (path resolved from `cwd`).
2. Nearest `promethean.mcp.json` discovered by walking up from `cwd`.
3. Legacy `MCP_CONFIG_JSON` environment variable containing inline JSON.

When `transport` is set to `"http"`, the runtime binds every endpoint declared in the JSON manifest *and* boots stdio proxies
described in the optional `stdioProxyConfig` EDN file. Each EDN entry maps to a spawned stdio process that is exposed at the
declared `:http-path` (defaulting to `/<name>/mcp`).

### Example `promethean.mcp.json`

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
  ],
  "endpoints": {
    "github": { "tools": ["github.request", "github.graphql"] }
  },
  "stdioProxyConfig": "./config/mcp_servers.edn"
}
```

Running with this manifest will expose both the GitHub endpoint defined in JSON and any stdio servers declared in
`config/mcp_servers.edn` on the same Fastify instance:

```bash
pnpm --filter @promethean/mcp dev -- --config ./promethean.mcp.json
```

Each server will be available at `http://<host>:<port>/<name>/mcp` unless you set `:http-path` in the EDN entry. Use `--prefix` to prepend a base path (e.g., `/mcp`).

### Unified HTTP endpoints

The Fastify transport now binds both registry endpoints declared in
`promethean.mcp.json` and stdio proxies resolved from
`config/mcp_servers.edn` to the same HTTP server. Each endpoint descriptor
contributes a path: registry descriptors mount an MCP server created from the
configured tools, while proxy descriptors delegate directly to the underlying
`StdioHttpProxy`. When the transport starts it boots any stdio proxies before
listening, and shutdown waits for those proxies to exit before closing
Fastify.


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
- kanban.get-board — load the configured kanban board with all columns/tasks.
- kanban.get-column — fetch a single column from the board.
- kanban.find-task / kanban.find-task-by-title — locate tasks by UUID or exact title.
- kanban.update-status / kanban.move-task — move tasks between columns or reorder them.
- kanban.sync-board — reconcile board ordering with task markdown files.
- kanban.search — run fuzzy/exact search over board tasks.
- github.review.* — GitHub pull request management helpers (open PRs, fetch comments,
  submit reviews, inspect checks, and run supporting git commands).

## HTTP Endpoints

The default `promethean.mcp.json` defines multiple HTTP endpoints. A new
`/github/review` endpoint serves GitHub code review automation tools powered by the
GraphQL API:

```json
{
  "tools": [
    "github.review.openPullRequest",
    "github.review.getComments",
    "github.review.getReviewComments",
    "github.review.submitComment",
    "github.review.submitReview",
    "github.review.getActionStatus",
    "github.review.commit",
    "github.review.push",
    "github.review.checkoutBranch",
    "github.review.createBranch",
    "github.review.revertCommits"
  ]
}
```

All GitHub review tools require `GITHUB_TOKEN` (and optional
`GITHUB_GRAPHQL_URL`) to authenticate with GitHub's GraphQL API.
- discord.send-message — send a message to a Discord channel using the configured tenant + space URN.
- discord.list-messages — fetch paginated messages from a Discord channel.
- pnpm.install — run `pnpm install` with optional `--filter` targeting specific packages.
- pnpm.add — add dependencies, supporting workspace or filtered package scopes.
- pnpm.remove — remove dependencies from the workspace or filtered packages.
- pnpm.runScript — execute `pnpm run <script>` with optional extra args and filters.

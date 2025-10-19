# @promethean/mcp

Single MCP server module with composable, pure tools. ESM-only, Fastify HTTP transport + stdio.

## Run

### Configuration Loading

The MCP system uses a sophisticated configuration loader that supports multiple sources and provides robust validation. For complete documentation on configuration options, schema validation, and security features, see [[mcp-config-loader.md]].

### Unified configuration

`@promethean/mcp` reads a single JSON manifest and optionally merges an EDN proxy catalog when the HTTP transport is active. The
loader resolves configuration in the following order (highest precedence first):

1. `--config` / `-c` CLI flag (path resolved from `cwd`).
2. Nearest `promethean.mcp.json` discovered by walking up from `cwd`.
3. Legacy `MCP_CONFIG_JSON` environment variable containing inline JSON.

When `transport` is set to `"http"`, the runtime binds every endpoint declared in the JSON manifest _and_ boots stdio proxies
described in the optional `stdioProxyConfig` EDN file. Each EDN entry maps to a spawned stdio process that is exposed at the
declared `:http-path` (defaulting to `/<name>/mcp`).

### Example `promethean.mcp.json`

```json
{
  "transport": "http",
  "tools": [
    "github_request",
    "github_graphql",
    "github_rate_limit",
    "files_list_directory",
    "files_tree_directory",
    "files_view_file",
    "files_write_content",
    "files_write_lines",
    "files_search",
    "discord_send_message",
    "discord_list_messages"
  ],
  "endpoints": {
    "github": { "tools": ["github_request", "github_graphql"] }
  },
  "stdioProxyConfig": "./packages/mcp/examples/mcp_servers.edn"
}
```

Running with this manifest will expose both the GitHub endpoint defined in JSON and any stdio servers declared in
`packages/mcp/examples/mcp_servers.edn` on the same Fastify instance. Copy the example to `config/mcp_servers.edn` and
adjust paths as needed for your machine (the config path is gitignored). Edit the EDN file and regenerate manifests instead of
touching `promethean.mcp.json` by hand:

```bash
bb -m mk.mcp-cli push-all --edn config/mcp_servers.edn
pnpm --filter @promethean/mcp dev -- --config ./promethean.mcp.json
```

Each server will be available at `http://<host>:<port>/<name>/mcp` unless you set `:http-path` in the EDN entry. Use `--prefix` to prepend a base path (e.g., `/mcp`).

### Dev UI

The HTTP transport exposes a Web Components Dev UI compiled with `shadow-cljs`. Build once before running the server (or use watch mode while iterating):

```bash
pnpm --filter @promethean/mcp-dev-ui build
# or
pnpm --filter @promethean/mcp-dev-ui watch
```

The bundle is emitted to `packages/mcp/static/dev-ui` and served from `/ui/assets/main.js`.

### Canonical EDN representation

Editors and tooling share a canonical EDN document that now carries both stdio
server definitions and HTTP manifest data. The new `:http` map mirrors the
fields in `promethean.mcp.json` so that all transports can be edited from one
file:

```clojure
{:mcp-servers {:github {:command "./bin/github.sh"}
               :files {:command "./bin/files.sh" :args ["--stdio"]}}
 :http {:transport :http
        :tools ["files_view_file" "files_write_content"]
        :include-help? true
        :stdio-meta {:title "Default MCP Endpoint"
                     :workflow ["mcp_toolset" "mcp_validate_config"]
                     :expectations {:usage ["Call mcp_toolset before editing"]}}
        :endpoints {:files {:tools ["files_view_file" "files_write_content"]
                            :include-help? true
                            :meta {:description "Filesystem utilities"
                                   :expectations {:pitfalls ["Avoid binary writes"]}}}
                    :github/review {:tools ["github_pr_get" "github_review_push"]
                                    :include-help? true}}
        :proxy {:config "./config/mcp_servers.edn"}}
 :outputs [{:schema :mcp.json :path "./promethean.mcp.json"}]}
```

- `:transport`, `:tools`, and `:include-help?` reflect the defaults used when no
  explicit HTTP endpoint is requested.
- `:stdio-meta` describes the fallback `/mcp` endpoint metadata (titles,
  workflows, expectations, etc.).
- `:endpoints` maps HTTP paths to the toolset they expose, including per-endpoint
  metadata.
- `:proxy` carries options for stdio proxy discovery; `:config` maps directly to
  the JSON `stdioProxyConfig` field.

### Unified HTTP endpoints

The Fastify transport now binds both registry endpoints declared in
`promethean.mcp.json` and stdio proxies resolved from
`packages/mcp/examples/mcp_servers.edn` to the same HTTP server. Each endpoint descriptor
contributes a path: registry descriptors mount an MCP server created from the
configured tools, while proxy descriptors delegate directly to the underlying
`StdioHttpProxy`. When the transport starts it boots any stdio proxies before
listening, and shutdown waits for those proxies to exit before closing
Fastify.

### Exec command allowlist

`exec_run` executes only commands declared in an allowlist. The loader checks for:

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

Use `exec_list` to introspect the active allowlist at runtime.

## Security & Authorization

The MCP system includes a comprehensive Role-Based Access Control (RBAC framework to address security vulnerabilities. See [[authorization.md]] for complete documentation.

### Quick Setup

1. **Set user roles via environment variables:**

   ```bash
   export MCP_USER_ID=user123
   export MCP_USER_ROLE=developer  # guest | user | developer | admin
   ```

2. **Configure authorization settings:**

   ```bash
   export MCP_DEFAULT_ROLE=guest
   export MCP_STRICT_MODE=true
   export MCP_REQUIRE_AUTH_DANGEROUS=true
   ```

3. **Role hierarchy:**
   - **Guest**: Read-only access to safe operations
   - **User**: Read + write access to non-destructive operations
   - **Developer**: Read + write + delete access
   - **Admin**: Full access including system-level operations

### Key Security Features

- **Defense in Depth**: Role hierarchy, tool categorization, dangerous operation flagging
- **Comprehensive Auditing**: All tool invocations logged with full context
- **Fail-Safe Defaults**: Deny by default, guest restrictions, admin isolation

For detailed configuration options, testing procedures, and security best practices, see the complete [[authorization.md]] documentation.

## Design

- Functional, pure tool factories (`(ctx) => { spec, invoke }`).
- No mutation. DI via `ToolContext`.
- ESM-only with `.js` import suffixes in TS source.
- Fastify HTTP transport and stdio transport.
- Tools are selected at runtime via config file, autodetected, or `MCP_CONFIG_JSON`.

## Status

This is a scaffold extracted to consolidate multiple MCP servers into one package. GitHub tools live under `src/tools/github/*`.

## Tools

- exec_list — enumerate allowlisted shell commands and metadata.
- exec_run — run an allowlisted shell command with optional args when enabled.
- files_search — grep-like content search returning path/line/snippet triples.
- kanban_get_board — load the configured kanban board with all columns/tasks.
- kanban_get_column — fetch a single column from the board.
- kanban_find_task / kanban_find_task_by_title — locate tasks by UUID or exact title.
- kanban_update_status / kanban_move_task — move tasks between columns or reorder them.
- kanban_sync_board — reconcile board ordering with task markdown files.
- kanban_search — run fuzzy/exact search over board tasks.
- github*pr*\* — High-level pull request utilities, including metadata lookup
  (`github_pr_get`), diff file inspection (`github_pr_files`), inline position
  resolution (`github_pr_resolve_position`), and review lifecycle helpers for
  pending reviews (`github_pr_review_start` / `comment_inline` / `submit`). These
  wrap GitHub REST/GraphQL edge-cases like diff mapping and suggestion fences.
- github*review*\* — GitHub pull request management helpers (open PRs, fetch comments,
  submit reviews, inspect checks, and run supporting git commands). Includes
  `github_review_request_changes_from_codex`, which posts an issue-level PR comment that
  always tags `@codex` so the agent is notified when changes are requested.
- github_apply_patch — Apply a unified diff to a GitHub branch by committing through
  the GraphQL `createCommitOnBranch` mutation. Useful when the agent cannot write to
  the working tree but can craft patches to push upstream.

### Pull request review workflow

Agents can stitch the new tools together to run full reviews without crafting raw
payloads:

```jsonc
// 1) Create a pending review (optional body summarizing goals)
{ "tool": "github_pr_review_start", "pullRequestId": "PR_NODE_ID" }

// 2) Inline comment at new line 42 with an optional suggestion
{
  "tool": "github_pr_review_comment_inline",
  "owner": "octocat",
  "repo": "hello-world",
  "number": 123,
  "path": "src/app.ts",
  "line": 42,
  "body": "Nit: consider extracting this constant.",
  "suggestion": { "after": ["const value = computeValue();"] }
}

// 3) Submit the pending review as a request for changes
{
  "tool": "github_pr_review_submit",
  "reviewId": "PENDING_REVIEW_ID",
  "event": "REQUEST_CHANGES",
  "body": "See inline comments for details."
}
```

## HTTP Endpoints

The default `promethean.mcp.json` defines multiple HTTP endpoints. A new
`/github/review` endpoint serves GitHub code review automation tools powered by the
GraphQL API:

```json
{
  "tools": [
    "github_review_open_pull_request",
    "github_review_get_comments",
    "github_review_get_review_comments",
    "github_pr_get",
    "github_pr_files",
    "github_pr_resolve_position",
    "github_pr_review_start",
    "github_pr_review_comment_inline",
    "github_pr_review_submit",
    "github_review_submit_comment",
    "github_review_submit_review",
    "github_review_get_action_status",
    "github_review_commit",
    "github_review_push",
    "github_review_checkout_branch",
    "github_review_create_branch",
    "github_review_revert_commits"
  ]
}
```

All GitHub review tools require `GITHUB_TOKEN` (and optional
`GITHUB_GRAPHQL_URL`) to authenticate with GitHub's GraphQL API.

- discord_send_message — send a message to a Discord channel using the configured tenant + space URN.
- discord_list_messages — fetch paginated messages from a Discord channel.
- pnpm_install — run `pnpm install` with optional `--filter` targeting specific packages.
- pnpm_add — add dependencies, supporting workspace or filtered package scopes.
- pnpm_remove — remove dependencies from the workspace or filtered packages.
- pnpm_run_script — execute `pnpm run <script>` with optional extra args and filters.

## Documentation

- **[[authorization.md]]** - Complete RBAC security framework documentation
- **[[mcp-config-loader.md]]** - Configuration loading, validation, and security features
- **[[docs/authorization.md]]** - Security implementation details and best practices

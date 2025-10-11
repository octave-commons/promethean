# MCP (Model Context Protocol) Reference

Complete reference for the `@promethean/mcp` package - unified MCP server with composable tools for AI agents.

## Overview

`@promethean/mcp` is a single MCP server module that provides:

- **70+ composable tools** for development workflows
- **HTTP and stdio transports** for flexible deployment
- **Unified configuration** via JSON manifest or EDN catalog
- **Multi-endpoint support** for specialized toolsets
- **Dev UI** for interactive tool exploration

## Quick Start

### Installation

```bash
# MCP is included in the monorepo
pnpm --filter @promethean/mcp build
```

### Basic Usage

```bash
# HTTP transport with default config
pnpm --filter @promethean/mcp dev

# Custom configuration
pnpm --filter @promethean/mcp dev -- --config ./my-mcp.json

# Stdio transport
MCP_CONFIG_JSON='{"transport":"stdio","tools":["files_view_file"]}' pnpm --filter @promethean/mcp dev
```

## Configuration

### Config Resolution Order

1. `--config` / `-c` CLI flag (path resolved from `cwd`)
2. Nearest `promethean.mcp.json` discovered by walking up from `cwd`
3. Legacy `MCP_CONFIG_JSON` environment variable containing inline JSON

### Example Configuration (`promethean.mcp.json`)

```json
{
  "transport": "http",
  "tools": ["files_view_file", "files_write_content", "kanban_get_board", "github_request"],
  "endpoints": {
    "github": {
      "tools": ["github_request", "github_graphql"]
    },
    "files": {
      "tools": ["files_view_file", "files_write_content"]
    }
  },
  "stdioProxyConfig": "./config/mcp_servers.edn"
}
```

### EDN Configuration (Advanced)

For complex setups, use the canonical EDN representation:

```clojure
{:mcp-servers {:github {:command "./bin/github.sh"}
               :files {:command "./bin/files.sh" :args ["--stdio"]}}
 :http {:transport :http
        :tools ["files_view_file" "kanban_get_board"]
        :include-help? true
        :endpoints {:github {:tools ["github_request" "github_graphql"]}
                    :files {:tools ["files_view_file" "files_write_content"]}}
        :proxy {:config "./config/mcp_servers.edn"}}
 :outputs [{:schema :mcp.json :path "./promethean.mcp.json"}]}
```

## Transports

### HTTP Transport

**Features:**

- Multiple endpoints on single server
- Web UI for tool exploration
- Stdio proxy support
- CORS enabled for web clients

```bash
# Start HTTP server
pnpm --filter @promethean/mcp dev

# Access endpoints
http://localhost:3000/mcp          # Default endpoint
http://localhost:3000/github       # GitHub endpoint
http://localhost:3000/ui           # Dev UI
```

### Stdio Transport

**Features:**

- Direct MCP protocol communication
- Lower latency
- IDE integration friendly
- Single toolset configuration

```bash
# Stdio with inline config
MCP_CONFIG_JSON='{"transport":"stdio","tools":["files_view_file"]}' \
  pnpm --filter @promethean/mcp dev

# Stdio with config file
pnpm --filter @promethean/mcp dev -- --config stdio-config.json
```

## Tool Categories

### 📁 File System Tools

| Tool                   | Description                  | Example                                                          |
| ---------------------- | ---------------------------- | ---------------------------------------------------------------- |
| `files_list_directory` | List directory contents      | `{"path": "src", "recursive": false}`                            |
| `files_tree_directory` | Get directory tree structure | `{"path": "src", "maxDepth": 3}`                                 |
| `files_view_file`      | Read file contents           | `{"path": "README.md"}`                                          |
| `files_write_content`  | Write file content           | `{"path": "file.txt", "content": "Hello"}`                       |
| `files_write_lines`    | Write specific lines         | `{"path": "file.txt", "lines": ["line1", "line2"], "start": 10}` |
| `files_search`         | Search file contents         | `{"pattern": "function", "path": "src", "maxResults": 20}`       |

### 🎯 Kanban Tools

| Tool                        | Description               | Example                                 |
| --------------------------- | ------------------------- | --------------------------------------- |
| `kanban_get_board`          | Load entire kanban board  | `{}`                                    |
| `kanban_get_column`         | Get specific column       | `{"column": "in_progress"}`             |
| `kanban_find_task`          | Find task by UUID         | `{"uuid": "abc-123"}`                   |
| `kanban_find_task_by_title` | Find task by title        | `{"title": "Fix bug"}`                  |
| `kanban_update_status`      | Move task between columns | `{"uuid": "abc-123", "status": "done"}` |
| `kanban_search`             | Search tasks              | `{"query": "bug", "limit": 10}`         |
| `kanban_breakdown_task`     | AI-powered task breakdown | `{"uuid": "abc-123"}`                   |

### 🐙 GitHub Tools

#### REST API Tools

| Tool                    | Description              | Example                                                                    |
| ----------------------- | ------------------------ | -------------------------------------------------------------------------- |
| `github_request`        | Generic GitHub REST API  | `{"method": "GET", "path": "/user"}`                                       |
| `github_graphql`        | GitHub GraphQL API       | `{"query": "query { viewer { login } }"}`                                  |
| `github_rate_limit`     | Check rate limits        | `{}`                                                                       |
| `github_contents_write` | Write file to repository | `{"owner": "user", "repo": "repo", "path": "file.txt", "content": "data"}` |

#### Pull Request Tools

| Tool                         | Description           | Example                                                                           |
| ---------------------------- | --------------------- | --------------------------------------------------------------------------------- |
| `github_pr_get`              | Get PR details        | `{"owner": "user", "repo": "repo", "number": 123}`                                |
| `github_pr_files`            | Get PR file changes   | `{"owner": "user", "repo": "repo", "number": 123}`                                |
| `github_pr_resolve_position` | Resolve diff position | `{"owner": "user", "repo": "repo", "number": 123, "path": "file.ts", "line": 42}` |

#### Code Review Tools

| Tool                              | Description             | Example                                                                                          |
| --------------------------------- | ----------------------- | ------------------------------------------------------------------------------------------------ |
| `github_pr_review_start`          | Start review            | `{"pullRequestId": "PR_NODE_ID"}`                                                                |
| `github_pr_review_comment_inline` | Add inline comment      | `{"owner": "user", "repo": "repo", "number": 123, "path": "file.ts", "line": 42, "body": "Nit"}` |
| `github_pr_review_submit`         | Submit review           | `{"reviewId": "REVIEW_ID", "event": "REQUEST_CHANGES"}`                                          |
| `github_apply_patch`              | Apply patch via GraphQL | `{"owner": "user", "repo": "repo", "branch": "main", "patch": "diff content"}`                   |

### 💻 Development Tools

#### Package Management

| Tool              | Description         | Example                                                  |
| ----------------- | ------------------- | -------------------------------------------------------- |
| `pnpm_install`    | Run pnpm install    | `{"filter": "@promethean/core"}`                         |
| `pnpm_add`        | Add dependencies    | `{"packages": ["lodash"], "filter": "@promethean/core"}` |
| `pnpm_remove`     | Remove dependencies | `{"packages": ["lodash"], "filter": "@promethean/core"}` |
| `pnpm_run_script` | Run npm script      | `{"script": "build", "filter": "@promethean/core"}`      |

#### Execution Tools

| Tool        | Description             | Example                                   |
| ----------- | ----------------------- | ----------------------------------------- |
| `exec_run`  | Run allowlisted command | `{"commandId": "git.status", "args": []}` |
| `exec_list` | List available commands | `{}`                                      |

#### TDD Tools

| Tool                | Description              | Example                                            |
| ------------------- | ------------------------ | -------------------------------------------------- |
| `tdd_scaffold_test` | Create test scaffold     | `{"filePath": "src/utils.ts", "testType": "unit"}` |
| `tdd_run_tests`     | Run tests                | `{"filter": "@promethean/core", "watch": false}`   |
| `tdd_start_watch`   | Start test watcher       | `{"filter": "@promethean/core"}`                   |
| `tdd_coverage`      | Generate coverage report | `{"filter": "@promethean/core"}`                   |

### 🤖 AI/LLM Tools

#### Ollama Tools

| Tool                          | Description           | Example                                                                   |
| ----------------------------- | --------------------- | ------------------------------------------------------------------------- |
| `ollama_pull`                 | Pull model            | `{"model": "llama2"}`                                                     |
| `ollama_list_models`          | List available models | `{}`                                                                      |
| `ollama_enqueue_generate_job` | Queue generation      | `{"model": "llama2", "prompt": "Hello", "options": {"temperature": 0.7}}` |
| `ollama_start_conversation`   | Start conversation    | `{"model": "llama2", "messages": [{"role": "user", "content": "Hi"}]}`    |

### 🛠️ Utility Tools

#### Process Management

| Tool                   | Description           | Example                                       |
| ---------------------- | --------------------- | --------------------------------------------- |
| `process_enqueue_task` | Queue background task | `{"command": "npm test", "cwd": "./package"}` |
| `process_get_queue`    | Get task queue        | `{}`                                          |
| `process_get_stdout`   | Get task output       | `{"taskId": "task-123"}`                      |

#### Sandbox Tools

| Tool             | Description    | Example                                          |
| ---------------- | -------------- | ------------------------------------------------ |
| `sandbox_create` | Create sandbox | `{"type": "filesystem", "path": "/tmp/sandbox"}` |
| `sandbox_list`   | List sandboxes | `{}`                                             |
| `sandbox_delete` | Delete sandbox | `{"sandboxId": "sandbox-123"}`                   |

#### Discord Tools

| Tool                    | Description          | Example                                    |
| ----------------------- | -------------------- | ------------------------------------------ |
| `discord_send_message`  | Send Discord message | `{"channelId": "123", "content": "Hello"}` |
| `discord_list_messages` | List messages        | `{"channelId": "123", "limit": 50}`        |

### 🔍 Meta Tools

| Tool                  | Description            | Example                         |
| --------------------- | ---------------------- | ------------------------------- |
| `mcp_help`            | Get help for tools     | `{"toolId": "files_view_file"}` |
| `mcp_toolset`         | List available tools   | `{}`                            |
| `mcp_endpoints`       | List HTTP endpoints    | `{}`                            |
| `mcp_validate_config` | Validate configuration | `{}`                            |

## Dev UI

The HTTP transport includes a Web Components-based Dev UI for interactive tool exploration.

### Starting Dev UI

```bash
# Build UI once
pnpm --filter @promethean/mcp-dev-ui build

# Or watch during development
pnpm --filter @promethean/mcp-dev-ui watch

# Start MCP server with UI
pnpm --filter @promethean/mcp dev

# Access UI
http://localhost:3000/ui
```

### UI Features

- **Tool Explorer**: Browse available tools with descriptions
- **Interactive Testing**: Try tools with form-based inputs
- **Endpoint Switching**: Switch between different MCP endpoints
- **Real-time Results**: See tool outputs immediately
- **Configuration View**: Inspect current MCP configuration

## Stdio Proxy Configuration

For external MCP servers, configure stdio proxies in EDN:

```clojure
{:mcp-servers
 {:github {:command "${HOME}/scripts/github.sh"}
  :filesystem {:command "${HOME}/scripts/filesystem.sh" :args ["--stdio"]}
  :eslint {:command "npx" :args ["-y" "@uplinq/mcp-eslint"]}}}
```

### Proxy Features

- **HTTP Bridge**: Stdio servers exposed via HTTP endpoints
- **Process Management**: Automatic startup/shutdown of proxy processes
- **Path Mapping**: Custom HTTP paths per server (`:http-path`)
- **Environment Variables**: Pass environment to proxy processes

## Security

### Command Allowlist

The `exec_run` tool uses an allowlist for security:

```json
{
  "defaultCwd": ".",
  "defaultTimeoutMs": 60000,
  "commands": [
    {
      "id": "git.status",
      "description": "Short git status",
      "command": "git",
      "args": ["status", "--short", "--branch"]
    }
  ]
}
```

**Config Resolution:**

1. `MCP_EXEC_CONFIG` environment variable
2. `MCP_EXEC_COMMANDS_JSON` inline JSON
3. Nearest `promethean.mcp.exec.json`

### File System Security

- **Path Validation**: All file operations validate paths
- **Sandbox Support**: Optional filesystem sandboxing
- **Access Control**: Configurable directory restrictions

## Workflows

### Code Review Workflow

```javascript
// 1. Get PR details
const pr = await mcp.call('github_pr_get', {
  owner: 'user',
  repo: 'repo',
  number: 123,
});

// 2. Start review
const review = await mcp.call('github_pr_review_start', {
  pullRequestId: pr.data.id,
});

// 3. Add inline comment
await mcp.call('github_pr_review_comment_inline', {
  owner: 'user',
  repo: 'repo',
  number: 123,
  path: 'src/app.ts',
  line: 42,
  body: 'Consider extracting this constant',
  suggestion: { after: ['const VALUE = computeValue();'] },
});

// 4. Submit review
await mcp.call('github_pr_review_submit', {
  reviewId: review.data.id,
  event: 'REQUEST_CHANGES',
  body: 'See inline comments',
});
```

### TDD Workflow

```javascript
// 1. Scaffold test
await mcp.call('tdd_scaffold_test', {
  filePath: 'src/utils.ts',
  testType: 'unit',
});

// 2. Start watcher
await mcp.call('tdd_start_watch', {
  filter: '@promethean/core',
});

// 3. Check coverage
const coverage = await mcp.call('tdd_coverage', {
  filter: '@promethean/core',
});
```

### Kanban Workflow

```javascript
// 1. Find work
const tasks = await mcp.call('kanban_search', {
  query: 'bug fix',
  limit: 5,
});

// 2. Start task
await mcp.call('kanban_update_status', {
  uuid: tasks.data[0].uuid,
  status: 'in_progress',
});

// 3. Break down complex task
const breakdown = await mcp.call('kanban_breakdown_task', {
  uuid: tasks.data[0].uuid,
});
```

## Environment Variables

| Variable                 | Description                | Example                                             |
| ------------------------ | -------------------------- | --------------------------------------------------- |
| `MCP_CONFIG_JSON`        | Inline JSON configuration  | `{"transport":"stdio","tools":["files_view_file"]}` |
| `MCP_PROXY_CONFIG`       | Path to stdio proxy config | `./config/mcp_servers.edn`                          |
| `MCP_EXEC_CONFIG`        | Path to exec allowlist     | `./config/exec.json`                                |
| `MCP_EXEC_COMMANDS_JSON` | Inline exec allowlist JSON | `{"commands":[...]}`                                |
| `GITHUB_TOKEN`           | GitHub API token           | `ghp_xxxxxxxxxxxx`                                  |
| `GITHUB_GRAPHQL_URL`     | Custom GraphQL endpoint    | `https://api.github.com/graphql`                    |

## Integration Examples

### VS Code Integration

```json
// .vscode/settings.json
{
  "mcp.servers": [
    {
      "name": "promethean",
      "command": "pnpm",
      "args": ["--filter", "@promethean/mcp", "dev"],
      "cwd": "/path/to/promethean"
    }
  ]
}
```

### Claude Desktop Integration

```json
// ~/.config/claude-desktop/config.json
{
  "mcpServers": {
    "promethean": {
      "command": "pnpm",
      "args": ["--filter", "@promethean/mcp", "dev"],
      "cwd": "/path/to/promethean"
    }
  }
}
```

### Docker Integration

```dockerfile
FROM node:20
WORKDIR /app
COPY . .
RUN corepack enable && corepack prepare pnpm@9 --activate
RUN pnpm install && pnpm --filter @promethean/mcp build
EXPOSE 3000
CMD ["pnpm", "--filter", "@promethean/mcp", "dev"]
```

## Troubleshooting

### Common Issues

**Config not found:**

```bash
# Check config resolution
pnpm --filter @promethean/mcp dev -- --config ./promethean.mcp.json --verbose
```

**Proxy server fails to start:**

```bash
# Check proxy config path
ls -la config/mcp_servers.edn
# Validate EDN syntax
bb -m mk.mcp-cli validate --edn config/mcp_servers.edn
```

**GitHub authentication:**

```bash
# Set token
export GITHUB_TOKEN=ghp_xxxxxxxxxxxx
# Test with rate limit
curl -H "Authorization: token $GITHUB_TOKEN" https://api.github.com/rate_limit
```

### Debug Mode

Enable verbose logging:

```bash
# HTTP transport
DEBUG=mcp:* pnpm --filter @promethean/mcp dev

# Stdio transport
MCP_CONFIG_JSON='{"transport":"stdio","tools":["files_view_file"]}' \
  DEBUG=mcp:* pnpm --filter @promethean/mcp dev
```

### Health Checks

```bash
# Check HTTP server
curl http://localhost:3000/mcp

# List available tools
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'
```

## Development

### Building

```bash
# Build MCP package
pnpm --filter @promethean/mcp build

# Build Dev UI
pnpm --filter @promethean/mcp-dev-ui build

# Build all
pnpm --filter "@promethean/mcp*" build
```

### Testing

```bash
# Run tests
pnpm --filter @promethean/mcp test

# Run specific test
pnpm --filter @promethean/mcp test -- --match "files"

# Coverage
pnpm --filter @promethean/mcp coverage
```

### Adding New Tools

1. Create tool file in `src/tools/`
2. Export tool factory function
3. Add to `toolCatalog` in `src/index.ts`
4. Write tests in `src/tests/`
5. Update documentation

```typescript
// src/tools/my-tool.ts
import type { ToolFactory } from '../core/types.js';

export const myTool: ToolFactory = (ctx) => ({
  spec: {
    name: 'my_tool',
    description: 'My custom tool',
    inputSchema: {
      type: 'object',
      properties: {
        input: { type: 'string', description: 'Input value' },
      },
      required: ['input'],
    },
  },
  invoke: async ({ input }) => {
    return { content: [{ type: 'text', text: `Hello ${input}!` }] };
  },
});
```

## Architecture

### Core Components

- **Registry**: Tool factory registration and resolution
- **Transports**: HTTP (Fastify) and stdio communication layers
- **Configuration**: Unified JSON/EDN configuration system
- **Proxy System**: Stdio server bridging to HTTP endpoints
- **Tool Context**: Dependency injection for tools

### Design Principles

- **Functional**: Pure tool factories, no mutation
- **Composable**: Tools can be combined in workflows
- **Type-safe**: Full TypeScript support
- **Transport-agnostic**: Same tools work on HTTP and stdio
- **Configuration-driven**: Runtime tool selection

## Performance

### Optimization Tips

1. **Tool Selection**: Only load needed tools per endpoint
2. **Proxy Management**: Use inline proxies for better control
3. **Caching**: Leverage GitHub's etag headers
4. **Batching**: Combine multiple operations where possible
5. **Connection Reuse**: HTTP transport reuses connections

### Monitoring

```bash
# Enable performance logging
DEBUG=mcp:performance pnpm --filter @promethean/mcp dev

# Monitor proxy processes
ps aux | grep promethean-mcp-proxy
```

This reference provides comprehensive documentation for the MCP system, enabling effective integration and usage across different development workflows.

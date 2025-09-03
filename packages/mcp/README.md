# MCP

Provides a Model Context Protocol server and a small stdio wrapper.

```mermaid
flowchart LR
  C[Client] -- WS --> S(MCP Server)
  S -- WS --> B[smartgpt-bridge]
```

## Quickstart

### Server

```bash
pnpm -F mcp dev:server
```

### CLI wrapper

```bash
echo '{"jsonrpc":"2.0","id":1,"method":"initialize"}' | mcp-stdio
```

## Environment

- `MCP_SERVER_PORT` (default 4410)
- `MCP_TOKEN` optional auth token
- `SMARTGPT_BRIDGE_URL` URL for bridge websocket

### Example

```bash
pnpm -F mcp smoke tools/call search.query '{"query":"hello"}'
```


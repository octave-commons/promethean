# MCP Server

Implements a WebSocket MCP server that forwards tool calls to `smartgpt-bridge`.

```mermaid
flowchart LR
  C[Client] -- WS --> S(MCP Server)
  S -- WS --> B[smartgpt-bridge]
```

## Quickstart

```bash
pnpm -F mcp-server dev
```

### Environment

- `MCP_SERVER_PORT` (default 4410)
- `MCP_TOKEN` optional auth token
- `SMARTGPT_BRIDGE_URL` URL for bridge websocket

### Example

```bash
pnpm -F mcp-server smoke tools/call search.query '{"query":"hello"}'
```

# MCP stdio wrapper

Tiny CLI that proxies JSON-RPC over stdio to the MCP server via WebSocket.

```bash
echo '{"jsonrpc":"2.0","id":1,"method":"initialize"}' | mcp-stdio
```

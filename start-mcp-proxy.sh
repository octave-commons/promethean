#!/usr/bin/env bash
set -euo pipefail

echo "Starting minimal MCP proxy on port 3210..."

cd /home/err/devel/promethean

# Only start the working MCP servers
PORT=3210 pnpm --filter @promethean/mcp exec node dist/bin/proxy.js \
  --config config/mcp_servers.edn \
  --port 3210 \
  --host 127.0.0.1
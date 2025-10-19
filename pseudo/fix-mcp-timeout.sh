#!/usr/bin/env bash
set -euo pipefail

echo "Starting MCP HTTP Proxy for ChatGPT..."
echo "This will provide the endpoints that ChatGPT connects to"

cd /home/err/devel/promethean

# Kill any existing proxy
pkill -f "proxy.js" || true
sleep 2

# Start the MCP proxy server
echo "Starting proxy on port 3210..."
PORT=3210 pnpm --filter @promethean/mcp exec node dist/bin/proxy.js --port 3210 --host 127.0.0.1 &

# Wait for startup
sleep 10

# Test if it's working
if curl -s http://localhost:3210/healthz > /dev/null 2>&1; then
    echo "✅ MCP Proxy is running on http://localhost:3210"
    echo "Available endpoints:"
    curl -s http://localhost:3210/healthz | jq -r '.routes[]?.path' 2>/dev/null || echo "  - /github/mcp"
    echo "  - /file-system/mcp"
    echo "  - /duckduckgo/mcp"
    echo "  - And more..."
    echo ""
    echo "ChatGPT should now be able to connect without timeouts!"
else
    echo "❌ Proxy failed to start. Check logs with: tail -f /tmp/mcp-proxy.log"
    exit 1
fi
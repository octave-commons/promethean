#!/usr/bin/env bash
set -euo pipefail
source "$HOME/.promethean/mcp/.env"
exec docker run -i --rm \
     -e GITHUB_API_KEY="$GITHUB_API_KEY" \
     mcp/github

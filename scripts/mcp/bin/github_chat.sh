#!/usr/bin/env bash
set -euo pipefail
source "$HOME/devel/promethean/.env"
exec docker run -i --rm \
     -e GITHUB_API_KEY="$GITHUB_TOKEN" \
     mcp/github-chat

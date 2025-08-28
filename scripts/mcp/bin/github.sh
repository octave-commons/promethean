#!/usr/bin/env bash
set -euo pipefail
source "$HOME/devel/promethean/.env"
exec docker run -i --rm \
     -e GITHUB_PERSONAL_ACCESS_TOKEN="$GITHUB_TOKEN" \
     mcp/github

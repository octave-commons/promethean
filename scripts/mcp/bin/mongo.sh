#!/usr/bin/env bash
set -euo pipefail
source "$HOME/.promethean/mcp/.env"
exec docker run -i --rm \
     -e MONGO_URI="$MONGO_URI" \
     mcp/mongodb

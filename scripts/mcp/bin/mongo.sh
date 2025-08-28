#!/usr/bin/env bash
set -euo pipefail
source "$HOME/devel/promethean/.env"
exec docker run -i --rm \
     -e MONGO_URI="$MONGO_URI" \
     mcp/mongodb

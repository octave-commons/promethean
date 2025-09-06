#!/usr/bin/env bash
set -euo pipefail
source "$HOME/devel/promethean/.env"
PROM_ROOT="-/home/err/devel/promethean"
# Mount root to the same path inside the container; pass ROOT as arg if server expects it.
exec docker run -i --rm \
     --user "$(id -u)":"$(id -g)" \
     -v "$ROOT:$ROOT" \
     mcp/filesystem "$ROOT"

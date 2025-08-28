#!/usr/bin/env bash
set -euo pipefail
source "$HOME/.promethean/mcp/.env"
ROOT="${PROM_ROOT:-/home/err/devel/promethean}"
# Mount root to the same path inside the container; pass ROOT as arg if server expects it.
exec docker run -i --rm \
     -v "$ROOT:$ROOT" \
     mcp/filesystem "$ROOT"

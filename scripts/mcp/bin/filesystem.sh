#!/usr/bin/env bash
set -euo pipefail
PROM_ROOT="/home/err/devel/promethean"
# Mount root to the same path inside the container; pass ROOT as arg if server expects it.
exec docker run -i --rm \
     --user "$(id -u)":"$(id -g)" \
     -v "$PROM_ROOT:$PROM_ROOT" \
     mcp/filesystem "$PROM_ROOT"

#!/usr/bin/env bash
set -euo pipefail

# source $PWD/.env
# Mount root to the same path inside the container; pass ROOT as arg if server expects it.
exec docker run -i --rm \
     --user "$(id -u)":"$(id -g)" \
     -v "$PWD:$PWD" \
     mcp/filesystem "$PWD"

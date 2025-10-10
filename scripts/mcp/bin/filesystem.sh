#!/usr/bin/env bash
set -euo pipefail

exec docker run -i --rm \
     --user "$(id -u)":"$(id -g)" \
     -v "$PWD:$PWD" \
     -w "$PWD" \
     mcp/filesystem \
     "$PWD"

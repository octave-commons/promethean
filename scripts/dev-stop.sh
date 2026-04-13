#!/usr/bin/env bash
# Stop the dev proxy instances.
set -euo pipefail
cd "$(dirname "$0")/.."

pm2 delete ecosystem.dev.config.cjs 2>/dev/null || true
echo "[dev-stop] Dev proxy stopped."

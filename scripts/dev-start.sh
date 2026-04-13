#!/usr/bin/env bash
# Quick-start the dev proxy without the file watcher.
# Useful for manual testing or running e2e tests.
set -euo pipefail
cd "$(dirname "$0")/.."

echo "[dev-start] Building..."
pnpm run build
pnpm run web:build 2>/dev/null || true

echo "[dev-start] Starting dev proxy on :8795 and web on :5175..."
pm2 start ecosystem.dev.config.cjs
pm2 logs --nostream --lines 5
echo ""
echo "[dev-start] Ready."
echo "  Proxy: http://127.0.0.1:8795"
echo "  Web:   http://127.0.0.1:5175"
echo ""
echo "  Stop:  scripts/dev-stop.sh"
echo "  Logs:  pm2 logs proxy-dev"
echo "  E2E:   scripts/e2e-test.sh"
echo "  Load:  node scripts/load-test.mjs"

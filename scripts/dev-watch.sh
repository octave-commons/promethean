#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

ECOSYSTEM="ecosystem.dev.config.cjs"
WATCH_DIRS=(src web)
DEBOUNCE_SEC=2

log() { printf "\033[1;36m[dev-watch]\033[0m %s\n" "$*"; }
err() { printf "\033[1;31m[dev-watch]\033[0m %s\n" "$*"; }

cleanup() {
  log "Stopping dev processes..."
  pm2 delete "$ECOSYSTEM" 2>/dev/null || true
  exit 0
}
trap cleanup EXIT INT TERM

initial_build() {
  log "Running initial build..."
  if ! pnpm run build; then
    err "Initial build failed"
    return 1
  fi
  if ! pnpm run web:build 2>/dev/null; then
    log "Web build skipped or failed (non-fatal)"
  fi
  return 0
}

run_tests() {
  log "Running unit tests..."
  if pnpm run test; then
    log "Tests passed"
    return 0
  else
    err "Tests FAILED — skipping restart"
    return 1
  fi
}

restart_dev() {
  log "Restarting dev processes..."
  pm2 restart "$ECOSYSTEM" --update-env 2>/dev/null \
    || pm2 start "$ECOSYSTEM" 2>/dev/null
  log "Dev proxy ready on http://127.0.0.1:8795"
  log "Dev web UI ready on http://127.0.0.1:5175"
}

# --- Boot ---
log "=== Dev watcher starting ==="

if ! initial_build; then
  err "Fix build errors before starting dev watcher"
  exit 1
fi

pm2 start "$ECOSYSTEM"
log "Dev proxy ready on http://127.0.0.1:8795"
log "Dev web UI ready on http://127.0.0.1:5175"

# --- Watch loop ---
log "Watching ${WATCH_DIRS[*]} for changes (debounce=${DEBOUNCE_SEC}s)..."

while true; do
  inotifywait -r -q -e modify,create,delete,move \
    --exclude '(node_modules|dist|\.git|logs|data)' \
    "${WATCH_DIRS[@]}"

  # Debounce: drain rapid-fire events
  sleep "$DEBOUNCE_SEC"
  while inotifywait -r -q -t 0 -e modify,create,delete,move \
    --exclude '(node_modules|dist|\.git|logs|data)' \
    "${WATCH_DIRS[@]}" 2>/dev/null; do
    sleep 0.5
  done

  log "Change detected — building and testing..."

  if run_tests; then
    restart_dev
  fi
done

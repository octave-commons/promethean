#!/usr/bin/env bash
set -euo pipefail

NAMESPACE="${OPENPLANNER_K8S_NAMESPACE:-openplanner}"
DEPLOYMENT_NAME="${OPENPLANNER_K8S_DEPLOYMENT:-openplanner}"
HEALTH_URL="${OPENPLANNER_K8S_HEALTH_URL:-http://127.0.0.1:8080/v1/health}"
HEALTH_HOST="${OPENPLANNER_K8S_HEALTH_HOST:-openplanner.127.0.0.1.nip.io}"
CHECKS="${OPENPLANNER_K8S_VERIFY_CHECKS:-40}"
SLEEP_SECONDS="${OPENPLANNER_K8S_VERIFY_SLEEP_SECONDS:-1}"
TIMEOUT_SECONDS="${OPENPLANNER_K8S_VERIFY_TIMEOUT_SECONDS:-600}"
TMP_LOG="$(mktemp)"

cleanup() {
  rm -f "$TMP_LOG"
}
trap cleanup EXIT

require_cmd() {
  command -v "$1" >/dev/null 2>&1 || {
    echo "Missing required command: $1" >&2
    exit 1
  }
}

require_cmd kubectl
require_cmd curl

log() {
  printf '[openplanner-k8s] %s\n' "$*"
}

probe_loop() {
  local attempt code
  for attempt in $(seq 1 "$CHECKS"); do
    code=$(curl -s -o /tmp/openplanner-k8s-verify-body.json -w '%{http_code}' -H "Host: ${HEALTH_HOST}" "$HEALTH_URL" || true)
    printf '%s %s\n' "$attempt" "$code" >> "$TMP_LOG"
    sleep "$SLEEP_SECONDS"
  done
}

probe_loop &
PROBE_PID=$!

log "restarting deployment/${DEPLOYMENT_NAME} in namespace ${NAMESPACE}"
kubectl rollout restart "deployment/${DEPLOYMENT_NAME}" -n "$NAMESPACE" >/dev/null
kubectl rollout status "deployment/${DEPLOYMENT_NAME}" -n "$NAMESPACE" --timeout="${TIMEOUT_SECONDS}s" >/dev/null

wait "$PROBE_PID"

log "probe results"
cat "$TMP_LOG"

if awk '$2 != 200 {bad=1} END {exit bad}' "$TMP_LOG"; then
  log "rolling update continuity verified (${CHECKS} consecutive 200 responses)"
else
  log "rolling update continuity FAILED"
  exit 1
fi

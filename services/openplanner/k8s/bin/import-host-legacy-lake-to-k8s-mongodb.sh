#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../../.." && pwd)"
SOURCE_DIR="${OPENPLANNER_SOURCE_DIR:-$ROOT_DIR/orgs/open-hax/openplanner}"
HOST_LAKE_DIR="${OPENPLANNER_HOST_LAKE_DIR:-$ROOT_DIR/services/openplanner/openplanner-lake}"
NAMESPACE="${OPENPLANNER_K8S_NAMESPACE:-openplanner}"
LOCAL_PORT="${OPENPLANNER_IMPORT_LOCAL_MONGO_PORT:-27017}"
REMOTE_PORT="${OPENPLANNER_IMPORT_REMOTE_MONGO_PORT:-27017}"
CHROMA_URL="${OPENPLANNER_IMPORT_CHROMA_URL:-http://127.0.0.1:8000}"
MONGODB_URI="${OPENPLANNER_IMPORT_MONGODB_URI:-mongodb://openplanner:change-me-openplanner-password@127.0.0.1:${LOCAL_PORT}/openplanner?replicaSet=rs0&authSource=openplanner}"
PORT_FORWARD_PID=""

cleanup() {
  if [[ -n "$PORT_FORWARD_PID" ]] && kill -0 "$PORT_FORWARD_PID" >/dev/null 2>&1; then
    kill "$PORT_FORWARD_PID" >/dev/null 2>&1 || true
    wait "$PORT_FORWARD_PID" >/dev/null 2>&1 || true
  fi
}
trap cleanup EXIT

require_cmd() {
  command -v "$1" >/dev/null 2>&1 || {
    echo "Missing required command: $1" >&2
    exit 1
  }
}

require_cmd kubectl
require_cmd node

log() {
  printf '[openplanner-k8s-import] %s\n' "$*"
}

if [[ ! -d "$HOST_LAKE_DIR" ]]; then
  echo "Host lake directory not found: $HOST_LAKE_DIR" >&2
  exit 1
fi

if [[ ! -f "$SOURCE_DIR/dist/migrate.js" ]]; then
  cat >&2 <<EOF
Missing migration entrypoint: $SOURCE_DIR/dist/migrate.js

This script intentionally does not rebuild source automatically because another agent may be editing the migration lane concurrently.
Build or stabilize the source lane first, then rerun this import script.
EOF
  exit 1
fi

log "starting port-forward to svc/mongodb in namespace $NAMESPACE"
kubectl port-forward -n "$NAMESPACE" svc/mongodb "${LOCAL_PORT}:${REMOTE_PORT}" >/tmp/openplanner-k8s-import-portforward.log 2>&1 &
PORT_FORWARD_PID=$!

for _ in $(seq 1 30); do
  if bash -lc "exec 3<>/dev/tcp/127.0.0.1/${LOCAL_PORT}" >/dev/null 2>&1; then
    break
  fi
  if ! kill -0 "$PORT_FORWARD_PID" >/dev/null 2>&1; then
    cat /tmp/openplanner-k8s-import-portforward.log >&2 || true
    echo "kubectl port-forward exited unexpectedly" >&2
    exit 1
  fi
  sleep 1
done

if ! kill -0 "$PORT_FORWARD_PID" >/dev/null 2>&1; then
  cat /tmp/openplanner-k8s-import-portforward.log >&2 || true
  echo "kubectl port-forward did not stay alive" >&2
  exit 1
fi

log "running legacy-to-mongo import against k8s mongodb"
cd "$SOURCE_DIR"
OPENPLANNER_STORAGE_BACKEND=mongodb \
OPENPLANNER_DATA_DIR="$HOST_LAKE_DIR" \
MONGODB_URI="$MONGODB_URI" \
MONGODB_DB=openplanner \
CHROMA_URL="$CHROMA_URL" \
node dist/migrate.js legacy-to-mongo "$@"

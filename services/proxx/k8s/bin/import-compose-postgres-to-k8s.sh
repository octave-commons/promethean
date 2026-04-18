#!/usr/bin/env bash
set -euo pipefail

SOURCE_CONTAINER="${PROXX_IMPORT_SOURCE_CONTAINER:-proxx-local-proxx-local-db-1}"
NAMESPACE="${PROXX_K8S_NAMESPACE:-proxx}"
LOCAL_PORT="${PROXX_IMPORT_LOCAL_PORT:-15439}"
REMOTE_PORT="${PROXX_IMPORT_REMOTE_PORT:-5432}"
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

require_cmd docker
require_cmd kubectl

log() {
  printf '[proxx-k8s] %s\n' "$*"
}

if ! docker ps --format '{{.Names}}' | grep -Fxq "$SOURCE_CONTAINER"; then
  echo "Source postgres container not running: $SOURCE_CONTAINER" >&2
  exit 1
fi

log "starting port-forward to proxx-postgres"
kubectl port-forward -n "$NAMESPACE" svc/proxx-postgres "${LOCAL_PORT}:${REMOTE_PORT}" >/tmp/proxx-k8s-portforward.log 2>&1 &
PORT_FORWARD_PID=$!

for _ in $(seq 1 30); do
  if bash -lc "exec 3<>/dev/tcp/127.0.0.1/${LOCAL_PORT}" >/dev/null 2>&1; then
    break
  fi
  if ! kill -0 "$PORT_FORWARD_PID" >/dev/null 2>&1; then
    cat /tmp/proxx-k8s-portforward.log >&2 || true
    echo "kubectl port-forward exited unexpectedly" >&2
    exit 1
  fi
  sleep 1
done

log "restoring compose postgres into k8s postgres"
docker exec "$SOURCE_CONTAINER" pg_dump -U openai_proxy -d openai_proxy --clean --if-exists --no-owner --no-privileges \
  | docker run --rm -i --network host -e PGPASSWORD=openai_proxy postgres:16-bookworm \
      psql -h 127.0.0.1 -p "$LOCAL_PORT" -U openai_proxy -d openai_proxy

log "postgres import complete"
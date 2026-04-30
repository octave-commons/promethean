#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../../.." && pwd)"
IMAGE_NAME="${OPENPLANNER_IMAGE_NAME:-openplanner:local}"
KIND_CLUSTER_NAME="${KIND_CLUSTER_NAME:-devel}"
OVERLAY_DIR="$ROOT_DIR/services/openplanner/k8s/overlays/local-kind"
SOURCE_DIR="$ROOT_DIR/orgs/open-hax/openplanner"

require_cmd() {
  command -v "$1" >/dev/null 2>&1 || {
    echo "Missing required command: $1" >&2
    exit 1
  }
}

require_cmd docker
require_cmd kind
require_cmd kubectl
require_cmd curl

log() {
  printf '[openplanner-k8s] %s\n' "$*"
}

bash "$ROOT_DIR/services/openplanner/k8s/bin/prepare-local-kind.sh"

log "building image ${IMAGE_NAME}"
docker build -t "$IMAGE_NAME" -f "$SOURCE_DIR/Dockerfile" "$SOURCE_DIR"

log "loading image into kind cluster ${KIND_CLUSTER_NAME}"
kind load docker-image --name "$KIND_CLUSTER_NAME" "$IMAGE_NAME"

log "applying overlay $OVERLAY_DIR"
kubectl apply -k "$OVERLAY_DIR"

log "waiting for chroma rollout"
kubectl rollout status deployment/openplanner-chroma -n openplanner --timeout=300s

log "waiting for openplanner rollout"
kubectl rollout status deployment/openplanner -n openplanner --timeout=300s

log "current objects"
kubectl get pods,svc,ingress,pvc -n openplanner

log "health check"
HEALTH_URL="http://127.0.0.1:8080/v1/health"
HEALTH_HOST="openplanner.127.0.0.1.nip.io"

for attempt in $(seq 1 20); do
  if curl -fsS -H "Host: ${HEALTH_HOST}" "$HEALTH_URL" > /tmp/openplanner-k8s-health.json; then
    cat /tmp/openplanner-k8s-health.json
    exit 0
  fi
  sleep 2
done

kubectl logs -n openplanner deployment/openplanner --tail=100 >&2 || true
echo "OpenPlanner ingress health check did not become ready in time" >&2
exit 1

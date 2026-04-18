#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../../.." && pwd)"
IMAGE_NAME="${OPENPLANNER_IMAGE_NAME:-openplanner:local}"
KIND_CLUSTER_NAME="${KIND_CLUSTER_NAME:-devel}"
OVERLAY_DIR="$ROOT_DIR/services/openplanner/k8s/overlays/local-kind-mongodb"
SOURCE_DIR="$ROOT_DIR/orgs/open-hax/openplanner"
RESET_MONGODB_BOOTSTRAP="${RESET_MONGODB_BOOTSTRAP:-0}"

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
  printf '[openplanner-k8s-mongodb] %s\n' "$*"
}

bash "$ROOT_DIR/services/openplanner/k8s/bin/prepare-local-kind-mongodb.sh"

log "deleting legacy chroma resources if present"
kubectl delete deployment/openplanner-chroma service/openplanner-chroma pvc/openplanner-chroma-data -n openplanner --ignore-not-found=true

log "deleting previous mongo-init job if present so it can be recreated with current spec"
kubectl delete job/mongo-init -n openplanner --ignore-not-found=true

if [[ "$RESET_MONGODB_BOOTSTRAP" == "1" ]]; then
  log "resetting MongoDB bootstrap state for local-kind-mongodb overlay"
  kubectl delete deployment/mongot statefulset/mongodb pvc/data-mongodb-0 pvc/openplanner-mongot-data -n openplanner --ignore-not-found=true
  kubectl wait --for=delete pod -l app.kubernetes.io/component=mongodb -n openplanner --timeout=180s || true
  kubectl wait --for=delete pod -l app.kubernetes.io/component=mongot -n openplanner --timeout=180s || true
fi

log "building image ${IMAGE_NAME}"
docker build -t "$IMAGE_NAME" -f "$SOURCE_DIR/Dockerfile" "$SOURCE_DIR"

log "loading image into kind cluster ${KIND_CLUSTER_NAME}"
kind load docker-image --name "$KIND_CLUSTER_NAME" "$IMAGE_NAME"

log "applying overlay $OVERLAY_DIR"
kubectl apply -k "$OVERLAY_DIR"

log "waiting for mongodb statefulset"
kubectl rollout status statefulset/mongodb -n openplanner --timeout=600s

log "waiting for mongo-init job"
kubectl wait --for=condition=complete job/mongo-init -n openplanner --timeout=600s

log "restarting mongot after mongo-init to pick up replica-set auth state"
kubectl rollout restart deployment/mongot -n openplanner
kubectl rollout status deployment/mongot -n openplanner --timeout=600s

log "waiting for openplanner rollout"
kubectl rollout status deployment/openplanner -n openplanner --timeout=600s

log "current objects"
kubectl get pods,svc,ingress,pvc,statefulset,job -n openplanner

log "health check"
HEALTH_URL="http://127.0.0.1:8080/v1/health"
HEALTH_HOST="openplanner.127.0.0.1.nip.io"

for attempt in $(seq 1 30); do
  if curl -fsS -H "Host: ${HEALTH_HOST}" "$HEALTH_URL" > /tmp/openplanner-k8s-mongodb-health.json; then
    cat /tmp/openplanner-k8s-mongodb-health.json
    exit 0
  fi
  sleep 2
done

kubectl logs -n openplanner deployment/openplanner --tail=100 >&2 || true
echo "OpenPlanner MongoDB ingress health check did not become ready in time" >&2
exit 1

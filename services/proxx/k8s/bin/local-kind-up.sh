#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../../.." && pwd)"
SOURCE_DIR="$ROOT_DIR/orgs/open-hax/proxx"
OVERLAY_DIR="$ROOT_DIR/services/proxx/k8s/overlays/local-kind"
IMAGE_NAME="${PROXX_IMAGE_NAME:-proxx:local}"
KIND_CLUSTER_NAME="${KIND_CLUSTER_NAME:-devel}"

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
  printf '[proxx-k8s] %s\n' "$*"
}

bash "$ROOT_DIR/services/proxx/k8s/bin/prepare-local-kind.sh"

log "building image ${IMAGE_NAME}"
docker build -t "$IMAGE_NAME" -f "$SOURCE_DIR/Dockerfile" "$ROOT_DIR"

log "loading image into kind cluster ${KIND_CLUSTER_NAME}"
kind load docker-image --name "$KIND_CLUSTER_NAME" "$IMAGE_NAME"

log "applying overlay"
kubectl apply -k "$OVERLAY_DIR"

log "waiting for postgres rollout"
kubectl rollout status statefulset/proxx-postgres -n proxx --timeout=600s

log "waiting for proxx rollout"
kubectl rollout status deployment/proxx -n proxx --timeout=600s

log "services"
kubectl get pods,svc,pvc,statefulset,ingress -n proxx

log "api health (inside cluster)"
kubectl exec -n proxx deploy/proxx -- sh -lc "node -e \"fetch('http://127.0.0.1:8789/health',{headers:{Authorization:'Bearer '+(process.env.PROXY_AUTH_TOKEN||'')}}).then(async(r)=>{const t=await r.text(); if(!r.ok){console.error(t); process.exit(1)} console.log(t)}).catch((e)=>{console.error(String(e)); process.exit(1)})\""

#!/usr/bin/env bash
set -euo pipefail

NAMESPACE="${OPENPLANNER_K8S_NAMESPACE:-openplanner}"
HEALTH_URL="${OPENPLANNER_K8S_HEALTH_URL:-http://127.0.0.1:8080/v1/health}"
HEALTH_HOST="${OPENPLANNER_K8S_HEALTH_HOST:-openplanner.127.0.0.1.nip.io}"

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

log "deployments"
kubectl get deployment -n "$NAMESPACE"

log "statefulsets"
kubectl get statefulset -n "$NAMESPACE" || true

log "pods/services/ingress/pvc/jobs"
kubectl get pods,svc,ingress,pvc,job -n "$NAMESPACE"

log "health"
curl -fsS -H "Host: ${HEALTH_HOST}" "$HEALTH_URL"
echo

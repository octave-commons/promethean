#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
CLUSTER_NAME="${KIND_CLUSTER_NAME:-devel}"
CONFIG_PATH="${KIND_CONFIG_PATH:-$ROOT_DIR/services/platform-k8s/kind/cluster.yaml}"
INSTALL_INGRESS_NGINX="${INSTALL_INGRESS_NGINX:-1}"
INGRESS_MANIFEST_URL="${INGRESS_MANIFEST_URL:-https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/kind/deploy.yaml}"

require_cmd() {
  command -v "$1" >/dev/null 2>&1 || {
    echo "Missing required command: $1" >&2
    exit 1
  }
}

require_cmd docker
require_cmd kubectl
require_cmd kind

log() {
  printf '[platform-k8s] %s\n' "$*"
}

if kind get clusters | grep -Fxq "$CLUSTER_NAME"; then
  log "kind cluster '$CLUSTER_NAME' already exists"
else
  log "creating kind cluster '$CLUSTER_NAME' from $CONFIG_PATH"
  kind create cluster --name "$CLUSTER_NAME" --config "$CONFIG_PATH"
fi

kubectl cluster-info >/dev/null
log "cluster is reachable"

if [[ "$INSTALL_INGRESS_NGINX" == "1" ]]; then
  if kubectl get namespace ingress-nginx >/dev/null 2>&1; then
    log "ingress-nginx namespace already present; skipping install"
  else
    log "installing ingress-nginx for kind"
    kubectl apply -f "$INGRESS_MANIFEST_URL"
    kubectl wait --namespace ingress-nginx \
      --for=condition=Ready pods \
      --selector=app.kubernetes.io/component=controller \
      --timeout=180s
  fi
fi

log "kind bootstrap complete"
kubectl get nodes -o wide

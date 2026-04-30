#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../../.." && pwd)"
OVERLAY_DIR="$ROOT_DIR/services/openplanner/k8s/overlays/local-kind"
KIND_NETWORK="${KIND_NETWORK:-kind}"

require_cmd() {
  command -v "$1" >/dev/null 2>&1 || {
    echo "Missing required command: $1" >&2
    exit 1
  }
}

require_cmd docker
require_cmd python3

log() {
  printf '[openplanner-k8s] %s\n' "$*"
}

HOST_GATEWAY_IP="$(docker network inspect "$KIND_NETWORK" --format '{{json .IPAM.Config}}' | python3 -c 'import json, sys
configs = json.load(sys.stdin)
for cfg in configs:
    gateway = cfg.get("Gateway")
    if gateway and "." in gateway:
        print(gateway)
        break
else:
    raise SystemExit("No IPv4 gateway found for kind network")')"

OPENPLANNER_API_KEY_VALUE="${OPENPLANNER_API_KEY:-change-me-openplanner}"
PROXY_TOKEN_VALUE="${OPEN_HAX_OPENAI_PROXY_AUTH_TOKEN:-${PROXY_AUTH_TOKEN:-}}"

if [[ -z "$PROXY_TOKEN_VALUE" ]]; then
  echo "Missing OPEN_HAX_OPENAI_PROXY_AUTH_TOKEN or PROXY_AUTH_TOKEN in environment" >&2
  exit 1
fi

cat > "$OVERLAY_DIR/secret.env" <<EOF
OPENPLANNER_API_KEY=${OPENPLANNER_API_KEY_VALUE}
OLLAMA_API_KEY=${PROXY_TOKEN_VALUE}
OPEN_HAX_OPENAI_PROXY_AUTH_TOKEN=${PROXY_TOKEN_VALUE}
EOF

cat > "$OVERLAY_DIR/host-proxx-endpointslice.generated.yaml" <<EOF
apiVersion: discovery.k8s.io/v1
kind: EndpointSlice
metadata:
  name: proxx-host-1
  namespace: openplanner
  labels:
    kubernetes.io/service-name: proxx-host
    endpointslice.kubernetes.io/managed-by: openplanner-local-kind
addressType: IPv4
ports:
  - name: http
    port: 8789
    protocol: TCP
endpoints:
  - addresses:
      - ${HOST_GATEWAY_IP}
EOF

log "prepared local-kind overlay"
log "host proxx gateway: ${HOST_GATEWAY_IP}"
log "wrote: $OVERLAY_DIR/secret.env"
log "wrote: $OVERLAY_DIR/host-proxx-endpointslice.generated.yaml"

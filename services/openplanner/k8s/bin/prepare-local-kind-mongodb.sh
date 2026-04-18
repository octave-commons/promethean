#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../../.." && pwd)"
OVERLAY_DIR="$ROOT_DIR/services/openplanner/k8s/overlays/local-kind-mongodb"
GENERATED_DIR="$OVERLAY_DIR/generated"
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
  printf '[openplanner-k8s-mongodb] %s\n' "$*"
}

mkdir -p "$GENERATED_DIR"

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
MONGODB_ROOT_USERNAME_VALUE="${MONGODB_ROOT_USERNAME:-openplannerRoot}"
MONGODB_ROOT_PASSWORD_VALUE="${MONGODB_ROOT_PASSWORD:-change-me-root-password}"
MONGOT_SYNC_PASSWORD_VALUE="${MONGOT_SYNC_PASSWORD:-change-me-mongot-password}"
OPENPLANNER_MONGO_APP_USERNAME_VALUE="${OPENPLANNER_MONGO_APP_USERNAME:-openplanner}"
OPENPLANNER_MONGO_APP_PASSWORD_VALUE="${OPENPLANNER_MONGO_APP_PASSWORD:-change-me-openplanner-password}"

if [[ -z "$PROXY_TOKEN_VALUE" ]]; then
  echo "Missing OPEN_HAX_OPENAI_PROXY_AUTH_TOKEN or PROXY_AUTH_TOKEN in environment" >&2
  exit 1
fi

python3 - <<'PY' > "$GENERATED_DIR/mongodb-keyfile"
import base64, os
print(base64.b64encode(os.urandom(756)).decode('ascii'))
PY
printf '%s' "$MONGOT_SYNC_PASSWORD_VALUE" > "$GENERATED_DIR/mongot-password"

cat > "$OVERLAY_DIR/openplanner-secret.env" <<EOF
OPENPLANNER_API_KEY=${OPENPLANNER_API_KEY_VALUE}
OPEN_HAX_OPENAI_PROXY_AUTH_TOKEN=${PROXY_TOKEN_VALUE}
OLLAMA_API_KEY=${PROXY_TOKEN_VALUE}
MONGODB_URI=mongodb://${OPENPLANNER_MONGO_APP_USERNAME_VALUE}:${OPENPLANNER_MONGO_APP_PASSWORD_VALUE}@mongodb-0.mongodb:27017/openplanner?replicaSet=rs0&authSource=openplanner
EOF

cat > "$OVERLAY_DIR/mongodb-secret.env" <<EOF
MONGODB_ROOT_USERNAME=${MONGODB_ROOT_USERNAME_VALUE}
MONGODB_ROOT_PASSWORD=${MONGODB_ROOT_PASSWORD_VALUE}
MONGOT_SYNC_PASSWORD=${MONGOT_SYNC_PASSWORD_VALUE}
OPENPLANNER_MONGO_APP_USERNAME=${OPENPLANNER_MONGO_APP_USERNAME_VALUE}
OPENPLANNER_MONGO_APP_PASSWORD=${OPENPLANNER_MONGO_APP_PASSWORD_VALUE}
EOF

cat > "$OVERLAY_DIR/host-proxx-endpointslice.generated.yaml" <<EOF
apiVersion: discovery.k8s.io/v1
kind: EndpointSlice
metadata:
  name: proxx-host-1
  namespace: openplanner
  labels:
    kubernetes.io/service-name: proxx-host
    endpointslice.kubernetes.io/managed-by: openplanner-local-kind-mongodb
addressType: IPv4
ports:
  - name: http
    port: 8789
    protocol: TCP
endpoints:
  - addresses:
      - ${HOST_GATEWAY_IP}
EOF

log "prepared local-kind-mongodb overlay"
log "host proxx gateway: ${HOST_GATEWAY_IP}"
log "wrote: $OVERLAY_DIR/openplanner-secret.env"
log "wrote: $OVERLAY_DIR/mongodb-secret.env"
log "wrote: $GENERATED_DIR/mongodb-keyfile"
log "wrote: $GENERATED_DIR/mongot-password"
log "wrote: $OVERLAY_DIR/host-proxx-endpointslice.generated.yaml"

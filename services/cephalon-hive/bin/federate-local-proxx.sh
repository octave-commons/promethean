#!/usr/bin/env bash
set -euo pipefail

REMOTE_HOST="${REMOTE_HOST:-error@big.ussy.promethean.rest}"
REMOTE_SSH_KEY="${REMOTE_SSH_KEY:-$HOME/.ssh/id_ed25519}"
LOCAL_PROXX_URL="${LOCAL_PROXX_URL:-http://127.0.0.1:8789}"
LOCAL_PROXX_TOKEN="${LOCAL_PROXX_TOKEN:-}"
REMOTE_PROXX_URL="${REMOTE_PROXX_URL:-http://big.ussy.promethean.rest:8789}"
REMOTE_PROXX_TOKEN="${REMOTE_PROXX_TOKEN:-}"
REMOTE_TUNNEL_PORT="${REMOTE_TUNNEL_PORT:-18789}"
REMOTE_RELAY_PORT="${REMOTE_RELAY_PORT:-18790}"

if [[ -z "$LOCAL_PROXX_TOKEN" ]]; then
  LOCAL_PROXX_TOKEN="$(python3 - <<'PY'
from pathlib import Path
for line in Path('services/proxx/.env').read_text().splitlines():
    if line.startswith('PROXY_AUTH_TOKEN='):
        print(line.split('=',1)[1])
        break
PY
)"
fi

if [[ -z "$REMOTE_PROXX_TOKEN" ]]; then
  REMOTE_PROXX_TOKEN="$(ssh -i "$REMOTE_SSH_KEY" "$REMOTE_HOST" 'python3 - <<"PY"
from pathlib import Path
for line in Path("/home/error/devel/services/cephalon-hive/.env").read_text().splitlines():
    if line.startswith("PROXX_PROXY_AUTH_TOKEN="):
        print(line.split("=",1)[1])
        break
PY')"
fi

ssh -i "$REMOTE_SSH_KEY" \
  -o ExitOnForwardFailure=yes \
  -o ServerAliveInterval=30 \
  -o ServerAliveCountMax=3 \
  -f -N -R "${REMOTE_TUNNEL_PORT}:127.0.0.1:8789" "$REMOTE_HOST"

ssh -i "$REMOTE_SSH_KEY" "$REMOTE_HOST" \
  "nohup socat TCP-LISTEN:${REMOTE_RELAY_PORT},bind=0.0.0.0,reuseaddr,fork TCP:127.0.0.1:${REMOTE_TUNNEL_PORT} >/tmp/local-proxx-relay.log 2>&1 &"

curl -sf -X POST \
  -H "Authorization: Bearer ${LOCAL_PROXX_TOKEN}" \
  -H 'Content-Type: application/json' \
  "${LOCAL_PROXX_URL}/api/ui/federation/peers" \
  -d "{\"ownerCredential\":\"${LOCAL_PROXX_TOKEN}\",\"label\":\"Big Ussy Cephalon Proxx\",\"baseUrl\":\"${REMOTE_PROXX_URL}\",\"authMode\":\"admin_key\",\"auth\":{\"token\":\"${REMOTE_PROXX_TOKEN}\"}}" || true

curl -sf -X POST \
  -H "Authorization: Bearer ${REMOTE_PROXX_TOKEN}" \
  -H 'Content-Type: application/json' \
  "${REMOTE_PROXX_URL}/api/ui/federation/peers" \
  -d "{\"ownerCredential\":\"${REMOTE_PROXX_TOKEN}\",\"label\":\"Err Local Proxx\",\"baseUrl\":\"http://host.docker.internal:${REMOTE_RELAY_PORT}\",\"authMode\":\"admin_key\",\"auth\":{\"token\":\"${LOCAL_PROXX_TOKEN}\"}}" || true

echo "Federation ritual complete."
echo "Remote can reach local via: http://host.docker.internal:${REMOTE_RELAY_PORT}"
echo "Local peer: ${LOCAL_PROXX_URL}"
echo "Remote peer: ${REMOTE_PROXX_URL}"

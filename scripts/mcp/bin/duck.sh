#!/usr/bin/env bash
set -euo pipefail
source "$HOME/devel/promethean/.env"

# Absolute docker path avoids PATH differences under Codex
DOCKER_BIN="${DOCKER_BIN:-/usr/bin/docker}"
if ! command -v "$DOCKER_BIN" >/dev/null 2>&1; then
    echo "[duck] ERROR: docker not found at $DOCKER_BIN; set DOCKER_BIN to the docker path" >&2
    exit 127
fi

# Check socket and group perms early
if [[ ! -S /var/run/docker.sock ]]; then
    echo "[duck] ERROR: /var/run/docker.sock missing (is Docker running?)" >&2
    exit 2
fi
if [[ ! -w /var/run/docker.sock ]]; then
    echo "[duck] ERROR: no permission to talk to docker socket. Add your user to 'docker' group and re-login:" >&2
    echo "       sudo usermod -aG docker \$USER && newgrp docker" >&2
    exit 13
fi

exec "$DOCKER_BIN" run -i --rm mcp/duckduckgo

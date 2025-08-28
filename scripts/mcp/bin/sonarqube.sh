#!/usr/bin/env bash
set -euo pipefail
source "$HOME/devel/promethean/.env"
# Only keep host.docker.internal if you truly need it on Linux.
exec docker run -i --rm \
     --add-host host.docker.internal:host-gateway \
     -e SONARQUBE_URL="$SONARQUBE_URL" \
     -e SONARQUBE_TOKEN="$SONARQUBE_TOKEN" \
     mcp/sonarqube

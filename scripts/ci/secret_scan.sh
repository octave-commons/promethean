#!/usr/bin/env bash
set -euo pipefail

MATCHES=$(grep -RInE "DISCORD_TOKEN|CLIENT_SECRET|REFRESH_TOKEN|bot_token" \
  --exclude-dir=.git \
  --exclude-dir=services/ts/discord-rest \
  --exclude-dir=services/ts/discord-gateway \
  --exclude=config/providers.yml \
  . || true)

if [ -n "$MATCHES" ]; then
  echo "Secret-like strings found outside allowed paths:" >&2
  echo "$MATCHES" >&2
  exit 1
fi

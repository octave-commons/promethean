#!/usr/bin/env bash
set -euo pipefail

cd /home/err/devel

# Install workspace dependencies
pnpm install --frozen-lockfile 2>/dev/null || pnpm install

# Build shared packages (order matters: radar-core first, then dependents)
pnpm --filter @workspace/radar-core build 2>/dev/null || true
pnpm --filter @workspace/mcp-foundation build 2>/dev/null || true
pnpm --filter @workspace/signal-atproto build 2>/dev/null || true
pnpm --filter @workspace/signal-embed-browser build 2>/dev/null || true

# Create .env for threat-radar-mcp if missing
if [ ! -f orgs/riatzukiza/threat-radar-mcp/.env ]; then
  cat > orgs/riatzukiza/threat-radar-mcp/.env <<'EOF'
PORT=9001
ADMIN_AUTH_KEY=\${ADMIN_AUTH_KEY:-placeholder}
DATABASE_URL=postgres://${PGUSER:-openai_proxy}:${PGPASSWORD:-changeme}@localhost:5432/threat_radar
ALLOW_UNAUTH_LOCAL=true
EOF
fi

# Ensure threat-radar database exists in local Postgres
docker exec open-hax-openai-proxy-open-hax-openai-proxy-db-1 \
  psql -U openai_proxy -tc "SELECT 1 FROM pg_database WHERE datname='threat_radar'" | grep -q 1 \
  || docker exec open-hax-openai-proxy-open-hax-openai-proxy-db-1 \
    psql -U openai_proxy -c "CREATE DATABASE threat_radar" 2>/dev/null || true

echo "[init.sh] Environment ready"

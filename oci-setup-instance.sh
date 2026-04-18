#!/usr/bin/env bash
set -euo pipefail

if [ -z "${1:-}" ]; then
  echo "Usage: $0 <public-ip>"
  exit 1
fi

HOST="opc@$1"
PROXY_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "=== Phase 1: Install Docker ==="
ssh -o StrictHostKeyChecking=no "$HOST" 'sudo bash -s' <<'REMOTE_SETUP'
set -euo pipefail

# Add swap (ARM has plenty of RAM but just in case)
if [ ! -f /swapfile ]; then
  fallocate -l 4G /swapfile
  chmod 600 /swapfile
  mkswap /swapfile
  swapon /swapfile
  echo '/swapfile swap swap defaults 0 0' >> /etc/fstab
fi

# Install Docker
dnf install -y dnf-utils
dnf config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
dnf install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
systemctl enable --now docker
usermod -aG docker opc

# Open firewall ports
firewall-cmd --permanent --add-port=8789/tcp
firewall-cmd --permanent --add-port=5174/tcp
firewall-cmd --reload

echo "Docker installed: $(docker --version)"
echo "Compose: $(docker compose version)"
REMOTE_SETUP

echo ""
echo "=== Phase 2: Transfer files ==="
ssh "$HOST" 'mkdir -p ~/openai-proxy'

# Transfer essential files
for f in Dockerfile docker-compose.yml package.json tsconfig.json ecosystem.container.config.cjs keys.json models.json; do
  if [ -f "$PROXY_DIR/$f" ]; then
    echo "  Copying $f..."
    scp "$PROXY_DIR/$f" "$HOST:~/openai-proxy/$f"
  fi
done

# Transfer src and web directories
echo "  Copying src/..."
rsync -az --delete "$PROXY_DIR/src/" "$HOST:~/openai-proxy/src/"
echo "  Copying web/..."
rsync -az --delete "$PROXY_DIR/web/" "$HOST:~/openai-proxy/web/"

echo ""
echo "=== Phase 3: Create production docker-compose ==="
ssh "$HOST" 'cat > ~/openai-proxy/docker-compose.prod.yml' <<'COMPOSE'
services:
  proxy:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "8789:8789"
      - "5174:5174"
    environment:
      NODE_ENV: production
      PROXY_HOST: 0.0.0.0
      PROXY_PORT: "8789"
      PROXY_AUTH_TOKEN: "${PROXY_AUTH_TOKEN:-change-me-open-hax-proxy-token}"
      PROXY_KEYS_FILE: /workspace/keys.json
      PROXY_MODELS_FILE: /workspace/models.json
      UPSTREAM_PROVIDER_ID: "${UPSTREAM_PROVIDER_ID:-openai}"
      UPSTREAM_FALLBACK_PROVIDER_IDS: "${UPSTREAM_FALLBACK_PROVIDER_IDS:-ollama-cloud,vivgrid}"
      DISABLED_PROVIDER_IDS: "${DISABLED_PROVIDER_IDS:-}"
      UPSTREAM_BASE_URL: "https://chatgpt.com/backend-api"
      UPSTREAM_PROVIDER_BASE_URLS: "ollama-cloud=https://ollama.com,openai=https://chatgpt.com/backend-api,vivgrid=https://api.vivgrid.com"
      OPENAI_PROVIDER_ID: openai
      OPENAI_BASE_URL: "https://chatgpt.com/backend-api"
      UPSTREAM_CHAT_COMPLETIONS_PATH: /v1/chat/completions
      OPENAI_CHAT_COMPLETIONS_PATH: /codex/responses/compact
      UPSTREAM_MESSAGES_PATH: /v1/messages
      UPSTREAM_MESSAGES_MODEL_PREFIXES: "claude-"
      UPSTREAM_RESPONSES_PATH: /v1/responses
      OPENAI_RESPONSES_PATH: /codex/responses
      UPSTREAM_RESPONSES_MODEL_PREFIXES: "gpt-"
      OPENAI_MODEL_PREFIXES: "openai/,openai:"
      OLLAMA_CHAT_PATH: /api/chat
      OLLAMA_MODEL_PREFIXES: "ollama/,ollama:"
      PROXY_KEY_RELOAD_MS: "5000"
      PROXY_KEY_COOLDOWN_MS: "30000"
      UPSTREAM_REQUEST_TIMEOUT_MS: "180000"
      PROXY_ALLOW_UNAUTHENTICATED: "false"
      DATABASE_URL: "postgresql://openai_proxy@db:5432/openai_proxy"
      PGPASSWORD: "${POSTGRES_PASSWORD:-change-me}" # pragma: allowlist secret
    volumes:
      - ./keys.json:/workspace/keys.json:ro
      - ./models.json:/workspace/models.json:ro
      - proxy-data:/app/data
    depends_on:
      db:
        condition: service_healthy
    restart: unless-stopped

  db:
    image: postgres:16-bookworm
    environment:
      POSTGRES_DB: openai_proxy
      POSTGRES_USER: openai_proxy
      POSTGRES_PASSWORD: "${POSTGRES_PASSWORD:-change-me}" # pragma: allowlist secret
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U openai_proxy -d openai_proxy"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 10s
    restart: unless-stopped

volumes:
  pgdata:
  proxy-data:
COMPOSE

echo ""
echo "=== Phase 4: Build and start ==="
ssh "$HOST" 'cd ~/openai-proxy && docker compose -f docker-compose.prod.yml up -d --build' 2>&1

echo ""
echo "=== Phase 5: Wait and verify ==="
sleep 15
ssh "$HOST" 'cd ~/openai-proxy && docker compose -f docker-compose.prod.yml ps && echo "---" && docker compose -f docker-compose.prod.yml logs --tail=20 proxy'

echo ""
echo "========================================="
echo "  Deployment complete!"
echo "  Proxy: http://$1:8789"
echo "  Web UI: http://$1:5174"
echo "========================================="

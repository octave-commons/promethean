#!/bin/bash
# Deploy Cephalon Hive to big.ussy.promethean.rest
#
# Usage:
#   ./deploy.sh [duck|openhax|openskull|all]
#
# Environment:
#   DUCK_DISCORD_TOKEN    - Duck bot token
#   OPENHAX_DISCORD_TOKEN - OpenHax bot token
#   OPENSKULL_DISCORD_TOKEN - OpenSkull bot token

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
WORKSPACE_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
REMOTE_WORKSPACE_ROOT="/home/error/devel"
SSH_HOST="error@big.ussy.promethean.rest"
DEPLOY_PATH="/home/error/devel/services/cephalon-hive"
PROFILE="${1:-duck}"

echo "=== Cephalon Hive Deployment ==="
echo "Target: $SSH_HOST"
echo "Profile: $PROFILE"
echo ""

# Build standalone bundle first
echo "Building standalone bundle..."
cd "$WORKSPACE_ROOT/orgs/octave-commons/cephalon/packages/cephalon-ts"
if ! pnpm tsup --config tsup.standalone.ts; then
    echo "Error: Failed to build standalone bundle"
    exit 1
fi

# Create remote directory
echo "Creating remote directories..."
ssh "$SSH_HOST" "mkdir -p $DEPLOY_PATH/dist $DEPLOY_PATH/sync $DEPLOY_PATH/dashboard $DEPLOY_PATH/proxx"

# Sync compose files
echo "Syncing compose files..."
cd "$SCRIPT_DIR"
scp docker-compose.yml docker-compose.base.yml "$SSH_HOST:$DEPLOY_PATH/"

# Sync Dockerfile and runtime files
echo "Syncing Dockerfile and runtime..."
scp Dockerfile entrypoint.sh ecosystem.config.cjs "$SSH_HOST:$DEPLOY_PATH/"

# Sync support scripts/config used by in-container node services.
echo "Syncing hive support scripts..."
rsync -avz --delete "$SCRIPT_DIR/sync/" "$SSH_HOST:$DEPLOY_PATH/sync/"
rsync -avz --delete "$SCRIPT_DIR/dashboard/" "$SSH_HOST:$DEPLOY_PATH/dashboard/"
rsync -avz --delete "$SCRIPT_DIR/proxx/" "$SSH_HOST:$DEPLOY_PATH/proxx/"

# Sync live source package used by the in-container rebuild.
# The cephalons rebuild from /workspace on boot, so shipping only dist/ is not enough.
echo "Syncing cephalon source package..."
ssh "$SSH_HOST" "mkdir -p $REMOTE_WORKSPACE_ROOT/orgs/octave-commons/cephalon/packages/cephalon-ts"
rsync -avz \
    --delete \
    --exclude node_modules \
    --exclude dist \
    --exclude build \
    --exclude coverage \
    "$WORKSPACE_ROOT/orgs/octave-commons/cephalon/packages/cephalon-ts/" \
    "$SSH_HOST:$REMOTE_WORKSPACE_ROOT/orgs/octave-commons/cephalon/packages/cephalon-ts/"

# Sync proxx source so federation/oauth behavior stays consistent across hosts.
echo "Syncing proxx source package..."
ssh "$SSH_HOST" "mkdir -p $REMOTE_WORKSPACE_ROOT/orgs/open-hax/proxx"
rsync -avz \
    --delete \
    --exclude node_modules \
    --exclude dist \
    --exclude build \
    --exclude coverage \
    "$WORKSPACE_ROOT/orgs/open-hax/proxx/" \
    "$SSH_HOST:$REMOTE_WORKSPACE_ROOT/orgs/open-hax/proxx/"

# Sync openplanner (compose build context expects orgs/octave-commons/cephalon/packages/openplanner on the remote).
echo "Syncing openplanner source package..."
ssh "$SSH_HOST" "mkdir -p $REMOTE_WORKSPACE_ROOT/orgs/riatzukiza/openplanner"
rsync -avz \
    --delete \
    --exclude node_modules \
    --exclude dist \
    --exclude build \
    --exclude coverage \
    --exclude .env \
    "$WORKSPACE_ROOT/orgs/riatzukiza/openplanner/" \
    "$SSH_HOST:$REMOTE_WORKSPACE_ROOT/orgs/riatzukiza/openplanner/"

# Sync standalone bundle
echo "Syncing standalone bundle..."
rsync -avz "$WORKSPACE_ROOT/orgs/octave-commons/cephalon/packages/cephalon-ts/dist/" "$SSH_HOST:$DEPLOY_PATH/dist/"

# Create env file on remote
echo "Creating environment file..."
ssh "$SSH_HOST" "cat > $DEPLOY_PATH/.env << EOF
# Proxx auth + base URL for the cephalons.
# On big ussy we typically talk to the shared canonical proxx (service name: "proxx") running on the ai-infra network.
PROXX_PROXY_AUTH_TOKEN=${PROXX_PROXY_AUTH_TOKEN:-change-me-open-hax-proxy-token}
CEPHALON_PROXX_BASE_URL=${CEPHALON_PROXX_BASE_URL:-http://proxx:8789}
# Federation sync defaults for big ussy: pull projected accounts from a local spoke peer.
PROXX_FEDERATION_DEFAULT_OWNER_SUBJECT=${PROXX_FEDERATION_DEFAULT_OWNER_SUBJECT:-did:web:big.ussy.promethean.rest}
CEPHALON_FEDERATION_SYNC_PEER_ID=${CEPHALON_FEDERATION_SYNC_PEER_ID:-spoke-federation}
CEPHALON_FEDERATION_SYNC_IMPORT_PROVIDERS=${CEPHALON_FEDERATION_SYNC_IMPORT_PROVIDERS:-ollama-cloud,vivgrid,blongs-definately-legit-model}
CEPHALON_FEDERATION_SYNC_BRIDGE_AGENT_ID=${CEPHALON_FEDERATION_SYNC_BRIDGE_AGENT_ID:-err-local-proxx}
CEPHALON_FEDERATION_SYNC_BRIDGE_IMPORT_PROVIDERS=${CEPHALON_FEDERATION_SYNC_BRIDGE_IMPORT_PROVIDERS:-openai,ollama-cloud,requesty,factory,gemini,zai}
CEPHALON_FEDERATION_SYNC_BRIDGE_IMPORT_LIMIT=${CEPHALON_FEDERATION_SYNC_BRIDGE_IMPORT_LIMIT:-500}
CEPHALON_FEDERATION_SYNC_BRIDGE_REFRESH_BUFFER_MS=${CEPHALON_FEDERATION_SYNC_BRIDGE_REFRESH_BUFFER_MS:-600000}
CEPHALON_ENABLE_IRC=${CEPHALON_ENABLE_IRC:-true}
CEPHALON_IRC_HOST=${CEPHALON_IRC_HOST:-irc.ussy.host}
CEPHALON_IRC_PORT=${CEPHALON_IRC_PORT:-6697}
CEPHALON_IRC_TLS=${CEPHALON_IRC_TLS:-true}
CEPHALON_IRC_TLS_SERVERNAME=${CEPHALON_IRC_TLS_SERVERNAME:-ussyco.de}
CEPHALON_IRC_WORKSPACE=${CEPHALON_IRC_WORKSPACE:-ussy}
CEPHALON_IRC_CHANNEL=${CEPHALON_IRC_CHANNEL:-#ussycode}
DUCK_DISCORD_TOKEN=${DUCK_DISCORD_TOKEN:-}
OPENHAX_DISCORD_TOKEN=${OPENHAX_DISCORD_TOKEN:-}
OPENSKULL_DISCORD_TOKEN=${OPENSKULL_DISCORD_TOKEN:-${OPEN_SKULL_DISCORD_TOKEN:-}}
ERROR_DISCORD_TOKEN=${ERROR_DISCORD_TOKEN:-${DISCORD_ERROR_BOT_TOKEN:-}}
EOF"

# Build and deploy
echo ""
echo "Building and deploying..."
ssh "$SSH_HOST" "cd $DEPLOY_PATH && \
    docker compose build --no-cache && \
    docker compose --profile $PROFILE up -d --remove-orphans"

echo ""
echo "=== Deployment Complete ==="
echo "Checking status..."
ssh "$SSH_HOST" "docker compose -f $DEPLOY_PATH/docker-compose.yml ps"

echo ""
echo "Logs: ssh $SSH_HOST 'docker compose -f $DEPLOY_PATH/docker-compose.yml logs -f'"

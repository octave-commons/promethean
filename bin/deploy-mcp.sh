#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

REPO_URL="https://github.com/riatzukiza/devel"
RENDER_DEPLOY_URL="https://render.com/deploy?repo=${REPO_URL}"

usage() {
  cat <<EOF
Usage: $(basename "$0") <command>

Commands:
  render          Open Render Blueprint deploy in browser
  docker:build    Build all MCP service images locally
  docker:up       Start all MCP services with docker compose
  docker:down     Stop all MCP services
  validate        Validate render.yaml and Dockerfiles
  status          Show status of running containers
  generate        Regenerate hermes Dockerfiles

Environment:
  SERVICES        Comma-separated list of services to build (default: all)
  REGISTRY        Container registry prefix (default: none)
  TAG             Image tag (default: latest)
EOF
}

REGISTRY="${REGISTRY:-}"
TAG="${TAG:-latest}"

ALL_SERVICES="mcp-devtools mcp-exec mcp-github mcp-ollama mcp-process mcp-sandboxes mcp-tdd mcp-fs-oauth threat-radar-mcp"
SERVICES="${SERVICES:-$ALL_SERVICES}"

log() { echo "[deploy-mcp] $*"; }

cmd_validate() {
  log "Validating render.yaml..."
  if command -v render &>/dev/null; then
    render blueprints validate render.yaml
  else
    python3 -c "import yaml; yaml.safe_load(open('render.yaml'))" 2>/dev/null && log "render.yaml: valid YAML" || {
      log "ERROR: render.yaml is not valid YAML"; exit 1
    }
  fi

  log "Validating Dockerfiles..."
  local count=0
  for svc in $SERVICES; do
    local df
    case "$svc" in
      threat-radar-mcp) df="orgs/riatzukiza/threat-radar-mcp/Dockerfile" ;;
      *)                df="services/$svc/Dockerfile" ;;
    esac
    if [ -f "$df" ]; then
      log "  $df: exists"
      count=$((count + 1))
    else
      log "  ERROR: $df missing"
    fi
  done
  log "Validated $count Dockerfiles."

  log "Validating docker-compose.mcp.yaml..."
  docker compose -f docker-compose.mcp.yaml config --quiet 2>/dev/null && log "docker-compose.mcp.yaml: valid" || log "docker-compose.mcp.yaml: invalid"
}

cmd_docker_build() {
  log "Building MCP service images..."
  for svc in $SERVICES; do
    local df ctx img
    case "$svc" in
      threat-radar-mcp)
        df="orgs/riatzukiza/threat-radar-mcp/Dockerfile"
        ctx="."
        ;;
      *)
        df="services/$svc/Dockerfile"
        ctx="."
        ;;
    esac

    if [ -n "$REGISTRY" ]; then
      img="${REGISTRY}/${svc}:${TAG}"
    else
      img="${svc}:${TAG}"
    fi

    log "Building $img from $df..."
    docker build -f "$df" -t "$img" "$ctx"
  done
  log "All images built."
}

cmd_docker_push() {
  if [ -z "$REGISTRY" ]; then
    log "ERROR: REGISTRY must be set for push. Example: REGISTRY=ghcr.io/riatzukiza $0 docker:push"
    exit 1
  fi
  for svc in $SERVICES; do
    local img="${REGISTRY}/${svc}:${TAG}"
    log "Pushing $img..."
    docker push "$img"
  done
  log "All images pushed."
}

cmd_docker_up() {
  log "Starting MCP services..."
  docker compose -f docker-compose.mcp.yaml up -d --build
  log "Services started. Run '$0 status' to check."
}

cmd_docker_down() {
  log "Stopping MCP services..."
  docker compose -f docker-compose.mcp.yaml down
}

cmd_status() {
  docker compose -f docker-compose.mcp.yaml ps 2>/dev/null || log "No services running."
}

cmd_render() {
  log "Opening Render Blueprint deploy..."
  log "URL: $RENDER_DEPLOY_URL"
  if command -v xdg-open &>/dev/null; then
    xdg-open "$RENDER_DEPLOY_URL"
  elif command -v open &>/dev/null; then
    open "$RENDER_DEPLOY_URL"
  else
    log "Open this URL in your browser: $RENDER_DEPLOY_URL"
  fi
}

cmd_generate() {
  log "Regenerating hermes Dockerfiles..."
  bash "$ROOT_DIR/bin/generate-hermes-dockerfiles.sh"
}

case "${1:-}" in
  render)        cmd_render ;;
  docker:build)  cmd_docker_build ;;
  docker:push)   cmd_docker_push ;;
  docker:up)     cmd_docker_up ;;
  docker:down)   cmd_docker_down ;;
  validate)      cmd_validate ;;
  status)        cmd_status ;;
  generate)      cmd_generate ;;
  *)             usage ;;
esac

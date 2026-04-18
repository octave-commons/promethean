#!/usr/bin/env bash
set -euo pipefail

CEPHALON_NAME="${CEPHALON_NAME:-DUCK}"
CEPHALON_SLUG="$(printf '%s' "$CEPHALON_NAME" | tr '[:upper:]' '[:lower:]')"
MEMORY_UI_PORT="${MEMORY_UI_PORT:-3000}"
GLM_MODEL="${GLM_MODEL:-glm-5-turbo}"
CEPHALON_HOME="${CEPHALON_HOME:-/cephalon}"
CEPHALON_REPO_NAME="${CEPHALON_REPO_NAME:-${CEPHALON_SLUG}-cephalon}"
CEPHALON_MONOREPO_ROOT="${CEPHALON_MONOREPO_ROOT:-$CEPHALON_HOME/orgs/octave-commons/$CEPHALON_REPO_NAME}"
CEPHALON_SOURCE_ROOT="${CEPHALON_SOURCE_ROOT:-$CEPHALON_MONOREPO_ROOT/packages/cephalon-ts}"
CEPHALON_LOG_FILE="${CEPHALON_LOG_FILE:-$CEPHALON_HOME/logs/${CEPHALON_SLUG}.log}"
CEPHALON_STATE_DIR="${CEPHALON_STATE_DIR:-$CEPHALON_HOME/state}"
SEED_WORKSPACE="${SEED_WORKSPACE:-/workspace}"
TSUP_BIN="${TSUP_BIN:-$SEED_WORKSPACE/node_modules/.pnpm/node_modules/.bin/tsup}"
PNPM_STORE_DIR="${PNPM_STORE_DIR:-$CEPHALON_HOME/.pnpm-store}"

export CEPHALON_MONOREPO_ROOT
export CEPHALON_SOURCE_ROOT
export CEPHALON_LOG_FILE
export CEPHALON_STATE_DIR
export PORT="$MEMORY_UI_PORT"
export PNPM_STORE_DIR

mkdir -p "$(dirname "$CEPHALON_LOG_FILE")" "$CEPHALON_STATE_DIR" "$CEPHALON_HOME/orgs/octave-commons" "$CEPHALON_HOME/git/octave-commons"
exec > >(tee -a "$CEPHALON_LOG_FILE") 2>&1

log() {
  echo "[cephalon-hive] $*"
}

bootstrap_clone() {
  if [ -d "$CEPHALON_MONOREPO_ROOT/.git" ]; then
    log "Refreshing persisted monorepo clone at $CEPHALON_MONOREPO_ROOT"
  else
    log "Materializing workspace mirror into $CEPHALON_MONOREPO_ROOT"
  fi
  mkdir -p "$CEPHALON_MONOREPO_ROOT/packages"

  for rel in \
    packages/cephalon-ts \
    packages/event \
    packages/openplanner-cljs-client
  do
    if [ -d "$SEED_WORKSPACE/$rel" ]; then
      mkdir -p "$CEPHALON_MONOREPO_ROOT/$(dirname "$rel")"
      rsync -a \
        --delete \
        --exclude .git \
        --exclude node_modules \
        --exclude dist \
        --exclude coverage \
        --exclude .turbo \
        --exclude .next \
        --exclude logs \
        "$SEED_WORKSPACE/$rel/" "$CEPHALON_MONOREPO_ROOT/$rel/"
    fi
  done

  if [ ! -d "$CEPHALON_MONOREPO_ROOT/.git" ]; then
    (
      cd "$CEPHALON_MONOREPO_ROOT"
      git init >/dev/null
      git add -A >/dev/null 2>&1 || true
      git commit -m "Seed workspace mirror for $CEPHALON_NAME" >/dev/null 2>&1 || true
    )
  fi
}

configure_git_identity() {
  local bare_remote="$CEPHALON_HOME/git/octave-commons/${CEPHALON_REPO_NAME}.git"

  if [ ! -d "$bare_remote" ]; then
    git init --bare "$bare_remote" >/dev/null
  fi

  git config --global --add safe.directory "$CEPHALON_MONOREPO_ROOT"
  git -C "$CEPHALON_MONOREPO_ROOT" config user.name "$CEPHALON_NAME Cephalon"
  git -C "$CEPHALON_MONOREPO_ROOT" config user.email "${CEPHALON_SLUG}@cephalon.local"

  if git -C "$CEPHALON_MONOREPO_ROOT" remote | grep -qx origin; then
    git -C "$CEPHALON_MONOREPO_ROOT" remote set-url origin "$bare_remote"
  else
    git -C "$CEPHALON_MONOREPO_ROOT" remote add origin "$bare_remote"
  fi

  if ! git -C "$CEPHALON_MONOREPO_ROOT" remote | grep -qx seed; then
    git -C "$CEPHALON_MONOREPO_ROOT" remote add seed "file://$SEED_WORKSPACE"
  else
    git -C "$CEPHALON_MONOREPO_ROOT" remote set-url seed "file://$SEED_WORKSPACE"
  fi

  if ! git -C "$CEPHALON_MONOREPO_ROOT" rev-parse --verify main >/dev/null 2>&1; then
    git -C "$CEPHALON_MONOREPO_ROOT" branch -M main >/dev/null 2>&1 || true
  fi
}

link_workspace_toolchain() {
  if [ ! -e "$CEPHALON_MONOREPO_ROOT/node_modules" ] && [ -d "$SEED_WORKSPACE/node_modules" ]; then
    ln -s "$SEED_WORKSPACE/node_modules" "$CEPHALON_MONOREPO_ROOT/node_modules"
  fi

  for pkg in cephalon-ts openplanner-cljs-client event; do
    if [ ! -e "$CEPHALON_MONOREPO_ROOT/packages/$pkg/node_modules" ] && [ -d "$SEED_WORKSPACE/packages/$pkg/node_modules" ]; then
      ln -s "$SEED_WORKSPACE/packages/$pkg/node_modules" "$CEPHALON_MONOREPO_ROOT/packages/$pkg/node_modules"
    fi
  done
}

ensure_workspace_manifests() {
  if [ ! -f "$CEPHALON_MONOREPO_ROOT/package.json" ]; then
    cat > "$CEPHALON_MONOREPO_ROOT/package.json" <<'JSON'
{
  "name": "cephalon-mirror-workspace",
  "private": true,
  "packageManager": "pnpm@10.32.1"
}
JSON
  fi

  if [ ! -f "$CEPHALON_MONOREPO_ROOT/pnpm-workspace.yaml" ]; then
    cat > "$CEPHALON_MONOREPO_ROOT/pnpm-workspace.yaml" <<'YAML'
packages:
  - "packages/*"
  - "services/*"
YAML
  fi
}

seed_workspace_dependency_dists() {
  if [ -f "$SEED_WORKSPACE/packages/event/dist/index.js" ]; then
    mkdir -p "$CEPHALON_SOURCE_ROOT/../event/dist"
    cp "$SEED_WORKSPACE/packages/event/dist/index.js" "$CEPHALON_SOURCE_ROOT/../event/dist/index.js"
  fi
  if [ -f "$SEED_WORKSPACE/packages/event/dist/index.cjs" ]; then
    mkdir -p "$CEPHALON_SOURCE_ROOT/../event/dist"
    cp "$SEED_WORKSPACE/packages/event/dist/index.cjs" "$CEPHALON_SOURCE_ROOT/../event/dist/index.cjs"
  fi
  if [ -f "$SEED_WORKSPACE/packages/openplanner-cljs-client/dist/index.js" ]; then
    mkdir -p "$CEPHALON_SOURCE_ROOT/../openplanner-cljs-client/dist"
    cp "$SEED_WORKSPACE/packages/openplanner-cljs-client/dist/index.js" "$CEPHALON_SOURCE_ROOT/../openplanner-cljs-client/dist/index.js"
  fi
}

ensure_workspace_toolchain() {
  local local_tsup_bin="$CEPHALON_SOURCE_ROOT/node_modules/.bin/tsup"

  seed_workspace_dependency_dists

  if [ -x "$TSUP_BIN" ]; then
    return 0
  fi

  if [ -x "$local_tsup_bin" ]; then
    TSUP_BIN="$local_tsup_bin"
    return 0
  fi

  log "Installing source toolchain inside $CEPHALON_SOURCE_ROOT"
  mkdir -p "$PNPM_STORE_DIR"
  (
    cd "$CEPHALON_SOURCE_ROOT"
    node <<'NODE'
const fs = require('fs');
const path = require('path');
const pkgPath = path.join(process.cwd(), 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
pkg.dependencies = pkg.dependencies || {};
if (pkg.dependencies['@promethean-os/event'] === 'workspace:*') {
  pkg.dependencies['@promethean-os/event'] = 'file:../event';
}
if (pkg.dependencies['@promethean-os/openplanner-cljs-client'] === 'workspace:*') {
  pkg.dependencies['@promethean-os/openplanner-cljs-client'] = 'file:../openplanner-cljs-client';
}
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');

NODE
    corepack pnpm config set store-dir "$PNPM_STORE_DIR" >/dev/null 2>&1 || true
    corepack pnpm install --ignore-workspace --frozen-lockfile=false
    if [ ! -e ../event/node_modules ]; then
      ln -s "$CEPHALON_SOURCE_ROOT/node_modules" ../event/node_modules
    fi
    if [ ! -e ../openplanner-cljs-client/node_modules ]; then
      ln -s "$CEPHALON_SOURCE_ROOT/node_modules" ../openplanner-cljs-client/node_modules
    fi
    node -e "0" >/dev/null 2>&1
    seed_workspace_dependency_dists
    if [ ! -f ../event/dist/index.cjs ]; then
      "$local_tsup_bin" ../event/src/index.ts --format cjs,esm --platform node --target node22 --out-dir ../event/dist
    fi
  )

  TSUP_BIN="$local_tsup_bin"
}

build_runtime() {
  if [ ! -x "$TSUP_BIN" ]; then
    log "tsup binary missing at $TSUP_BIN"
    return 1
  fi

  log "Building source repo at $CEPHALON_SOURCE_ROOT"
  (
    cd "$CEPHALON_SOURCE_ROOT"
    "$TSUP_BIN" --config tsup.standalone.ts
    mkdir -p dist
    rm -rf dist/public
    cp -r src/ui/public dist/public
  )
}

select_runtime_bundle() {
  if [ -f "$CEPHALON_SOURCE_ROOT/dist/cli.cjs" ]; then
    printf '%s' "$CEPHALON_SOURCE_ROOT/dist/cli.cjs"
    return 0
  fi

  if [ -f "/app/dist/cli.cjs" ]; then
    printf '%s' "/app/dist/cli.cjs"
    return 0
  fi

  return 1
}

log "Starting $CEPHALON_NAME cephalon"
log "MongoDB: ${CEPHALON_MONGODB_URI:-not set}"
log "Repo: $CEPHALON_MONOREPO_ROOT"
log "Source: $CEPHALON_SOURCE_ROOT"
log "Log file: $CEPHALON_LOG_FILE"

bootstrap_clone
configure_git_identity
link_workspace_toolchain
ensure_workspace_manifests
ensure_workspace_toolchain

if ! build_runtime; then
  log "Source rebuild failed; falling back to last available bundle"
fi

RUNTIME_BUNDLE="$(select_runtime_bundle)"
log "Running bundle: $RUNTIME_BUNDLE"

exec node "$RUNTIME_BUNDLE"

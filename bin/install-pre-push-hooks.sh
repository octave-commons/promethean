#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR=$(git rev-parse --show-toplevel 2>/dev/null || pwd)
PRE_PUSH_SOURCE="$ROOT_DIR/.hooks/pre-push-typecheck.sh"
PRE_COMMIT_SOURCE="$ROOT_DIR/.hooks/pre-commit-secrets.sh"

assert_hook_source() {
  local hook_source=$1
  if [[ ! -f "$hook_source" ]]; then
    echo "Unable to find hook source at $hook_source" >&2
    exit 1
  fi
}

assert_hook_source "$PRE_PUSH_SOURCE"
assert_hook_source "$PRE_COMMIT_SOURCE"

install_hook() {
  local hook_dir=$1
  local hook_name=$2
  local hook_source=$3
  mkdir -p "$hook_dir"
  install -m 755 "$hook_source" "$hook_dir/$hook_name"
}

ensure_nx_ignore() {
  local exclude_file=$1
  mkdir -p "$(dirname "$exclude_file")"
  touch "$exclude_file"
  if ! grep -qx '.nx/' "$exclude_file" >/dev/null 2>&1; then
    printf '\n.nx/\n' >> "$exclude_file"
  fi
}

# Install for root repository
ROOT_HOOK_DIR=$(git -C "$ROOT_DIR" rev-parse --git-path hooks)
install_hook "$ROOT_HOOK_DIR" pre-push "$PRE_PUSH_SOURCE"
install_hook "$ROOT_HOOK_DIR" pre-commit "$PRE_COMMIT_SOURCE"
echo "Installed pre-push and pre-commit hooks for root repo"
ROOT_EXCLUDE=$(git -C "$ROOT_DIR" rev-parse --git-path info/exclude)
ensure_nx_ignore "$ROOT_EXCLUDE"
echo "Ensured .nx ignore for root repo"
echo "Default pre-push typecheck mode: PREPUSH_TYPECHECK_MODE=fast"
echo "Set PREPUSH_TYPECHECK_MODE=nx before git push to run Nx affected typechecks"

# Install for each submodule recursively
if git -C "$ROOT_DIR" rev-parse --git-dir >/dev/null 2>&1; then
  export PRE_PUSH_SOURCE PRE_COMMIT_SOURCE
  if ! git -C "$ROOT_DIR" submodule foreach --quiet --recursive '
    hook_dir=$(git rev-parse --git-path hooks)
    mkdir -p "$hook_dir"
    install -m 755 "$PRE_PUSH_SOURCE" "$hook_dir/pre-push"
    install -m 755 "$PRE_COMMIT_SOURCE" "$hook_dir/pre-commit"
    exclude_file=$(git rev-parse --git-path info/exclude)
    mkdir -p "$(dirname "$exclude_file")"
    touch "$exclude_file"
    if ! grep -qx ".nx/" "$exclude_file" >/dev/null 2>&1; then
      printf "\n.nx/\n" >> "$exclude_file"
    fi
    echo "Installed pre-push/pre-commit hooks and ensured .nx ignore for $path"
  '; then
    echo "Warning: hook installation skipped for one or more nested submodules; fix their .gitmodules and rerun if you need hook coverage there" >&2
  fi
fi

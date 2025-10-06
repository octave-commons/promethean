#!/usr/bin/env bash
set -euo pipefail

log() {
  printf '[codex_build] %s\n' "$*" >&2
}

resolve_git_commit() {
  local ref="$1"
  if git rev-parse --verify "${ref}^{commit}" >/dev/null 2>&1; then
    return 0
  fi
  return 1
}

select_base() {
  local candidate
  local requested="${NX_BASE:-}"
  if [[ -n "$requested" ]]; then
    if resolve_git_commit "$requested" >/dev/null; then
      echo "$requested"
      return 0
    fi
    log "WARN: requested NX_BASE='$requested' not found; falling back to auto-detect."
  fi
  for candidate in origin/main origin/master main master HEAD^; do
    if resolve_git_commit "$candidate" >/dev/null; then
      echo "$candidate"
      return 0
    fi
  done
  if first_commit=$(git rev-list --max-parents=0 HEAD 2>/dev/null | tail -n 1); then
    echo "$first_commit"
    return 0
  fi
  echo HEAD
}

select_head() {
  local requested="${NX_HEAD:-HEAD}"
  if resolve_git_commit "$requested" >/dev/null; then
    echo "$requested"
    return 0
  fi
  log "WARN: requested NX_HEAD='$requested' not found; defaulting to HEAD."
  echo HEAD
}

run_nx_affected() {
  local nx_base nx_head parallel
  nx_base="$(select_base)"
  nx_head="$(select_head)"
  parallel="${NX_PARALLEL:-3}"

  local cmd=(pnpm exec nx affected --target=build "--parallel=${parallel}" --output-style=static --base "$nx_base" --head "$nx_head")

  log "info: attempting Nx affected build (base=${nx_base} head=${nx_head} parallel=${parallel})."
  if "${cmd[@]}"; then
    return 0
  fi

  local rc=$?
  log "WARN: Nx affected build failed with rc=${rc}; falling back to recursive pnpm build."
  return 1
}

run_recursive_build() {
  log "info: running fallback pnpm recursive build."
  pnpm -r --no-bail build
}

main() {
  if run_nx_affected; then
    exit 0
  fi
  run_recursive_build
}

main "$@"

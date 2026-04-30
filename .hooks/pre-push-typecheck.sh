#!/usr/bin/env bash
set -euo pipefail

# Pre-push typecheck configuration:
# - SKIP_PREPUSH_TYPECHECK=1 skips this hook.
# - PREPUSH_TYPECHECK_MODE=fast (default) typechecks changed allowed-org submodule pointers.
# - PREPUSH_TYPECHECK_MODE=nx runs the Nx affected typecheck path instead.
# Example: PREPUSH_TYPECHECK_MODE=nx git push

if [[ "${SKIP_PREPUSH_TYPECHECK:-0}" == "1" ]]; then
  printf "[pre-push:typecheck] Skipping because SKIP_PREPUSH_TYPECHECK=1\n"
  exit 0
fi

repo_root=$(git rev-parse --show-toplevel)
cd "$repo_root"

log() {
  printf "[pre-push:typecheck] %s\n" "$1"
}

format_mib() {
  awk -v bytes="$1" 'BEGIN { printf "%.2f MiB", bytes / 1048576 }'
}

matches_blocked_generated_path() {
  case "$1" in
    services/*/db-backups/*|labs/*/runs/*|*__pycache__/*|*.pyc)
      return 0
      ;;
    *)
      return 1
      ;;
  esac
}

remote_name="${1:-origin}"
_remote_url="${2:-}"
head_sha=$(git rev-parse HEAD)
push_updates=()

if [[ ! -t 0 ]]; then
  while read -r local_ref local_sha remote_ref remote_sha; do
    push_updates+=("$local_ref $local_sha $remote_ref $remote_sha")
  done
fi

selected_push_line=""
for entry in "${push_updates[@]}"; do
  IFS=' ' read -r _entry_local_ref entry_local_sha _entry_remote_ref _entry_remote_sha <<<"$entry"
  if [[ -z "$selected_push_line" ]]; then
    selected_push_line="$entry"
  fi
  if [[ "$entry_local_sha" == "$head_sha" ]]; then
    selected_push_line="$entry"
    break
  fi
done

selected_remote_ref=""
selected_remote_sha=""
if [[ -n "$selected_push_line" ]]; then
  IFS=' ' read -r _selected_local_ref _selected_local_sha selected_remote_ref selected_remote_sha <<<"$selected_push_line"
fi

remote_branch_name=""
if [[ -n "$selected_remote_ref" ]]; then
  remote_branch_name="${selected_remote_ref#refs/heads/}"
fi

default_base_candidate=""
default_base_note=""
if [[ -n "$selected_remote_sha" && ! "$selected_remote_sha" =~ ^0+$ ]]; then
  if git cat-file -e "${selected_remote_sha}^{commit}" >/dev/null 2>&1; then
    default_base_candidate="$selected_remote_sha"
    default_base_note="remote ${remote_name}/${remote_branch_name:-$selected_remote_ref}"
  fi
fi

if [[ -z "$default_base_candidate" && -n "$remote_branch_name" ]]; then
  tracking_ref="refs/remotes/${remote_name}/${remote_branch_name}"
  if git rev-parse --verify "$tracking_ref" >/dev/null 2>&1; then
    default_base_candidate="$tracking_ref"
    default_base_note="$tracking_ref"
  fi
fi

NX_RESOLVED_BASE="${NX_BASE_REF:-${default_base_candidate:-origin/main}}"
if [[ -n "${NX_BASE_REF:-}" ]]; then
  NX_BASE_SELECTION_MSG="Using Nx base override ${NX_RESOLVED_BASE} (NX_BASE_REF)"
elif [[ -n "$default_base_note" ]]; then
  NX_BASE_SELECTION_MSG="Using Nx base derived from ${default_base_note}: ${NX_RESOLVED_BASE}"
else
  NX_BASE_SELECTION_MSG="Using Nx base default ${NX_RESOLVED_BASE}"
fi

MAX_GIT_PUSH_BLOB_BYTES=${MAX_GIT_PUSH_BLOB_BYTES:-104857600}
PUSH_BASE_SHA=""
PUSH_HEAD_REF=""
PUSH_BASE_SELECTION_MSG=""

ORG_PREFIXES=(
  "orgs-riatzukiza-"
  "orgs-open-hax-"
  "orgs-octave-commons-"
)

ALLOWED_ORGS_REGEX='^orgs/(riatzukiza|open-hax|octave-commons)/[^/]+(/[^/]+)*$'

COMPUTED_BASE_USED_FALLBACK=0
COMPUTED_BASE_SHA=""

compute_base_sha() {
  local head_ref="$1"
  local desired_base="$2"
  local fallback_label="$3"
  local failure_message="$4"
  local base_sha=""

  COMPUTED_BASE_USED_FALLBACK=0
  COMPUTED_BASE_SHA=""

  if git rev-parse --verify "$desired_base" >/dev/null 2>&1; then
    if base_sha=$(git merge-base "$head_ref" "$desired_base" 2>/dev/null); then
      :
    else
      base_sha=$(git rev-parse "$desired_base" 2>/dev/null || true)
    fi
  fi

  if [[ -z "$base_sha" ]]; then
    if base_sha=$(git rev-parse "${head_ref}~1" 2>/dev/null); then
      COMPUTED_BASE_USED_FALLBACK=1
      log "Falling back to ${head_ref}~1 for ${fallback_label}"
    else
      log "$failure_message"
      return 1
    fi
  fi

  COMPUTED_BASE_SHA="$base_sha"
}

collect_changed_submodule_paths() {
  local base_sha="$1"
  local head_ref="$2"
  local diff_output=""
  local changed_paths=()
  local submodule_paths=()

  if ! diff_output=$(git diff --name-only "$base_sha" "$head_ref"); then
    return 1
  fi

  if [[ -n "${diff_output//[[:space:]]/}" ]]; then
    mapfile -t changed_paths <<<"$diff_output"
  fi

  for changed_path in "${changed_paths[@]}"; do
    if [[ "$changed_path" =~ $ALLOWED_ORGS_REGEX ]]; then
      submodule_paths+=("$changed_path")
    fi
  done

  if [[ ${#submodule_paths[@]} -eq 0 ]]; then
    return 0
  fi

  printf '%s\n' "${submodule_paths[@]}" | sort -u
}

run_direct_submodule_typecheck() {
  local base_sha="$1"
  local head_ref="$2"
  local submodule_output=""
  local submodule_paths=()
  local failed=0

  if ! submodule_output=$(collect_changed_submodule_paths "$base_sha" "$head_ref"); then
    return 1
  fi

  if [[ -n "${submodule_output//[[:space:]]/}" ]]; then
    mapfile -t submodule_paths <<<"$submodule_output"
  fi

  if [[ ${#submodule_paths[@]} -eq 0 ]]; then
    log "No changed allowed-org submodule pointers; skipping typecheck"
    return 0
  fi

  log "Fast path: typechecking changed submodule pointers: ${submodule_paths[*]}"
  for sub_path in "${submodule_paths[@]}"; do
    if ! bun run src/giga/run-submodule.ts "$sub_path" typecheck; then
      failed=1
    fi
  done

  if [[ $failed -ne 0 ]]; then
    return 1
  fi

  return 0
}

run_nx_affected_typecheck() {
  local head_ref="${NX_HEAD_REF:-HEAD}"
  local desired_base="${NX_RESOLVED_BASE:-origin/main}"
  local base_sha=""

  if ! git rev-parse --verify "$head_ref" >/dev/null 2>&1; then
    head_ref="HEAD"
  fi

  if git rev-parse --verify "$desired_base" >/dev/null 2>&1; then
    if base_sha=$(git merge-base "$head_ref" "$desired_base" 2>/dev/null); then
      :
    else
      base_sha=$(git rev-parse "$desired_base" 2>/dev/null || true)
    fi
  fi

  if [[ -z "$base_sha" ]]; then
    if base_sha=$(git rev-parse "${head_ref}~1" 2>/dev/null); then
      PUSH_BASE_SELECTION_MSG="Falling back to ${head_ref}~1 for Nx base"
    else
      log "Unable to determine push base reference (tried ${desired_base} and ${head_ref}~1)"
      return 1
    fi
  else
    PUSH_BASE_SELECTION_MSG="$NX_BASE_SELECTION_MSG (merge-base ${base_sha})"
  fi

  PUSH_BASE_SHA="$base_sha"
  PUSH_HEAD_REF="$head_ref"
  return 0
}

run_push_artifact_guard() {
  local base_sha=$1
  local head_ref=$2

  if [[ "${SKIP_GIT_ARTIFACT_GUARD:-0}" == "1" ]]; then
    log "Skipping generated artifact guard because SKIP_GIT_ARTIFACT_GUARD=1"
    return 0
  fi

  declare -A seen_oids=()
  local -a blocked_paths=()
  local -a oversized_paths=()
  local oid=""
  local object_type=""
  local object_size=""
  local path=""

  while IFS=' ' read -r oid object_type object_size path; do
    if [[ "$object_type" != "blob" || -z "$path" ]]; then
      continue
    fi

    if [[ -n "${seen_oids[$oid]:-}" ]]; then
      continue
    fi
    seen_oids[$oid]=1

    if matches_blocked_generated_path "$path"; then
      blocked_paths+=("$path")
    fi

    if (( object_size > MAX_GIT_PUSH_BLOB_BYTES )); then
      oversized_paths+=("$(format_mib "$object_size")  $path")
    fi
  done < <(
    git rev-list --objects "${base_sha}..${head_ref}" \
      | git cat-file --batch-check='%(objectname) %(objecttype) %(objectsize) %(rest)'
  )

  if [[ ${#blocked_paths[@]} -gt 0 ]]; then
    log "Push range ${base_sha}..${head_ref} contains blocked generated/runtime artifacts:"
    printf '  %s\n' "${blocked_paths[@]}"
    log "Remove them from history or set SKIP_GIT_ARTIFACT_GUARD=1 for an explicit one-off override"
    return 1
  fi

  if [[ ${#oversized_paths[@]} -gt 0 ]]; then
    log "Push range ${base_sha}..${head_ref} contains blob(s) exceeding MAX_GIT_PUSH_BLOB_BYTES=$(format_mib "$MAX_GIT_PUSH_BLOB_BYTES"):"
    printf '  %s\n' "${oversized_paths[@]}"
    log "Rewrite them out of history or set SKIP_GIT_ARTIFACT_GUARD=1 for an explicit one-off override"
    return 1
  fi

  return 0
}

run_changed_package_typecheck() {
  local base_sha=$1
  local head_ref=$2
  local changed_files=()
  local package_dirs=()
  local package_dir=""

  if ! mapfile -t changed_files < <(git diff --name-only "$base_sha" "$head_ref"); then
    log "Unable to list changed files for fallback typecheck"
    return 1
  fi

  declare -A seen_dirs=()
  for changed_file in "${changed_files[@]}"; do
    package_dir=$(dirname "$changed_file")
    while [[ "$package_dir" != "." && "$package_dir" != "/" ]]; do
      if [[ -f "$package_dir/package.json" ]]; then
        if [[ -z "${seen_dirs[$package_dir]:-}" ]]; then
          package_dirs+=("$package_dir")
          seen_dirs[$package_dir]=1
        fi
        break
      fi
      package_dir=$(dirname "$package_dir")
    done
  done

  if [[ ${#package_dirs[@]} -eq 0 ]]; then
    log "No changed package roots detected for fallback typecheck"
    return 0
  fi

  for package_dir in "${package_dirs[@]}"; do
    if [[ -f "$package_dir/package.json" ]] && grep -q '"typecheck"\s*:' "$package_dir/package.json"; then
      log "Running pnpm --dir $package_dir run typecheck"
      pnpm --dir "$package_dir" run typecheck
    else
      log "Skipping $package_dir (no typecheck script)"
    fi
  done
}

run_nx_affected_typecheck() {
  local head_ref="${PUSH_HEAD_REF:-${NX_HEAD_REF:-HEAD}}"
  local desired_base="${NX_RESOLVED_BASE:-origin/main}"
  local base_sha="${PUSH_BASE_SHA:-}"
  local affected_projects_raw=""
  local affected_projects=()
  local filtered_projects=()

  if ! git rev-parse --verify "$head_ref" >/dev/null 2>&1; then
    head_ref="HEAD"
  fi

  if ! compute_base_sha "$head_ref" "$desired_base" "Nx base" "Unable to determine Nx base reference (tried ${desired_base} and ${head_ref}~1)"; then
    return 1
  fi
  base_sha="$COMPUTED_BASE_SHA"

  if [[ $COMPUTED_BASE_USED_FALLBACK -eq 0 ]]; then
    log "$NX_BASE_SELECTION_MSG (merge-base ${base_sha})"
  fi

  if ! affected_projects_raw=$(pnpm nx show projects --affected --base "$base_sha" --head "$head_ref"); then
    log "Nx show projects failed; falling back to changed-package typecheck"
    run_changed_package_typecheck "$base_sha" "$head_ref"
    return $?
  fi

  if [[ -z "${affected_projects_raw//[[:space:]]/}" ]]; then
    log "No affected projects detected"
    return 0
  fi

  mapfile -t affected_projects <<<"$affected_projects_raw"
  for project in "${affected_projects[@]}"; do
    project="${project//[[:space:]]/}"
    if [[ -z "$project" ]]; then
      continue
    fi
    for prefix in "${ORG_PREFIXES[@]}"; do
      if [[ "$project" == "$prefix"* ]]; then
        filtered_projects+=("$project")
        break
      fi
    done
  done

  if [[ ${#filtered_projects[@]} -eq 0 ]]; then
    log "No affected projects in allowed orgs (riatzukiza, open-hax, octave-commons); skipping"
    return 0
  fi

  log "Running pnpm nx run-many -t typecheck --projects ${filtered_projects[*]}"
  pnpm nx run-many -t typecheck --projects "$(IFS=,; echo "${filtered_projects[*]}")"
}

run_fast_typecheck() {
  local head_ref="${NX_HEAD_REF:-HEAD}"
  local desired_base="${NX_RESOLVED_BASE:-origin/main}"
  local base_sha=""

  if ! git rev-parse --verify "$head_ref" >/dev/null 2>&1; then
    head_ref="HEAD"
  fi

  if ! compute_base_sha "$head_ref" "$desired_base" "fast-path base" "Unable to determine fast-path base reference"; then
    return 1
  fi
  base_sha="$COMPUTED_BASE_SHA"

  run_direct_submodule_typecheck "$base_sha" "$head_ref"
}

if command -v pnpm >/dev/null 2>&1 && [[ -f nx.json ]]; then
  PREPUSH_TYPECHECK_MODE="${PREPUSH_TYPECHECK_MODE:-fast}"

  if [[ "$PREPUSH_TYPECHECK_MODE" == "nx" ]]; then
    run_nx_affected_typecheck
    nx_exit=$?
  else
    run_fast_typecheck
    nx_exit=$?
  fi

  if [[ $nx_exit -eq 0 ]]; then
    if [[ "$PREPUSH_TYPECHECK_MODE" == "nx" ]]; then
      log "Nx affected typecheck completed"
    else
      log "Fast pre-push typecheck completed"
    fi
    exit 0
  fi

  if [[ "$PREPUSH_TYPECHECK_MODE" == "nx" ]]; then
    log "Nx affected typecheck failed (exit ${nx_exit}); aborting pre-push checks"
  else
    log "Fast pre-push typecheck failed (exit ${nx_exit}); aborting pre-push checks"
  fi
  exit "$nx_exit"
fi

if command -v pnpm >/dev/null 2>&1; then
  if [[ -f package.json ]] && grep -q '"typecheck"\s*:' package.json; then
    log "Running pnpm run typecheck"
    pnpm run typecheck
    exit 0
  fi
fi

if command -v npm >/dev/null 2>&1 && [[ -f package.json ]] && grep -q '"typecheck"\s*:' package.json; then
  log "Running npm run typecheck"
  npm run typecheck
  exit 0
fi

if [[ -f package.json ]] && command -v bun >/dev/null 2>&1; then
  log "Running bun run typecheck"
  bun run typecheck
  exit 0
fi

if [[ -f deno.json || -f deno.jsonc ]] && command -v deno >/dev/null 2>&1; then
  log "Running deno check"
  deno check
  exit 0
fi

if [[ -f tsconfig.json ]] && command -v npx >/dev/null 2>&1; then
  log "Running npx tsc --noEmit"
  npx tsc --noEmit
  exit 0
fi

log "Skipping typecheck (no supported toolchain found)"

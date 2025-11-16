#!/usr/bin/env bash
set -euo pipefail

ROOT=$(git rev-parse --show-toplevel)
STAGE=${1:-}
BRANCH=${2:-}
HEAD_BRANCH=${3:-}
PARENT_PR_URL=${4:-}

special_branch() {
  case "$1" in
    device/*|dev/*|main|release) return 0 ;;
    *) return 1 ;;
  esac
}

to_repo_slug() {
  local url=$1
  url=${url%.git}
  url=${url#git@github.com:}
  url=${url#https://github.com/}
  echo "$url"
}

submodule_entries() {
  git -C "$ROOT" config -f "$ROOT/.gitmodules" --get-regexp '^submodule\..*\.path' || true
}

ensure_gitmodules_branch() {
  local target=$1
  special_branch "$target" || return 0
  local changed=0
  while read -r key path; do
    local name=${key#submodule.}
    name=${name%.path}
    local current=$(git -C "$ROOT" config -f "$ROOT/.gitmodules" "submodule.${name}.branch" || true)
    if [ "$current" != "$target" ]; then
      git -C "$ROOT" config -f "$ROOT/.gitmodules" "submodule.${name}.branch" "$target"
      changed=1
    fi
  done < <(submodule_entries)

  if [ "$changed" -eq 1 ]; then
    git -C "$ROOT" submodule sync --recursive >/dev/null
    echo "info: updated .gitmodules branch entries to $target"
  fi
}

submodule_dirty() {
  git -C "$1" status --porcelain | grep -q .
}

submodule_in_merge_state() {
  local gitdir=$(git -C "$1" rev-parse --git-dir)
  [ -f "$gitdir/MERGE_HEAD" ]
}

submodule_in_rebase_state() {
  local gitdir=$(git -C "$1" rev-parse --git-dir)
  [ -d "$gitdir/rebase-merge" ] || [ -d "$gitdir/rebase-apply" ]
}

attempt_branch_align() {
  local path=$1
  local target=$2
  git -C "$path" fetch --no-tags origin "$target" >/dev/null 2>&1 || true
  if git -C "$path" show-ref --verify --quiet "refs/heads/$target"; then
    git -C "$path" switch "$target" >/dev/null 2>&1 && return 0
  fi
  if git -C "$path" show-ref --verify --quiet "refs/remotes/origin/$target"; then
    git -C "$path" switch -C "$target" "origin/$target" >/dev/null 2>&1 && return 0
  fi
  return 1
}

check_push_constraints() {
  local parent_branch=$1
  local failed=0
  while read -r key path; do
    local name=${key#submodule.}
    name=${name%.path}
    local abs="$ROOT/$path"
    if ! [ -d "$abs" ]; then
      echo "::error::Missing submodule path $path"
      failed=1
      continue
    fi

    local head_ref=$(git -C "$abs" symbolic-ref -q --short HEAD || true)
    if [ -z "$head_ref" ]; then
      echo "::error::Submodule $path is in detached HEAD"
      failed=1
    fi
    if submodule_in_merge_state "$abs"; then
      echo "::error::Submodule $path is mid-merge"
      failed=1
    fi
    if submodule_in_rebase_state "$abs"; then
      echo "::error::Submodule $path is mid-rebase"
      failed=1
    fi

    if submodule_dirty "$abs"; then
      echo "::error::Submodule $path has uncommitted changes"
      failed=1
    fi

    if [ "$head_ref" != "$parent_branch" ]; then
      if attempt_branch_align "$abs" "$parent_branch"; then
        echo "info: aligned $path to $parent_branch"
      else
        echo "::error::Submodule $path on branch '${head_ref:-detached}' expected '$parent_branch'"
        failed=1
      fi
    fi
  done < <(submodule_entries)

  if [ "$failed" -ne 0 ]; then
    echo "::error::Push blocked due to submodule state"
    return 1
  fi
}

check_dirty_submodules() {
  local dirty=0
  while read -r _ path; do
    local abs="$ROOT/$path"
    if submodule_dirty "$abs"; then
      echo "::error::Cannot checkout: submodule $path has uncommitted changes"
      dirty=1
    fi
  done < <(submodule_entries)
  [ "$dirty" -eq 0 ]
}

update_submodules_for_branch() {
  local branch=$1
  ensure_gitmodules_branch "$branch"
  git -C "$ROOT" submodule sync --recursive >/dev/null
  git -C "$ROOT" submodule update --init --recursive --remote --jobs 4
}

ci_create_branch_if_missing() {
  local slug=$1
  local branch=$2
  local main_sha
  if gh api "repos/${slug}/branches/${branch}" >/dev/null 2>&1; then
    return 0
  fi
  main_sha=$(gh api "repos/${slug}/branches/main" --jq '.commit.sha')
  gh api "repos/${slug}/git/refs" \
    --method POST \
    -f ref="refs/heads/${branch}" \
    -f sha="${main_sha}" >/dev/null
  echo "info: created ${branch} in ${slug} from main"
}

ci_check_mergeability() {
  local base_branch=$1
  local head_branch=$2
  local parent_url=$3
  local failures=0

  while read -r key path; do
    local name=${key#submodule.}
    name=${name%.path}
    local url=$(git -C "$ROOT" config -f "$ROOT/.gitmodules" "submodule.${name}.url")
    local slug=$(to_repo_slug "$url")
    local abs="$ROOT/$path"

    git -C "$abs" fetch --no-tags origin "$base_branch" "$head_branch" main >/dev/null 2>&1 || true

    ci_create_branch_if_missing "$slug" "$base_branch"

    if ! git -C "$abs" show-ref --verify --quiet "refs/remotes/origin/$head_branch"; then
      echo "::error::Submodule $path missing head branch origin/$head_branch"
      failures=1
      continue
    fi

    if ! git -C "$abs" show-ref --verify --quiet "refs/remotes/origin/$base_branch"; then
      echo "::error::Submodule $path missing base branch origin/$base_branch even after creation attempt"
      failures=1
      continue
    fi

    local base_ref="origin/$base_branch"
    local head_ref="origin/$head_branch"
    local mb=$(git -C "$abs" merge-base "$base_ref" "$head_ref" || true)
    local conflict=0
    if [ -z "$mb" ]; then
      conflict=1
    else
      if git -C "$abs" merge-tree "$mb" "$base_ref" "$head_ref" | grep -q '<<<<<<<'; then
        conflict=1
      fi
    fi

    if [ "$conflict" -eq 1 ]; then
      echo "::warning::Submodule $path has merge conflicts between $head_branch -> $base_branch"
      local existing
      existing=$(gh pr list --repo "$slug" --state open --base "$base_branch" --head "$head_branch" --json number --jq '.[0].number' || true)
      if [ -z "$existing" ]; then
        gh pr create --repo "$slug" --base "$base_branch" --head "$head_branch" \
          --title "Sync $head_branch into $base_branch (from parent PR)" \
          --body "Parent PR: ${parent_url}\nAutomated sync detected conflicts; please resolve in submodule." >/dev/null
        echo "info: opened sync PR in ${slug}"
      else
        echo "info: existing submodule PR #${existing} in ${slug}"
      fi
      failures=1
    fi
  done < <(submodule_entries)

  if [ "$failures" -ne 0 ]; then
    echo "::error::Submodule mergeability check failed"
    return 1
  fi
}

ci_post_merge_sync_gitmodules() {
  local branch=$1
  special_branch "$branch" || return 0
  ensure_gitmodules_branch "$branch"
  if git -C "$ROOT" diff --quiet -- .gitmodules; then
    echo "info: .gitmodules already aligned to $branch"
    return 0
  fi
  git -C "$ROOT" config user.name "promethean-bot"
  git -C "$ROOT" config user.email "promethean-bot@users.noreply.github.com"
  git -C "$ROOT" add .gitmodules
  git -C "$ROOT" commit -m "chore: align submodule branches to $branch" >/dev/null
  git -C "$ROOT" push origin HEAD
  echo "info: pushed .gitmodules alignment for $branch"
}

current_branch() {
  git -C "$ROOT" rev-parse --abbrev-ref HEAD 2>/dev/null || echo "HEAD"
}

main() {
  case "$STAGE" in
    commit)
      local branch=$(current_branch)
      special_branch "$branch" || exit 0
      ensure_gitmodules_branch "$branch"
      ;;
    push)
      local branch=$(current_branch)
      special_branch "$branch" || exit 0
      ensure_gitmodules_branch "$branch"
      check_push_constraints "$branch"
      ;;
    post-checkout)
      local branch=$(current_branch)
      check_dirty_submodules
      if special_branch "$branch"; then
        update_submodules_for_branch "$branch"
      fi
      ;;
    ci-merge-check)
      special_branch "$BRANCH" || exit 0
      ensure_gitmodules_branch "$BRANCH"
      ci_check_mergeability "$BRANCH" "$HEAD_BRANCH" "$PARENT_PR_URL"
      ;;
    ci-post-merge)
      ci_post_merge_sync_gitmodules "$BRANCH"
      ;;
    *)
      echo "unknown stage: $STAGE" >&2
      exit 1
      ;;
  esac
}

main "$@"

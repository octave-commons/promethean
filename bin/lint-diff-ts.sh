#!/usr/bin/env bash
set -euo pipefail

# Find a sensible BASE commit for "what changed".
if upstream_ref="$(git rev-parse --abbrev-ref --symbolic-full-name @{upstream} 2>/dev/null)"; then
  # Local env: we have a tracking branch; use three-dot semantics vs upstream.
  git fetch --quiet "${upstream_ref%%/*}" || true
  base="$(git merge-base HEAD "$upstream_ref")"
else
  # Sandbox: no remotes. Use the *oldest* reflog entry of the current branch
  # (that's the commit created from FETCH_HEAD at sandbox start).
  # If reflog is missing for some reason, fall back to FETCH_HEAD itself.
  if base="$(git reflog --format=%H | tail -1)"; then
    :
  elif git rev-parse -q --verify FETCH_HEAD >/dev/null 2>&1; then
    base="$(git rev-parse FETCH_HEAD)"
  else
    # Absolute last resort: just lint staged/working changes vs HEAD
    base="HEAD"
  fi
fi

# Persist the chosen base so subsequent runs are consistent (optional).
printf '%s' "$base" > .git/BOT_BASE_SHA 2>/dev/null || true

# Lint only changed TypeScript files vs BASE, including uncommitted edits.
# We compare BASE -> working tree (single-commit form of `git diff`),
# list paths NUL-delimited, skip deletions, then eslint them.
git diff -z --name-only --diff-filter=d "$base" -- '*.ts' '*.tsx' \
  | xargs -0 --no-run-if-empty eslint --cache --pass-on-no-patterns

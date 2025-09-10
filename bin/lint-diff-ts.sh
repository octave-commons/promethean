#!/usr/bin/env bash
set -euo pipefail

# 1) Figure out the upstream ref (tracking branch or origin/<default>)
upstream_ref="$(git rev-parse --abbrev-ref --symbolic-full-name @{upstream} 2>/dev/null \
  || { git remote show origin | sed -n '/HEAD branch/s/.*: //p' | sed 's/^/origin\//'; })"

# 2) Ensure we have the remote refs
git fetch --quiet "${upstream_ref%%/*}"  # usually "origin"

# 3) Merge-base (three-dot semantics)
mb="$(git merge-base HEAD "$upstream_ref")"

# 4) Diff -> ESLint (NUL-delimited; ignore deletions)
git diff -z --name-only --diff-filter=d "$mb"...HEAD -- '*.ts' '*.tsx' \
    | xargs -0 --no-run-if-empty eslint --cache --pass-on-no-patterns

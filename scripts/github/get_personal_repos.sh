#!/usr/bin/bash
# Requires: gh, jq, git
# Log in first: gh auth login

OUTDIR="${1:-./github-repos}"
PARALLEL="${2:-4}"
mkdir -p "$OUTDIR"

# List repos you own; add --visibility and --no-archived as needed
gh repo list "$(gh api user | jq -r .login)" \
   --limit 1000 \
   --json sshUrl,nameWithOwner,isFork,isArchived \
    | jq -r '.[] | select(.isFork|not) | select(.isArchived|not) | .sshUrl' \
    | xargs -n1 -P"$PARALLEL" -I{} bash -lc '
      url="{}"
      path="${url#git@github.com:}"; path="${path%.git}"
      target="'$OUTDIR'/$path"
      if [[ -d "$target/.git" ]]; then
        echo "[exists] $path -> fetch"
        git -C "$target" fetch --all --prune --tags || true
      else
        mkdir -p "$(dirname "$target")"
        echo "[clone]  $path"
        git clone --depth=1 "$url" "$target"
      fi
  '

#!/usr/bin/env bash
set -euo pipefail

# ----------- required runtime env -----------
: "${GH_TOKEN:?GH_TOKEN must be set}"
: "${REPO_SLUG:?REPO_SLUG must be set, e.g. owner/repo}"

# Optional: master switch for protocol: https|ssh
PROTO="${PROTO:-https}"

# Optional: branch to check out if repo is missing
BRANCH="${BRANCH:-main}"

# ----------- utilities -----------
need() { command -v "$1" >/dev/null 2>&1; }

# Install basics if missing (Debian/Ubuntu; adjust for your base)
if ! need git; then
  apt-get update -y && apt-get install -y git
fi
if ! need gh; then
  apt-get update -y && apt-get install -y gh
fi
if [ "$PROTO" = "ssh" ] && ! need ssh; then
  apt-get update -y && apt-get install -y openssh-client
fi

# Disable gh prompts; avoid accidental TTY blocking
gh config set prompt disabled true

# Login non-interactively (stdin avoids token showing up in ps/history)
printf '%s' "$GH_TOKEN" | gh auth login --with-token >/dev/null

# Let gh wire Git credentials for HTTPS
gh auth setup-git >/dev/null 2>&1 || true

# ----------- compute URLs -----------
if [ "$PROTO" = "ssh" ]; then
  CLONE_URL="git@github.com:${REPO_SLUG}.git"
else
  CLONE_URL="https://github.com/${REPO_SLUG}.git"
fi

# ----------- ensure repo & origin -----------
if [ -d .git ]; then
  # We are inside a git worktree, but origin may be missing
  if git remote get-url origin >/dev/null 2>&1; then
    echo "[ok] origin already exists -> $(git remote get-url origin)"
  else
    echo "[fix] adding origin -> $CLONE_URL"
    git remote add origin "$CLONE_URL"
  fi
else
  # No .git — initialize a repo and bind it to origin (shallow for speed)
  echo "[init] creating git repo and binding origin -> $CLONE_URL"
  git init
  git remote add origin "$CLONE_URL"
  # fetch just the branch tip
  git fetch --depth=1 origin "$BRANCH"
  # create local branch tracking remote
  git checkout -B "$BRANCH" "FETCH_HEAD"
fi

# ----------- safety / consistency -----------
# Avoid “dubious ownership” in some sandboxes
git config --global --add safe.directory "$(pwd)" || true

# If submodules exist and sandbox strips SSH, force HTTPS for GitHub submodules
if [ "$PROTO" = "https" ]; then
  git config --global url."https://github.com/".insteadOf "git@github.com:"
fi

# ----------- verify connectivity -----------
if git ls-remote --exit-code origin HEAD >/dev/null 2>&1; then
  echo "[ok] connected to origin"
else
  echo "[err] cannot reach origin or permissions are wrong"
  echo "      check REPO_SLUG and GH_TOKEN scopes/fine-grained repo selection"
  exit 2
fi

# Optional: set repo default for gh even without origin (helps commands like gh pr list outside worktree context)
export GH_REPO="${REPO_SLUG}"

echo "[ready] git+gh are wired; origin restored."

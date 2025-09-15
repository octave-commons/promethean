#!/usr/bin/env bash
set -euo pipefail
INSTALL_PYTHON=/home/err/.pyenv/versions/3.12.1/bin/python
ARGS=(hook-impl --config=.pre-commit-config.yaml --hook-type=pre-commit)

HERE="$(cd "$(dirname "$0")" && pwd)"
ARGS+=(--hook-dir "$HERE" -- "$@")
BRANCHES="main develop"

# Get the current branch name
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
echo "$BRANCHES" | grep -w "$CURRENT_BRANCH" > /dev/null
if [ $? -eq 0 ]; then
    if [ -x "$INSTALL_PYTHON" ]; then
        exec "$INSTALL_PYTHON" -mpre_commit "${ARGS[@]}"
    elif command -v pre-commit > /dev/null; then
        exec pre-commit "${ARGS[@]}"
    else
        echo '`pre-commit` not found.  Did you forget to activate your virtualenv?' 1>&2
        exit 1
    fi
else
    echo "Skipping pre-commit hooks on branch '$CURRENT_BRANCH'."
fi

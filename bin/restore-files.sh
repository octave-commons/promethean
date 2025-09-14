#!/usr/bin/env bash
set -euo pipefail

SHA="${1:-}"
TARGET_PATH="${2:-services/js/broker}"

if [[ -z "${SHA}" ]]; then
  echo "Usage: $0 <commit-sha> [path]" >&2
  exit 64
fi

echo "Working tree status:"
git status --porcelain

echo "History for ${TARGET_PATH}:"
git log --oneline --decorate -- "${TARGET_PATH}" | head -50

echo "Restoring ${TARGET_PATH} from ${SHA}..."
git restore --source "${SHA}" -- "${TARGET_PATH}"
echo "Done."

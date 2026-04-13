#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

if ! command -v shellcheck >/dev/null 2>&1; then
  echo "shellcheck is required" >&2
  exit 1
fi

mapfile -t SHELL_FILES < <(find scripts -type f -name '*.sh' | sort)
if [[ "${#SHELL_FILES[@]}" -eq 0 ]]; then
  echo "no shell files found"
  exit 0
fi

shellcheck "${SHELL_FILES[@]}"

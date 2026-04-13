#!/usr/bin/env bash
set -euo pipefail

missing=0

check_required_cmd() {
  local name="$1"
  if command -v "$name" >/dev/null 2>&1; then
    printf '[platform-k8s] %-10s %s\n' "$name" "$(command -v "$name")"
  else
    printf '[platform-k8s] %-10s %s\n' "$name" "MISSING (required)"
    missing=1
  fi
}

check_optional_cmd() {
  local name="$1"
  if command -v "$name" >/dev/null 2>&1; then
    printf '[platform-k8s] %-10s %s\n' "$name" "$(command -v "$name")"
  else
    printf '[platform-k8s] %-10s %s\n' "$name" "MISSING (optional)"
  fi
}

check_required_cmd docker
check_required_cmd kubectl
check_required_cmd kind
check_required_cmd skaffold
check_required_cmd helm

if command -v kubectl >/dev/null 2>&1; then
  kubectl version --client --output=yaml | sed -n '1,12p'
fi

if command -v kind >/dev/null 2>&1; then
  kind version
fi

if command -v skaffold >/dev/null 2>&1; then
  skaffold version
fi

if command -v helm >/dev/null 2>&1; then
  helm version --short
fi

exit "$missing"

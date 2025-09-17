#!/usr/bin/env bash
set -euo pipefail

# ensure describe() exists
if ! type describe >/dev/null 2>&1; then
  ART_ROOT="${ART_ROOT:-docs/reports/codex_cloud}"
  RUN_TS="${RUN_TS:-$(date -u +"%Y.%m.%d.%H.%M.%S")}"
  ART_ROOT="$ART_ROOT" RUN_TS="$RUN_TS" source "$(dirname "$0")/describe.sh"
  OWN_DESCRIBE=1
fi

BASE="${NX_BASE:-origin/main}"
HEAD="${NX_HEAD:-HEAD}"

# artifacts
describe nx-affected-projects pnpm exec nx show projects --affected --base="$BASE" --head="$HEAD"
describe nx-affected-build    pnpm exec nx affected -t build --parallel --output-style=stream --base="$BASE" --head="$HEAD"
describe nx-affected-lint     pnpm exec nx affected -t lint  --parallel --output-style=stream --base="$BASE" --head="$HEAD"
describe nx-affected-test     pnpm exec nx affected -t test  --parallel --output-style=stream --base="$BASE" --head="$HEAD"
describe nx-graph             pnpm exec nx graph --affected --base="$BASE" --head="$HEAD" --file="$RUN_DIR/affected-graph.html"
describe eslint-json          bash -lc 'pnpm exec eslint --cache -f json . > "'"$RUN_DIR"'/eslint.json"'

# if we created describe(), also finalize
if [ "${OWN_DESCRIBE:-0}" -eq 1 ]; then
  describe_finalize
fi

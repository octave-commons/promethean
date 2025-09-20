#!/usr/bin/env bash
set -euo pipefail
# debug trap: print the exact failing command and location
set -o errtrace
trap 'code=$?; echo "ERR $BASH_SOURCE:$LINENO: $BASH_COMMAND (rc=$code)" >&2' ERR


# ---------- run context ----------
ART_ROOT="${ART_ROOT:-docs/reports/codex_cloud}"
RUN_TS="${RUN_TS:-$(date -u +"%Y.%m.%d.%H.%M.%S")}"
ART_ROOT="$ART_ROOT" RUN_TS="$RUN_TS" source "$(dirname "$0")/describe.sh"

# ---------- base/tooling ----------
describe env-dump               bash -lc '(set -o posix; set)'

# pre-commit
describe uvx-precommit-install  uvx pre-commit install
describe uvx-hook-install       uvx pre-commit install --install-hooks
describe uvx-hook-commit-msg    uvx pre-commit install --hook-type commit-msg
describe uvx-hook-pre-merge     uvx pre-commit install --hook-type pre-merge-commit

# OS deps
describe apt-update             bash -lc 'export DEBIAN_FRONTEND=noninteractive; apt-get update -y'
describe apt-build-tools        bash -lc 'apt-get install -y build-essential python3 make g++ pkg-config'
describe apt-extras             bash -lc 'apt-get install -y git ca-certificates jq moreutils ripgrep'

# native toolchain + node-gyp helpers
describe install-gyp            bash -lc '"./run/install_gyp.sh"'

# node toolchain
describe corepack-enable        corepack enable
describe pnpm-activate          corepack prepare pnpm@9.0.0 --activate
describe pnpm-install           pnpm install --frozen-lockfile

# playwright
describe setup-playwright       bash -lc '"$(dirname "$0")/setup_playwright.sh"'

# gh CLI + origin
# describe install-gh-cli         bash -lc '"$(dirname "$0")/install_gh_cli.sh"'
# describe setup-gh-cli           bash -lc '"$(dirname "$0")/setup_gh_cli.sh"'

# services: chroma + ollama
describe chroma-standup         bash -lc '"./run/standup_chroma_nohup.sh"'
describe ollama-install         bash -lc 'curl -fsSL https://ollama.com/install.sh | sh'
describe ollama-standup         bash -lc '"./run/standup_ollama_nohup.sh"'

# helpful globals (non-fatal)
describe npm-corepack-latest    bash -lc 'npm i -g corepack@latest'
describe npm-eslint-global      bash -lc 'npm i -g eslint'

# ---------- project checks / caches ----------
BASE="${NX_BASE:-origin/main}"
HEAD="${NX_HEAD:-HEAD}"

# if pnpm exec nx --version >/dev/null 2>&1; then
#   describe nx-affected-build    pnpm exec nx affected -t build --parallel --output-style=stream --base="$BASE" --head="$HEAD"
#   describe nx-affected-lint     pnpm exec nx affected -t lint  --parallel --output-style=stream --base="$BASE" --head="$HEAD"
#   describe nx-affected-test     pnpm exec nx affected -t test  --parallel --output-style=stream --base="$BASE" --head="$HEAD"
#   describe nx-graph             pnpm exec nx graph --affected --base="$BASE" --head="$HEAD" --file="$RUN_DIR/affected-graph.html"
# else
  describe pnpm-build           pnpm -r --no-bail build
# fi

describe eslint-stylish         pnpm exec eslint --cache -f stylish .
# ---------- per-run INDEX + global rollup ----------
make_index() {
  local idx="$RUN_DIR/INDEX.md"
  local rc_build= rc_lint= rc_test=
  rc_build=$(awk -F'\t' '$2~/nx-affected-build|pnpm-build/ {st=$3} END{print st+0}' "$SUMMARY_TSV" 2>/dev/null || echo 0)
  rc_lint=$(awk  -F'\t' '$2~/nx-affected-lint/ {st=$3} END{print st+0}' "$SUMMARY_TSV" 2>/dev/null || echo 0)
  rc_test=$(awk  -F'\t' '$2~/nx-affected-test/ {st=$3} END{print st+0}' "$SUMMARY_TSV" 2>/dev/null || echo 0)
  local e_err=0 e_warn=0
  if command -v jq >/dev/null 2>&1 && [ -s "$RUN_DIR/eslint.json" ]; then
    read -r e_err e_warn < <(
      jq -r 'reduce .[] as $f ({e:0,w:0}; .e += ($f.errorCount // 0) | .w += ($f.warningCount // 0)) | "\(.e) \(.w)"' "$RUN_DIR/eslint.json"
    )
  fi

  {
    echo "# Codex Setup — $RUN_TS"
    echo ""
    echo "## Quick status"
    builtin printf -- "- Build: **%s**\n"   "$([ "${rc_build:-0}" -eq 0 ] && echo PASS || echo FAIL)"
    builtin printf -- "- Lint:  **%s**  (errors: %s, warnings: %s)\n" "$([ "${rc_lint:-0}" -eq 0 ] && echo PASS || echo FAIL)" "$e_err" "$e_warn"
    builtin printf -- "- Test:  **%s**\n"   "$([ "${rc_test:-0}" -eq 0 ] && echo PASS || echo FAIL)"
    echo ""
    echo "## Artifacts"
    echo "- Summary table: \`$(basename "$SUMMARY_TSV")\`"
    [ -f "$SUMMARY_JSON" ] && echo "- Summary JSONL: \`$(basename "$SUMMARY_JSON")\`"
    echo "- ESLint JSON: \`eslint.json\`"
    [ -f "$RUN_DIR/affected-graph.html" ] && echo "- Nx affected graph: \`affected-graph.html\`"
    echo ""
    echo "## Logs"
    echo "<details><summary>per-step logs</summary>"
    echo ""
    for f in "$LOG_DIR"/*.log; do
      [ -f "$f" ] || continue
      echo "- \`logs/$(basename "$f")\`"
    done
    echo ""
    echo "</details>"
  } > "$idx"

  ln -sfn "$RUN_DIR" "$ART_ROOT/latest"
  local rel="${RUN_DIR#$ART_ROOT/}"
  {
    echo "- [$RUN_TS]($rel/INDEX.md)"
  } >> "$ART_ROOT/INDEX.md"
  awk '!seen[$0]++' "$ART_ROOT/INDEX.md" > "$ART_ROOT/.INDEX.md.tmp" && mv "$ART_ROOT/.INDEX.md.tmp" "$ART_ROOT/INDEX.md"
}
make_index

# ---------- exit policy ----------
describe_finalize

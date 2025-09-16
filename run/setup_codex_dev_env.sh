#!/usr/bin/env bash
set -euo pipefail

ART_DIR="docs/reports/codex_cloud"
mkdir -p "$ART_DIR"

# capture env for debugging instead of spamming stdout
(set -o posix; set) > "$ART_DIR/env.txt" 2>&1 || true

command -v uvx >/dev/null || { echo "uvx not found on PATH after install" >&2; exit 1; }

uvx pre-commit install
uvx pre-commit install --install-hooks
uvx pre-commit install --hook-type commit-msg
uvx pre-commit install --hook-type pre-merge-commit

# base toolchain (noninteractive so CI won’t hang)
export DEBIAN_FRONTEND=noninteractive
apt-get update -y >"$ART_DIR/apt_update.txt" 2>&1
apt-get install -y build-essential python3 make g++ pkg-config >"$ART_DIR/apt_build_tools.txt" 2>&1
apt-get install -y git ca-certificates jq moreutils ripgrep >"$ART_DIR/apt_extras.txt" 2>&1

bash ./run/install_gyp.sh >"$ART_DIR/install_gyp.txt" 2>&1

corepack enable >"$ART_DIR/corepack_enable.txt" 2>&1
corepack prepare pnpm@9.0.0 --activate >"$ART_DIR/corepack_prepare.txt" 2>&1
pnpm install --frozen-lockfile >"$ART_DIR/pnpm_install.txt" 2>&1

bash ./run/setup_playwright.sh >"$ART_DIR/setup_playwright.txt" 2>&1 || true

bash ./run/install_gh_cli.sh >"$ART_DIR/install_gh_cli.txt" 2>&1
bash ./run/setup_gh_cli.sh >"$ART_DIR/setup_gh_cli.txt" 2>&1

# start chroma if not running
if ! curl -fsS http://127.0.0.1:8000/api/v2/heartbeat >/dev/null 2>&1; then
  nohup uvx --from chromadb chroma run --host 127.0.0.1 --port 8000 >"$ART_DIR/chromadb_nohup.txt" 2>&1 &
fi

if ! timeout 60s bash -c 'until curl -fsS http://127.0.0.1:8000/api/v2/heartbeat >/dev/null; do sleep 1; done'; then
  echo "ChromaDB failed to become healthy in 60s" | tee -a "$ART_DIR/chromadb_health.txt" >&2
  exit 1
fi

# install & start ollama
curl -fsSL https://ollama.com/install.sh | sh >"$ART_DIR/ollama_install.txt" 2>&1
pgrep -f 'ollama serve' >/dev/null || nohup ollama serve >"$ART_DIR/ollama_nohup.txt" 2>&1 &

if ! timeout 60s bash -c 'until curl -fsS http://127.0.0.1:11434/api/tags >/dev/null; do sleep 1; done'; then
  echo "Ollama daemon failed to become ready in 60s" | tee -a "$ART_DIR/ollama_health.txt" >&2
  exit 1
fi

ollama pull qwen2.5:0.5b >"$ART_DIR/ollama_pull_qwen.txt" 2>&1 || true
ollama pull nomic-embed-text >"$ART_DIR/ollama_pull_embed.txt" 2>&1 || true

npm install --global corepack@latest >"$ART_DIR/npm_corepack.txt" 2>&1 || true
npm install -g eslint >"$ART_DIR/npm_eslint.txt" 2>&1 || true

# --------------------------
# Check phase: never bail early; capture artifacts
# --------------------------
SOFT_FAIL="${SOFT_FAIL:-1}"  # 1 = always exit 0 (soft), 0 = fail at end (hard)
BUILD_LOG="$ART_DIR/initial_build.txt"
LINT_LOG="$ART_DIR/initial_eslint.txt"
LINT_JSON="$ART_DIR/initial_eslint.json"
SUMMARY_JSON="$ART_DIR/summary.json"

# Decide how to run: Nx affected speeds things up if present
NX_RUNNER="pnpm -s -r --no-bail build"
if pnpm exec nx --version >/dev/null 2>&1; then
  # Prime Nx graph & cache info; prefer affected if git is available
  if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
    NX_RUNNER="pnpm exec nx affected -t build --parallel --output-style=stream"
  else
    NX_RUNNER="pnpm exec nx run-many -t build --parallel --output-style=stream"
  fi
fi

# run build + lint without -e so we can collect exit codes
set +e
/usr/bin/time -p bash -c "$NX_RUNNER" >"$BUILD_LOG" 2>&1
build_rc=$?

# produce both human and machine-readable lint artifacts
/usr/bin/time -p pnpm exec eslint --cache -f stylish . >"$LINT_LOG" 2>&1
eslint_rc=$?

# JSON report (for agents to parse quickly)
pnpm exec eslint --cache -f json . >"$LINT_JSON" 2>&1
eslint_json_rc=$?
set -e

# Summarize for the agent
jq -n \
  --arg now "$(date -Is)" \
  --arg nx_runner "$NX_RUNNER" \
  --arg build_log "$BUILD_LOG" \
  --arg lint_log "$LINT_LOG" \
  --arg lint_json "$LINT_JSON" \
  --arg pnpm_version "$(pnpm --version 2>/dev/null || echo unknown)" \
  --arg eslint_version "$(pnpm exec eslint --version 2>/dev/null || echo unknown)" \
  --arg node_version "$(node --version 2>/dev/null || echo unknown)" \
  --argjson build_rc "$build_rc" \
  --argjson eslint_rc "$eslint_rc" \
  --argjson eslint_json_rc "$eslint_json_rc" \
  '{
     timestamp: $now,
     runner: $nx_runner,
     env: { pnpm: $pnpm_version, eslint: $eslint_version, node: $node_version },
     artifacts: { build_log: $build_log, lint_log: $lint_log, lint_json: $lint_json },
     status: { build: $build_rc, eslint_stylish: $eslint_rc, eslint_json: $eslint_json_rc },
     advice: [
       "Open \( $build_log ) for build errors.",
       "Open \( $lint_log ) for human readable lint output.",
       "Open \( $lint_json ) to programmatically inspect lint issues."
     ]
   }' >"$SUMMARY_JSON"

# Friendly pointers on stdout for the agent
echo "Artifacts ready:"
echo "  Build log:     $BUILD_LOG"
echo "  ESLint log:    $LINT_LOG"
echo "  ESLint JSON:   $LINT_JSON"
echo "  Summary JSON:  $SUMMARY_JSON"

# Exit policy
if [ "$SOFT_FAIL" -eq 1 ]; then
  exit 0
fi

# Hard fail at the very end if either check failed
if [ "$build_rc" -ne 0 ] || [ "$eslint_rc" -ne 0 ] || [ "$eslint_json_rc" -ne 0 ]; then
  exit 1
fi

exit 0

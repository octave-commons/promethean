#!/usr/bin/env bash
set -euo pipefail

ART_ROOT="${ART_ROOT:-docs/reports/codex_cloud}"
ART_DIR="$ART_ROOT/nx"
mkdir -p "$ART_DIR"

# Detect Nx
if ! pnpm exec nx --version >/dev/null 2>&1; then
  echo "Nx not found; skipping Nx artifacts" | tee "$ART_DIR/skipped.txt"
  exit 0
fi

NX_VERSION="$(pnpm exec nx --version || echo unknown)"
BASE="${NX_BASE:-origin/main}"
HEAD="${NX_HEAD:-HEAD}"

# ---------- Affected projects ----------
AFFECTED_TXT="$ART_DIR/affected_projects.txt"
AFFECTED_JSON="$ART_DIR/affected_projects.json"

set +e
pnpm exec nx show projects --affected --base="$BASE" --head="$HEAD" \
  >"$AFFECTED_TXT" 2>"$ART_DIR/affected_projects.stderr"
SHOW_RC=$?
set -e

# Fallback for older Nx (<19): print-affected
if [ "$SHOW_RC" -ne 0 ]; then
  set +e
  pnpm exec nx print-affected --select=projects --base="$BASE" --head="$HEAD" \
    >"$AFFECTED_TXT" 2>>"$ART_DIR/affected_projects.stderr" || true
  set -e
fi

# Normalize to JSON array for agents
if command -v jq >/dev/null 2>&1; then
  jq -Rs 'split("\n") | map(select(length>0))' "$AFFECTED_TXT" >"$AFFECTED_JSON"
else
  echo '[]' >"$AFFECTED_JSON"
fi

AFFECTED_COUNT=$(wc -l <"$AFFECTED_TXT" | tr -d ' ' || echo 0)

# ---------- Graph artifact ----------
# Produces an HTML (with embedded data) you can open or attach
pnpm exec nx graph --affected --base="$BASE" --head="$HEAD" \
  --file="$ART_DIR/affected-graph.html" >/dev/null 2>&1 || true

# ---------- Targets: build, lint, test ----------
targets=(build lint test)
declare -A rcs
for t in "${targets[@]}"; do
  LOG="$ART_DIR/${t}.log"
  set +e
  /usr/bin/time -p pnpm exec nx affected -t "$t" \
    --base="$BASE" --head="$HEAD" \
    --parallel --output-style=stream >"$LOG" 2>&1
  rcs[$t]=$?
  set -e
done

# Always produce ESLint JSON (consistent artifact for agents)
set +e
pnpm exec eslint --cache -f json . >"$ART_DIR/eslint.json" 2>"$ART_DIR/eslint.stderr"
ESLINT_JSON_RC=$?
set -e

# ---------- Summary ----------
if command -v jq >/dev/null 2>&1; then
  jq -n \
    --arg now "$(date -Is)" \
    --arg nx_version "$NX_VERSION" \
    --arg base "$BASE" \
    --arg head "$HEAD" \
    --arg affected_file "$AFFECTED_TXT" \
    --arg affected_json "$AFFECTED_JSON" \
    --arg graph_file "$ART_DIR/affected-graph.html" \
    --arg build_log "$ART_DIR/build.log" \
    --arg lint_log "$ART_DIR/lint.log" \
    --arg test_log "$ART_DIR/test.log" \
    --arg eslint_json "$ART_DIR/eslint.json" \
    --argjson affected_count "${AFFECTED_COUNT:-0}" \
    --argjson rc_build "${rcs[build]:-0}" \
    --argjson rc_lint  "${rcs[lint]:-0}"  \
    --argjson rc_test  "${rcs[test]:-0}"  \
    --argjson rc_eslint "$ESLINT_JSON_RC" \
    '{
      timestamp: $now,
      nx: { version: $nx_version, base: $base, head: $head },
      affected: { count: $affected_count, list_file: $affected_file, list_json: $affected_json, graph_html: $graph_file },
      targets: {
        build: { rc: $rc_build, log: $build_log },
        lint:  { rc: $rc_lint,  log: $lint_log },
        test:  { rc: $rc_test,  log: $test_log }
      },
      eslint: { json_file: $eslint_json, rc: $rc_eslint },
      advice: [
        "Open build/lint/test logs to see failures (rc != 0).",
        "Open affected-graph.html to visualize impacted projects.",
        "Use affected_projects.json for quick programmatic routing."
      ]
    }' >"$ART_DIR/summary.json"
else
  echo "Install jq to generate summary.json" | tee -a "$ART_DIR/summary.warn"
fi

echo "Nx artifacts:"
echo "  - $ART_DIR/affected_projects.txt"
echo "  - $ART_DIR/affected_projects.json"
echo "  - $ART_DIR/affected-graph.html"
echo "  - $ART_DIR/build.log"
echo "  - $ART_DIR/lint.log"
echo "  - $ART_DIR/test.log"
echo "  - $ART_DIR/eslint.json"
echo "  - $ART_DIR/summary.json (if jq available)"

# ---------- Exit policy ----------
STRICT="${NX_STRICT:-0}"  # 0 = always exit 0; 1 = fail at end if any target failed
if [ "$STRICT" -ne 0 ]; then
  if [ "${rcs[build]:-0}" -ne 0 ] || [ "${rcs[lint]:-0}" -ne 0 ] || [ "${rcs[test]:-0}" -ne 0 ] || [ "$ESLINT_JSON_RC" -ne 0 ]; then
    exit 1
  fi
fi
exit 0

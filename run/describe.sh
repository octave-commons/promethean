#!/usr/bin/env bash
# Runner: streams to terminal AND logs to files, overwrites "latest", and never fails outward from steps.
# Requires: bash, coreutils; optional: jq, /usr/bin/time

# Safety: no errexit (we don't want artifact write failures to kill the script)
set +e
set -uo pipefail

# ---- knobs ----
ART_ROOT="${ART_ROOT:-docs/reports/codex_cloud}"
RUN_DIR="${RUN_DIR:-$ART_ROOT/describe/latest}"   # always overwritten each run
TIMEOUT_SECS="${TIMEOUT_SECS:-0}"                 # 0 = no timeout; otherwise e.g. 600
STRICT="${STRICT:-0}"                             # 0 = never fail; 1 = fail at end if any step failed
DEBUG_RUNNER="${DEBUG_RUNNER:-0}"                 # 1 = bash -x

(( DEBUG_RUNNER )) && { PS4='+ (${BASH_SOURCE##*/}:${LINENO}): '; set -x; }

_have() { command -v "$1" >/dev/null 2>&1; }

# ---- reset run dir (no timestamp sprawl) ----
if [[ -d "$RUN_DIR" ]]; then
  case "$RUN_DIR" in
    */describe/*) rm -rf "$RUN_DIR" 2>/dev/null || true ;;
    *) printf '[runner] REFUSED to wipe suspicious RUN_DIR: %s\n' "$RUN_DIR" >&2 ;;
  esac
fi

LOG_DIR="$RUN_DIR/logs"
STEP_DIR="$RUN_DIR/steps"
if ! mkdir -p "$LOG_DIR" "$STEP_DIR" 2>/dev/null; then
  printf '[runner] WARN: cannot create %s; falling back to /tmp.\n' "$RUN_DIR" >&2
  RUN_DIR="/tmp/codex_cloud/describe/latest"
  LOG_DIR="$RUN_DIR/logs"; STEP_DIR="$RUN_DIR/steps"
  mkdir -p "$LOG_DIR" "$STEP_DIR" 2>/dev/null || { printf '[runner] WARN: console-only mode.\n' >&2; RUN_DIR=""; LOG_DIR=""; STEP_DIR=""; }
fi

# preflight warn if low disk
if _have df && [[ -n "$ART_ROOT" ]] && df -Pk "$ART_ROOT" >/dev/null 2>&1; then
  avail_k=$(df -Pk "$ART_ROOT" | awk 'NR==2{print $4}')
  [[ "${avail_k:-0}" -lt 51200 ]] && printf '[runner] WARN: low disk on %s (~%s KB free).\n' "$ART_ROOT" "$avail_k" >&2
fi

# summaries (always overwritten per run)
if [[ -n "$RUN_DIR" ]]; then
  SUMMARY_TSV="$RUN_DIR/summary.tsv"
  SUMMARY_JSON="$RUN_DIR/summary.jsonl"
else
  SUMMARY_TSV="/dev/null"
  SUMMARY_JSON="/dev/null"
fi
printf 'ts\tname\trc\tsignal\tstatus\tlog_out\tlog_err\n' >"$SUMMARY_TSV" 2>/dev/null || true
: >"$SUMMARY_JSON" 2>/dev/null || true

# ---- classifier ----
_classify() {
  local rc="$1" out="$2" err="$3" cmd="$4"
  local status="ok" signal=""
  (( rc > 128 )) && { signal=$((rc-128)); status="signal:$signal"; }
  (( rc == 124 )) && status="timeout"
  (( rc == 126 )) && status="permission"
  (( rc == 127 )) && status="not_found"
  grep -Eiq 'No space left on device|ENOSPC' "$err" "$out" 2>/dev/null && status="disk_full"
  grep -Eiq 'Out of memory|Cannot allocate memory|ENOMEM|JavaScript heap out of memory|Killed' "$err" "$out" 2>/dev/null && status="oom"
  grep -Eiq 'ECONNREFUSED|ECONNRESET|EAI_AGAIN|ENOTFOUND|network is unreachable|timed out|TLS handshake timeout' "$err" "$out" 2>/dev/null && status="network"
  grep -Eiq 'Unknown option|unrecognized option|invalid option|Usage:' "$err" "$out" 2>/dev/null && status="cli_usage"
  grep -Eiq 'Cannot find module|Module not found|TS2307' "$err" "$out" 2>/dev/null && status="dep_missing"
  grep -Eiq 'ELIFECYCLE|ERR_PNPM|npm ERR!' "$err" "$out" 2>/dev/null && status="build_failed"
  if echo "$cmd" | grep -Eq '\beslint\b'; then (( rc != 0 )) && status="lint_failed"; fi
  if echo "$cmd" | grep -Eq '\bnx\b'; then grep -Eiq 'Target .* failed|Nothing to run|Cannot find project' "$err" "$out" 2>/dev/null && status="nx_failed"; fi
  echo "$status" "$signal"
}

__RUNNER_ANY_FAIL=0

# ---- run a step (streams + never fails outward) ----
describe() {
  local name="$1"; shift
  local cmd=( "$@" )

  local out err merged
  if [[ -n "$LOG_DIR" ]]; then
    out="$LOG_DIR/${name}.out.log"
    err="$LOG_DIR/${name}.err.log"
    merged="$LOG_DIR/${name}.log"
  else
    out="/dev/null"; err="/dev/null"; merged="/dev/null"
  fi
  : >"$out" 2>/dev/null || true
  : >"$err" 2>/dev/null || true

  local started ended rc=0
  started="$(date -Is)"

  # Build wrapped command (time + timeout if available)
  local run_cmd=( "${cmd[@]}" )
  _have /usr/bin/time && run_cmd=( /usr/bin/time -v "${run_cmd[@]}" )
  if (( TIMEOUT_SECS > 0 )) && _have timeout; then
    run_cmd=( timeout --preserve-status "${TIMEOUT_SECS}s" "${run_cmd[@]}" )
  fi

  # STREAM: Send to terminal and to files, but NEVER let logging failures kill the command.
  # Strategy:
  # - temporarily ignore SIGPIPE (writer won't die if a logger closes)
  # - disable pipefail around the pipeline
  # - tee writes to a process substitution that appends to file via `cat >>file`; if that fails, it just stops appending.
  # - capture the command's actual rc via PIPESTATUS[0]
  trap '' PIPE
  set +o pipefail
  {
    "${run_cmd[@]}" \
      2> >( tee >( cat >>"$err" 2>/dev/null || true ) >&2 || true ) \
      | tee >( cat >>"$out" 2>/dev/null || true ) || true
  }
  rc=${PIPESTATUS[0]}
  set -o pipefail
  trap - PIPE

  ended="$(date -Is)"

  # merged (best-effort)
  { cat "$out"; echo; echo "------ STDERR ------"; cat "$err"; } >"$merged" 2>/dev/null || true

  read -r status signal <<< "$(_classify "$rc" "$out" "$err" "${cmd[*]}")"

  # per-step JSON (overwrite)
  if _have jq && [[ -n "$STEP_DIR" ]] && [[ "$SUMMARY_JSON" != "/dev/null" ]]; then
    jq -n \
      --arg name "$name" --arg cmd "${cmd[*]}" \
      --arg started "$started" --arg ended "$ended" \
      --arg out "$out" --arg err "$err" --arg merged "$merged" \
      --arg status "$status" --argjson rc "$rc" --arg signal "${signal:-}" \
      '
      def maybe_signal(s):
        if (s|type) == "string" and (s|length) > 0 then { signal: (s|tonumber) } else {} end;
      { name:$name, cmd:$cmd, started:$started, ended:$ended,
        logs:{out:$out, err:$err, merged:$merged},
        result:( {rc:$rc, status:$status} + maybe_signal($signal) ) }' \
      | tee "$STEP_DIR/${name}.json" > /dev/null 2>&1 || true
  fi

  printf '%s\t%s\t%d\t%s\t%s\t%s\t%s\n' \
    "$started" "$name" "$rc" "${signal:-}" "$status" "$out" "$err" >>"$SUMMARY_TSV" 2>/dev/null || true

  if _have jq && [[ "$SUMMARY_JSON" != "/dev/null" ]]; then
    jq -n \
      --arg name "$name" --arg cmd "${cmd[*]}" \
      --arg started "$started" --arg ended "$ended" \
      --arg out "$out" --arg err "$err" --arg merged "$merged" \
      --arg status "$status" --argjson rc "$rc" --arg signal "${signal:-}" \
      '
      def maybe_signal(s):
        if (s|type) == "string" and (s|length) > 0 then { signal: (s|tonumber) } else {} end;
      { name:$name, cmd:$cmd, started:$started, ended:$ended,
        logs:{out:$out, err:$err, merged:$merged},
        result:( {rc:$rc, status:$status} + maybe_signal($signal) ) }' \
      >>"$SUMMARY_JSON" 2>/dev/null || true
  fi

  (( rc != 0 )) && __RUNNER_ANY_FAIL=1
  # breadcrumb for supervisors
  printf '[runner] %s name=%s rc=%d status=%s\n' "$ended" "$name" "$rc" "$status" >&2

  return 0
}

# ---- finalize ----
describe_finalize() {
  if [[ -n "$RUN_DIR" ]]; then
    echo "Artifacts in: $RUN_DIR"
    echo "  - logs:     $LOG_DIR/*.log"
    echo "  - per-step: $STEP_DIR/*.json"
    [[ -s "$SUMMARY_JSON" ]] && echo "  - summary:  $SUMMARY_JSON"
    echo "  - table:    $SUMMARY_TSV"
  else
    echo "Artifacts: console-only (no writable artifact dir)"
  fi

  if (( STRICT )); then
    if [[ "$SUMMARY_TSV" != "/dev/null" ]] && [[ -s "$SUMMARY_TSV" ]]; then
      awk 'NR>1 && $3!="0"{bad=1} END{exit bad?1:0}' "$SUMMARY_TSV" || exit 1
    else
      (( __RUNNER_ANY_FAIL )) && exit 1
    fi
  fi
  exit 0
}

#!/bin/sh
set -eu

WAIT_TIMEOUT_SEC="${OLLAMA_GPU_WAIT_TIMEOUT_SEC:-180}"
STABLE_CHECKS="${OLLAMA_GPU_STABLE_CHECKS:-3}"
CHECK_INTERVAL_SEC="${OLLAMA_GPU_CHECK_INTERVAL_SEC:-5}"
LOSS_GRACE_SEC="${OLLAMA_GPU_LOSS_GRACE_SEC:-30}"

log() {
  printf '[ollama-gpu-guard] %s\n' "$*"
}

gpu_ready() {
  command -v nvidia-smi >/dev/null 2>&1 || return 1
  nvidia-smi >/dev/null 2>&1 || return 1
}

wait_for_gpu() {
  stable=0
  started_at="$(date +%s)"

  while :; do
    if gpu_ready; then
      stable=$((stable + 1))
      log "gpu probe ok (${stable}/${STABLE_CHECKS})"
      if [ "$stable" -ge "$STABLE_CHECKS" ]; then
        return 0
      fi
    else
      stable=0
      now="$(date +%s)"
      elapsed=$((now - started_at))
      if [ "$elapsed" -ge "$WAIT_TIMEOUT_SEC" ]; then
        log "gpu not ready after ${elapsed}s; exiting so docker restart policy can retry"
        return 1
      fi
      log "gpu not ready yet; retrying in ${CHECK_INTERVAL_SEC}s"
    fi

    sleep "$CHECK_INTERVAL_SEC"
  done
}

watch_gpu() {
  loss_elapsed=0

  while :; do
    sleep "$CHECK_INTERVAL_SEC"

    if gpu_ready; then
      loss_elapsed=0
      continue
    fi

    loss_elapsed=$((loss_elapsed + CHECK_INTERVAL_SEC))
    log "gpu probe failed after startup (${loss_elapsed}s/${LOSS_GRACE_SEC}s grace)"

    if [ "$loss_elapsed" -lt "$LOSS_GRACE_SEC" ]; then
      continue
    fi

    log "gpu remained unavailable; stopping ollama so docker restart policy can recover"
    kill -TERM "$OLLAMA_PID" 2>/dev/null || true
    sleep 10
    kill -KILL "$OLLAMA_PID" 2>/dev/null || true
    return 0
  done
}

wait_for_gpu

log "gpu ready; starting ollama serve"
ollama serve &
OLLAMA_PID="$!"

watch_gpu &
WATCHDOG_PID="$!"

set +e
wait "$OLLAMA_PID"
OLLAMA_STATUS="$?"
set -e

kill "$WATCHDOG_PID" 2>/dev/null || true
wait "$WATCHDOG_PID" 2>/dev/null || true

exit "$OLLAMA_STATUS"
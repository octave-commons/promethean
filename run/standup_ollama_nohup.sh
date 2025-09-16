#!/usr/bin/env bash
set -euo pipefail

# start daemon if not running
pgrep -f 'ollama serve' >/dev/null || nohup ollama serve >/dev/null 2>&1 &

# wait for readiness
if ! timeout 60s bash -c 'until curl -fsS http://127.0.0.1:11434/api/tags >/dev/null; do sleep 1; done'; then
    echo "Ollama daemon failed to become ready in 60s" >&2
    exit 1
fi

# pull common models (non-fatal)
ollama pull qwen2.5:0.5b || true
ollama pull nomic-embed-text || true

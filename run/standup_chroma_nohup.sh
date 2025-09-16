#!/usr/bin/env bash
set -euo pipefail

# start chroma if not running
curl -fsS http://127.0.0.1:8000/api/v2/heartbeat >/dev/null 2>&1 || \
    nohup uvx --from chromadb chroma run --host 127.0.0.1 --port 8000 >/dev/null 2>&1 &

# wait for health
if ! timeout 60s bash -c 'until curl -fsS http://127.0.0.1:8000/api/v2/heartbeat >/dev/null; do sleep 1; done'; then
    echo "ChromaDB failed to become healthy in 60s" >&2
    exit 1
fi

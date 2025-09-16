#!/usr/bin/env bash
# start chroma if not running
if ! curl -fsS http://127.0.0.1:8000/api/v2/heartbeat >/dev/null 2>&1; then
  nohup uvx --from chromadb chroma run --host 127.0.0.1 --port 8000 >"$ART_DIR/chromadb_nohup.txt" 2>&1 &
fi

if ! timeout 60s bash -c 'until curl -fsS http://127.0.0.1:8000/api/v2/heartbeat >/dev/null; do sleep 1; done'; then
  echo "ChromaDB failed to become healthy in 60s" | tee -a "$ART_DIR/chromadb_health.txt" >&2
  exit 1
fi

#!/usr/bin/env bash
pnpm install --frozen-lockfile

# start the server if not running
curl -fsS http://127.0.0.1:8000/api/v2/heartbeat >/dev/null 2>&1 || \
    nohup uvx --from chromadb chroma run --host 127.0.0.1 --port 8000 >/dev/null 2>&1 &


# wait for health (60s timeout each)
if ! timeout 60s bash -c 'until curl -fsS http://127.0.0.1:8000/api/v2/heartbeat >/dev/null; do sleep 1; done'; then
    echo "ChromaDB failed to become healthy in 60s" >&2
    exit 1
fi


pgrep -f 'ollama serve' >/dev/null || nohup ollama serve >/dev/null 2>&1 &

if ! timeout 60s bash -c 'until curl -fsS http://127.0.0.1:11434/api/tags >/dev/null; do sleep 1; done'; then
    echo "Ollama daemon failed to become ready in 60s" >&2
    exit 1
fi

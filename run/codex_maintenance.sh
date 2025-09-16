#!/usr/bin/env bash

echo "# Codex Cloud Maintenance Report Start:$(date +"%Y.%m.%d.%H.%M.%S")"
pnpm install --no-frozen-lockfile

bash ./run/setup_gh_cli.sh >"$ART_DIR/setup_gh_cli.txt" 2>&1

# start the server if not running
curl -fsS http://127.0.0.1:8000/api/v2/heartbeat >/dev/null 2>&1 || \
    nohup uvx --from chromadb chroma run --host 127.0.0.1 --port 8000 >/dev/null 2>&1 &


# wait for health (60s timeout each)
if ! timeout 60s bash -c 'until curl -fsS http://127.0.0.1:8000/api/v2/heartbeat >/dev/null; do sleep 1; done'; then
    echo "ChromaDB failed to become healthy in 60s" >&2
    exit 1
fi


# Start ollama if it isn't already running
bash ./run/standup_ollama_nohup.sh


bash ./run/standup_chroma_nohup.sh


# Prime caches & collect Nx artifacts without failing the job
NX_BASE="${NX_BASE:-origin/main}" \
       NX_HEAD="${NX_HEAD:-HEAD}" \
       NX_STRICT="${NX_STRICT:-0}" \
       ART_ROOT="docs/reports/codex_cloud" \
       bash ./run/nx_artifacts.sh || true

echo "# Codex Cloud Maintenance Report End:$(date +"%Y.%m.%d.%H.%M.%S")"

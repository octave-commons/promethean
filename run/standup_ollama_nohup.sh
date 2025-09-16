#!/usr/bin/env bash
pgrep -f 'ollama serve' >/dev/null || nohup ollama serve >"$ART_DIR/ollama_nohup.txt" 2>&1 &

if ! timeout 60s bash -c 'until curl -fsS http://127.0.0.1:11434/api/tags >/dev/null; do sleep 1; done'; then
  echo "Ollama daemon failed to become ready in 60s" | tee -a "$ART_DIR/ollama_health.txt" >&2
  exit 1
fi

ollama pull qwen2.5:0.5b >"$ART_DIR/ollama_pull_qwen.txt" 2>&1 || true
ollama pull nomic-embed-text >"$ART_DIR/ollama_pull_embed.txt" 2>&1 || true

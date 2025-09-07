#!/usr/bin/env bash

set -euo pipefail

# curl -fsSL https://ollama.com/install.sh | sh



############################################
# Clojure CLI (clj / clojure)
############################################
# echo "==> Installing Clojure CLI (official linux script)..."
# tmpdir="$(mktemp -d)"
# pushd "$tmpdir" >/dev/null
# curl -L -O https://github.com/clojure/brew-install/releases/latest/download/linux-install.sh
# chmod +x linux-install.sh
# sudo ./linux-install.sh
# popd >/dev/null
# rm -rf "$tmpdir"

# echo "==> clj / clojure versions:"
# clojure -Sdescribe | sed -n '1,12p' || true

############################################
# Babashka (bb)
############################################
# echo "==> Installing Babashka..."
# sudo bash < <(curl -s https://raw.githubusercontent.com/babashka/babashka/master/install)
# bb --version || true

# npm install --global corepack@latest
# corepack enable pnpm
apt-get update
apt-get install -y build-essential python3 make g++ pkg-config
# optional but helps some images:
apt-get install -y git ca-certificates
apt-get install -y jq moreutils ripgrep
bash ./run/install_gyp.sh

# pre-commit install
corepack enable
corepack prepare pnpm@9.0.0 --activate
pnpm -v
pnpm install --no-frozen-lockfile --reporter=append-only
bash ./run/setup_playwright.sh
curl -LsSf https://astral.sh/uv/install.sh | sh
export PATH="$HOME/.local/bin:$PATH"
command -v uvx >/dev/null || { echo "uvx not found on PATH after install" >&2; exit 1; }
# install ollama
curl -fsSL https://ollama.com/install.sh | sh

# start the server if not running
curl -fsS http://127.0.0.1:8000/api/v2/heartbeat >/dev/null 2>&1 || \
        nohup uvx --from chromadb chroma run --host 127.0.0.1 --port 8000 >/dev/null 2>&1 &

pgrep -f 'ollama serve' >/dev/null || nohup ollama serve >/dev/null 2>&1 &

# wait for health (60s timeout each)
if ! timeout 60s bash -c 'until curl -fsS http://127.0.0.1:8000/api/v2/heartbeat >/dev/null; do sleep 1; done'; then
  echo "ChromaDB failed to become healthy in 60s" >&2
  exit 1
fi
if ! timeout 60s bash -c 'until curl -fsS http://127.0.0.1:11434/api/tags >/dev/null; do sleep 1; done'; then
  echo "Ollama daemon failed to become ready in 60s" >&2
  exit 1
fi
# pull models once daemon is ready
ollama pull qwen2.5:0.5b
ollama pull nomic-embed-text

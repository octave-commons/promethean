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

# pre-commit install
corepack enable
corepack prepare pnpm@9.0.0 --activate
pnpm -v
pnpm install --reporter=ndjson --no-frozen-lockfile
pnpm --filter @promethean/piper run build

#!/usr/bin/env bash

set -euo pipefail

curl -LsSf https://astral.sh/uv/install.sh | sh
curl -fsSL https://ollama.com/install.sh | sh



############################################
# Clojure CLI (clj / clojure)
############################################
echo "==> Installing Clojure CLI (official linux script)..."
tmpdir="$(mktemp -d)"
pushd "$tmpdir" >/dev/null
curl -L -O https://github.com/clojure/brew-install/releases/latest/download/linux-install.sh
chmod +x linux-install.sh
$SUDO ./linux-install.sh
popd >/dev/null
rm -rf "$tmpdir"

echo "==> clj / clojure versions:"
clojure -Sdescribe | sed -n '1,12p' || true

############################################
# Babashka (bb)
############################################
echo "==> Installing Babashka..."
$SUDO bash < <(curl -s https://raw.githubusercontent.com/babashka/babashka/master/install)
bb --version || true

npm install --global corepack@latest
corepack enable pnpm

pip install pytest flake8 black pre-commit hy dotenv
pre-commit install
make setup-pipenv
PROMETHEAN_TORCH="cpu" make install
make build

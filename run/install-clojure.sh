#!/usr/bin/env bash
set -euo pipefail

if [[ "${EUID:-$(id -u)}" -ne 0 ]]; then
  SUDO="sudo"
else
  SUDO=""
fi

echo "==> Updating apt and installing base deps..."
sudo apt-get update -y
sudo apt-get install -y \
  git curl wget unzip zip gpg ca-certificates rlwrap build-essential \
  openjdk-21-jdk

echo "==> Java:"
java -version || true

############################################
# Node.js (for ClojureScript toolchains)
############################################
echo "==> Installing Node.js LTS via NodeSource (adds apt repo & keyring)..."
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key \
  | sudo gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg
NODE_MAJOR=22   # current LTS
echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_${NODE_MAJOR}.x nodistro main" \
 | sudo tee /etc/apt/sources.list.d/nodesource.list >/dev/null
sudo apt-get update -y
sudo apt-get install -y nodejs

echo "==> Enabling Corepack & PNPM (nice for shadow-cljs workflows)..."
# corepack is bundled with modern Node — enable and pin latest pnpm
sudo corepack enable
sudo corepack prepare pnpm@latest-10 --activate || true

############################################
# Clojure CLI (clj / clojure)
############################################
echo "==> Installing Clojure CLI (official linux script)..."
tmpdir="$(mktemp -d)"
pushd "$tmpdir" >/dev/null
curl -L -O https://github.com/clojure/brew-install/releases/latest/download/linux-install.sh
chmod +x linux-install.sh
sudo ./linux-install.sh
popd >/dev/null
rm -rf "$tmpdir"

echo "==> clj / clojure versions:"
clojure -Sdescribe | sed -n '1,12p' || true

############################################
# Babashka (bb)
############################################
echo "==> Installing Babashka..."
if command -v bb >/dev/null 2>&1; then
  echo "bb already installed: $(bb --version | head -n 1)"
else
  echo "Downloading latest Babashka install script..."
  sudo bash < <(curl -fsSL https://raw.githubusercontent.com/babashka/babashka/master/install)
fi
bb --version || true



############################################
# (Optional) Global shadow-cljs CLI
############################################
# You usually add shadow-cljs per-project as a dev dependency,
# but a global CLI can be handy:
# pnpm add -g shadow-cljs || npm i -g shadow-cljs

echo "==> Done!"
echo
echo "Quick checks:"
echo "  clojure-lsp --version"
echo "  clj-kondo --version"
echo "  bb --version"
echo "  node -v && pnpm -v"
echo
echo "Editor wiring:"
echo "  • VS Code: install 'Calva' (uses clojure-lsp under the hood)."
echo "  • Emacs/Spacemacs: enable lsp-mode or eglot; clojure-lsp is already on PATH."
echo
echo "ClojureScript note:"
echo "  • Prefer project-local shadow-cljs: 'pnpm add -D shadow-cljs' then run 'npx shadow-cljs watch app' (or via pnpm scripts)."

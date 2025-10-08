#!/usr/bin/env bash
set -euo pipefail

if [[ "${EUID:-$(id -u)}" -ne 0 ]]; then
  SUDO="sudo"
else
  SUDO=""
fi

echo "==> Updating apt and installing base deps..."
$SUDO apt-get update -y
$SUDO apt-get install -y \
  git curl wget unzip zip gpg ca-certificates rlwrap build-essential \
  openjdk-21-jdk

echo "==> Java:"
java -version || true

############################################
# Node.js (for ClojureScript toolchains)
############################################
echo "==> Installing Node.js LTS via NodeSource (adds apt repo & keyring)..."
$SUDO mkdir -p /etc/apt/keyrings
curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key \
  | $SUDO gpg --dearmor --yes -o /etc/apt/keyrings/nodesource.gpg
NODE_MAJOR=22   # current LTS
echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_${NODE_MAJOR}.x nodistro main" \
 | $SUDO tee /etc/apt/sources.list.d/nodesource.list >/dev/null
$SUDO apt-get update -y
$SUDO apt-get install -y nodejs

echo "==> Enabling Corepack & PNPM (nice for shadow-cljs workflows)..."
# corepack is bundled with modern Node — enable and pin latest pnpm
$SUDO corepack enable
$SUDO corepack prepare pnpm@latest-10 --activate || true

if ! command -v npm >/dev/null 2>&1; then
  echo "npm missing from PATH; aborting because we can't install shadow-cljs/nbb."
  exit 1
fi

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
if command -v bb >/dev/null 2>&1; then
  echo "bb already installed: $(bb --version | head -n 1)"
else
  echo "Downloading latest Babashka install script..."
  $SUDO bash < <(curl -fsSL https://raw.githubusercontent.com/babashka/babashka/master/install)
fi
bb --version || true



############################################
# Global shadow-cljs & nbb CLIs
############################################
print_cli_version() {
  local cmd="$1"
  if ! command -v "$cmd" >/dev/null 2>&1; then
    return
  fi

  set +e
  local output
  output=$("$cmd" --version 2>&1)
  local status=$?
  set -e

  if [[ $status -eq 0 ]]; then
    echo "$cmd version: $(echo "$output" | head -n 1)"
  else
    echo "$cmd installed at $(command -v "$cmd") (version check failed with exit $status — first run may need internet access)"
    echo "$output"
  fi
}

install_global_cli() {
  local cmd="$1"
  local pkg="$2"
  if command -v "$cmd" >/dev/null 2>&1; then
    echo "$cmd already installed at $(command -v "$cmd")"
    print_cli_version "$cmd"
    return
  fi

  echo "Installing $pkg globally via npm..."
  $SUDO npm install -g "$pkg"
  if ! command -v "$cmd" >/dev/null 2>&1; then
    echo "Failed to locate $cmd on PATH after installing $pkg" >&2
    exit 1
  fi
  print_cli_version "$cmd"
}

echo "==> Installing shadow-cljs CLI..."
install_global_cli shadow-cljs shadow-cljs

echo "==> Installing nbb CLI..."
install_global_cli nbb nbb

echo "==> Done!"
echo
echo "Quick checks:"
echo "  clojure-lsp --version"
echo "  clj-kondo --version"
echo "  bb --version"
echo "  shadow-cljs --version"
echo "  nbb --version"
echo "  node -v && pnpm -v"
echo
echo "Editor wiring:"
echo "  • VS Code: install 'Calva' (uses clojure-lsp under the hood)."
echo "  • Emacs/Spacemacs: enable lsp-mode or eglot; clojure-lsp is already on PATH."
echo
echo "ClojureScript note:"
echo "  • Prefer project-local shadow-cljs: 'pnpm add -D shadow-cljs' then run 'npx shadow-cljs watch app' (or via pnpm scripts)."

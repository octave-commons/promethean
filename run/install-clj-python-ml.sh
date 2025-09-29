#!/usr/bin/env bash
set -euo pipefail

if [[ "${EUID:-$(id -u)}" -ne 0 ]]; then SUDO="sudo"; else SUDO=""; fi

echo "==> Base deps (Java, build tools, Python headers)..."
$SUDO apt-get update -y
$SUDO apt-get install -y \
  git curl unzip zip ca-certificates rlwrap build-essential \
  openjdk-21-jdk \
  python3 python3-venv python3-dev python3-pip

echo "==> Clojure CLI..."
tmp="$(mktemp -d)"; pushd "$tmp" >/dev/null
curl -L -O https://github.com/clojure/brew-install/releases/latest/download/linux-install.sh
chmod +x linux-install.sh
$SUDO ./linux-install.sh
popd >/dev/null; rm -rf "$tmp"

echo "==> Python venv for ML (keeps site-packages clean)..."
python3 -m venv "$HOME/.py-ml"
source "$HOME/.py-ml/bin/activate"
python -m pip install --upgrade pip wheel setuptools

echo "==> Core ML libs (CPU builds to be safe)..."
pip install numpy pandas scikit-learn matplotlib
# PyTorch CPU (safe default). For GPU, replace with official CUDA wheels when ready.
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu

echo "==> Convenience: point LIBPYTHON to the venv’s libpython (helps libpython-clj2 find it)..."
LPATH="$(python - <<'PY'
import sysconfig, os
libdir = sysconfig.get_config_var("LIBDIR") or ""
ver    = sysconfig.get_config_var("LDVERSION") or sysconfig.get_config_var("VERSION")
cand   = os.path.join(libdir, f"libpython{ver}.so")
print(cand if os.path.exists(cand) else "")
PY
)"
if [[ -n "$LPATH" ]]; then
  grep -q 'LIBPYTHON=' "$HOME/.bashrc" 2>/dev/null || echo "export LIBPYTHON=$LPATH" >> "$HOME/.bashrc"
  export LIBPYTHON="$LPATH"
  echo "    LIBPYTHON=$LIBPYTHON"
else
  echo "    (Could not auto-find libpython .so; libpython-clj2 may still auto-detect. If not, set LIBPYTHON manually.)"
fi

echo "==> Done. Next:"
echo "   1) source ~/.bashrc (or start a new shell)"
echo "   2) Keep the venv active when you run your Clojure app:"
echo "        source ~/.py-ml/bin/activate"
echo "   3) Create a Clojure project (see below) and run: clj -M -m ml.playground"

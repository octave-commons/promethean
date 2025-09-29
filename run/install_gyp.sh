#!/usr/bin/env bash
# setup-native-node-build.sh
# Ubuntu/Debian: install system deps for native Node builds, pin global node-gyp, and harden PATH.

set -euo pipefail

#--- Helpers ---------------------------------------------------------------
log() { builtin printf -- "\033[1;32m[setup]\033[0m %s\n" "$*"; }
warn() { builtin printf -- "\033[1;33m[warn]\033[0m %s\n" "$*"; }
die() { builtin printf -- "\033[1;31m[err]\033[0m %s\n" "$*"; exit 1; }

#--- OS guard --------------------------------------------------------------
if ! command -v apt-get >/dev/null 2>&1; then
  die "This script targets Debian/Ubuntu (apt-get not found)."
fi

#--- 1) Toolchain for node-gyp (Python, make, C/C++ compiler, pkg-config) ---
# node-gyp needs Python + make + a proper C/C++ toolchain. :contentReference[oaicite:4]{index=4}
log "Installing core build toolchain (Python, make, g++, pkg-config)…"
sudo apt-get install -y python3 make g++ pkg-config build-essential

#--- 2) Canvas system libraries (Cairo/Pango/JPEG/GIF/SVG) -----------------
# Canonical deps from node-canvas docs. :contentReference[oaicite:5]{index=5}
log "Installing node-canvas dependencies (Cairo/Pango/jpeg/gif/svg)…"
sudo apt-get install -y libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev

#--- 3) Voice stack libs for @discordjs/opus --------------------------------
# Native bindings to libopus; ffmpeg commonly used alongside. :contentReference[oaicite:6]{index=6}
log "Installing Opus/FFmpeg for @discordjs/opus…"
sudo apt-get install -y libopus-dev ffmpeg

#--- 4) Ensure Corepack & pnpm (optional but handy in fresh envs) ----------
if ! command -v pnpm >/dev/null 2>&1; then
  log "Enabling Corepack and preparing pnpm (optional)…"
  if command -v corepack >/dev/null 2>&1; then
    corepack enable || true
    corepack prepare pnpm@latest --activate || true
  else
    warn "corepack not found; skipping pnpm bootstrap."
  fi
fi

#--- 5) Install node-gyp globally & pin npm to it --------------------------
# npm uses the `node_gyp` config to locate the binary for lifecycle builds. :contentReference[oaicite:7]{index=7}
log "Installing node-gyp globally…"
npm i -g node-gyp@latest

# Find global npm prefix & binary path
NPM_PREFIX=$(npm prefix -g)
NODE_GYP_BIN="$NPM_PREFIX/lib/node_modules/node-gyp/bin/node-gyp.js"
#--- 6) Ensure npm global bin is on PATH for interactive shells ------------
# npm honors env vars like NPM_CONFIG_* for config; PATH still matters for tools you run. :contentReference[oaicite:8]{index=8}
NPM_BIN_DIR="$NPM_PREFIX/bin"

#--- 7) Show effective config ------------------------------------------------
log "Verifying configuration…"
echo "npm config get node_gyp  => $(npm config get node_gyp)"
echo "node-gyp --version       => $(node-gyp --version || echo 'NOT FOUND IN PATH')"
echo "Global npm bin dir       => $NPM_BIN_DIR"

log "Done. You can now run: pnpm install --reporter=ndjson --loglevel silly"

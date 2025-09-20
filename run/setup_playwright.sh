#!/usr/bin/env bash
# Setup Playwright for CI on Debian/Ubuntu runners.
# - Installs OS deps (package manager + fonts)
# - Installs Playwright browsers and their Linux dependencies
# - Supports pnpm/npm/yarn workspaces

set -euo pipefail

log() { builtin printf -- "\033[1;32m[playwright-setup]\033[0m %s\n" "$*"; }

# 0) Detect package manager (Debian/Ubuntu expected in most CI)
if command -v apt-get >/dev/null 2>&1; then
  PKG=apt-get
else
  echo "Unsupported runner (needs apt-get). Use the official Playwright Docker images instead." >&2
  exit 1
fi

# 1) Base system deps that Playwright recommends (fonts, libs)
#    (install-deps covers most libs; fonts help rendering)
log "Installing base system packages…"
sudo apt-get install -y --no-install-recommends \
  ca-certificates curl git \
  fonts-liberation fonts-noto-color-emoji \
  libasound2t64 libatk-bridge2.0-0 libatk1.0-0 \
  libatspi2.0-0 libcups2 libdbus-1-3 libdrm2 \
  libgbm1 libgtk-3-0 libgtk-4-1 libnspr4 libnss3 \
  libu2f-udev libx11-6 libx11-xcb1 libxcb1 libxcomposite1 \
  libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 \
  libxrandr2 libxrender1 libxss1 libxtst6 xdg-utils

# 2) Ensure node + package manager are present (CI images often have node)
if ! command -v node >/dev/null 2>&1; then
  echo "Node.js not found; install Node before this script." >&2
  exit 1
fi

# Prefer pnpm if present
PM="pnpm"
if ! command -v pnpm >/dev/null 2>&1; then
  if command -v npm >/dev/null 2>&1; then PM="npm"
  elif command -v yarn >/dev/null 2>&1; then PM="yarn"
  else
    echo "No pnpm/npm/yarn found." >&2
    exit 1
  fi
fi

# 3) Install Playwright browsers + OS dependencies in one go
#    --with-deps pulls the distro-specific packages playwright needs on Linux.
#    (Supported Ubuntu/Debian versions only.)
log "Installing Playwright browsers and Linux dependencies…"
npx --yes playwright install --with-deps

# (Optional) force install specific browsers only:
# npx --yes playwright install --with-deps chromium firefox webkit

# 4) Print cache location (useful if you decide to cache anyway)
log "Playwright cache:"
if [ -d "$HOME/.cache/ms-playwright" ]; then
  du -hs "$HOME/.cache/ms-playwright"/* || true
fi

log "Playwright setup complete."

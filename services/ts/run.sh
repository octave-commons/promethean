#!/usr/bin/bash
if command -v pnpm >/dev/null 2>&1; then
  pnpm start
else
  echo "ERROR: pnpm is required. Enable Corepack and activate pnpm:"
  echo "  corepack enable && corepack prepare pnpm@latest --activate"
  exit 1
fi

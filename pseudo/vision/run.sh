#!/usr/bin/bash
if command -v pnpm >/dev/null 2>&1; then
  pnpm start
else
  npm start
fi

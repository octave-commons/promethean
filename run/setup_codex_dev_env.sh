#!/usr/bin/bash
if command -v pnpm >/dev/null 2>&1; then
  pnpm add -g pm2 ava dotenv
else
  echo "ERROR: pnpm is required. Enable Corepack and activate pnpm:"
  echo "  corepack enable && corepack prepare pnpm@latest --activate"
  exit 1
fi
pip install pytest flake8 black pre-commit hy dotenv
curl -fsSL https://ollama.com/install.sh | sh
pre-commit install
make setup-pipenv

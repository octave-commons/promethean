#!/usr/bin/bash
if command -v pnpm >/dev/null 2>&1; then
  pnpm add -g pm2 ava dotenv
else
  npm install -g pm2 ava dotenv
fi
pip install pytest flake8 black pre-commit hy dotenv
curl -fsSL https://ollama.com/install.sh | sh
pre-commit install
make setup-pipenv

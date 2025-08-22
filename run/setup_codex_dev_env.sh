#!/usr/bin/bash
curl -LsSf https://astral.sh/uv/install.sh | sh
curl -fsSL https://ollama.com/install.sh | sh

npm install --global corepack@latest
corepack enable pnpm

pip install pytest flake8 black pre-commit hy dotenv
pre-commit install
make setup-pipenv
make setup

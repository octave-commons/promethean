#!/usr/bin/bash
npm install --global corepack@latest
corepack enable pnpm
pip install pytest flake8 black pre-commit hy dotenv
curl -fsSL https://ollama.com/install.sh | sh
pre-commit install
make setup-pipenv
curl -LsSf https://astral.sh/uv/install.sh | sh
make setup

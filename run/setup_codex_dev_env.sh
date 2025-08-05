#!/usr/bin/bash
npm install -g pm2 ava dotenv
pip install pytest flake8 black pre-commit hy dotenv
curl -fsSL https://ollama.com/install.sh | sh
pre-commit install
make setup-pipenv
make setup-quick

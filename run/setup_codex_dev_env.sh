#!/usr/bin/bash
npm install -g pm2 ava dotenv
pip install pytest flake8 black pre-commit hy dotenv
pre-commit install
make setup-pipenv
make install

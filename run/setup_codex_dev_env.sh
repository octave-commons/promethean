#!/usr/bin/bash
npm install -g pm2 ava
pip install pytest discord flake8 black pre-commit hy
pre-commit install
make setup-pipenv


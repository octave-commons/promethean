#!/usr/bin/bash
PYTHONPATH="$(dirname "$0")/../shared:${PYTHONPATH}" pipenv run python service.py

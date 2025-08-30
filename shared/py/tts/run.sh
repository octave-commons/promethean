#!/usr/bin/bash
PYTHONPATH="$(dirname "$0")/../shared:${PYTHONPATH}" pipenv run uvicorn app:app --host 0.0.0.0 --port 5004

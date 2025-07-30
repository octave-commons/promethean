#!/usr/bin/bash
pipenv run uvicorn ws:app --host 0.0.0.0 --port 5003

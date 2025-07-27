#!/usr/bin/bash
export AGENT_NAME="duck"
cd ../../services/
python -m pipenv run python -m main

#!/usr/bin/bash
source .env
source .tokens

export PYTHONPATH=../../
export PYTHONUNBUFFERED=1
export PYTHONUTF8=1
export DISCORD_CLIENT_USER_NAME=$AGENT_NAME

cd ../../services/discord-indexer
pipenv install dotenv discord
python -m pipenv run python -m main

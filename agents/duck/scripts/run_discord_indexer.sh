#!/usr/bin/bash
source .env
source .tokens

export DISCORD_TOKEN
export DISCORD_CLIENT_USER_ID

export DEFAULT_CHANNEL
export DEFAULT_CHANNEL_NAME
export PYTHONPATH=../../
export PYTHONUNBUFFERED=1
export PYTHONUTF8=1
export DISCORD_CLIENT_USER_NAME=$AGENT_NAME


python -m pipenv run python -m services.py.main

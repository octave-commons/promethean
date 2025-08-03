#!/usr/bin/bash
source .env
source .tokens
export DISCORD_TOKEN
export DISCORD_CLIENT_USER_ID

npm --prefix ../../services/ts/discord-embedder run start:dev

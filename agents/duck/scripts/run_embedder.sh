#!/usr/bin/bash
source .env
source .tokens

export DISCORD_TOKEN
export DISCORD_CLIENT_USER_ID
cd ../../../services/discord-embedder/
npm install
node --loader ts-node/esm ./src/index.ts

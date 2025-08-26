#!/usr/bin/bash
source .env
source .tokens

export DISCORD_TOKEN
export DISCORD_CLIENT_USER_ID
cd ../../../services/discord-embedder/
if command -v pnpm >/dev/null 2>&1; then
  pnpm install
else
  npm install
fi
node --loader ts-node/esm ./src/index.ts

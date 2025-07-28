#!/usr/bin/bash
source .env
source .tokens
export DISCORD_TOKEN
export DISCORD_CLIENT_USER_ID
cd ../../services/cephalon/
npm install

# echo "wooot"
npm run build
# echo "wooth"

node dist/index.js

# npm run start:dev

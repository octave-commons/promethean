#!/usr/bin/bash
source .env
source .tokens
cd ../../../services/discord-embedder/
npm install
node --loader ts-node/esm ./src/index.ts

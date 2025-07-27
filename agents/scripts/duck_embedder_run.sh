#!/usr/bin/bash
export AGENT_NAME="duck"

cd ../../services/discord-embedder/
node --loader ts-node/esm ./src/index.ts

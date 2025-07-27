#!/usr/bin/bash
export AGENT_NAME="duck"
cd ../../services/cephalon/
node --loader ts-node/esm ./src/index.ts

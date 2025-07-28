#!/usr/bin/bash
source .env
source .tokens
cd ../../services/cephalon/
npm install
node --loader ts-node/esm ./src/index.ts

# remote.ts

**Path**: `shared/ts/src/embeddings/remote.ts`

**Description**: Shared embedding function that forwards requests to the embedding service through the
message broker. Cephalon modules import this helper when embeddings are required.

## Dependencies
- chromadb
- `@promethean/legacy/brokerClient.js`

## Dependents
- `services/ts/cephalon/src/tests/embedding.test.ts`

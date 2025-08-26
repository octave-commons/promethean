RemoteEmbeddingFunction (TypeScript)

- Import: `@shared/ts/dist/embeddings/remote.js`
- Purpose: shared Chroma EmbeddingFunction that requests vectors via the broker.

Usage

```ts
import { RemoteEmbeddingFunction } from '@shared/ts/dist/embeddings/remote.js';

const embeddingFunction = RemoteEmbeddingFunction.fromConfig({
    driver: process.env.EMBEDDING_DRIVER || 'ollama',
    fn: process.env.EMBEDDING_FUNCTION || 'nomic-embed-text',
    // optional:
    brokerUrl: process.env.BROKER_URL,
    clientIdPrefix: 'cephalon-embed',
});
```

Notes

- Replaces duplicated per-service implementations in Cephalon and Discord Embedder.
- Items may be either strings (treated as `{ type: 'text', data }`) or explicit `{ type, data }` objects, e.g. `{ type: 'image_url', data: 'https://example.com' }`.
- Default distance space: `l2` (also supports `cosine`).

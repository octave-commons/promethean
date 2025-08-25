# Shared Persistence Module

This module centralizes MongoDB and ChromaDB persistence for Promethean services.

## DualStore

`DualStoreManager` provides a unified API that writes documents to both MongoDB and ChromaDB. Each entry receives a UUID, timestamp, and optional metadata. Usage:

```ts
import { DualStoreManager } from '@shared/ts/persistence/dualStore.js';

const store = await DualStoreManager.create('my_collection', 'text', 'createdAt');
await store.addEntry({ text: 'hello', createdAt: Date.now(), metadata: { userName: 'Duck' } });
const recent = await store.getMostRecent(5);
```

## ContextStore

`ContextStore` manages multiple `DualStore` collections and can compile context for LLM prompts.

```ts
import { ContextStore } from '@shared/ts/persistence/contextStore.js';

const ctx = new ContextStore();
await ctx.createCollection('agent_messages', 'text', 'createdAt');
const compiled = await ctx.compileContext(['hi']);
```

## Maintenance

Background cleanup helpers live in `maintenance.ts` and can be reused by services for periodic trimming of large collections.

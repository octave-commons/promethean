# @promethean-os/unified-indexer

A comprehensive unified indexer service that provides cross-domain search and indexing capabilities for the Promethean OS.

## Features

- **Multi-source indexing**: Files, Discord, OpenCode, Kanban
- **Cross-domain search**: Semantic and keyword search across all sources
- **Context compilation**: LLM-ready context from multiple data sources
- **Service management**: Periodic sync, health monitoring, statistics
- **Extensible architecture**: Easy to add new data sources

## Quick Start

```typescript
import { createUnifiedIndexerService, createCrossDomainSearchEngine } from '@promethean-os/unified-indexer';

// Create indexer service
const indexerService = await createUnifiedIndexerService({
    indexing: { /* ChromaDB + MongoDB config */ },
    sources: {
        files: { enabled: true, paths: ['./src', './docs'] },
        discord: { enabled: false },
        opencode: { enabled: false },
        kanban: { enabled: false },
    },
    sync: { interval: 300000, batchSize: 100 },
});

// Create search engine
const searchEngine = createCrossDomainSearchEngine(indexerService);

// Search across all sources
const results = await searchEngine.search({
    query: 'TypeScript contextStore',
    semantic: true,
    timeBoost: true,
    includeContext: true,
});
```

## Documentation

See [UNIFIED_INDEXER_GUIDE.md](./UNIFIED_INDEXER_GUIDE.md) for comprehensive documentation.

## License

GPL-3.0-only
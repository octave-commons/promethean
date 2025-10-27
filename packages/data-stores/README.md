# @promethean-os/data-stores

Centralized data store management for Promethean packages, providing unified access to shared dual stores through ContextStore.

## Overview

This package serves as a centralized sink and data source for dual store definitions used across multiple packages:

- **@promethean-os/opencode-client**: Uses session, event, and message stores
- **@promethean-os/file-system/file-indexer-service**: Uses file index stores

Instead of each package exposing APIs for their data, this package provides common access to all stores through a unified ContextStore interface.

## Features

- **Unified Context Management**: Single ContextStore instance managing all collections
- **Cross-Store Search**: Search across all stores simultaneously or individual stores
- **Type-Safe Access**: Strongly typed store interfaces
- **Centralized Configuration**: Single place to define store schemas and names

## Store Types

### OpenCode Stores

- `sessionStore`: Session metadata and information
- `eventStore`: System events and logs
- `messageStore`: Chat messages and conversations

### File System Stores

- `fileIndexStore`: File content and metadata for indexed files

## Usage

```typescript
import { getDataStoreManager, StoreNames } from '@promethean-os/data-stores';

// Get the data store manager
const manager = getDataStoreManager();

// Access individual stores
const sessionStore = await manager.getStore(StoreNames.SESSION);
const fileIndexStore = await manager.getStore(StoreNames.FILE_INDEX);

// Search across all stores
const allResults = await manager.searchAcrossAllStores(['query'], 10);

// Search specific stores
const sessionResults = await manager.searchInStores(
  [StoreNames.SESSION, StoreNames.MESSAGE],
  ['query'],
  10,
);
```

## Architecture

The package uses the ContextStore pattern from `@promethean-os/persistence` to:

1. **Manage Collections**: Create and maintain dual store collections
2. **Provide Unified Access**: Single entry point for all data operations
3. **Enable Cross-Store Search**: Search across multiple collections simultaneously
4. **Maintain Type Safety**: Strong typing for all store operations

# Indexing Consolidation Analysis

## Current Redundant Implementations

### 1. **Discord Message Indexer** (`packages/discord/src/message-indexer/index.ts`)

-   **Purpose**: Index Discord messages to MongoDB
-   **Approach**: Direct MongoDB operations with event-driven architecture
-   **Issues**:
    -   No vector search capabilities
    -   Tied to Discord-specific schema
    -   No unified content model
    -   Duplicate metadata handling

### 2. **File System Indexer** (`packages/file-system/file-indexer-service/src/file-indexer.ts`)

-   **Purpose**: Index file system content
-   **Approach**: Uses DualStoreManager but with custom FileIndexEntry interface
-   **Issues**:
    -   Custom interface instead of unified content model
    -   Duplicate search functionality
    -   Separate metadata schema
    -   Redundant file operations

### 3. **OpenCode Indexer** (`packages/opencode-client/src/services/indexer.ts`)

-   **Purpose**: Index OpenCode sessions, events, messages
-   **Approach**: Complex composable architecture with custom types
-   **Issues**:
    -   Over-engineered composables
    -   Custom state management
    -   Separate from unified content model
    -   Complex event handling

### 4. **Kanban Task Indexer** (`packages/kanban/src/board/indexer.ts`)

-   **Purpose**: Index kanban tasks
-   **Approach**: File-based indexing with custom task cache
-   **Issues**:
    -   File-based storage instead of database
    -   Custom task format
    -   Separate from unified content model
    -   Redundant search/filter logic

## Consolidation Strategy

### Phase 1: Create Migration Adapters

1. **Discord Migration Adapter**

    - Transform Discord messages to unified content model
    - Migrate existing MongoDB data to DualStore
    - Replace event handler with unified indexing

2. **File System Migration Adapter**

    - Replace FileIndexEntry with IndexableContent
    - Migrate existing DualStore collections
    - Update search to use unified API

3. **OpenCode Migration Adapter**

    - Simplify to use unified indexing client
    - Remove complex composables
    - Migrate existing data

4. **Kanban Migration Adapter**
    - Move from file-based to database storage
    - Transform tasks to unified content model
    - Replace custom cache with unified storage

### Phase 2: Remove Redundant Code

1. Delete custom indexer interfaces
2. Remove duplicate search implementations
3. Consolidate metadata schemas
4. Remove redundant event handlers

### Phase 3: Update Dependencies

1. Update all packages to use unified indexing API
2. Remove custom indexer dependencies
3. Standardize configuration
4. Update tests and documentation

## Benefits of Consolidation

1. **Single Source of Truth**: All indexing through unified API
2. **Reduced Maintenance**: One codebase instead of four
3. **Consistent Search**: Unified search across all content types
4. **Better Performance**: Optimized single implementation
5. **Easier Testing**: One test suite instead of four
6. **Type Safety**: Unified TypeScript interfaces
7. **Scalability**: Single scalable architecture

## Implementation Priority

1. **High**: File System Indexer (already uses DualStore)
2. **Medium**: Discord Message Indexer (critical data source)
3. **Medium**: OpenCode Indexer (complex but important)
4. **Low**: Kanban Task Indexer (self-contained)

## Migration Risks

1. **Data Loss**: Improper migration could lose existing data
2. **Downtime**: Service interruption during migration
3. **Compatibility**: Breaking changes to dependent packages
4. **Performance**: Temporary performance degradation
5. **Complexity**: Migration logic complexity

## Risk Mitigation

1. **Backup**: Full database backup before migration
2. **Staged Migration**: Migrate one indexer at a time
3. **Rollback Plan**: Ability to revert if needed
4. **Testing**: Comprehensive migration testing
5. **Monitoring**: Close monitoring during migration

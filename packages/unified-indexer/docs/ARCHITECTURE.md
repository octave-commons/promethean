# Architecture Overview - @promethean-os/unified-indexer

This document provides a comprehensive overview of the unified-indexer package architecture, including component interactions, data flow, and design principles.

## Table of Contents

- [High-Level Architecture](#high-level-architecture)
- [Component Overview](#component-overview)
- [Data Flow](#data-flow)
- [Service Lifecycle](#service-lifecycle)
- [Integration Patterns](#integration-patterns)
- [Design Principles](#design-principles)
- [Component Interactions](#component-interactions)
- [Storage Architecture](#storage-architecture)
- [Search Architecture](#search-architecture)

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Unified Indexer Service                      │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │   File Indexer  │  │ Discord Indexer │  │ OpenCode Indexer│  │
│  │                 │  │                 │  │                 │  │
│  │ • Directory     │  │ • Messages      │  │ • Sessions      │  │
│  │   Scanning      │  │ • Channels      │  │ • Events        │  │
│  │ • Content       │  │ • Attachments   │  │ • Messages      │  │
│  │   Extraction    │  │ • Threads       │  │ • Code          │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
│           │                   │                   │              │
│           └───────────────────┼───────────────────┘              │
│                               │                                  │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │              Unified Indexing Client                        │  │
│  │                                                             │  │
│  │ • Content Transformation                                    │  │
│  │ • Batch Processing                                          │  │
│  │ • Error Handling                                           │  │
│  │ • Validation                                                │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                               │                                  │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │                 DualStoreManager                           │  │
│  │                                                             │  │
│  │  ┌─────────────────┐    ┌─────────────────┐                 │  │
│  │  │  Vector Store   │    │ Metadata Store  │                 │  │
│  │  │                 │    │                 │                 │  │
│  │  │ • ChromaDB      │    │ • MongoDB       │                 │  │
│  │  │ • Embeddings    │    │ • Documents     │                 │  │
│  │  │ • Semantic      │    │ • Metadata      │                 │  │
│  │  │   Search        │    │ • Indexes       │                 │  │
│  │  └─────────────────┘    └─────────────────┘                 │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                               │                                  │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │                 ContextStore                                │  │
│  │                                                             │  │
│  │ • Context Compilation                                       │  │
│  │ • LLM Message Formatting                                    │  │
│  │ • Collection Management                                     │  │
│  │ • Query Processing                                          │  │
│  └─────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                               │
┌─────────────────────────────────────────────────────────────────┐
│                 Cross-Domain Search Engine                      │
│                                                                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │  Query          │  │  Result         │  │  Context        │  │
│  │  Processing     │  │  Enhancement    │  │  Compilation    │  │
│  │                 │  │                 │  │                 │  │
│  │ • Expansion     │  │ • Scoring       │  │ • Formatting    │  │
│  │ • Weighting     │  │ • Temporal      │  │ • LLM Ready     │  │
│  │ • Filtering     │  │   Boost         │  │ • Optimization  │  │
│  │ • Semantic      │  │ • Deduplication │  │ • Caching       │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Component Overview

### Core Components

#### 1. UnifiedIndexerService (`unified-indexer-service.ts`)

**Purpose**: Main orchestrator that manages all data sources and provides unified search capabilities.

**Responsibilities**:

- Service lifecycle management (start/stop/status)
- Coordinating multiple indexers
- Periodic synchronization
- Health monitoring and statistics
- Unified client management

**Key Functions**:

```typescript
createUnifiedIndexerService(config); // Service creation
startUnifiedIndexerService(state); // Start service
stopUnifiedIndexerService(state); // Stop service
getServiceStatus(state); // Get status
```

#### 2. CrossDomainSearchEngine (`cross-domain-search-functional.ts`)

**Purpose**: Advanced search capabilities across all indexed content.

**Responsibilities**:

- Multi-source search coordination
- Query expansion and enhancement
- Result processing and ranking
- Context compilation for LLM
- Analytics generation

**Key Functions**:

```typescript
createCrossDomainSearchEngine(service, options); // Create engine
search(engine, query); // Perform search
intelligentSearch(engine, query, options); // Smart search
getContextualSearch(engine, queries, options); // LLM context
```

#### 3. UnifiedIndexingClient (Internal)

**Purpose**: Adapter that bridges domain-specific indexers with the unified storage layer.

**Responsibilities**:

- Content transformation and validation
- Batch processing optimization
- Error handling and recovery
- Storage abstraction

**Interface**:

```typescript
interface UnifiedIndexingClient {
  index(content); // Index single item
  indexBatch(contents); // Index multiple items
  search(query); // Search content
  getById(id); // Get by ID
  getStats(); // Get statistics
  healthCheck(); // Health status
}
```

### Processing Components

#### 4. Result Processing (`cross-domain-processing.ts`)

**Purpose**: Enhances and processes search results with additional metadata.

**Responsibilities**:

- Result enhancement with temporal data
- Deduplication and grouping
- Source and type weighting
- Query expansion

**Key Functions**:

```typescript
enhanceResults(results, options); // Add metadata
processResults(results, options); // Filter/group
deduplicateResults(results); // Remove duplicates
groupResultsBySource(results, limit); // Group by source
expandQuery(query); // Expand terms
```

#### 5. Scoring Engine (`cross-domain-scoring.ts`)

**Purpose**: Calculates and manages search result scoring.

**Responsibilities**:

- Multi-factor scoring algorithms
- Temporal boosting calculations
- Source and type weight application
- Analytics generation

**Key Functions**:

```typescript
calculateRecencyScore(age, decay); // Time-based score
calculateScoreBreakdown(result, age, opts); // Detailed scoring
applyWeights(results, options); // Apply weights
applyTemporalBoost(results); // Boost recent content
generateAnalytics(results, options); // Search analytics
```

#### 6. Context Compilation (`cross-domain-context.ts`)

**Purpose**: Compiles search results into LLM-ready context.

**Responsibilities**:

- Context message formatting
- LLM-specific optimizations
- Collection management
- Query-based context selection

**Key Functions**:

```typescript
compileSearchContext(service, results, options); // Compile context
```

### Data Source Components

#### 7. File Indexer (`types/service.ts`)

**Purpose**: Indexes file system content with batch processing.

**Responsibilities**:

- Directory scanning and filtering
- File content extraction
- Batch processing optimization
- Error handling for file operations

**Key Functions**:

```typescript
createUnifiedFileIndexer(client); // Create indexer
indexDirectory(path, options); // Index directory
```

#### 8. Domain Indexers (Planned)

**Discord Indexer**: Messages, channels, attachments
**OpenCode Indexer**: Sessions, events, code
**Kanban Indexer**: Tasks, boards, projects

---

## Data Flow

### Indexing Flow

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Data Source   │───▶│   Domain        │───▶│   Unified       │
│                 │    │   Indexer       │    │   Client        │
│ • Files         │    │                 │    │                 │
│ • Discord       │    │ • Transform     │    │ • Validate      │
│ • OpenCode      │    │ • Filter        │    │ • Batch         │
│ • Kanban        │    │ • Extract       │    │ • Store         │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                       │
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   ContextStore  │◀───│ DualStoreManager│◀───│   Storage       │
│                 │    │                 │    │                 │
│ • Collections   │    │ • Vector Store  │    │ • ChromaDB      │
│ • Search        │    │ • Metadata      │    │ • MongoDB       │
│ • Context       │    │ • Indexing      │    │ • Persistence   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

**Step-by-Step Process**:

1. **Source Discovery**: Domain indexers discover content from their respective sources
2. **Content Transformation**: Raw content is transformed to `IndexableContent` format
3. **Validation**: Content is validated for size, format, and required metadata
4. **Batch Processing**: Content is processed in configurable batches for efficiency
5. **Storage**: Content is stored in both vector and metadata stores
6. **Context Population**: Content becomes available through ContextStore collections

### Search Flow

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Search Query  │───▶│  Query          │───▶│  Multi-Source   │
│                 │    │  Processing     │    │  Search         │
│ • Keywords      │    │                 │    │                 │
│ • Filters       │    │ • Expansion     │    │ • Vector Search │
│ • Options       │    │ • Weighting     │    │ • Metadata      │
│ • Context       │    │ • Semantic      │    │ • Hybrid        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                       │
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Final         │◀───│  Result         │◀───│  Raw Results    │
│   Response      │    │  Enhancement    │    │                 │
│                 │    │                 │    │ • Scores        │
│ • Enhanced      │    │ • Scoring       │    │ • Metadata      │
│ • Context       │    │ • Temporal      │    │ • Content       │
│ • Analytics     │    │ • Deduplication │    │ • Sources       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

**Step-by-Step Process**:

1. **Query Processing**: Search query is expanded and enhanced with semantic understanding
2. **Multi-Source Search**: Query is executed across all indexed content sources
3. **Raw Results**: Initial results are collected from vector and metadata stores
4. **Result Enhancement**: Results are enhanced with temporal data, scores, and metadata
5. **Advanced Processing**: Results are filtered, weighted, deduplicated, and grouped
6. **Context Compilation**: LLM-ready context is compiled if requested
7. **Final Response**: Enhanced results with analytics and context are returned

---

## Service Lifecycle

### Initialization Phase

```
┌─────────────────────────────────────────────────────────────────┐
│                    Service Initialization                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                │
│  1. Configuration Validation                                   │
│     ├─ Validate indexing configuration                         │
│     ├─ Check data source settings                              │
│     └─ Verify storage connections                              │
│                                                                │
│  2. Component Creation                                         │
│     ├─ Create UnifiedIndexingClient                           │
│     ├─ Initialize ContextStore                                 │
│     ├─ Create domain indexers                                  │
│     └─ Setup search engine                                     │
│                                                                │
│  3. Storage Initialization                                     │
│     ├─ Connect to vector store (ChromaDB)                      │
│     ├─ Connect to metadata store (MongoDB)                    │
│     ├─ Initialize collections                                  │
│     └─ Validate storage health                                 │
│                                                                │
│  4. Service State Setup                                        │
│     ├─ Initialize statistics tracking                          │
│     ├─ Setup error handling                                   │
│     ├─ Configure sync intervals                               │
│     └─ Prepare health monitoring                               │
│                                                                │
└─────────────────────────────────────────────────────────────────┘
```

### Runtime Phase

```
┌─────────────────────────────────────────────────────────────────┐
│                     Service Runtime                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐  │
│  │   Periodic     │    │   Search        │    │   Health        │  │
│  │   Sync         │    │   Requests      │    │   Monitoring    │  │
│  │                 │    │                 │    │                 │  │
│  │ • Index new     │    │ • Query         │    │ • Storage       │  │
│  │   content       │    │   processing    │    │   health        │  │
│  │ • Update        │    │ • Result        │    │ • Error         │  │
│  │   existing      │    │   enhancement   │    │   tracking      │  │
│  │ • Clean up      │    │ • Context       │    │ • Performance   │  │
│  │   stale data    │    │   compilation   │    │   metrics       │  │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘  │
│                                                                │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │                 Statistics Tracking                        │  │
│  │                                                             │  │
│  │ • Indexing progress (files, messages, etc.)                │  │
│  │ • Search performance (latency, results)                    │  │
│  │ • Storage usage (vectors, metadata)                        │  │
│  │ • Error rates and types                                    │  │
│  │ • Resource consumption                                      │  │
│  └─────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### Shutdown Phase

```
┌─────────────────────────────────────────────────────────────────┐
│                    Service Shutdown                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                │
│  1. Graceful Stop                                              │
│     ├─ Stop periodic sync intervals                            │
│     ├─ Complete in-progress operations                         │
│     ├─ Reject new search requests                              │
│     └─ Wait for active operations to finish                    │
│                                                                │
│  2. Resource Cleanup                                           │
│     ├─ Close database connections                               │
│     ├─ Clear in-memory caches                                  │
│     ├─ Stop background processes                              │
│     └─ Release file handles                                    │
│                                                                │
│  3. State Persistence                                          │
│     ├─ Save final statistics                                   │
│     ├─ Record shutdown reason                                 │
│     ├─ Persist indexing progress                               │
│     └─ Clean up temporary files                                │
│                                                                │
└─────────────────────────────────────────────────────────────────┘
```

---

## Integration Patterns

### With @promethean-os/persistence

The unified-indexer integrates seamlessly with the persistence package:

```typescript
// Uses DualStoreManager for unified storage
import { DualStoreManager, createContextStore } from '@promethean-os/persistence';

// ContextStore integration
const contextStore = createContextStore(formatTime, assistantName);

// Compatible with existing compileContext usage
const context = await compileContext(contextStore, options);
```

**Integration Points**:

- **DualStoreManager**: Core storage abstraction
- **ContextStore**: LLM context compilation
- **Type System**: Shared content types and interfaces
- **Error Handling**: Consistent error patterns

### With Domain Services

Each domain service provides its own indexer:

```typescript
// File system integration
const fileIndexer = createUnifiedFileIndexer(client);
await fileIndexer.indexDirectory('./src', options);

// Discord integration (future)
const discordIndexer = createUnifiedDiscordIndexer(client);
await discordIndexer.indexGuild(guildId);

// OpenCode integration (future)
const opencodeIndexer = createUnifiedOpenCodeIndexer(client);
await opencodeIndexer.indexSession(sessionId);
```

### With LLM Clients

Context compilation provides LLM-ready messages:

```typescript
const { context } = await getContextualSearch(searchEngine, queries);

// Direct use with LLM clients
const llmResponse = await llmClient.chat({
  messages: [
    { role: 'system', content: 'You are a helpful assistant.' },
    ...context,
    { role: 'user', content: userQuery },
  ],
});
```

---

## Design Principles

### 1. Functional Programming

- **Pure Functions**: All processing functions are pure and side-effect free
- **Immutability**: Data structures are immutable wherever possible
- **Composition**: Complex operations are built from simple, composable functions
- **First-Class Functions**: Functions are treated as first-class citizens

### 2. Separation of Concerns

- **Indexing vs Search**: Clear separation between content indexing and search functionality
- **Storage vs Processing**: Storage operations are separate from data processing
- **Domain vs Unified**: Domain-specific logic is isolated from unified operations
- **Synchronous vs Asynchronous**: Clear boundaries between sync and async operations

### 3. Configuration-Driven

- **External Configuration**: All behavior is driven by configuration objects
- **Environment-Specific**: Support for different deployment environments
- **Feature Flags**: Enable/disable features without code changes
- **Validation**: Comprehensive configuration validation

### 4. Error Resilience

- **Graceful Degradation**: Service continues operating with partial failures
- **Error Boundaries**: Errors are contained and don't cascade
- **Recovery Mechanisms**: Automatic recovery from transient failures
- **Comprehensive Logging**: Detailed error information for debugging

### 5. Performance Optimization

- **Batch Processing**: Operations are batched for efficiency
- **Lazy Loading**: Resources are loaded only when needed
- **Caching**: Frequently accessed data is cached
- **Resource Management**: Efficient use of memory and connections

---

## Component Interactions

### Service Coordination

```
┌─────────────────────────────────────────────────────────────────┐
│                    Service Coordination                        │
│                                                                 │
│  UnifiedIndexerService                                          │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │  createUnifiedIndexerService(config)                        │  │
│  │  ├─ validateConfiguration(config)                            │  │
│  │  ├─ createUnifiedIndexingClient(config.indexing)           │  │
│  │  ├─ createContextStore(config.contextStore)                │  │
│  │  ├─ initializeIndexers(config.sources)                      │  │
│  │  └─ setupServiceState(config)                              │  │
│  │                                                             │  │
│  │  startUnifiedIndexerService(state)                         │  │
│  │  ├─ validateServiceState(state)                             │  │
│  │  ├─ startPeriodicSync(state)                                │  │
│  │  ├─ initializeStatistics(state)                             │  │
│  │  └─ return updatedState                                     │  │
│  └─────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### Search Coordination

```
┌─────────────────────────────────────────────────────────────────┐
│                    Search Coordination                         │
│                                                                 │
│  CrossDomainSearchEngine                                        │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │  search(engine, query)                                      │  │
│  │  ├─ mergeOptions(engine.defaultOptions, query)              │  │
│  │  ├─ performBaseSearch(engine.indexerService, options)       │  │
│  │  ├─ enhanceResults(baseResults, options)                    │  │
│  │  ├─ processResults(enhancedResults, options)                │  │
│  │  ├─ compileContext(engine.indexerService, results, options) │  │
│  │  ├─ generateAnalytics(results, options)                      │  │
│  │  └─ buildResponse(results, analytics, context, options)     │  │
│  │                                                             │  │
│  │  intelligentSearch(engine, query, options)                 │  │
│  │  ├─ expandQuery(query)                                      │  │
│  │  ├─ enhanceWithSemantic(query)                               │  │
│  │  └─ search(engine, enhancedQuery, options)                  │  │
│  └─────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### Data Flow Coordination

```
┌─────────────────────────────────────────────────────────────────┐
│                    Data Flow Coordination                      │
│                                                                 │
│  Indexing Pipeline                                              │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │  Domain Indexer → Unified Client → DualStoreManager         │  │
│  │                                                             │  │
│  │  1. discoverContent()                                       │  │
│  │  2. transformToIndexable(content)                           │  │
│  │  3. validateContent(indexable)                               │  │
│  │  4. batchProcess(contents)                                  │  │
│  │  5. storeInDualStore(indexable)                             │  │
│  │  6. updateStatistics(stats)                                  │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                                                                 │
│  Search Pipeline                                                │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │  Search Engine → Processing → Context → Response            │  │
│  │                                                             │  │
│  │  1. processQuery(query)                                     │  │
│  │  2. searchDualStore(processedQuery)                          │  │
│  │  3. enhanceResults(rawResults)                              │  │
│  │  4. processResults(enhancedResults)                        │  │
│  │  5. compileContext(results)                                  │  │
│  │  6. generateAnalytics(results)                               │  │
│  │  7. buildResponse(results, context, analytics)              │  │
│  └─────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Storage Architecture

### Dual Store Pattern

The unified-indexer uses a dual store pattern for optimal performance:

```
┌─────────────────────────────────────────────────────────────────┐
│                    Dual Store Architecture                      │
│                                                                 │
│  ┌─────────────────┐              ┌─────────────────┐           │
│  │  Vector Store   │              │ Metadata Store  │           │
│  │                 │              │                 │           │
│  │ • ChromaDB      │◀─────────────▶│ • MongoDB       │           │
│  │ • Embeddings    │  Document ID  │ • Documents     │           │
│  │ • Semantic      │              │ • Metadata      │           │
│  │   Search        │              │ • Indexes       │           │
│  │ • Similarity    │              │ • Queries       │           │
│  │ • ANN Index     │              │ • Aggregations  │           │
│  └─────────────────┘              └─────────────────┘           │
│           │                                │                    │
│           └────────────┬───────────────────┘                    │
│                        │                                      │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │              DualStoreManager                              │  │
│  │                                                             │  │
│  │ • Synchronization                                           │  │
│  │ • Consistency Management                                    │  │
│  │ • Transaction Coordination                                  │  │
│  │ • Error Handling                                           │  │
│  │ • Performance Optimization                                   │  │
│  └─────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### Collection Strategy

```
┌─────────────────────────────────────────────────────────────────┐
│                    Collection Strategy                          │
│                                                                 │
│  ContextStore Collections                                        │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │     Files       │  │    Discord      │  │   OpenCode      │  │
│  │                 │  │                 │  │                 │  │
│  │ • Source code   │  │ • Messages      │  │ • Sessions      │  │
│  │ • Documentation │  │ • Channels      │  │ • Events        │  │
│  │ • Config files  │  │ • Threads       │  │ • Code snippets │  │
│  │ • Assets        │  │ • Attachments   │  │ • Discussions   │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
│                                                                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │     Kanban      │  │    Unified      │  │    System       │  │
│  │                 │  │                 │  │                 │  │
│  │ • Tasks         │  │ • Cross-domain  │  │ • Logs          │  │
│  │ • Projects      │  │ • Aggregated    │  │ • Metrics       │  │
│  │ • Boards        │  │ • Enhanced      │  │ • Health        │  │
│  │ • Comments      │  │ • Analytics     │  │ • Status        │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Search Architecture

### Multi-Layer Search

```
┌─────────────────────────────────────────────────────────────────┐
│                    Multi-Layer Search                         │
│                                                                 │
│  Query Layer                                                    │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │  Query Processing                                            │  │
│  │  ├─ Tokenization                                            │  │
│  │  ├─ Normalization                                           │  │
│  │  ├─ Expansion                                               │  │
│  │  ├─ Semantic Enhancement                                    │  │
│  │  └─ Weight Application                                      │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                                │                                │
│  Search Layer                                                   │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │  Multi-Strategy Search                                      │  │
│  │  ├─ Vector Search (Semantic)                                │  │
│  │  ├─ Keyword Search (Exact)                                  │  │
│  │  ├─ Hybrid Search (Combined)                               │  │
│  │  ├─ Fuzzy Search (Tolerant)                                │  │
│  │  └─ Faceted Search (Filtered)                              │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                                │                                │
│  Processing Layer                                               │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │  Result Processing                                           │  │
│  │  ├─ Score Calculation                                       │  │
│  │  ├─ Temporal Boosting                                       │  │
│  │  ├─ Source Weighting                                        │  │
│  │  ├─ Deduplication                                           │  │
│  │  ├─ Grouping                                                │  │
│  │  └─ Ranking                                                 │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                                │                                │
│  Enhancement Layer                                              │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │  Result Enhancement                                          │  │
│  │  ├─ Metadata Enrichment                                     │  │
│  │  ├─ Context Compilation                                      │  │
│  │  ├─ Analytics Generation                                    │  │
│  │  ├─ Explanation Generation                                  │  │
│  │  └─ Format Optimization                                      │  │
│  └─────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### Scoring Algorithm

```
┌─────────────────────────────────────────────────────────────────┐
│                    Scoring Algorithm                           │
│                                                                 │
│  Final Score = Base Score × Weights × Boosts                   │
│                                                                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │   Base Score   │  │   Weights      │  │    Boosts       │  │
│  │                 │  │                 │  │                 │  │
│  │ • Semantic      │  │ • Source        │  │ • Temporal      │  │
│  │ • Keyword       │  │ • Type          │  │ • Recency       │  │
│  │ • Hybrid        │  │ • Custom        │  │ • Frequency     │  │
│  │ • Fuzzy         │  │ • User          │  │ • Popularity    │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
│           │                   │                   │              │
│           └───────────────────┼───────────────────┘              │
│                               │                                  │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │              Score Breakdown                                │  │
│  │                                                             │  │
│  │  semantic: 0.6 × baseScore                                │  │
│  │  keyword: 0.3 × baseScore                                 │  │
│  │  temporal: 0.1 × recencyScore                             │  │
│  │  source: sourceWeight × currentScore                       │  │
│  │  type: typeWeight × currentScore                           │  │
│  │  final: weightedScore × (1 + temporalBoost)               │  │
│  └─────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

This architecture overview provides a comprehensive understanding of the unified-indexer package's design, components, and interactions. For specific implementation details and usage examples, refer to the other documentation files in this package.

# @promethean-os/persistence - Development Guidelines

## Overview

This document provides comprehensive development guidelines for the @promethean-os/persistence package, including coding standards, contribution processes, testing strategies, and development setup procedures.

## Table of Contents

-   [Development Setup](#development-setup)
-   [Coding Standards](#coding-standards)
-   [Architecture Guidelines](#architecture-guidelines)
-   [Testing Strategy](#testing-strategy)
-   [Code Review Process](#code-review-process)
-   [Documentation Standards](#documentation-standards)
-   [Debugging Guidelines](#debugging-guidelines)
-   [Performance Guidelines](#performance-guidelines)
-   [Security Guidelines](#security-guidelines)
-   [Release Process](#release-process)

---

## Development Setup

### Prerequisites

```bash
# Required tools
node --version  # >= 18.x
pnpm --version  # >= 8.x
git --version   # >= 2.x

# Optional but recommended
docker --version
docker-compose --version
```

### Environment Setup

```bash
# Clone the repository
git clone https://github.com/promethean-os/promethean.git
cd promethean

# Install dependencies
pnpm install

# Build the package
pnpm --filter @promethean-os/persistence build

# Run tests
pnpm --filter @promethean-os/persistence test
```

### Development Environment Configuration

```bash
# Create development environment file
cp packages/persistence/.env.example packages/persistence/.env.development

# Configure development databases
# MongoDB
export MONGODB_URL="mongodb://localhost:27017/promethean_dev"

# ChromaDB
export CHROMA_DB_URL="http://localhost:8000"

# Optional: Redis for caching
export REDIS_URL="redis://localhost:6379"

# Development settings
export NODE_ENV="development"
export LOG_LEVEL="debug"
```

### IDE Configuration

#### VS Code Settings

```json
// .vscode/settings.json
{
    "typescript.preferences.importModuleSpecifier": "relative",
    "editor.formatOnSave": true,
    "editor.codeActionsOnSave": {
        "source.fixAll.eslint": true,
        "source.organizeImports": true
    },
    "files.exclude": {
        "**/dist": true,
        "**/node_modules": true,
        "**/.git": true
    },
    "search.exclude": {
        "**/dist": true,
        "**/node_modules": true,
        "**/.git": true
    }
}
```

#### VS Code Extensions

```json
// .vscode/extensions.json
{
    "recommendations": [
        "dbaeumer.vscode-eslint",
        "esbenp.prettier-vscode",
        "ms-vscode.vscode-typescript-next",
        "bradlc.vscode-tailwindcss",
        "ms-vscode.vscode-json",
        "redhat.vscode-yaml"
    ]
}
```

---

## Coding Standards

### TypeScript Standards

#### Code Style

```typescript
// Use explicit types for function parameters and return values
interface SearchOptions {
    query: string;
    limit?: number;
    filters?: Record<string, any>;
}

async function searchContent(options: SearchOptions): Promise<SearchResult[]> {
    // Implementation
}

// Use interfaces for complex objects
interface IndexableContent {
    id: string;
    type: ContentType;
    source: ContentSource;
    content: string;
    metadata: ContentMetadata;
    timestamp: number;
}

// Use enums for fixed sets of values
enum ContentType {
    FILE = 'file',
    MESSAGE = 'message',
    EVENT = 'event',
    SESSION = 'session',
    ATTACHMENT = 'attachment',
    THOUGHT = 'thought',
    DOCUMENT = 'document',
    TASK = 'task',
    BOARD = 'board',
}

enum ContentSource {
    FILESYSTEM = 'filesystem',
    DISCORD = 'discord',
    OPENCODE = 'opencode',
    AGENT = 'agent',
    USER = 'user',
    SYSTEM = 'system',
    EXTERNAL = 'external',
    KANBAN = 'kanban',
}
```

#### Naming Conventions

```typescript
// Classes: PascalCase
class UnifiedIndexerService {
    // Private properties: camelCase with underscore prefix
    private _config: UnifiedIndexerServiceConfig;
    private _client: UnifiedIndexingClient;
    
    // Public methods: camelCase
    async initialize(): Promise<void> {
        // Implementation
    }
    
    // Private methods: camelCase with underscore prefix
    private async _validateConfig(): Promise<void> {
        // Implementation
    }
}

// Interfaces: PascalCase with descriptive names
interface IndexingPerformanceConfig {
    batchSize: number;
    maxConcurrency: number;
    batchTimeout: number;
}

// Constants: UPPER_SNAKE_CASE
const DEFAULT_BATCH_SIZE = 100;
const MAX_RETRY_ATTEMPTS = 3;
const DEFAULT_TIMEOUT_MS = 30000;

// Functions: camelCase with descriptive names
function createOptimizedSearchEngine(config: SearchEngineConfig): SearchEngine {
    // Implementation
}

// Variables: camelCase with descriptive names
const searchResults = await performSearch(query);
const indexingStats = await getIndexingStatistics();
```

#### Error Handling

```typescript
// Use custom error classes
class IndexingError extends Error {
    constructor(
        message: string,
        public readonly source: string,
        public readonly cause?: Error,
    ) {
        super(message);
        this.name = 'IndexingError';
    }
}

class SearchError extends Error {
    constructor(
        message: string,
        public readonly query: string,
        public readonly cause?: Error,
    ) {
        super(message);
        this.name = 'SearchError';
    }
}

// Use Result pattern for operations that can fail
type Result<T, E = Error> = {
    success: true;
    data: T;
} | {
    success: false;
    error: E;
};

async function safeIndexContent(content: IndexableContent): Promise<Result<string, IndexingError>> {
    try {
        const id = await indexContent(content);
        return { success: true, data: id };
    } catch (error) {
        return { 
            success: false, 
            error: new IndexingError('Failed to index content', content.source, error as Error)
        };
    }
}

// Handle errors appropriately
const result = await safeIndexContent(content);
if (!result.success) {
    logger.error('Indexing failed', { error: result.error, contentId: content.id });
    // Handle error appropriately
    return;
}
```

#### Async/Await Patterns

```typescript
// Use async/await consistently
async function processBatch(contents: IndexableContent[]): Promise<void> {
    // Process items in parallel with concurrency limit
    const chunks = chunkArray(contents, MAX_CONCURRENCY);
    
    for (const chunk of chunks) {
        const promises = chunk.map(content => processContent(content));
        await Promise.allSettled(promises);
    }
}

// Use proper error handling with async/await
async function searchWithRetry(query: SearchQuery, maxRetries: number = 3): Promise<SearchResponse> {
    let lastError: Error;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await performSearch(query);
        } catch (error) {
            lastError = error as Error;
            
            if (attempt === maxRetries) {
                throw new SearchError(`Search failed after ${maxRetries} attempts`, query.query, lastError);
            }
            
            // Exponential backoff
            const delay = Math.pow(2, attempt) * 1000;
            await sleep(delay);
        }
    }
    
    throw lastError!;
}
```

### Code Organization

#### File Structure

```
src/
├── core/                    # Core functionality
│   ├── indexing/           # Indexing logic
│   ├── search/             # Search functionality
│   └── storage/            # Storage abstractions
├── adapters/               # Data source adapters
│   ├── filesystem/         # File system adapter
│   ├── discord/            # Discord adapter
│   ├── opencode/           # OpenCode adapter
│   └── kanban/             # Kanban adapter
├── utils/                  # Utility functions
├── types/                  # Type definitions
├── config/                 # Configuration
└── tests/                  # Test files
```

#### Module Organization

```typescript
// Export types separately
export type {
    IndexableContent,
    ContentType,
    ContentSource,
    SearchQuery,
    SearchResult,
} from './types/index.js';

// Export classes and functions
export {
    UnifiedIndexerService,
    createUnifiedIndexerService,
    CrossDomainSearchEngine,
    createCrossDomainSearchEngine,
} from './index.js';

// Group related exports
export * from './adapters/index.js';
export * from './utils/index.js';
```

---

## Architecture Guidelines

### SOLID Principles

#### Single Responsibility Principle

```typescript
// Good: Each class has a single responsibility
class ContentIndexer {
    async index(content: IndexableContent): Promise<void> {
        // Only handles indexing logic
    }
}

class ContentValidator {
    validate(content: IndexableContent): ValidationResult {
        // Only handles validation logic
    }
}

class ContentTransformer {
    transform(content: any): IndexableContent {
        // Only handles transformation logic
    }
}

// Bad: Class with multiple responsibilities
class ContentProcessor {
    async process(content: any): Promise<void> {
        this.validate(content);      // Validation
        const transformed = this.transform(content); // Transformation
        await this.index(transformed); // Indexing
        await this.notify(transformed); // Notification
    }
}
```

#### Open/Closed Principle

```typescript
// Good: Open for extension, closed for modification
abstract class IndexingAdapter {
    abstract async index(data: any): Promise<void>;
    abstract async search(query: SearchQuery): Promise<SearchResult[]>;
}

class FileSystemAdapter extends IndexingAdapter {
    async index(data: FileSystemData): Promise<void> {
        // File system specific indexing
    }
    
    async search(query: SearchQuery): Promise<SearchResult[]> {
        // File system specific search
    }
}

class DiscordAdapter extends IndexingAdapter {
    async index(data: DiscordData): Promise<void> {
        // Discord specific indexing
    }
    
    async search(query: SearchQuery): Promise<SearchResult[]> {
        // Discord specific search
    }
}

// Indexing service works with any adapter
class IndexingService {
    constructor(private adapters: IndexingAdapter[]) {}
    
    async indexAll(data: any[]): Promise<void> {
        for (const item of data) {
            const adapter = this.findAdapter(item);
            await adapter.index(item);
        }
    }
}
```

#### Dependency Inversion Principle

```typescript
// Good: Depend on abstractions, not concretions
interface StorageProvider {
    store(key: string, value: any): Promise<void>;
    retrieve(key: string): Promise<any>;
    delete(key: string): Promise<void>;
}

class MongoDBStorageProvider implements StorageProvider {
    // MongoDB implementation
}

class RedisStorageProvider implements StorageProvider {
    // Redis implementation
}

class IndexingService {
    constructor(private storage: StorageProvider) {
        // Depends on abstraction, not concrete implementation
    }
    
    async index(content: IndexableContent): Promise<void> {
        await this.storage.store(content.id, content);
    }
}

// Dependency injection
const mongoProvider = new MongoDBStorageProvider();
const redisProvider = new RedisStorageProvider();

const serviceWithMongo = new IndexingService(mongoProvider);
const serviceWithRedis = new IndexingService(redisProvider);
```

### Design Patterns

#### Factory Pattern

```typescript
// Factory for creating search engines
interface SearchEngineFactory {
    create(config: SearchEngineConfig): SearchEngine;
}

class SemanticSearchEngineFactory implements SearchEngineFactory {
    create(config: SearchEngineConfig): SemanticSearchEngine {
        return new SemanticSearchEngine(config);
    }
}

class HybridSearchEngineFactory implements SearchEngineFactory {
    create(config: SearchEngineConfig): HybridSearchEngine {
        return new HybridSearchEngine(config);
    }
}

// Factory registry
class SearchEngineFactoryRegistry {
    private factories = new Map<string, SearchEngineFactory>();
    
    register(type: string, factory: SearchEngineFactory): void {
        this.factories.set(type, factory);
    }
    
    create(type: string, config: SearchEngineConfig): SearchEngine {
        const factory = this.factories.get(type);
        if (!factory) {
            throw new Error(`Unknown search engine type: ${type}`);
        }
        return factory.create(config);
    }
}

// Usage
const registry = new SearchEngineFactoryRegistry();
registry.register('semantic', new SemanticSearchEngineFactory());
registry.register('hybrid', new HybridSearchEngineFactory());

const engine = registry.create('semantic', config);
```

#### Observer Pattern

```typescript
// Event system for indexing operations
interface IndexingEvent {
    type: string;
    data: any;
    timestamp: number;
}

interface IndexingEventListener {
    onEvent(event: IndexingEvent): void;
}

class IndexingEventEmitter {
    private listeners = new Map<string, IndexingEventListener[]>();
    
    addEventListener(type: string, listener: IndexingEventListener): void {
        const listeners = this.listeners.get(type) || [];
        listeners.push(listener);
        this.listeners.set(type, listeners);
    }
    
    removeEventListener(type: string, listener: IndexingEventListener): void {
        const listeners = this.listeners.get(type) || [];
        const index = listeners.indexOf(listener);
        if (index > -1) {
            listeners.splice(index, 1);
        }
    }
    
    emit(event: IndexingEvent): void {
        const listeners = this.listeners.get(event.type) || [];
        listeners.forEach(listener => listener.onEvent(event));
    }
}

// Usage
class IndexingMetricsCollector implements IndexingEventListener {
    private metrics = new Map<string, number>();
    
    onEvent(event: IndexingEvent): void {
        const count = this.metrics.get(event.type) || 0;
        this.metrics.set(event.type, count + 1);
    }
    
    getMetrics(): Record<string, number> {
        return Object.fromEntries(this.metrics);
    }
}
```

#### Strategy Pattern

```typescript
// Strategy for different indexing approaches
interface IndexingStrategy {
    index(content: IndexableContent): Promise<void>;
    search(query: SearchQuery): Promise<SearchResult[]>;
}

class BatchIndexingStrategy implements IndexingStrategy {
    constructor(private batchSize: number) {}
    
    async index(content: IndexableContent): Promise<void> {
        // Batch indexing implementation
    }
    
    async search(query: SearchQuery): Promise<SearchResult[]> {
        // Search optimized for batch indexing
    }
}

class StreamingIndexingStrategy implements IndexingStrategy {
    async index(content: IndexableContent): Promise<void> {
        // Streaming indexing implementation
    }
    
    async search(query: SearchQuery): Promise<SearchResult[]> {
        // Search optimized for streaming indexing
    }
}

class ContextAwareIndexingStrategy implements IndexingStrategy {
    async index(content: IndexableContent): Promise<void> {
        // Context-aware indexing implementation
    }
    
    async search(query: SearchQuery): Promise<SearchResult[]> {
        // Context-aware search implementation
    }
}
```

---

## Testing Strategy

### Test Structure

```
src/tests/
├── unit/                   # Unit tests
│   ├── indexing/          # Indexing unit tests
│   ├── search/            # Search unit tests
│   └── utils/             # Utility unit tests
├── integration/           # Integration tests
│   ├── database/          # Database integration tests
│   ├── adapters/          # Adapter integration tests
│   └── api/               # API integration tests
├── e2e/                   # End-to-end tests
├── fixtures/              # Test fixtures
├── mocks/                 # Mock implementations
└── helpers/               # Test helpers
```

### Unit Testing

```typescript
// Example unit test for indexing service
import { test, beforeEach, afterEach } from 'ava';
import sinon from 'sinon';
import { UnifiedIndexerService } from '../unified-indexer-service.js';
import { UnifiedIndexingClient } from '../unified-indexing-client.js';

test.beforeEach(async (t) => {
    // Setup test environment
    const mockClient = sinon.createStubInstance(UnifiedIndexingClient);
    mockClient.index.resolves();
    mockClient.search.resolves({ results: [], total: 0, took: 0 });
    
    t.context.service = new UnifiedIndexerService({
        indexing: {
            vectorStore: { type: 'chromadb', connectionString: 'http://localhost:8000' },
            metadataStore: { type: 'mongodb', connectionString: 'mongodb://localhost:27017' },
            embedding: { model: 'test-model', dimensions: 1536, batchSize: 100 },
        },
        sources: { files: { enabled: true, paths: [] } },
        sync: { interval: 60000, batchSize: 100, retryAttempts: 3, retryDelay: 1000 },
    });
    
    t.context.mockClient = mockClient;
});

test.afterEach(async (t) => {
    // Cleanup
    if (t.context.service) {
        await t.context.service.stop();
    }
    sinon.restore();
});

test('should index content successfully', async (t) => {
    const { service, mockClient } = t.context;
    
    const content = {
        id: 'test-id',
        type: 'file' as const,
        source: 'filesystem' as const,
        content: 'Test content',
        metadata: { path: '/test/path' },
        timestamp: Date.now(),
    };
    
    await service.indexContent(content);
    
    t.true(mockClient.index.calledOnce);
    t.true(mockClient.index.calledWith(content));
});

test('should handle indexing errors gracefully', async (t) => {
    const { service, mockClient } = t.context;
    
    mockClient.index.rejects(new Error('Indexing failed'));
    
    const content = {
        id: 'test-id',
        type: 'file' as const,
        source: 'filesystem' as const,
        content: 'Test content',
        metadata: { path: '/test/path' },
        timestamp: Date.now(),
    };
    
    await t.throwsAsync(() => service.indexContent(content), {
        message: /Indexing failed/,
    });
});

test('should search content with filters', async (t) => {
    const { service, mockClient } = t.context;
    
    const query = {
        query: 'test query',
        type: ['file'],
        limit: 10,
    };
    
    const expectedResults = [
        { id: '1', score: 0.9, content: 'Test result 1' },
        { id: '2', score: 0.8, content: 'Test result 2' },
    ];
    
    mockClient.search.resolves({
        results: expectedResults,
        total: expectedResults.length,
        took: 50,
    });
    
    const results = await service.search(query);
    
    t.deepEqual(results.results, expectedResults);
    t.true(mockClient.search.calledWith(query));
});
```

### Integration Testing

```typescript
// Example integration test with real database
import { test, beforeEach, afterEach } from 'ava';
import { MongoClient } from 'mongodb';
import { ChromaClient } from 'chromadb';
import { UnifiedIndexerService } from '../unified-indexer-service.js';

test.before(async (t) => {
    // Setup test databases
    const mongoClient = new MongoClient(process.env.MONGODB_URL!);
    await mongoClient.connect();
    
    const chromaClient = new ChromaClient({ url: process.env.CHROMA_DB_URL! });
    
    t.context.mongoClient = mongoClient;
    t.context.chromaClient = chromaClient;
    t.context.testDb = mongoClient.db('test_persistence');
    t.context.testCollection = await chromaClient.getOrCreateCollection({
        name: 'test_collection',
    });
});

test.afterEach.always(async (t) => {
    // Cleanup test data
    await t.context.testDb.dropDatabase();
    await t.context.testCollection.delete();
    await t.context.mongoClient.close();
});

test('should index and search content end-to-end', async (t) => {
    const { testDb, testCollection } = t.context;
    
    const service = new UnifiedIndexerService({
        indexing: {
            vectorStore: { type: 'chromadb', connectionString: process.env.CHROMA_DB_URL! },
            metadataStore: { type: 'mongodb', connectionString: process.env.MONGODB_URL! },
            embedding: { model: 'test-model', dimensions: 1536, batchSize: 100 },
        },
        sources: { files: { enabled: true, paths: [] } },
        sync: { interval: 60000, batchSize: 100, retryAttempts: 3, retryDelay: 1000 },
    });
    
    await service.initialize();
    
    // Index test content
    const content = {
        id: 'integration-test-id',
        type: 'file' as const,
        source: 'filesystem' as const,
        content: 'Integration test content for searching',
        metadata: { path: '/integration/test' },
        timestamp: Date.now(),
    };
    
    await service.indexContent(content);
    
    // Wait for indexing to complete
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Search for content
    const results = await service.search({
        query: 'integration test',
        limit: 10,
    });
    
    t.true(results.results.length > 0);
    t.true(results.results.some(result => result.id === content.id));
});
```

### Test Utilities

```typescript
// Test helper utilities
export class TestHelpers {
    static createTestContent(overrides: Partial<IndexableContent> = {}): IndexableContent {
        return {
            id: `test-${Date.now()}-${Math.random()}`,
            type: 'file',
            source: 'filesystem',
            content: 'Test content',
            metadata: { path: '/test/path' },
            timestamp: Date.now(),
            ...overrides,
        };
    }
    
    static createTestQuery(overrides: Partial<SearchQuery> = {}): SearchQuery {
        return {
            query: 'test query',
            limit: 10,
            ...overrides,
        };
    }
    
    static async waitForCondition(
        condition: () => Promise<boolean>,
        timeout: number = 5000,
        interval: number = 100,
    ): Promise<void> {
        const startTime = Date.now();
        
        while (Date.now() - startTime < timeout) {
            if (await condition()) {
                return;
            }
            await new Promise(resolve => setTimeout(resolve, interval));
        }
        
        throw new Error(`Condition not met within ${timeout}ms`);
    }
    
    static createMockDatabase(): {
        client: MongoClient;
        db: Db;
        cleanup: () => Promise<void>;
    } {
        const client = new MongoClient('mongodb://localhost:27017');
        const db = client.db(`test_${Date.now()}`);
        
        return {
            client,
            db,
            cleanup: async () => {
                await db.dropDatabase();
                await client.close();
            },
        };
    }
}

// Test fixtures
export const TestFixtures = {
    sampleFiles: [
        {
            id: 'file-1',
            type: 'file' as const,
            source: 'filesystem' as const,
            content: 'TypeScript is a superset of JavaScript',
            metadata: { path: '/docs/typescript.md', language: 'markdown' },
            timestamp: Date.now() - 86400000,
        },
        {
            id: 'file-2',
            type: 'file' as const,
            source: 'filesystem' as const,
            content: 'Node.js is a JavaScript runtime built on Chrome\'s V8 engine',
            metadata: { path: '/docs/nodejs.md', language: 'markdown' },
            timestamp: Date.now() - 43200000,
        },
    ],
    
    sampleMessages: [
        {
            id: 'msg-1',
            type: 'message' as const,
            source: 'discord' as const,
            content: 'Has anyone worked with the new persistence package?',
            metadata: { channel: 'general', author: 'user1' },
            timestamp: Date.now() - 3600000,
        },
    ],
};
```

### Mock Implementations

```typescript
// Mock implementations for testing
export class MockUnifiedIndexingClient implements UnifiedIndexingClient {
    private indexedContent = new Map<string, IndexableContent>();
    private searchResults: SearchResult[] = [];
    
    async index(content: IndexableContent): Promise<void> {
        this.indexedContent.set(content.id, content);
    }
    
    async indexBatch(contents: IndexableContent[]): Promise<void> {
        for (const content of contents) {
            await this.index(content);
        }
    }
    
    async search(query: SearchQuery): Promise<SearchResponse> {
        const results = this.searchResults.filter(result => 
            result.content.toLowerCase().includes(query.query.toLowerCase())
        );
        
        return {
            results: results.slice(0, query.limit || 50),
            total: results.length,
            took: 10,
            query,
        };
    }
    
    async delete(id: string): Promise<void> {
        this.indexedContent.delete(id);
    }
    
    async getStats(): Promise<IndexingStats> {
        return {
            totalContent: this.indexedContent.size,
            contentByType: {},
            lastIndexed: Date.now(),
        };
    }
    
    // Test helper methods
    setMockSearchResults(results: SearchResult[]): void {
        this.searchResults = results;
    }
    
    getIndexedContent(): IndexableContent[] {
        return Array.from(this.indexedContent.values());
    }
    
    clear(): void {
        this.indexedContent.clear();
        this.searchResults = [];
    }
}
```

---

## Code Review Process

### Review Checklist

#### Functionality
- [ ] Code implements the required functionality correctly
- [ ] Edge cases are handled appropriately
- [ ] Error handling is comprehensive
- [ ] Performance considerations are addressed

#### Code Quality
- [ ] Code follows established coding standards
- [ ] Code is readable and maintainable
- [ ] Functions and classes have single responsibilities
- [ ] Code is properly documented

#### Testing
- [ ] Unit tests are provided and comprehensive
- [ ] Integration tests are included where appropriate
- [ ] Test coverage meets minimum requirements (>80%)
- [ ] Tests are well-structured and maintainable

#### Security
- [ ] Input validation is implemented
- [ ] Sensitive data is handled securely
- [ ] Authentication and authorization are proper
- [ ] No security vulnerabilities are introduced

#### Performance
- [ ] Code is efficient and optimized
- [ ] Memory usage is appropriate
- [ ] Database queries are optimized
- [ ] Caching is used where beneficial

### Review Process

1. **Self-Review**
   ```bash
   # Run all checks before submitting
   pnpm --filter @promethean-os/persistence typecheck
   pnpm --filter @promethean-os/persistence lint
   pnpm --filter @promethean-os/persistence test
   pnpm --filter @promethean-os/persistence build
   ```

2. **Peer Review**
   - Create pull request with descriptive title and description
   - Link to relevant issues or tasks
   - Include testing instructions
   - Request review from at least two team members

3. **Review Feedback**
   - Address all review comments
   - Update code and tests as needed
   - Re-run all tests after changes
   - Respond to each comment with resolution

4. **Approval and Merge**
   - Ensure all checks pass
   - Get approval from required reviewers
   - Merge using squash merge for clean history
   - Delete feature branch after merge

### Review Guidelines

#### Providing Feedback

```typescript
// Good feedback example
/**
 * @review
 * 
 * **Issue**: The error handling in this function could be more specific.
 * 
 * **Current code**:
 * ```typescript
 * try {
 *   await indexContent(content);
 * } catch (error) {
 *   console.error('Indexing failed');
 * }
 * ```
 * 
 * **Suggested improvement**:
 * ```typescript
 * try {
 *   await indexContent(content);
 * } catch (error) {
 *   if (error instanceof NetworkError) {
 *     // Retry logic for network errors
 *     await retryIndexing(content);
 *   } else if (error instanceof ValidationError) {
 *     // Log validation errors for monitoring
 *     logger.warn('Content validation failed', { contentId: content.id, error });
 *   } else {
 *     // Handle unexpected errors
 *     logger.error('Unexpected indexing error', { contentId: content.id, error });
 *     throw error;
 *   }
 * }
 * ```
 * 
 * **Reasoning**: More specific error handling allows for better recovery and monitoring.
 */
```

#### Receiving Feedback

```typescript
// Good response to feedback
/**
 * @review-response
 * 
 * Thanks for the detailed feedback! I've implemented the suggested error handling improvements:
 * 
 * - Added specific error types for network and validation errors
 * - Implemented retry logic for transient failures
 * - Added structured logging for better monitoring
 * - Preserved original error context for debugging
 * 
 * The changes are in the latest commit. I've also added unit tests to verify the new error handling behavior.
 * 
 * Please let me know if you'd like any further adjustments!
 */
```

---

## Documentation Standards

### Code Documentation

#### JSDoc Standards

```typescript
/**
 * Creates a unified indexer service with the specified configuration.
 * 
 * @example
 * ```typescript
 * const service = await createUnifiedIndexerService({
 *   indexing: {
 *     vectorStore: { type: 'chromadb', connectionString: 'http://localhost:8000' },
 *     metadataStore: { type: 'mongodb', connectionString: 'mongodb://localhost:27017' },
 *     embedding: { model: 'text-embedding-ada-002', dimensions: 1536, batchSize: 100 },
 *   },
 *   sources: { files: { enabled: true, paths: ['./src', './docs'] } },
 *   sync: { interval: 300000, batchSize: 100, retryAttempts: 3, retryDelay: 5000 },
 * });
 * 
 * await service.start();
 * ```
 * 
 * @param config - Configuration object for the indexer service
 * @param config.indexing - Storage and embedding configuration
 * @param config.indexing.vectorStore - Vector store configuration
 * @param config.indexing.metadataStore - Metadata store configuration
 * @param config.indexing.embedding - Embedding model configuration
 * @param config.sources - Data source configuration
 * @param config.sync - Synchronization settings
 * 
 * @returns Promise that resolves to the configured indexer service
 * 
 * @throws {ConfigurationError} When configuration is invalid
 * @throws {ConnectionError} When unable to connect to storage services
 * 
 * @since 1.0.0
 */
export async function createUnifiedIndexerService(
    config: UnifiedIndexerServiceConfig,
): Promise<UnifiedIndexerService> {
    // Implementation
}
```

#### Interface Documentation

```typescript
/**
 * Configuration interface for the unified indexer service.
 * 
 * @interface UnifiedIndexerServiceConfig
 */
export interface UnifiedIndexerServiceConfig {
    /**
     * Storage and indexing configuration.
     * 
     * Defines how content is stored, indexed, and embedded.
     */
    indexing: {
        /**
         * Vector store configuration for semantic search.
         * 
         * Supports ChromaDB, Pinecone, Weaviate, and Qdrant.
         */
        vectorStore: {
            /**
             * Type of vector store to use.
             * 
             * @default 'chromadb'
             */
            type: 'chromadb' | 'pinecone' | 'weaviate' | 'qdrant';
            
            /**
             * Connection string for the vector store.
             * 
             * Format depends on the vector store type.
             * 
             * @example
             * // ChromaDB
             * 'http://localhost:8000'
             * 
             * @example
             * // Pinecone
             * 'https://your-index.pinecone.io'
             */
            connectionString: string;
            
            /**
             * Name of the index/collection to use.
             * 
             * @optional
             */
            indexName?: string;
        };
        
        /**
         * Metadata store configuration for content metadata.
         * 
         * Supports MongoDB, PostgreSQL, and SQLite.
         */
        metadataStore: {
            /**
             * Type of metadata store to use.
             * 
             * @default 'mongodb'
             */
            type: 'mongodb' | 'postgresql' | 'sqlite';
            
            /**
             * Connection string for the metadata store.
             * 
             * @example
             * // MongoDB
             * 'mongodb://localhost:27017/promethean'
             * 
             * @example
             * // PostgreSQL
             * 'postgresql://user:pass@localhost:5432/promethean'
             */
            connectionString: string;
        };
    };
    
    /**
     * Data source configuration.
     * 
     * Defines which data sources to enable and their settings.
     */
    sources: {
        /**
         * File system indexing configuration.
         */
        files: {
            /**
             * Whether file system indexing is enabled.
             * 
             * @default false
             */
            enabled: boolean;
            
            /**
             * Paths to index recursively.
             * 
             * @example
             * ['./src', './docs', './packages']
             */
            paths: string[];
            
            /**
             * File indexing options.
             * 
             * @optional
             */
            options?: FileIndexingOptions;
        };
    };
}
```

### README Documentation

#### Package README Structure

```markdown
# @promethean-os/persistence

> Unified persistence and indexing service for Promethean OS

## Features

- 🚀 **High Performance**: Optimized indexing and search with sub-100ms latency
- 🔍 **Semantic Search**: Advanced vector-based search with hybrid capabilities
- 🔄 **Multi-Source**: Unified indexing from files, Discord, OpenCode, and Kanban
- 🛡️ **Secure**: Enterprise-grade security with encryption and access control
- 📊 **Observable**: Comprehensive monitoring and metrics
- 🔧 **Configurable**: Flexible configuration for different deployment scenarios

## Quick Start

### Installation

\`\`\`bash
pnpm add @promethean-os/persistence
\`\`\`

### Basic Usage

\`\`\`typescript
import { createUnifiedIndexerService } from '@promethean-os/persistence';

const service = await createUnifiedIndexerService({
    indexing: {
        vectorStore: { type: 'chromadb', connectionString: 'http://localhost:8000' },
        metadataStore: { type: 'mongodb', connectionString: 'mongodb://localhost:27017' },
    },
    sources: { files: { enabled: true, paths: ['./src', './docs'] } },
});

await service.start();

// Search content
const results = await service.search({
    query: 'TypeScript implementation',
    limit: 10,
});

console.log(\`Found \${results.total} results\`);
\`\`\`

## Documentation

- [API Reference](./docs/API_REFERENCE.md)
- [Architecture Guide](./docs/ARCHITECTURE.md)
- [Deployment Guide](./docs/DEPLOYMENT_GUIDE.md)
- [Security Guidelines](./docs/SECURITY_GUIDELINES.md)
- [Performance Optimization](./docs/PERFORMANCE_OPTIMIZATION.md)

## Development

See [Development Guidelines](./docs/DEVELOPMENT_GUIDELINES.md) for information about contributing to this package.

## License

GPL-3.0
```

---

## Debugging Guidelines

### Debugging Tools

#### VS Code Debug Configuration

```json
// .vscode/launch.json
{
    "version": "0.2.0",
    "configurations": [
        {
            "name": "Debug Unified Indexer",
            "type": "node",
            "request": "launch",
            "program": "${workspaceFolder}/packages/persistence/dist/unified-indexer-example.js",
            "env": {
                "NODE_ENV": "development",
                "LOG_LEVEL": "debug"
            },
            "console": "integratedTerminal",
            "outFiles": [
                "${workspaceFolder}/packages/persistence/dist/**/*.js"
            ],
            "sourceMaps": true
        },
        {
            "name": "Debug Tests",
            "type": "node",
            "request": "launch",
            "program": "${workspaceFolder}/node_modules/.bin/ava",
            "args": [
                "--config",
                "${workspaceFolder}/config/ava.config.mjs",
                "${workspaceFolder}/packages/persistence/src/tests/**/*.test.ts"
            ],
            "env": {
                "NODE_ENV": "test"
            },
            "console": "integratedTerminal"
        }
    ]
}
```

#### Logging Configuration

```typescript
// Debug logging setup
import { createLogger } from '@promethean-os/logger';

const logger = createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: 'json',
    transports: [
        new transports.Console({
            format: format.combine(
                format.colorize(),
                format.timestamp(),
                format.printf(({ timestamp, level, message, ...meta }) => {
                    return `${timestamp} [${level}]: ${message} ${Object.keys(meta).length ? JSON.stringify(meta) : ''}`;
                })
            ),
        }),
        new transports.File({
            filename: 'debug.log',
            level: 'debug',
        }),
    ],
});

// Debug utilities
export class DebugUtils {
    static logIndexingOperation(operation: string, content: IndexableContent): void {
        logger.debug('Indexing operation', {
            operation,
            contentId: content.id,
            contentType: content.type,
            contentSource: content.source,
            contentSize: content.content.length,
        });
    }
    
    static logSearchOperation(query: SearchQuery, results: SearchResponse): void {
        logger.debug('Search operation', {
            query: query.query,
            filters: query.filters,
            limit: query.limit,
            resultCount: results.results.length,
            searchTime: results.took,
        });
    }
    
    static logPerformanceMetrics(operation: string, duration: number, metadata?: any): void {
        logger.debug('Performance metrics', {
            operation,
            duration,
            ...metadata,
        });
    }
}
```

### Common Debugging Scenarios

#### Indexing Issues

```typescript
// Debugging indexing problems
async function debugIndexing(content: IndexableContent): Promise<void> {
    try {
        // Validate content
        const validation = validateContent(content);
        if (!validation.valid) {
            logger.error('Content validation failed', { 
                contentId: content.id, 
                errors: validation.errors 
            });
            return;
        }
        
        // Check embedding generation
        const embeddingStart = Date.now();
        const embedding = await generateEmbedding(content.content);
        const embeddingTime = Date.now() - embeddingStart;
        
        logger.debug('Embedding generated', {
            contentId: content.id,
            embeddingDimensions: embedding.length,
            generationTime: embeddingTime,
        });
        
        // Check vector storage
        const vectorStart = Date.now();
        await storeVector(content.id, embedding);
        const vectorTime = Date.now() - vectorStart;
        
        logger.debug('Vector stored', {
            contentId: content.id,
            storageTime: vectorTime,
        });
        
        // Check metadata storage
        const metadataStart = Date.now();
        await storeMetadata(content);
        const metadataTime = Date.now() - metadataStart;
        
        logger.debug('Metadata stored', {
            contentId: content.id,
            storageTime: metadataTime,
        });
        
        logger.info('Indexing completed successfully', {
            contentId: content.id,
            totalTime: embeddingTime + vectorTime + metadataTime,
        });
        
    } catch (error) {
        logger.error('Indexing failed', {
            contentId: content.id,
            error: error.message,
            stack: error.stack,
        });
        throw error;
    }
}
```

#### Search Issues

```typescript
// Debugging search problems
async function debugSearch(query: SearchQuery): Promise<SearchResponse> {
    try {
        logger.debug('Starting search', { query });
        
        // Check query processing
        const processedQuery = processQuery(query);
        logger.debug('Query processed', {
            original: query,
            processed: processedQuery,
        });
        
        // Check embedding generation for query
        if (query.semantic) {
            const queryEmbedding = await generateEmbedding(query.query);
            logger.debug('Query embedding generated', {
                query: query.query,
                embeddingDimensions: queryEmbedding.length,
            });
        }
        
        // Check vector search
        const vectorStart = Date.now();
        const vectorResults = await performVectorSearch(processedQuery);
        const vectorTime = Date.now() - vectorStart;
        
        logger.debug('Vector search completed', {
            resultCount: vectorResults.length,
            searchTime: vectorTime,
        });
        
        // Check keyword search
        const keywordStart = Date.now();
        const keywordResults = await performKeywordSearch(processedQuery);
        const keywordTime = Date.now() - keywordStart;
        
        logger.debug('Keyword search completed', {
            resultCount: keywordResults.length,
            searchTime: keywordTime,
        });
        
        // Check result merging
        const mergedResults = mergeResults(vectorResults, keywordResults, query);
        
        logger.debug('Results merged', {
            vectorCount: vectorResults.length,
            keywordCount: keywordResults.length,
            mergedCount: mergedResults.length,
        });
        
        const response: SearchResponse = {
            results: mergedResults,
            total: mergedResults.length,
            took: vectorTime + keywordTime,
            query: processedQuery,
        };
        
        logger.debug('Search completed', {
            resultCount: response.results.length,
            totalTime: response.took,
        });
        
        return response;
        
    } catch (error) {
        logger.error('Search failed', {
            query,
            error: error.message,
            stack: error.stack,
        });
        throw error;
    }
}
```

---

## Performance Guidelines

### Performance Monitoring

```typescript
// Performance monitoring utilities
export class PerformanceMonitor {
    private metrics = new Map<string, PerformanceMetric[]>();
    
    startTimer(operation: string): () => void {
        const startTime = process.hrtime.bigint();
        
        return () => {
            const endTime = process.hrtime.bigint();
            const duration = Number(endTime - startTime) / 1000000; // Convert to milliseconds
            
            this.recordMetric(operation, duration);
        };
    }
    
    recordMetric(operation: string, duration: number): void {
        const metrics = this.metrics.get(operation) || [];
        metrics.push({
            operation,
            duration,
            timestamp: Date.now(),
        });
        
        // Keep only last 1000 metrics
        if (metrics.length > 1000) {
            metrics.splice(0, metrics.length - 1000);
        }
        
        this.metrics.set(operation, metrics);
    }
    
    getMetrics(operation?: string): PerformanceReport {
        if (operation) {
            const metrics = this.metrics.get(operation) || [];
            return this.generateReport(operation, metrics);
        }
        
        const reports: Record<string, PerformanceReport> = {};
        for (const [op, metrics] of this.metrics.entries()) {
            reports[op] = this.generateReport(op, metrics);
        }
        
        return reports as any;
    }
    
    private generateReport(operation: string, metrics: PerformanceMetric[]): PerformanceReport {
        if (metrics.length === 0) {
            return {
                operation,
                count: 0,
                average: 0,
                min: 0,
                max: 0,
                p50: 0,
                p95: 0,
                p99: 0,
            };
        }
        
        const durations = metrics.map(m => m.duration).sort((a, b) => a - b);
        
        return {
            operation,
            count: metrics.length,
            average: durations.reduce((sum, d) => sum + d, 0) / durations.length,
            min: durations[0],
            max: durations[durations.length - 1],
            p50: durations[Math.floor(durations.length * 0.5)],
            p95: durations[Math.floor(durations.length * 0.95)],
            p99: durations[Math.floor(durations.length * 0.99)],
        };
    }
}

// Usage example
const monitor = new PerformanceMonitor();

// Wrap function with performance monitoring
async function monitoredSearch(query: SearchQuery): Promise<SearchResponse> {
    const endTimer = monitor.startTimer('search');
    
    try {
        const results = await performSearch(query);
        return results;
    } finally {
        endTimer();
    }
}

// Get performance report
const report = monitor.getMetrics('search');
console.log('Search performance:', report);
```

### Memory Profiling

```typescript
// Memory profiling utilities
export class MemoryProfiler {
    private snapshots: MemorySnapshot[] = [];
    
    takeSnapshot(label: string): MemorySnapshot {
        const memUsage = process.memoryUsage();
        const snapshot: MemorySnapshot = {
            label,
            timestamp: Date.now(),
            rss: memUsage.rss,
            heapUsed: memUsage.heapUsed,
            heapTotal: memUsage.heapTotal,
            external: memUsage.external,
        };
        
        this.snapshots.push(snapshot);
        
        // Keep only last 100 snapshots
        if (this.snapshots.length > 100) {
            this.snapshots.splice(0, this.snapshots.length - 100);
        }
        
        return snapshot;
    }
    
    getMemoryTrend(): MemoryTrend {
        if (this.snapshots.length < 2) {
            return { trend: 'stable', change: 0 };
        }
        
        const recent = this.snapshots.slice(-10);
        const older = this.snapshots.slice(-20, -10);
        
        if (older.length === 0) {
            return { trend: 'stable', change: 0 };
        }
        
        const recentAvg = recent.reduce((sum, s) => sum + s.heapUsed, 0) / recent.length;
        const olderAvg = older.reduce((sum, s) => sum + s.heapUsed, 0) / older.length;
        
        const change = ((recentAvg - olderAvg) / olderAvg) * 100;
        
        let trend: 'increasing' | 'decreasing' | 'stable';
        if (change > 5) {
            trend = 'increasing';
        } else if (change < -5) {
            trend = 'decreasing';
        } else {
            trend = 'stable';
        }
        
        return { trend, change };
    }
    
    generateReport(): MemoryReport {
        if (this.snapshots.length === 0) {
            return { snapshots: [], trend: { trend: 'stable', change: 0 } };
        }
        
        return {
            snapshots: this.snapshots,
            trend: this.getMemoryTrend(),
            peak: Math.max(...this.snapshots.map(s => s.heapUsed)),
            average: this.snapshots.reduce((sum, s) => sum + s.heapUsed, 0) / this.snapshots.length,
            current: this.snapshots[this.snapshots.length - 1].heapUsed,
        };
    }
}
```

---

## Security Guidelines

### Secure Coding Practices

```typescript
// Input validation
import { z } from 'zod';

const SearchQuerySchema = z.object({
    query: z.string().max(1000).min(1),
    limit: z.number().int().min(1).max(100).default(10),
    type: z.array(z.enum(['file', 'message', 'event', 'session'])).optional(),
    filters: z.record(z.any()).optional(),
});

function validateSearchQuery(input: unknown): SearchQuery {
    return SearchQuerySchema.parse(input);
}

// SQL injection prevention
async function safeDatabaseQuery(query: string, params: any[]): Promise<any> {
    // Use parameterized queries
    const stmt = db.prepare(query);
    return stmt.run(...params);
}

// XSS prevention
function sanitizeHtml(input: string): string {
    return input
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;');
}

// Path traversal prevention
function safePathJoin(basePath: string, userPath: string): string {
    const resolvedPath = path.resolve(basePath, userPath);
    if (!resolvedPath.startsWith(path.resolve(basePath))) {
        throw new Error('Path traversal attempt detected');
    }
    return resolvedPath;
}
```

### Authentication and Authorization

```typescript
// JWT token validation
import jwt from 'jsonwebtoken';

interface AuthContext {
    userId: string;
    permissions: string[];
    source: string;
}

function validateAuthToken(token: string): AuthContext {
    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET!) as any;
        return {
            userId: payload.sub,
            permissions: payload.permissions || [],
            source: payload.source,
        };
    } catch (error) {
        throw new UnauthorizedError('Invalid authentication token');
    }
}

// Permission checking
function hasPermission(authContext: AuthContext, resource: string, action: string): boolean {
    const requiredPermission = `${resource}:${action}`;
    return authContext.permissions.includes(requiredPermission) ||
           authContext.permissions.includes('*:*'); // Admin permission
}

// Authorization middleware
function requireAuth(resource: string, action: string) {
    return (req: Request, res: Response, next: NextFunction) => {
        const token = req.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ error: 'Missing authentication token' });
        }
        
        try {
            const authContext = validateAuthToken(token);
            
            if (!hasPermission(authContext, resource, action)) {
                return res.status(403).json({ error: 'Insufficient permissions' });
            }
            
            req.authContext = authContext;
            next();
        } catch (error) {
            return res.status(401).json({ error: 'Invalid authentication token' });
        }
    };
}
```

---

## Release Process

### Version Management

```bash
# Version bumping
pnpm --filter @promethean-os/persistence version patch  # 0.0.1 -> 0.0.2
pnpm --filter @promethean-os/persistence version minor  # 0.0.1 -> 0.1.0
pnpm --filter @promethean-os/persistence version major  # 0.0.1 -> 1.0.0

# Pre-release versions
pnpm --filter @promethean-os/persistence version prerelease --preid=alpha  # 0.0.1 -> 0.0.2-alpha.0
pnpm --filter @promethean-os/persistence version prerelease --preid=beta   # 0.0.2-alpha.0 -> 0.0.2-beta.0
```

### Release Checklist

#### Pre-Release
- [ ] All tests are passing
- [ ] Code coverage meets requirements (>80%)
- [ ] Documentation is updated
- [ ] CHANGELOG.md is updated
- [ ] Version number is appropriate
- [ ] Security scan passes
- [ ] Performance benchmarks meet targets

#### Release
- [ ] Create release branch
- [ ] Update version number
- [ ] Build and test release artifacts
- [ ] Create Git tag
- [ ] Publish to npm registry
- [ ] Create GitHub release

#### Post-Release
- [ ] Merge release branch to main
- [ ] Update documentation website
- [ ] Notify team of release
- [ ] Monitor for issues
- [ ] Update project boards

### Automated Release Pipeline

```yaml
# .github/workflows/release.yml
name: Release

on:
  push:
    tags:
      - 'v*'

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'pnpm'
      
      - run: pnpm install --frozen-lockfile
      - run: pnpm --filter @promethean-os/persistence test
      - run: pnpm --filter @promethean-os/persistence build

  security-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: pnpm audit --audit-level moderate
      - run: npx snyk test --severity-threshold=high

  publish:
    needs: [test, security-scan]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          registry-url: 'https://registry.npmjs.org'
          cache: 'pnpm'
      
      - run: pnpm install --frozen-lockfile
      - run: pnpm --filter @promethean-os/persistence build
      - run: pnpm --filter @promethean-os/persistence publish --no-git-checks
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

This development guidelines document provides comprehensive standards and processes for contributing to the @promethean-os/persistence package, ensuring high code quality, maintainability, and collaboration efficiency.
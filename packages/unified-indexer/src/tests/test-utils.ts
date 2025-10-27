/**
 * Test Utilities for Unified Indexer Tests
 *
 * This file provides common utilities, mocks, and helpers for testing
 * the unified indexer service and cross-domain search functionality.
 */

import type {
    UnifiedIndexingClient,
    UnifiedIndexingConfig,
    SearchQuery,
    SearchResult,
    IndexingStats,
} from '@promethean-os/persistence';

import type {
    UnifiedFileIndexer,
    UnifiedDiscordIndexer,
    UnifiedOpenCodeIndexer,
    UnifiedKanbanIndexer,
} from '@promethean-os/persistence';

import type {
    UnifiedIndexerServiceConfig,
    UnifiedIndexerStats,
    ServiceStatus,
} from '../unified-indexer-service.js';

/**
 * Mock implementation of UnifiedIndexingClient
 */
export class MockUnifiedIndexingClient implements UnifiedIndexingClient {
    private addedDocuments: any[] = [];
    private searchResults: SearchResult[] = [];

    async addDocuments(documents: any[]): Promise<void> {
        this.addedDocuments.push(...documents);
    }

    async search(query: SearchQuery): Promise<SearchResult[]> {
        return this.searchResults.filter(result => 
            result.content.toLowerCase().includes(query.query.toLowerCase())
        );
    }

    async getStats(): Promise<IndexingStats> {
        return {
            totalDocuments: this.addedDocuments.length,
            totalVectors: this.addedDocuments.length,
            lastIndexed: new Date(),
            collections: ['test-collection'],
        };
    }

    async clear(): Promise<void> {
        this.addedDocuments = [];
        this.searchResults = [];
    }

    // Test helpers
    addMockSearchResults(results: SearchResult[]): void {
        this.searchResults.push(...results);
    }

    getAddedDocuments(): any[] {
        return [...this.addedDocuments];
    }

    reset(): void {
        this.addedDocuments = [];
        this.searchResults = [];
    }
}

/**
 * Mock implementation of UnifiedFileIndexer
 */
export class MockUnifiedFileIndexer implements UnifiedFileIndexer {
    private indexedFiles: any[] = [];

    async indexDirectory(path: string): Promise<void> {
        // Simulate indexing files
        this.indexedFiles.push({
            path,
            type: 'directory',
            timestamp: new Date(),
        });
    }

    async indexFile(path: string): Promise<void> {
        this.indexedFiles.push({
            path,
            type: 'file',
            timestamp: new Date(),
        });
    }

    async getStats() {
        return {
            totalFiles: this.indexedFiles.length,
            totalDirectories: this.indexedFiles.filter(f => f.type === 'directory').length,
            lastIndexed: new Date(),
            errors: [],
        };
    }

    getIndexedFiles(): any[] {
        return [...this.indexedFiles];
    }

    reset(): void {
        this.indexedFiles = [];
    }
}

/**
 * Mock implementations for other indexers
 */
export class MockUnifiedDiscordIndexer implements UnifiedDiscordIndexer {
    private messages: any[] = [];

    async indexMessages(channelId: string, limit?: number): Promise<void> {
        this.messages.push({
            channelId,
            limit,
            timestamp: new Date(),
        });
    }

    async getStats() {
        return {
            totalMessages: this.messages.length,
            totalChannels: new Set(this.messages.map(m => m.channelId)).size,
            lastIndexed: new Date(),
            errors: [],
        };
    }

    reset(): void {
        this.messages = [];
    }
}

export class MockUnifiedOpenCodeIndexer implements UnifiedOpenCodeIndexer {
    private sessions: any[] = [];

    async indexSession(sessionId: string): Promise<void> {
        this.sessions.push({
            sessionId,
            timestamp: new Date(),
        });
    }

    async getStats() {
        return {
            totalSessions: this.sessions.length,
            totalEvents: 0,
            totalMessages: 0,
            lastIndexed: new Date(),
            errors: [],
        };
    }

    reset(): void {
        this.sessions = [];
    }
}

export class MockUnifiedKanbanIndexer implements UnifiedKanbanIndexer {
    private tasks: any[] = [];

    async indexBoard(boardId: string): Promise<void> {
        this.tasks.push({
            boardId,
            timestamp: new Date(),
        });
    }

    async getStats() {
        return {
            totalTasks: this.tasks.length,
            totalBoards: new Set(this.tasks.map(t => t.boardId)).size,
            lastIndexed: new Date(),
            errors: [],
        };
    }

    reset(): void {
        this.tasks = [];
    }
}

/**
 * Create a minimal test configuration
 */
export function createTestConfig(overrides: Partial<UnifiedIndexerServiceConfig> = {}): UnifiedIndexerServiceConfig {
    const mockIndexingClient = new MockUnifiedIndexingClient();
    
    return {
        indexing: {
            vectorStore: {
                type: 'chromadb',
                config: {
                    host: 'localhost',
                    port: 8000,
                },
            },
            documentStore: {
                type: 'mongodb',
                config: {
                    uri: 'mongodb://localhost:27017',
                    database: 'test',
                },
            },
        },
        contextStore: {
            collections: {
                files: 'test-files',
                discord: 'test-discord',
                opencode: 'test-opencode',
                kanban: 'test-kanban',
            },
        },
        sources: {
            files: {
                enabled: true,
                paths: ['./test-data'],
                exclude: ['node_modules', '.git'],
                include: ['*.ts', '*.js', '*.md'],
            },
            discord: {
                enabled: false,
                channels: [],
                token: 'test-token',
            },
            opencode: {
                enabled: false,
                sessions: [],
            },
            kanban: {
                enabled: false,
                boards: [],
            },
        },
        sync: {
            interval: 5000, // Short interval for tests
            batchSize: 10,
            retryAttempts: 2,
            retryDelay: 100,
        },
        ...overrides,
    };
}

/**
 * Create test search results
 */
export function createTestSearchResults(overrides: Partial<SearchResult>[] = []): SearchResult[] {
    const defaultResults: SearchResult[] = [
        {
            id: 'test-result-1',
            content: 'TypeScript contextStore implementation',
            metadata: {
                source: 'file',
                type: 'file',
                path: '/test/contextStore.ts',
                timestamp: new Date('2024-01-01'),
            },
            score: 0.9,
        },
        {
            id: 'test-result-2',
            content: 'Discord message about unified indexing',
            metadata: {
                source: 'discord',
                type: 'message',
                channelId: 'test-channel',
                messageId: 'test-message',
                timestamp: new Date('2024-01-02'),
            },
            score: 0.8,
        },
        {
            id: 'test-result-3',
            content: 'Kanban task for indexer optimization',
            metadata: {
                source: 'kanban',
                type: 'task',
                taskId: 'test-task',
                boardId: 'test-board',
                timestamp: new Date('2024-01-03'),
            },
            score: 0.7,
        },
    ];

    return defaultResults.map((result, index) => ({
        ...result,
        ...overrides[index] || {},
    }));
}

/**
 * Wait for a specified amount of time (for async testing)
 */
export function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Create a mock console for testing console output
 */
export function createMockConsole() {
    const logs: { level: string; message: string; args: any[] }[] = [];

    const mockConsole = {
        log: (...args: any[]) => logs.push({ level: 'log', message: args[0], args }),
        warn: (...args: any[]) => logs.push({ level: 'warn', message: args[0], args }),
        error: (...args: any[]) => logs.push({ level: 'error', message: args[0], args }),
        info: (...args: any[]) => logs.push({ level: 'info', message: args[0], args }),
        
        getLogs: () => [...logs],
        getLogsByLevel: (level: string) => logs.filter(log => log.level === level),
        clear: () => { logs.length = 0; },
    };

    return mockConsole;
}

/**
 * Test data factory
 */
export const TestDataFactory = {
    /**
     * Create test file content
     */
    createFileContent: (path: string, content: string) => ({
        id: `file-${path}`,
        content,
        metadata: {
            source: 'file' as const,
            type: 'file' as const,
            path,
            size: content.length,
            timestamp: new Date(),
        },
    }),

    /**
     * Create test Discord message
     */
    createDiscordMessage: (channelId: string, content: string, author: string) => ({
        id: `discord-${channelId}-${Date.now()}`,
        content,
        metadata: {
            source: 'discord' as const,
            type: 'message' as const,
            channelId,
            author,
            timestamp: new Date(),
        },
    }),

    /**
     * Create test Kanban task
     */
    createKanbanTask: (taskId: string, title: string, description: string) => ({
        id: `kanban-${taskId}`,
        content: `${title}: ${description}`,
        metadata: {
            source: 'kanban' as const,
            type: 'task' as const,
            taskId,
            title,
            timestamp: new Date(),
        },
    }),
};
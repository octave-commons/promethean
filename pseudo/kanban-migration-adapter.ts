/**
 * Kanban Migration Adapter
 *
 * This module migrates the Kanban task indexer to use the unified indexing API.
 * It provides backward compatibility while transitioning to the unified approach.
 */

import type { UnifiedIndexingClient } from '@promethean-os/persistence';
import type { IndexableContent } from '@promethean-os/persistence';
import { transformKanbanTask } from '@promethean-os/persistence';

/**
 * Kanban task data
 */
export type KanbanTask = {
    id: string;
    title: string;
    description?: string;
    status: 'backlog' | 'todo' | 'in_progress' | 'review' | 'done';
    priority: 'low' | 'medium' | 'high' | 'critical';
    assignee?: string;
    labels?: string[];
    dueDate?: Date;
    createdAt: Date;
    updatedAt: Date;
    metadata?: Record<string, any>;
};

/**
 * Kanban board data
 */
export type KanbanBoard = {
    id: string;
    name: string;
    description?: string;
    columns: Array<{
        id: string;
        name: string;
        status: string;
    }>;
    createdAt: Date;
    updatedAt: Date;
    metadata?: Record<string, any>;
};

/**
 * Kanban indexing statistics
 */
export type KanbanIndexingStats = {
    totalItems: number;
    indexedItems: number;
    skippedItems: number;
    errors: string[];
    duration: number;
};

/**
 * Migrated Kanban indexer that uses the unified indexing API
 */
export class UnifiedKanbanIndexer {
    private unifiedClient: UnifiedIndexingClient;

    constructor(unifiedClient: UnifiedIndexingClient) {
        this.unifiedClient = unifiedClient;
    }

    /**
     * Index a Kanban task using the unified API
     */
    async indexTask(task: KanbanTask): Promise<void> {
        try {
            const unifiedContent = transformKanbanTask(
                {
                    id: task.id,
                    title: task.title,
                    description: task.description,
                    status: task.status,
                    priority: task.priority,
                    assignee: task.assignee,
                    labels: task.labels,
                    due_date: task.dueDate?.toISOString(),
                    created_at: task.createdAt.toISOString(),
                    updated_at: task.updatedAt.toISOString(),
                },
                {
                    type: 'task',
                    source: 'kanban',
                    task_id: task.id,
                    title: task.title,
                    description: task.description,
                    status: task.status,
                    priority: task.priority,
                    assignee: task.assignee,
                    labels: task.labels,
                    due_date: task.dueDate?.getTime(),
                    created_at: task.createdAt.getTime(),
                    updated_at: task.updatedAt.getTime(),
                    ...task.metadata,
                },
            );

            await this.unifiedClient.index(unifiedContent, {
                validate: true,
            });

            console.log(`[kanban-unified-indexer] Indexed task ${task.id}`);
        } catch (error) {
            console.error(`[kanban-unified-indexer] Failed to index task ${task.id}:`, error);
            throw error;
        }
    }

    /**
     * Index a Kanban board using the unified API
     */
    async indexBoard(board: KanbanBoard): Promise<void> {
        try {
            const unifiedContent = {
                id: board.id,
                type: 'board' as const,
                source: 'kanban' as const,
                content: board.description || board.name,
                timestamp: board.createdAt.getTime(),
                metadata: {
                    type: 'board' as const,
                    source: 'kanban' as const,
                    board_id: board.id,
                    name: board.name,
                    description: board.description,
                    columns: board.columns,
                    created_at: board.createdAt.getTime(),
                    updated_at: board.updatedAt.getTime(),
                    ...board.metadata,
                } as any,
            };

            await this.unifiedClient.index(unifiedContent, {
                validate: true,
            });

            console.log(`[kanban-unified-indexer] Indexed board ${board.id}`);
        } catch (error) {
            console.error(`[kanban-unified-indexer] Failed to index board ${board.id}:`, error);
            throw error;
        }
    }

    /**
     * Index multiple Kanban items
     */
    async indexBatch(items: Array<{ type: 'task' | 'board'; data: any }>): Promise<KanbanIndexingStats> {
        const startTime = Date.now();
        const stats: KanbanIndexingStats = {
            totalItems: items.length,
            indexedItems: 0,
            skippedItems: 0,
            errors: [],
            duration: 0,
        };

        try {
            const unifiedContents: IndexableContent[] = [];

            for (const item of items) {
                try {
                    let unifiedContent: IndexableContent;

                    switch (item.type) {
                        case 'task':
                            unifiedContent = transformKanbanTask(
                                {
                                    id: item.data.id,
                                    title: item.data.title,
                                    description: item.data.description,
                                    status: item.data.status,
                                    priority: item.data.priority,
                                    assignee: item.data.assignee,
                                    labels: item.data.labels,
                                    due_date: item.data.dueDate?.toISOString(),
                                    created_at: item.data.createdAt.toISOString(),
                                    updated_at: item.data.updatedAt.toISOString(),
                                },
                                {
                                    type: 'task',
                                    source: 'kanban',
                                    task_id: item.data.id,
                                    title: item.data.title,
                                    description: item.data.description,
                                    status: item.data.status,
                                    priority: item.data.priority,
                                    assignee: item.data.assignee,
                                    labels: item.data.labels,
                                    due_date: item.data.dueDate?.getTime(),
                                    created_at: item.data.createdAt.getTime(),
                                    updated_at: item.data.updatedAt.getTime(),
                                    ...item.data.metadata,
                                },
                            );
                            break;

                        case 'board':
                            unifiedContent = {
                                id: item.data.id,
                                type: 'board' as const,
                                source: 'kanban' as const,
                                content: item.data.description || item.data.name,
                                timestamp: item.data.createdAt.getTime(),
                                metadata: {
                                    type: 'board' as const,
                                    source: 'kanban' as const,
                                    board_id: item.data.id,
                                    name: item.data.name,
                                    description: item.data.description,
                                    columns: item.data.columns,
                                    created_at: item.data.createdAt.getTime(),
                                    updated_at: item.data.updatedAt.getTime(),
                                    ...item.data.metadata,
                                } as any,
                            };
                            break;

                        default:
                            throw new Error(`Unknown item type: ${(item as any).type}`);
                    }

                    unifiedContents.push(unifiedContent);
                    stats.indexedItems++;
                } catch (error) {
                    stats.skippedItems++;
                    stats.errors.push(
                        `${item.type}:${item.data.id}: ${error instanceof Error ? error.message : 'Unknown error'}`,
                    );
                }
            }

            // Batch index using the unified API
            if (unifiedContents.length > 0) {
                await this.unifiedClient.indexBatch(unifiedContents, {
                    validate: true,
                    batchSize: 100,
                });
            }
        } catch (error) {
            stats.errors.push(`Batch indexing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }

        stats.duration = Date.now() - startTime;
        return stats;
    }

    /**
     * Search Kanban tasks using the unified API
     */
    async searchTasks(
        query: string,
        filters: {
            status?: string;
            priority?: string;
            assignee?: string;
            labels?: string[];
        } = {},
        limit: number = 10,
    ): Promise<any[]> {
        const searchOptions: any = {
            query,
            limit,
            type: 'task',
            source: 'kanban',
            includeContent: true,
        };

        // Add metadata filters
        const metadataFilters: Record<string, any> = {};
        if (filters.status) metadataFilters.status = filters.status;
        if (filters.priority) metadataFilters.priority = filters.priority;
        if (filters.assignee) metadataFilters.assignee = filters.assignee;
        if (filters.labels && filters.labels.length > 0) metadataFilters.labels = { $in: filters.labels };

        if (Object.keys(metadataFilters).length > 0) {
            searchOptions.metadata = metadataFilters;
        }

        const unifiedResults = await this.unifiedClient.search(searchOptions);

        return unifiedResults.results.map((result) => ({
            id: result.content.id,
            title: (result.content.metadata as any)?.title || '',
            description: (result.content.metadata as any)?.description,
            status: (result.content.metadata as any)?.status,
            priority: (result.content.metadata as any)?.priority,
            assignee: (result.content.metadata as any)?.assignee,
            labels: (result.content.metadata as any)?.labels || [],
            dueDate: (result.content.metadata as any)?.due_date
                ? new Date((result.content.metadata as any).due_date)
                : undefined,
            createdAt: new Date(result.content.timestamp),
            updatedAt: new Date((result.content.metadata as any)?.updated_at || result.content.timestamp),
            score: result.score,
            highlights: result.highlights || [],
        }));
    }

    /**
     * Search Kanban boards using the unified API
     */
    async searchBoards(query: string, limit: number = 10): Promise<any[]> {
        const unifiedResults = await this.unifiedClient.search({
            query,
            limit,
            type: 'board',
            source: 'kanban',
            includeContent: true,
        });

        return unifiedResults.results.map((result) => ({
            id: result.content.id,
            name: (result.content.metadata as any)?.name || '',
            description: (result.content.metadata as any)?.description,
            columns: (result.content.metadata as any)?.columns || [],
            createdAt: new Date(result.content.timestamp),
            updatedAt: new Date((result.content.metadata as any)?.updated_at || result.content.timestamp),
            score: result.score,
            highlights: result.highlights || [],
        }));
    }

    /**
     * Get Kanban task by ID using the unified API
     */
    async getTaskById(taskId: string): Promise<any | null> {
        const result = await this.unifiedClient.getById(taskId);

        if (!result || result.type !== 'task' || result.source !== 'kanban') {
            return null;
        }

        return {
            id: result.id,
            title: (result.metadata as any)?.title,
            description: (result.metadata as any)?.description,
            status: (result.metadata as any)?.status,
            priority: (result.metadata as any)?.priority,
            assignee: (result.metadata as any)?.assignee,
            labels: (result.metadata as any)?.labels || [],
            dueDate: (result.metadata as any)?.due_date ? new Date((result.metadata as any).due_date) : undefined,
            createdAt: new Date(result.timestamp),
            updatedAt: new Date((result.metadata as any)?.updated_at || result.timestamp),
            metadata: result.metadata,
        };
    }

    /**
     * Get Kanban board by ID using the unified API
     */
    async getBoardById(boardId: string): Promise<any | null> {
        const result = await this.unifiedClient.getById(boardId);

        if (!result || result.type !== 'board' || result.source !== 'kanban') {
            return null;
        }

        return {
            id: result.id,
            name: (result.metadata as any)?.name,
            description: (result.metadata as any)?.description,
            columns: (result.metadata as any)?.columns || [],
            createdAt: new Date(result.timestamp),
            updatedAt: new Date((result.metadata as any)?.updated_at || result.timestamp),
            metadata: result.metadata,
        };
    }

    /**
     * Get Kanban tasks by status using the unified API
     */
    async getTasksByStatus(status: string, limit: number = 50): Promise<any[]> {
        const searchResults = await this.unifiedClient.search({
            limit,
            type: 'task',
            source: 'kanban',
            metadata: { status },
            includeContent: true,
        });

        return searchResults.results.map((result) => ({
            id: result.content.id,
            title: (result.content.metadata as any)?.title,
            description: (result.content.metadata as any)?.description,
            status: (result.content.metadata as any)?.status,
            priority: (result.content.metadata as any)?.priority,
            assignee: (result.content.metadata as any)?.assignee,
            labels: (result.content.metadata as any)?.labels || [],
            dueDate: (result.content.metadata as any)?.due_date
                ? new Date((result.content.metadata as any).due_date)
                : undefined,
            createdAt: new Date(result.content.timestamp),
            updatedAt: new Date((result.content.metadata as any)?.updated_at || result.content.timestamp),
            score: result.score,
        }));
    }

    /**
     * Get Kanban tasks by assignee using the unified API
     */
    async getTasksByAssignee(assignee: string, limit: number = 50): Promise<any[]> {
        const searchResults = await this.unifiedClient.search({
            limit,
            type: 'task',
            source: 'kanban',
            metadata: { assignee },
            includeContent: true,
        });

        return searchResults.results.map((result) => ({
            id: result.content.id,
            title: (result.content.metadata as any)?.title,
            description: (result.content.metadata as any)?.description,
            status: (result.content.metadata as any)?.status,
            priority: (result.content.metadata as any)?.priority,
            assignee: (result.content.metadata as any)?.assignee,
            labels: (result.content.metadata as any)?.labels || [],
            dueDate: (result.content.metadata as any)?.due_date
                ? new Date((result.content.metadata as any).due_date)
                : undefined,
            createdAt: new Date(result.content.timestamp),
            updatedAt: new Date((result.content.metadata as any)?.updated_at || result.content.timestamp),
            score: result.score,
        }));
    }

    /**
     * Remove Kanban item using the unified API
     */
    async removeItem(itemId: string): Promise<boolean> {
        return await this.unifiedClient.delete(itemId);
    }

    /**
     * Get Kanban indexing statistics using the unified API
     */
    async getStats(): Promise<{
        totalTasks: number;
        totalBoards: number;
        tasksByStatus: Record<string, number>;
        tasksByPriority: Record<string, number>;
        tasksByAssignee: Record<string, number>;
    }> {
        const [tasks, boards] = await Promise.all([
            this.unifiedClient.getByType('task'),
            this.unifiedClient.getByType('board'),
        ]);

        const kanbanTasks = tasks.filter((t) => t.source === 'kanban');
        const kanbanBoards = boards.filter((b) => b.source === 'kanban');

        const tasksByStatus: Record<string, number> = {};
        const tasksByPriority: Record<string, number> = {};
        const tasksByAssignee: Record<string, number> = {};

        for (const task of kanbanTasks) {
            const status = (task.metadata as any)?.status || 'unknown';
            const priority = (task.metadata as any)?.priority || 'unknown';
            const assignee = (task.metadata as any)?.assignee || 'unassigned';

            tasksByStatus[status] = (tasksByStatus[status] || 0) + 1;
            tasksByPriority[priority] = (tasksByPriority[priority] || 0) + 1;
            tasksByAssignee[assignee] = (tasksByAssignee[assignee] || 0) + 1;
        }

        return {
            totalTasks: kanbanTasks.length,
            totalBoards: kanbanBoards.length,
            tasksByStatus,
            tasksByPriority,
            tasksByAssignee,
        };
    }

    /**
     * Migrate existing file-based data to the unified API
     */
    async migrateExistingData(taskFiles: string[], boardFiles: string[]): Promise<KanbanIndexingStats> {
        const startTime = Date.now();
        const stats: KanbanIndexingStats = {
            totalItems: taskFiles.length + boardFiles.length,
            indexedItems: 0,
            skippedItems: 0,
            errors: [],
            duration: 0,
        };

        try {
            const unifiedContents: IndexableContent[] = [];

            // Migrate task files
            for (const filePath of taskFiles) {
                try {
                    const { readFile } = await import('node:fs/promises');
                    const content = await readFile(filePath, 'utf-8');
                    const taskData = JSON.parse(content);

                    const unifiedContent = transformKanbanTask(
                        {
                            id: taskData.id,
                            title: taskData.title,
                            description: taskData.description,
                            status: taskData.status,
                            priority: taskData.priority,
                            assignee: taskData.assignee,
                            labels: taskData.labels,
                            due_date: taskData.dueDate,
                            created_at: taskData.createdAt,
                            updated_at: taskData.updatedAt,
                        },
                        {
                            type: 'task',
                            source: 'kanban',
                            task_id: taskData.id,
                            title: taskData.title,
                            description: taskData.description,
                            status: taskData.status,
                            priority: taskData.priority,
                            assignee: taskData.assignee,
                            labels: taskData.labels,
                            due_date: taskData.dueDate ? new Date(taskData.dueDate).getTime() : undefined,
                            created_at: new Date(taskData.createdAt).getTime(),
                            updated_at: new Date(taskData.updatedAt).getTime(),
                            ...taskData.metadata,
                        },
                    );

                    unifiedContents.push(unifiedContent);
                    stats.indexedItems++;
                } catch (error) {
                    stats.skippedItems++;
                    stats.errors.push(`${filePath}: ${error instanceof Error ? error.message : 'Unknown error'}`);
                }
            }

            // Migrate board files
            for (const filePath of boardFiles) {
                try {
                    const { readFile } = await import('node:fs/promises');
                    const content = await readFile(filePath, 'utf-8');
                    const boardData = JSON.parse(content);

                    const unifiedContent = {
                        id: boardData.id,
                        type: 'board' as const,
                        source: 'kanban' as const,
                        content: boardData.description || boardData.name,
                        timestamp: new Date(boardData.createdAt).getTime(),
                        metadata: {
                            type: 'board' as const,
                            source: 'kanban' as const,
                            board_id: boardData.id,
                            name: boardData.name,
                            description: boardData.description,
                            columns: boardData.columns,
                            created_at: new Date(boardData.createdAt).getTime(),
                            updated_at: new Date(boardData.updatedAt).getTime(),
                            ...boardData.metadata,
                        } as any,
                    };

                    unifiedContents.push(unifiedContent);
                    stats.indexedItems++;
                } catch (error) {
                    stats.skippedItems++;
                    stats.errors.push(`${filePath}: ${error instanceof Error ? error.message : 'Unknown error'}`);
                }
            }

            // Batch index using the unified API
            if (unifiedContents.length > 0) {
                await this.unifiedClient.indexBatch(unifiedContents, {
                    validate: true,
                    batchSize: 100,
                });
            }

            console.log(`[kanban-unified-indexer] Migrated ${stats.indexedItems} items`);
        } catch (error) {
            stats.errors.push(`Migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }

        stats.duration = Date.now() - startTime;
        return stats;
    }
}

/**
 * Factory function to create a unified Kanban indexer
 */
export function createUnifiedKanbanIndexer(unifiedClient: UnifiedIndexingClient): UnifiedKanbanIndexer {
    return new UnifiedKanbanIndexer(unifiedClient);
}

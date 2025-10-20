// SPDX-License-Identifier: GPL-3.0-only
// Background Event Indexing System

/**
 * Background event indexing system for real-time and retrospective event capture
 * Captures OpenCode events, session data, messages, and tool execution
 * Stores everything in dual stores for UI visibility
 */

import { sessionStore, agentTaskStore } from '../index.js';
import { hookManager } from '../hooks/tool-execute-hooks.js';
import type { Event } from '../api/events.js';

export interface EventIndexerConfig {
  /** Enable real-time event capture */
  enableRealTime?: boolean;
  /** Enable retrospective indexing of existing data */
  enableRetrospective?: boolean;
  /** Batch size for processing events */
  batchSize?: number;
  /** Indexing interval in milliseconds */
  indexingInterval?: number;
  /** Maximum events to keep in memory */
  maxMemoryEvents?: number;
  /** Enable batch processing for better performance */
  enableBatchProcessing?: boolean;
  /** Maximum batch size for batch operations */
  maxBatchSize?: number;
  /** Memory cleanup threshold (percentage of maxMemoryEvents) */
  memoryCleanupThreshold?: number;
  /** Enable compression for large event data */
  enableCompression?: boolean;
  /** Maximum event size before compression (bytes) */
  maxEventSize?: number;
  /** Retry configuration for failed operations */
  retryConfig?: {
    maxRetries: number;
    retryDelay: number;
    backoffFactor: number;
  };
}

export interface IndexedEvent extends Event {
  /** Unique identifier for indexed event */
  indexedId: string;
  /** When this event was indexed (vs when it occurred) */
  indexedAt: string;
  /** Event source (opencode, dualstore, retrospective) */
  source: 'opencode' | 'dualstore' | 'retrospective';
  /** Processing status */
  processed: boolean;
  /** Related session data if available */
  sessionData?: any;
  /** Related message data if available */
  messageData?: any;
  /** Tool execution data if available */
  toolData?: any;
}

export interface IndexingStats {
  /** Total events indexed */
  totalIndexed: number;
  /** Events processed in real-time */
  realTimeCount: number;
  /** Events processed retrospectively */
  retrospectiveCount: number;
  /** Current indexing rate (events/second) */
  indexingRate: number;
  /** Last indexing timestamp */
  lastIndexedAt: string;
  /** Error count */
  errorCount: number;
  /** Memory usage */
  memoryUsage: number;
}

/**
 * Background Event Indexer
 *
 * Provides comprehensive event capture and indexing for OpenCode events,
 * session data, messages, and tool execution with dual store persistence.
 */
export class EventIndexer {
  private config: Required<EventIndexerConfig>;
  private isRunning = false;
  private indexingInterval: NodeJS.Timeout | null = null;
  private eventQueue: IndexedEvent[] = [];
  private stats: IndexingStats = {
    totalIndexed: 0,
    realTimeCount: 0,
    retrospectiveCount: 0,
    indexingRate: 0,
    lastIndexedAt: new Date().toISOString(),
    errorCount: 0,
    memoryUsage: 0,
  };
  private processingBatches = new Map<string, Promise<void>>();
  private retryCounts = new Map<string, number>();
  private lastCleanupTime = Date.now();

  constructor(config: EventIndexerConfig = {}) {
    this.config = {
      enableRealTime: true,
      enableRetrospective: true,
      batchSize: 100,
      indexingInterval: 5000, // 5 seconds
      maxMemoryEvents: 10000,
      enableBatchProcessing: true,
      maxBatchSize: 500,
      memoryCleanupThreshold: 0.8, // 80% of maxMemoryEvents
      enableCompression: true,
      maxEventSize: 1024 * 1024, // 1MB
      retryConfig: {
        maxRetries: 3,
        retryDelay: 1000, // 1 second
        backoffFactor: 2,
      },
      ...config,
    };
  }

  /**
   * Start the background event indexing
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      console.warn('EventIndexer is already running');
      return;
    }

    console.log('🚀 Starting EventIndexer with config:', this.config);
    this.isRunning = true;

    try {
      // Set up real-time event capture
      if (this.config.enableRealTime) {
        await this.setupRealTimeCapture();
      }

      // Set up retrospective indexing
      if (this.config.enableRetrospective) {
        await this.setupRetrospectiveIndexing();
      }

      // Start background processing loop
      this.startBackgroundProcessing();

      console.log('✅ EventIndexer started successfully');
    } catch (error) {
      console.error('❌ Failed to start EventIndexer:', error);
      this.isRunning = false;
      throw error;
    }
  }

  /**
   * Stop the background event indexing
   */
  async stop(): Promise<void> {
    if (!this.isRunning) {
      console.warn('EventIndexer is not running');
      return;
    }

    console.log('🛑 Stopping EventIndexer...');
    this.isRunning = false;

    // Clear background processing
    if (this.indexingInterval) {
      clearInterval(this.indexingInterval);
      this.indexingInterval = null;
    }

    // Process remaining events in queue
    await this.processEventQueue();

    console.log('✅ EventIndexer stopped');
    console.log('📊 Final stats:', this.getStats());
  }

  /**
   * Set up real-time event capture using hooks
   */
  private async setupRealTimeCapture(): Promise<void> {
    console.log('📡 Setting up real-time event capture...');

    // Hook into tool execution for real-time capture
    hookManager.registerHook({
      id: 'realtime-tool-capture',
      type: 'before',
      hook: async (context: any) => {
        await this.captureToolExecution(context, 'before');
        return context.args;
      },
      tools: ['*'],
      priority: 1,
      timeout: 5000,
    });

    hookManager.registerHook({
      id: 'realtime-tool-capture-after',
      type: 'after',
      hook: async (context: any) => {
        await this.captureToolExecution(context, 'after');
        return context.result;
      },
      tools: ['*'],
      priority: 1,
      timeout: 5000,
    });

    console.log('✅ Real-time event capture configured');
  }

  /**
   * Set up retrospective indexing of existing data
   */
  private async setupRetrospectiveIndexing(): Promise<void> {
    console.log('📚 Setting up retrospective indexing...');

    try {
      // Index existing sessions from dual store
      await this.indexExistingSessions();

      // Index existing agent tasks from dual store
      await this.indexExistingAgentTasks();

      // Index any existing events
      await this.indexExistingEvents();

      console.log('✅ Retrospective indexing completed');
    } catch (error) {
      console.error('❌ Retrospective indexing failed:', error);
      throw error;
    }
  }

  /**
   * Start background processing loop
   */
  private startBackgroundProcessing(): void {
    console.log(`⚡ Starting background processing (interval: ${this.config.indexingInterval}ms)`);

    this.indexingInterval = setInterval(async () => {
      if (this.isRunning) {
        await this.processEventQueue();
        await this.updateStats();
      }
    }, this.config.indexingInterval);
  }

  /**
   * Capture tool execution events
   */
  private async captureToolExecution(context: any, phase: 'before' | 'after'): Promise<void> {
    if (!this.isRunning) return;

    try {
      const event: IndexedEvent = {
        id: `tool-${phase}-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
        type: `tool.execute.${phase}`,
        timestamp: new Date().toISOString(),
        sessionId: context.metadata?.sessionId,
        properties: {
          toolName: context.metadata?.originalTool || context.toolName,
          phase,
          args: phase === 'before' ? context.args : undefined,
          result: phase === 'after' ? context.result?.result : undefined,
          executionTime: context.result?.executionTime,
          success: context.result?.success,
        },
        indexedId: `indexed-tool-${phase}-${Date.now()}`,
        indexedAt: new Date().toISOString(),
        source: 'opencode',
        processed: false,
        toolData: {
          toolName: context.metadata?.originalTool || context.toolName,
          phase,
          args: context.args,
          result: context.result,
        },
      };

      this.queueEvent(event);
    } catch (error) {
      console.error('❌ Failed to capture tool execution:', error);
      this.stats.errorCount++;
    }
  }

  /**
   * Index existing sessions from dual store
   */
  private async indexExistingSessions(): Promise<void> {
    console.log('📂 Indexing existing sessions...');

    try {
      const sessions = await sessionStore.getMostRecent(1000);

      for (const session of sessions) {
        let sessionData;
        try {
          sessionData = JSON.parse(session.text);
        } catch (error) {
          // Handle legacy plain text format
          const text = session.text;
          const sessionMatch = text.match(/Session:\s*(\w+)/);
          sessionData = {
            id: sessionMatch?.[1] || session.id || 'unknown',
            title: `Session ${sessionMatch?.[1] || 'unknown'}`,
            createdAt: session.timestamp || new Date().toISOString(),
          };
        }
        const event: IndexedEvent = {
          id: `session-${sessionData.id}`,
          type: 'session.indexed',
          timestamp: sessionData.createdAt || session.timestamp,
          sessionId: sessionData.id,
          properties: {
            sessionData,
            action: 'retrospective_index',
          },
          indexedId: `indexed-session-${sessionData.id}`,
          indexedAt: new Date().toISOString(),
          source: 'retrospective',
          processed: false,
          sessionData,
        };

        this.queueEvent(event);
      }

      console.log(`✅ Indexed ${sessions.length} existing sessions`);
    } catch (error) {
      console.error('❌ Failed to index existing sessions:', error);
      this.stats.errorCount++;
    }
  }

  /**
   * Index existing agent tasks from dual store
   */
  private async indexExistingAgentTasks(): Promise<void> {
    console.log('📋 Indexing existing agent tasks...');

    try {
      const tasks = await agentTaskStore.getMostRecent(1000);

      for (const task of tasks) {
        const taskData = JSON.parse(task.text);
        const event: IndexedEvent = {
          id: `task-${taskData.id}`,
          type: 'agent.task.indexed',
          timestamp: taskData.createdAt || task.timestamp,
          sessionId: taskData.sessionId,
          properties: {
            taskData,
            action: 'retrospective_index',
          },
          indexedId: `indexed-task-${taskData.id}`,
          indexedAt: new Date().toISOString(),
          source: 'retrospective',
          processed: false,
          toolData: taskData,
        };

        this.queueEvent(event);
      }

      console.log(`✅ Indexed ${tasks.length} existing agent tasks`);
    } catch (error) {
      console.error('❌ Failed to index existing agent tasks:', error);
      this.stats.errorCount++;
    }
  }

  /**
   * Index existing events from dual store
   */
  private async indexExistingEvents(): Promise<void> {
    console.log('📅 Indexing existing events...');

    try {
      const existingEvents = await sessionStore.getMostRecent(1000);
      const eventEntries = existingEvents.filter(
        (entry) => entry.id && entry.id.startsWith('event:'),
      );

      for (const entry of eventEntries) {
        const eventData = JSON.parse(entry.text);
        const event: IndexedEvent = {
          ...eventData,
          indexedId: `indexed-event-${eventData.id}`,
          indexedAt: new Date().toISOString(),
          source: 'dualstore',
          processed: false,
        };

        this.queueEvent(event);
      }

      console.log(`✅ Indexed ${eventEntries.length} existing events`);
    } catch (error) {
      console.error('❌ Failed to index existing events:', error);
      this.stats.errorCount++;
    }
  }

  /**
   * Queue an event for processing
   */
  private queueEvent(event: IndexedEvent): void {
    // Compress large events if enabled
    if (this.config.enableCompression && this.shouldCompressEvent(event)) {
      event = this.compressEvent(event);
    }

    this.eventQueue.push(event);

    // Enhanced memory management with cleanup threshold
    const cleanupThreshold = Math.floor(
      this.config.maxMemoryEvents * this.config.memoryCleanupThreshold,
    );
    if (this.eventQueue.length > cleanupThreshold) {
      this.performMemoryCleanup();
    }

    // Hard limit protection
    if (this.eventQueue.length > this.config.maxMemoryEvents) {
      this.eventQueue = this.eventQueue.slice(-this.config.maxMemoryEvents);
      console.warn(
        `⚠️ Event queue exceeded max size, truncated to ${this.config.maxMemoryEvents} events`,
      );
    }

    this.stats.memoryUsage = this.eventQueue.length;
  }

  /**
   * Check if event should be compressed
   */
  private shouldCompressEvent(event: IndexedEvent): boolean {
    const eventSize = JSON.stringify(event).length;
    return eventSize > this.config.maxEventSize;
  }

  /**
   * Compress event data to reduce memory usage
   */
  private compressEvent(event: IndexedEvent): IndexedEvent {
    const compressed = { ...event };

    // Compress large properties
    if (compressed.properties && JSON.stringify(compressed.properties).length > 1000) {
      compressed.properties = {
        _compressed: true,
        _originalSize: JSON.stringify(compressed.properties).length,
        _summary: this.createSummary(compressed.properties),
      };
    }

    // Compress large session data
    if (compressed.sessionData && JSON.stringify(compressed.sessionData).length > 1000) {
      compressed.sessionData = {
        _compressed: true,
        _originalSize: JSON.stringify(compressed.sessionData).length,
        _summary: this.createSummary(compressed.sessionData),
      };
    }

    // Compress large tool data
    if (compressed.toolData && JSON.stringify(compressed.toolData).length > 1000) {
      compressed.toolData = {
        _compressed: true,
        _originalSize: JSON.stringify(compressed.toolData).length,
        _summary: this.createSummary(compressed.toolData),
      };
    }

    return compressed;
  }

  /**
   * Create a summary of large objects
   */
  private createSummary(obj: any): string {
    if (typeof obj !== 'object' || obj === null) {
      return String(obj);
    }

    const keys = Object.keys(obj);
    const summary = {
      type: obj.constructor?.name || typeof obj,
      keys: keys.slice(0, 10), // First 10 keys
      totalKeys: keys.length,
      size: JSON.stringify(obj).length,
    };

    return JSON.stringify(summary);
  }

  /**
   * Perform memory cleanup of old events
   */
  private performMemoryCleanup(): void {
    const now = Date.now();
    const cleanupInterval = 60000; // 1 minute between cleanups

    if (now - this.lastCleanupTime < cleanupInterval) {
      return; // Don't clean up too frequently
    }

    console.log('🧹 Performing memory cleanup...');

    // Remove oldest events, keeping newer ones
    const removeCount = Math.floor(this.eventQueue.length * 0.2); // Remove 20%
    this.eventQueue = this.eventQueue.slice(removeCount);

    // Clean up retry counts for old events
    const oldRetryKeys = Array.from(this.retryCounts.keys()).filter((key) => {
      const eventTime = parseInt(key.split('-')[1] || '0');
      return now - eventTime > 3600000; // Remove entries older than 1 hour
    });

    oldRetryKeys.forEach((key) => this.retryCounts.delete(key));

    this.lastCleanupTime = now;
    console.log(`✅ Memory cleanup completed, removed ${removeCount} events`);
  }

  /**
   * Process the event queue
   */
  private async processEventQueue(): Promise<void> {
    if (this.eventQueue.length === 0) return;

    const batchSize = this.config.enableBatchProcessing
      ? Math.min(this.config.maxBatchSize, this.eventQueue.length)
      : this.config.batchSize;

    const batch = this.eventQueue.splice(0, batchSize);
    const batchId = `batch-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

    try {
      if (this.config.enableBatchProcessing) {
        await this.processBatchWithRetry(batchId, batch);
      } else {
        await Promise.all(batch.map((event) => this.processEventWithRetry(event)));
      }

      this.stats.totalIndexed += batch.length;
      this.stats.realTimeCount += batch.filter((e) => e.source === 'opencode').length;
      this.stats.retrospectiveCount += batch.filter((e) => e.source === 'retrospective').length;
    } catch (error) {
      console.error('❌ Failed to process event batch:', error);
      this.stats.errorCount++;

      // Return failed events to queue for retry
      this.eventQueue.unshift(...batch);
    }
  }

  /**
   * Process a batch of events with retry logic
   */
  private async processBatchWithRetry(batchId: string, batch: IndexedEvent[]): Promise<void> {
    if (this.processingBatches.has(batchId)) {
      return; // Batch already being processed
    }

    const processingPromise = this.executeBatchWithRetry(batchId, batch);
    this.processingBatches.set(batchId, processingPromise);

    try {
      await processingPromise;
    } finally {
      this.processingBatches.delete(batchId);
    }
  }

  /**
   * Execute batch processing with retry logic
   */
  private async executeBatchWithRetry(batchId: string, batch: IndexedEvent[]): Promise<void> {
    let attempt = 0;
    let lastError: Error | null = null;

    while (attempt < this.config.retryConfig.maxRetries) {
      try {
        await this.processBatch(batch);
        return; // Success
      } catch (error) {
        lastError = error as Error;
        attempt++;

        if (attempt < this.config.retryConfig.maxRetries) {
          const delay =
            this.config.retryConfig.retryDelay *
            Math.pow(this.config.retryConfig.backoffFactor, attempt - 1);

          console.warn(
            `⚠️ Batch ${batchId} failed (attempt ${attempt}), retrying in ${delay}ms...`,
          );
          await this.sleep(delay);
        }
      }
    }

    throw lastError || new Error(`Batch ${batchId} failed after ${attempt} attempts`);
  }

  /**
   * Process a batch of events efficiently
   */
  private async processBatch(batch: IndexedEvent[]): Promise<void> {
    // Group events by type for efficient processing
    const eventGroups = this.groupEventsByType(batch);

    // Process each group in parallel
    await Promise.all(
      Object.entries(eventGroups).map(([type, events]) => this.processEventGroup(type, events)),
    );
  }

  /**
   * Group events by type for batch processing
   */
  private groupEventsByType(batch: IndexedEvent[]): Record<string, IndexedEvent[]> {
    const groups: Record<string, IndexedEvent[]> = {};

    for (const event of batch) {
      const type = event.type || 'unknown';
      if (!groups[type]) {
        groups[type] = [];
      }
      groups[type].push(event);
    }

    return groups;
  }

  /**
   * Process a group of events of the same type
   */
  private async processEventGroup(type: string, events: IndexedEvent[]): Promise<void> {
    switch (type) {
      case 'session.indexed':
        await this.processSessionEvents(events);
        break;
      case 'agent.task.indexed':
        await this.processTaskEvents(events);
        break;
      case 'tool.execute.before':
      case 'tool.execute.after':
        await this.processToolEvents(events);
        break;
      default:
        await this.processGenericEvents(events);
    }
  }

  /**
   * Process session events in batch
   */
  private async processSessionEvents(events: IndexedEvent[]): Promise<void> {
    for (const event of events) {
      await sessionStore.insert({
        id: `session:${event.sessionId}`,
        text: JSON.stringify(event.sessionData),
        timestamp: new Date().toISOString(),
        metadata: {
          type: 'session_data',
          sessionId: event.sessionId,
          batchProcessed: true,
        },
      });
    }
  }

  /**
   * Process task events in batch
   */
  private async processTaskEvents(events: IndexedEvent[]): Promise<void> {
    for (const event of events) {
      await agentTaskStore.insert({
        id: `task:${event.indexedId}`,
        text: JSON.stringify(event.toolData),
        timestamp: new Date().toISOString(),
        metadata: {
          type: 'tool_data',
          eventId: event.indexedId,
          batchProcessed: true,
        },
      });
    }
  }

  /**
   * Process tool events in batch
   */
  private async processToolEvents(events: IndexedEvent[]): Promise<void> {
    for (const event of events) {
      await sessionStore.insert({
        id: `event:${event.indexedId}`,
        text: JSON.stringify({
          ...event,
          processed: true,
        }),
        timestamp: new Date().toISOString(),
        metadata: {
          type: 'indexed_event',
          originalEventId: event.indexedId,
          sessionId: event.sessionId,
          batchProcessed: true,
        },
      });
    }
  }

  /**
   * Process generic events in batch
   */
  private async processGenericEvents(events: IndexedEvent[]): Promise<void> {
    for (const event of events) {
      await sessionStore.insert({
        id: `event:${event.indexedId}`,
        text: JSON.stringify({
          ...event,
          processed: true,
        }),
        timestamp: new Date().toISOString(),
        metadata: {
          type: 'indexed_event',
          originalEventId: event.indexedId,
          sessionId: event.sessionId,
          batchProcessed: true,
        },
      });
    }
  }

  /**
   * Process a single event with retry logic
   */
  private async processEventWithRetry(event: IndexedEvent): Promise<void> {
    const eventKey = `${event.indexedId}-${event.timestamp}`;
    let retryCount = this.retryCounts.get(eventKey) || 0;

    if (retryCount >= this.config.retryConfig.maxRetries) {
      console.warn(`⚠️ Event ${event.indexedId} exceeded max retries, skipping`);
      return;
    }

    try {
      await this.processEvent(event);
      this.retryCounts.delete(eventKey); // Clear retry count on success
    } catch (error) {
      retryCount++;
      this.retryCounts.set(eventKey, retryCount);

      if (retryCount < this.config.retryConfig.maxRetries) {
        const delay =
          this.config.retryConfig.retryDelay *
          Math.pow(this.config.retryConfig.backoffFactor, retryCount - 1);

        console.warn(
          `⚠️ Event ${event.indexedId} failed (attempt ${retryCount}), retrying in ${delay}ms...`,
        );
        await this.sleep(delay);
        await this.processEventWithRetry(event); // Recursive retry
      } else {
        throw error;
      }
    }
  }

  /**
   * Sleep utility for retry delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Process a single event
   */
  private async processEvent(event: IndexedEvent): Promise<void> {
    try {
      // Store event in dual store with event: prefix
      const eventId = `event:${event.indexedId}`;
      await sessionStore.insert({
        id: eventId,
        text: JSON.stringify({
          ...event,
          processed: true,
        }),
        timestamp: new Date().toISOString(),
        metadata: {
          type: 'indexed_event',
          originalEventId: event.indexedId,
          sessionId: event.sessionId,
        },
      });

      // Store additional data if available
      if (event.sessionData) {
        await sessionStore.insert({
          id: `session:${event.sessionId}`,
          text: JSON.stringify(event.sessionData),
          timestamp: new Date().toISOString(),
          metadata: {
            type: 'session_data',
            sessionId: event.sessionId,
          },
        });
      }

      if (event.toolData) {
        await agentTaskStore.insert({
          id: `tool:${event.indexedId}`,
          text: JSON.stringify(event.toolData),
          timestamp: new Date().toISOString(),
          metadata: {
            type: 'tool_data',
            eventId: event.indexedId,
          },
        });
      }

      console.log(`📝 Processed event: ${event.type} (${event.indexedId})`);
    } catch (error) {
      console.error(`❌ Failed to process event ${event.indexedId}:`, error);
      this.stats.errorCount++;
    }
  }

  /**
   * Update indexing statistics
   */
  private async updateStats(): Promise<void> {
    const now = new Date();
    const lastIndexed = new Date(this.stats.lastIndexedAt);
    const timeDiff = (now.getTime() - lastIndexed.getTime()) / 1000; // seconds

    this.stats.indexingRate = timeDiff > 0 ? this.eventQueue.length / timeDiff : 0;
    this.stats.lastIndexedAt = now.toISOString();
    this.stats.memoryUsage = this.eventQueue.length;

    // Store stats in dual store for monitoring
    try {
      await sessionStore.insert({
        id: 'event-indexer-stats',
        text: JSON.stringify(this.stats),
        timestamp: new Date().toISOString(),
        metadata: {
          type: 'indexer_stats',
          lastUpdated: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.warn('Failed to store indexer stats:', error);
    }
  }

  /**
   * Get current indexing statistics
   */
  getStats(): IndexingStats {
    return { ...this.stats };
  }

  /**
   * Get recent events from the indexed store
   */
  async getRecentEvents(limit: number = 100): Promise<IndexedEvent[]> {
    try {
      const entries = await sessionStore.getMostRecent(limit * 2); // Get more to filter
      const events = entries
        .filter((entry) => entry.id && entry.id.startsWith('event:'))
        .map((entry) => ({
          ...JSON.parse(entry.text),
          _id: entry.id,
          _timestamp: entry.timestamp,
        }))
        .sort((a, b) => new Date(b._timestamp).getTime() - new Date(a._timestamp).getTime())
        .slice(0, limit);

      return events;
    } catch (error) {
      console.error('Failed to get recent events:', error);
      return [];
    }
  }

  /**
   * Search indexed events
   */
  async searchEvents(query: string, limit: number = 100): Promise<IndexedEvent[]> {
    try {
      const entries = await sessionStore.getMostRecent(1000); // Search larger set
      const events = entries
        .filter((entry) => entry.id && entry.id.startsWith('event:'))
        .map((entry) => ({
          ...JSON.parse(entry.text),
          _id: entry.id,
          _timestamp: entry.timestamp,
        }))
        .filter(
          (event) =>
            event.type?.toLowerCase().includes(query.toLowerCase()) ||
            event.sessionId?.toLowerCase().includes(query.toLowerCase()) ||
            JSON.stringify(event.properties).toLowerCase().includes(query.toLowerCase()),
        )
        .sort((a, b) => new Date(b._timestamp).getTime() - new Date(a._timestamp).getTime())
        .slice(0, limit);

      return events;
    } catch (error) {
      console.error('Failed to search events:', error);
      return [];
    }
  }
}

/**
 * Global event indexer instance
 */
export const eventIndexer = new EventIndexer();

/**
 * Helper function to start event indexing with default configuration
 */
export async function startEventIndexing(_config?: EventIndexerConfig): Promise<void> {
  await eventIndexer.start();
}

/**
 * Helper function to stop event indexing
 */
export async function stopEventIndexing(): Promise<void> {
  await eventIndexer.stop();
}

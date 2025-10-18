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

  constructor(config: EventIndexerConfig = {}) {
    this.config = {
      enableRealTime: true,
      enableRetrospective: true,
      batchSize: 100,
      indexingInterval: 5000, // 5 seconds
      maxMemoryEvents: 10000,
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
    hookManager.registerHook(
      'realtime-tool-capture',
      'before',
      async (context) => {
        await this.captureToolExecution(context, 'before');
        return context.args;
      },
      {
        tools: ['*'],
        priority: 1,
        timeout: 5000,
      },
    );

    hookManager.registerHook(
      'realtime-tool-capture-after',
      'after',
      async (context) => {
        await this.captureToolExecution(context, 'after');
        return context.result;
      },
      {
        tools: ['*'],
        priority: 1,
        timeout: 5000,
      },
    );

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
        const sessionData = JSON.parse(session.text);
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
    this.eventQueue.push(event);

    // Maintain memory limit
    if (this.eventQueue.length > this.config.maxMemoryEvents) {
      this.eventQueue = this.eventQueue.slice(-this.config.maxMemoryEvents);
    }

    this.stats.memoryUsage = this.eventQueue.length;
  }

  /**
   * Process the event queue
   */
  private async processEventQueue(): Promise<void> {
    if (this.eventQueue.length === 0) return;

    const batch = this.eventQueue.splice(0, this.config.batchSize);

    try {
      await Promise.all(batch.map((event) => this.processEvent(event)));
      this.stats.totalIndexed += batch.length;
      this.stats.realTimeCount += batch.filter((e) => e.source === 'opencode').length;
      this.stats.retrospectiveCount += batch.filter((e) => e.source === 'retrospective').length;
    } catch (error) {
      console.error('❌ Failed to process event batch:', error);
      this.stats.errorCount++;
    }
  }

  /**
   * Process a single event
   */
  private async processEvent(event: IndexedEvent): Promise<void> {
    try {
      // Store event in dual store with event: prefix
      const eventId = `event:${event.indexedId}`;
      await sessionStore.set(
        eventId,
        JSON.stringify({
          ...event,
          processed: true,
        }),
      );

      // Store additional data if available
      if (event.sessionData) {
        await sessionStore.set(`session:${event.sessionId}`, JSON.stringify(event.sessionData));
      }

      if (event.toolData) {
        await agentTaskStore.set(`tool:${event.indexedId}`, JSON.stringify(event.toolData));
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
      await sessionStore.set('event-indexer-stats', JSON.stringify(this.stats));
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
export async function startEventIndexing(config?: EventIndexerConfig): Promise<void> {
  await eventIndexer.start();
}

/**
 * Helper function to stop event indexing
 */
export async function stopEventIndexing(): Promise<void> {
  await eventIndexer.stop();
}

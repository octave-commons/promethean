/**
 * Event Watcher Service
 *
 * Provides real-time event streaming and projection into local database.
 * Handles connection management, event ordering, and error recovery.
 */

import { createOpencodeClient } from '@opencode-ai/sdk';
import { sessionStore, agentTaskStore } from '../index.js';

export type EventWatcherConfig = {
  /** Indexing interval in milliseconds */
  indexingInterval?: number;
  /** Event batch size for processing */
  batchSize?: number;
  /** Enable retrospective indexing of existing data */
  enableRetrospective?: boolean;
  /** Enable verbose logging */
  verbose?: boolean;
  /** Maximum retry attempts for failed operations */
  maxRetries?: number;
  /** Retry delay in milliseconds */
  retryDelay?: number;
};

export type OpenCodeEvent = {
  id: string;
  type: string;
  timestamp: string;
  sessionId?: string;
  properties?: Record<string, unknown>;
  data?: unknown;
};

export type ProjectedEvent = OpenCodeEvent & {
  projectedAt: string;
  source: 'realtime' | 'retrospective';
  processed: boolean;
  retryCount?: number;
};

export type EventWatcherStats = {
  totalEventsProcessed: number;
  realTimeEvents: number;
  retrospectiveEvents: number;
  errors: number;
  lastEventTime: string;
  uptime: number;
  indexingRate: number;
};

/**
 * Event Watcher Service
 *
 * Connects to OpenCode event stream and projects events into local database
 * for fast querying and offline capability.
 */
export class EventWatcherService {
  private config: Required<EventWatcherConfig>;
  private isRunning = false;
  private startTime = 0;
  private client: any = null;
  private eventStream: AsyncGenerator<unknown, void, unknown> | null = null;
  private processingQueue: ProjectedEvent[] = [];
  private stats: EventWatcherStats = {
    totalEventsProcessed: 0,
    realTimeEvents: 0,
    retrospectiveEvents: 0,
    errors: 0,
    lastEventTime: new Date().toISOString(),
    uptime: 0,
    indexingRate: 0,
  };
  private retryCount = new Map<string, number>();
  private processingTimer: NodeJS.Timeout | null = null;

  constructor(config: EventWatcherConfig = {}) {
    this.config = {
      indexingInterval: 5000,
      batchSize: 100,
      enableRetrospective: true,
      verbose: false,
      maxRetries: 3,
      retryDelay: 1000,
      ...config,
    };
  }

  /**
   * Start the event watcher service
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      throw new Error('EventWatcherService is already running');
    }

    this.log('🚀 Starting Event Watcher Service...');
    this.startTime = Date.now();
    this.isRunning = true;

    try {
      // Initialize OpenCode client
      await this.initializeClient();

      // Start retrospective indexing if enabled
      if (this.config.enableRetrospective) {
        await this.performRetrospectiveIndexing();
      }

      // Start real-time event streaming
      await this.startRealTimeStreaming();

      // Start event processing loop
      this.startProcessingLoop();

      this.log('✅ Event Watcher Service started successfully');
    } catch (error) {
      this.log('❌ Failed to start Event Watcher Service:', 'error');
      this.isRunning = false;
      throw error;
    }
  }

  /**
   * Stop the event watcher service
   */
  async stop(): Promise<void> {
    if (!this.isRunning) {
      return;
    }

    this.log('🛑 Stopping Event Watcher Service...');
    this.isRunning = false;

    // Stop processing timer
    if (this.processingTimer) {
      clearInterval(this.processingTimer);
      this.processingTimer = null;
    }

    // Close event stream
    if (this.eventStream) {
      try {
        await this.eventStream.return?.();
      } catch (error) {
        this.log('Warning: Failed to close event stream gracefully:', 'warn');
      }
      this.eventStream = null;
    }

    // Process remaining events
    await this.processEventQueue();

    // Update final stats
    this.updateStats();

    this.log('✅ Event Watcher Service stopped');
    this.log(`📊 Final stats: ${JSON.stringify(this.stats, null, 2)}`);
  }

  /**
   * Get current service statistics
   */
  getStats(): EventWatcherStats {
    this.updateStats();
    return { ...this.stats };
  }

  /**
   * Initialize OpenCode client
   */
  private async initializeClient(): Promise<void> {
    const baseURL = process.env.OPENCODE_SERVER_URL || 'http://localhost:4096';
    const authHeader = process.env.OPENCODE_AUTH_TOKEN
      ? { Authorization: `Bearer ${process.env.OPENCODE_AUTH_TOKEN}` }
      : undefined;

    this.client = createOpencodeClient({
      baseUrl: baseURL,
      headers: authHeader,
    });

    this.log(`📡 Connected to OpenCode server at ${baseURL}`);
  }

  /**
   * Perform retrospective indexing of existing data
   */
  private async performRetrospectiveIndexing(): Promise<void> {
    this.log('📚 Starting retrospective indexing...');

    try {
      // Index existing sessions
      await this.indexExistingSessions();

      // Index existing agent tasks
      await this.indexExistingAgentTasks();

      this.log('✅ Retrospective indexing completed');
    } catch (error) {
      this.log('❌ Retrospective indexing failed:', 'error');
      throw error;
    }
  }

  /**
   * Index existing sessions from local store
   */
  private async indexExistingSessions(): Promise<void> {
    try {
      const sessions = await sessionStore.getMostRecent(1000);
      let indexedCount = 0;

      for (const session of sessions) {
        const projectedEvent: ProjectedEvent = {
          id: `session-${session.id}`,
          type: 'session.indexed',
          timestamp: new Date().toISOString(),
          projectedAt: new Date().toISOString(),
          source: 'retrospective',
          processed: false,
          sessionId: session.id,
          properties: {
            action: 'retrospective_index',
            sessionData: session.text,
          },
        };

        this.queueEvent(projectedEvent);
        indexedCount++;
      }

      this.stats.retrospectiveEvents += indexedCount;
      this.log(`📂 Indexed ${indexedCount} existing sessions`);
    } catch (error) {
      this.log(`Failed to index existing sessions: ${error}`, 'error');
      this.stats.errors++;
    }
  }

  /**
   * Index existing agent tasks from local store
   */
  private async indexExistingAgentTasks(): Promise<void> {
    try {
      const tasks = await agentTaskStore.getMostRecent(1000);
      let indexedCount = 0;

      for (const task of tasks) {
        const projectedEvent: ProjectedEvent = {
          id: `task-${task.id}`,
          type: 'agent.task.indexed',
          timestamp: task.timestamp,
          projectedAt: new Date().toISOString(),
          source: 'retrospective',
          processed: false,
          sessionId: task.id,
          properties: {
            action: 'retrospective_index',
            taskData: task.text,
          },
        };

        this.queueEvent(projectedEvent);
        indexedCount++;
      }

      this.stats.retrospectiveEvents += indexedCount;
      this.log(`📋 Indexed ${indexedCount} existing agent tasks`);
    } catch (error) {
      this.log(`Failed to index existing agent tasks: ${error}`, 'error');
      this.stats.errors++;
    }
  }

  /**
   * Start real-time event streaming from OpenCode
   */
  private async startRealTimeStreaming(): Promise<void> {
    this.log('📡 Starting real-time event streaming...');

    try {
      this.eventStream = await this.client.event.list();

      // Process events in real-time
      (async () => {
        try {
          for await (const eventResponse of this.eventStream) {
            if (!this.isRunning) break;

            const response = eventResponse as any;
            const eventData = response?.data || response;
            if (eventData) {
              await this.processRealTimeEvent(eventData);
            }
          }
        } catch (error) {
          this.log(`Real-time streaming error: ${error}`, 'error');
          this.stats.errors++;

          // Attempt to restart streaming after delay
          if (this.isRunning) {
            setTimeout(() => {
              this.startRealTimeStreaming().catch((err) => {
                this.log(`Failed to restart streaming: ${err}`, 'error');
              });
            }, this.config.retryDelay);
          }
        }
      })();

      this.log('✅ Real-time event streaming started');
    } catch (error) {
      this.log(`Failed to start real-time streaming: ${error}`, 'error');
      throw error;
    }
  }

  /**
   * Process a real-time event from OpenCode
   */
  private async processRealTimeEvent(eventData: unknown): Promise<void> {
    try {
      const event: OpenCodeEvent = this.normalizeEvent(eventData);

      const projectedEvent: ProjectedEvent = {
        ...event,
        projectedAt: new Date().toISOString(),
        source: 'realtime',
        processed: false,
      };

      this.queueEvent(projectedEvent);
      this.stats.realTimeEvents++;
      this.stats.lastEventTime = event.timestamp;
    } catch (error) {
      this.log(`Failed to process real-time event: ${error}`, 'error');
      this.stats.errors++;
    }
  }

  /**
   * Normalize event data to standard format
   */
  private normalizeEvent(eventData: unknown): OpenCodeEvent {
    if (typeof eventData === 'object' && eventData !== null) {
      const event = eventData as Record<string, unknown>;
      return {
        id: String(
          event.id || `event-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
        ),
        type: String(event.type || 'unknown'),
        timestamp: String(event.timestamp || new Date().toISOString()),
        sessionId: event.sessionId ? String(event.sessionId) : undefined,
        properties: (event.properties as Record<string, unknown>) || {},
        data: event.data,
      };
    }

    // Fallback for non-object events
    return {
      id: `event-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
      type: 'raw',
      timestamp: new Date().toISOString(),
      properties: { data: eventData },
    };
  }

  /**
   * Start the event processing loop
   */
  private startProcessingLoop(): void {
    this.processingTimer = setInterval(async () => {
      if (this.isRunning) {
        await this.processEventQueue();
        this.updateStats();
      }
    }, this.config.indexingInterval);

    this.log(`⚡ Started processing loop (interval: ${this.config.indexingInterval}ms)`);
  }

  /**
   * Queue an event for processing
   */
  private queueEvent(event: ProjectedEvent): void {
    this.processingQueue.push(event);

    // Prevent memory leaks by limiting queue size
    const maxQueueSize = 10000;
    if (this.processingQueue.length > maxQueueSize) {
      const excess = this.processingQueue.length - maxQueueSize;
      this.processingQueue.splice(0, excess);
      this.log(`⚠️ Event queue exceeded max size, dropped ${excess} events`, 'warn');
    }
  }

  /**
   * Process the event queue
   */
  private async processEventQueue(): Promise<void> {
    if (this.processingQueue.length === 0) return;

    const batchSize = Math.min(this.config.batchSize, this.processingQueue.length);
    const batch = this.processingQueue.splice(0, batchSize);

    this.log(`🔄 Processing batch of ${batch.length} events`);

    for (const event of batch) {
      await this.processEventWithRetry(event);
    }

    this.stats.totalEventsProcessed += batch.length;
  }

  /**
   * Process a single event with retry logic
   */
  private async processEventWithRetry(event: ProjectedEvent): Promise<void> {
    const eventKey = `${event.id}-${event.timestamp}`;
    const currentRetries = this.retryCount.get(eventKey) || 0;

    if (currentRetries >= this.config.maxRetries) {
      this.log(`⚠️ Event ${event.id} exceeded max retries, skipping`, 'warn');
      this.retryCount.delete(eventKey);
      return;
    }

    try {
      await this.processEvent(event);
      this.retryCount.delete(eventKey);
    } catch (error) {
      this.retryCount.set(eventKey, currentRetries + 1);

      if (currentRetries + 1 < this.config.maxRetries) {
        const delay = this.config.retryDelay * Math.pow(2, currentRetries);
        this.log(
          `Event ${event.id} failed (attempt ${currentRetries + 1}), retrying in ${delay}ms`,
          'warn',
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
        await this.processEventWithRetry(event);
      } else {
        this.log(
          `Event ${event.id} failed after ${this.config.maxRetries} attempts: ${error}`,
          'error',
        );
        this.stats.errors++;
      }
    }
  }

  /**
   * Process a single event into the database
   */
  private async processEvent(event: ProjectedEvent): Promise<void> {
    try {
      // Store event in session store with event: prefix
      await sessionStore.insert({
        id: `event:${event.id}`,
        text: JSON.stringify({
          ...event,
          processed: true,
        }),
        timestamp: Date.now(),
        metadata: {
          type: 'projected_event',
          source: event.source,
          sessionId: event.sessionId,
          originalEventId: event.id,
        },
      });

      // Store related data if available
      if (event.sessionId && event.type.includes('session')) {
        await this.updateSessionProjection(event);
      }

      if (event.type.includes('agent.task')) {
        await this.updateTaskProjection(event);
      }

      this.log(`📝 Processed event: ${event.type} (${event.id})`);
    } catch (error) {
      this.log(`Failed to process event ${event.id}: ${error}`, 'error');
      throw error;
    }
  }

  /**
   * Update session projection based on event
   */
  private async updateSessionProjection(event: ProjectedEvent): Promise<void> {
    if (!event.sessionId) return;

    try {
      // Update session metadata
      try {
        const existingSession = await sessionStore.get(`session:${event.sessionId}`);

        if (existingSession) {
          const sessionData = JSON.parse(existingSession.text);
          const updatedSessionData = {
            ...sessionData,
            lastActivityTime: event.timestamp,
            updatedAt: new Date().toISOString(),
          };

          await sessionStore.insert({
            id: `session:${event.sessionId}`,
            text: JSON.stringify(updatedSessionData),
            timestamp: Date.now(), // Use current time as update timestamp
            metadata: {
              ...existingSession.metadata,
              lastUpdated: new Date().toISOString(),
            },
          });
        }
      } catch (error) {
        this.log(`Failed to update session projection for ${event.sessionId}: ${error}`, 'warn');
      }
    } catch (error) {
      this.log(`Failed to update session projection for ${event.sessionId}: ${error}`, 'warn');
    }
  }

  /**
   * Update task projection based on event
   */
  private async updateTaskProjection(event: ProjectedEvent): Promise<void> {
    if (!event.sessionId) return;

    try {
      // Update agent task metadata
      try {
        const existingTask = await agentTaskStore.get(`task:${event.sessionId}`);

        if (existingTask) {
          const taskData = JSON.parse(existingTask.text);
          const updatedTaskData = {
            ...taskData,
            lastActivityTime: event.timestamp,
            updatedAt: new Date().toISOString(),
          };

          await agentTaskStore.insert({
            id: `task:${event.sessionId}`,
            text: JSON.stringify(updatedTaskData),
            timestamp: Date.now(), // Use current time as update timestamp
            metadata: {
              ...existingTask.metadata,
              lastUpdated: new Date().toISOString(),
            },
          });
        }
      } catch (error) {
        this.log(`Failed to update task projection for ${event.sessionId}: ${error}`, 'warn');
      }
    } catch (error) {
      this.log(`Failed to update task projection for ${event.sessionId}: ${error}`, 'warn');
    }
  }

  /**
   * Update service statistics
   */
  private updateStats(): void {
    const now = Date.now();
    this.stats.uptime = now - this.startTime;

    // Calculate indexing rate (events per second)
    const timeDiff = this.stats.uptime / 1000; // seconds
    this.stats.indexingRate = timeDiff > 0 ? this.stats.totalEventsProcessed / timeDiff : 0;
  }

  /**
   * Log messages with optional level
   */
  private log(message: string, level: 'info' | 'warn' | 'error' = 'info'): void {
    if (!this.config.verbose && level === 'info') return;

    const timestamp = new Date().toISOString();
    const prefix = level === 'error' ? '❌' : level === 'warn' ? '⚠️' : 'ℹ️';

    console.log(`${timestamp} ${prefix} ${message}`);
  }
}

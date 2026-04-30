/**
 * Workspace Isolation for Event Bus
 *
 * Provides session-scoped and workspace-partitioned event bus isolation.
 * Each workspace gets its own event stream, cursors, and subscriptions.
 */

import type {
  EventBus,
  EventRecord,
  PublishOptions,
  SubscribeOptions,
  Handler,
  CursorPosition,
  EventStore,
  CursorStore,
  Ack,
  DeliveryContext,
  UUID,
} from './types.js';
import { randomUUID } from 'node:crypto';

/**
 * Workspace identifier
 */
export type WorkspaceId = string;

/**
 * Session identifier for workspace context
 */
export type SessionId = string;

/**
 * Workspace configuration
 */
export type WorkspaceConfig = {
  /** Unique workspace identifier */
  id: WorkspaceId;
  /** Optional session ID for this workspace context */
  sessionId?: SessionId;
  /** Optional parent workspace for hierarchical isolation */
  parentId?: WorkspaceId;
  /** Metadata for the workspace */
  metadata?: Record<string, unknown>;
  /** Event retention in milliseconds (default: 1 hour) */
  retentionMs?: number;
  /** Maximum events per topic (default: 10000) */
  maxEventsPerTopic?: number;
};

/**
 * Workspace-aware event record
 */
export type WorkspaceEventRecord<T = unknown> = EventRecord<T> & {
  workspaceId: WorkspaceId;
  sessionId?: SessionId;
};

/**
 * Isolated event bus for a single workspace
 */
export class IsolatedEventBus implements EventBus {
  private readonly events = new Map<string, WorkspaceEventRecord[]>();
  private readonly cursors = new Map<string, CursorPosition>();
  private readonly subscriptions = new Map<string, Array<{ handler: Handler; opts: SubscribeOptions }>>();

  constructor(
    private readonly config: WorkspaceConfig,
    private readonly store?: EventStore,
    private readonly cursorStore?: CursorStore,
  ) {}

  get workspaceId(): WorkspaceId {
    return this.config.id;
  }

  get sessionId(): SessionId | undefined {
    return this.config.sessionId;
  }

  /**
   * Publish an event to this workspace's event stream
   */
  async publish<T>(topic: string, payload: T, opts: PublishOptions = {}): Promise<EventRecord<T>> {
    const event: WorkspaceEventRecord<T> = {
      id: opts.id || randomUUID(),
      ts: opts.ts || Date.now(),
      topic,
      payload,
      key: opts.key,
      headers: opts.headers,
      tags: opts.tags,
      caused_by: opts.caused_by,
      sid: opts.sid || this.config.sessionId,
      workspaceId: this.config.id,
      sessionId: opts.sid || this.config.sessionId,
      partition: opts.key ? this.getPartition(opts.key) : undefined,
    };

    // Store event
    if (!this.events.has(topic)) {
      this.events.set(topic, []);
    }

    const topicEvents = this.events.get(topic)!;
    topicEvents.push(event);

    // Enforce max events per topic
    const maxEvents = this.config.maxEventsPerTopic ?? 10000;
    if (topicEvents.length > maxEvents) {
      topicEvents.splice(0, topicEvents.length - maxEvents);
    }

    // Persist to store if provided
    if (this.store) {
      await this.store.insert(event);
    }

    // Notify subscribers
    await this.notifySubscribers(topic, event);

    return event;
  }

  /**
   * Subscribe to events in this workspace
   */
  async subscribe(
    topic: string,
    group: string,
    handler: Handler,
    opts: Omit<SubscribeOptions, 'group'> = {},
  ): Promise<() => Promise<void>> {
    const key = this.getSubscriptionKey(topic, group);

    if (!this.subscriptions.has(key)) {
      this.subscriptions.set(key, []);
    }

    const subscription = { handler, opts: { ...opts, group } as SubscribeOptions };
    this.subscriptions.get(key)!.push(subscription);

    // Return unsubscribe function
    return async () => {
      const subs = this.subscriptions.get(key);
      if (subs) {
        const index = subs.indexOf(subscription);
        if (index > -1) {
          subs.splice(index, 1);
        }
      }
    };
  }

  async ack(_topic: string, _group: string, id: UUID): Promise<Ack> {
    return { id, ok: true };
  }

  async nack(_topic: string, _group: string, id: UUID, reason?: string): Promise<Ack> {
    return { id, ok: false, err: reason };
  }

  async getCursor(topic: string, group: string): Promise<CursorPosition | null> {
    const key = this.getCursorKey(topic, group);

    if (this.cursorStore) {
      return await this.cursorStore.get(topic, group);
    }

    return this.cursors.get(key) || null;
  }

  async setCursor(topic: string, group: string, cursor: CursorPosition): Promise<void> {
    const key = this.getCursorKey(topic, group);

    if (this.cursorStore) {
      await this.cursorStore.set(topic, group, cursor);
    }

    this.cursors.set(key, cursor);
  }

  /**
   * Get all events for a topic in this workspace
   */
  getEvents(topic: string): WorkspaceEventRecord[] {
    return this.events.get(topic) || [];
  }

  /**
   * Clear all events in this workspace
   */
  clear(): void {
    this.events.clear();
    this.cursors.clear();
  }

  /**
   * Get workspace statistics
   */
  getStats(): {
    topicCount: number;
    totalEvents: number;
    subscriptionCount: number;
    cursorCount: number;
  } {
    let totalEvents = 0;
    for (const events of this.events.values()) {
      totalEvents += events.length;
    }

    return {
      topicCount: this.events.size,
      totalEvents,
      subscriptionCount: Array.from(this.subscriptions.values()).reduce((sum, subs) => sum + subs.length, 0),
      cursorCount: this.cursors.size,
    };
  }

  // Private methods

  private async notifySubscribers(topic: string, event: WorkspaceEventRecord): Promise<void> {
    const topicSubscriptions = Array.from(this.subscriptions.entries())
      .filter(([key]) => key.startsWith(`${topic}:`))
      .flatMap(([_, subs]) => subs);

    for (const sub of topicSubscriptions) {
      if (sub.opts.filter && !sub.opts.filter(event)) {
        continue;
      }

      const ctx: DeliveryContext = {
        attempt: 1,
        maxAttempts: sub.opts.maxAttempts || 5,
        cursor: await this.getCursor(topic, sub.opts.group) ?? undefined,
      };

      // Fire and forget for in-memory implementation
      sub.handler(event, ctx).catch((err) => {
        console.error('Event handler error in workspace', this.config.id, ':', err);
      });
    }
  }

  private getSubscriptionKey(topic: string, group: string): string {
    return `${topic}:${group}`;
  }

  private getCursorKey(topic: string, group: string): string {
    return `${topic}:${group}`;
  }

  private getPartition(key: string): number {
    // Simple hash-based partitioning
    let hash = 0;
    for (let i = 0; i < key.length; i++) {
      const char = key.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash) % 16; // 16 partitions
  }
}

/**
 * Workspace Manager - manages multiple isolated workspaces
 */
export class WorkspaceManager {
  private readonly workspaces = new Map<WorkspaceId, IsolatedEventBus>();
  private readonly store?: EventStore;
  private readonly cursorStore?: CursorStore;

  constructor(
    private readonly defaultConfig: Partial<WorkspaceConfig> = {},
    store?: EventStore,
    cursorStore?: CursorStore,
  ) {
    this.store = store;
    this.cursorStore = cursorStore;
  }

  /**
   * Get or create an isolated workspace
   */
  getWorkspace(config: WorkspaceConfig): IsolatedEventBus {
    let workspace = this.workspaces.get(config.id);

    if (!workspace) {
      workspace = new IsolatedEventBus(
        { ...this.defaultConfig, ...config },
        this.store,
        this.cursorStore,
      );
      this.workspaces.set(config.id, workspace);
    }

    return workspace;
  }

  /**
   * Create a new workspace with a unique ID
   */
  createWorkspace(sessionId?: SessionId, metadata?: Record<string, unknown>): IsolatedEventBus {
    const id = `ws-${Date.now()}-${randomUUID().slice(0, 8)}`;
    return this.getWorkspace({ id, sessionId, metadata });
  }

  /**
   * Check if a workspace exists
   */
  hasWorkspace(id: WorkspaceId): boolean {
    return this.workspaces.has(id);
  }

  /**
   * List all workspace IDs
   */
  listWorkspaces(): WorkspaceId[] {
    return Array.from(this.workspaces.keys());
  }

  /**
   * Remove a workspace and clear its data
   */
  removeWorkspace(id: WorkspaceId): boolean {
    const workspace = this.workspaces.get(id);
    if (workspace) {
      workspace.clear();
      this.workspaces.delete(id);
      return true;
    }
    return false;
  }

  /**
   * Get statistics for all workspaces
   */
  getGlobalStats(): {
    workspaceCount: number;
    workspaces: Array<{
      id: WorkspaceId;
      stats: ReturnType<IsolatedEventBus['getStats']>;
    }>;
  } {
    const workspaces = Array.from(this.workspaces.entries()).map(([id, bus]) => ({
      id,
      stats: bus.getStats(),
    }));

    return {
      workspaceCount: this.workspaces.size,
      workspaces,
    };
  }

  /**
   * Broadcast an event to all workspaces
   */
  async broadcast<T>(topic: string, payload: T, opts?: PublishOptions): Promise<EventRecord<T>[]> {
    const promises = Array.from(this.workspaces.values()).map((ws) => ws.publish(topic, payload, opts));
    return Promise.all(promises);
  }

  /**
   * Clear all workspaces
   */
  clearAll(): void {
    for (const workspace of this.workspaces.values()) {
      workspace.clear();
    }
    this.workspaces.clear();
  }
}

/**
 * Factory function to create a workspace manager
 */
export function createWorkspaceManager(
  defaultConfig?: Partial<WorkspaceConfig>,
  store?: EventStore,
  cursorStore?: CursorStore,
): WorkspaceManager {
  return new WorkspaceManager(defaultConfig, store, cursorStore);
}

/**
 * Factory function to create an isolated event bus for a single workspace
 */
export function createIsolatedEventBus(
  config: WorkspaceConfig,
  store?: EventStore,
  cursorStore?: CursorStore,
): IsolatedEventBus {
  return new IsolatedEventBus(config, store, cursorStore);
}

/**
 * Session Manager
 * 
 * Manages multiple session facets with weighted fair queuing
 */

import type {
  Session,
  CephalonEvent,
  CephalonEventType,
  CephalonPolicy,
  SessionManagerConfig,
} from "../types/index.js";
import type { EventBus } from "@promethean-os/event";
export { createDefaultSessionManagerConfig } from "../config/defaults.js";

interface QueuedEvent {
  event: CephalonEvent;
  enqueuedAt: number;
}

interface SessionState {
  session: Session;
  queue: QueuedEvent[];
  lastTurnAt: number;
}

interface PendingTurn {
  resolve: () => void;
  reject: (error: Error) => void;
  timeout: NodeJS.Timeout;
}

export class SessionManager {
  private sessions = new Map<string, SessionState>();
  private eventBus: EventBus;
  private policy: CephalonPolicy;
  private config: SessionManagerConfig;
  private runningSessions = new Set<string>();
  private pendingTurns = new Map<string, PendingTurn>();
  private laneUsage = {
    interactive: { turns: 0, toolCalls: 0, lastReset: Date.now() },
    operational: { turns: 0, toolCalls: 0, lastReset: Date.now() },
    maintenance: { turns: 0, toolCalls: 0, lastReset: Date.now() }
  };
  private isScheduling = false;
  private subscriptionsReady: Promise<void> | null = null;

    constructor(eventBus: EventBus, policy: CephalonPolicy, config: SessionManagerConfig) {
    this.eventBus = eventBus;
    this.policy = policy;
    this.config = config;
    this.subscriptionsReady = this.setupEventSubscriptions();
  }

  public async start(): Promise<void> {
    if (!this.subscriptionsReady) {
      this.subscriptionsReady = this.setupEventSubscriptions();
    }
    await this.subscriptionsReady;
  }

  private async setupEventSubscriptions(): Promise<void> {
    await this.eventBus.subscribe('session.turn.completed', 'session-manager', async (event) => {
      const payload = event.payload as { sessionId?: string; timestamp?: number };
      if (payload?.sessionId) {
        this.completeTurn(payload.sessionId, true);
      }
    });

    await this.eventBus.subscribe('session.turn.error', 'session-manager', async (event) => {
      const payload = event.payload as { sessionId?: string; error?: string; timestamp?: number };
      if (payload?.sessionId) {
        console.error(`[SessionManager] Turn error for ${payload.sessionId}:`, payload.error);
        this.completeTurn(payload.sessionId, false, new Error(payload.error || 'Turn failed'));
      }
    });

    await this.eventBus.subscribe('tool.result', 'session-manager', async (event) => {
      const payload = event.payload as { 
        toolName?: string; 
        callId?: string; 
        sessionId?: string;
        result?: unknown; 
        error?: string 
      };
      
      if (payload?.sessionId) {
        const state = this.sessions.get(payload.sessionId);
        if (state) {
          this.incrementToolCallUsage(state.session.priorityClass);
        }
      }
    });
  }

  private completeTurn(sessionId: string, success: boolean, error?: Error): void {
    const pending = this.pendingTurns.get(sessionId);
    if (pending) {
      clearTimeout(pending.timeout);
      this.pendingTurns.delete(sessionId);
      
      if (success) {
        pending.resolve();
      } else {
        pending.reject(error || new Error('Turn failed'));
      }
    }
    
    this.runningSessions.delete(sessionId);
    void this.schedule();
  }

  private createPendingTurn(sessionId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.pendingTurns.delete(sessionId);
        this.runningSessions.delete(sessionId);
        reject(new Error(`Turn timeout for session ${sessionId}`));
        void this.schedule();
      }, 5 * 60 * 1000);

      this.pendingTurns.set(sessionId, { resolve, reject, timeout });
    });
  }

  /**
   * Create a new session
   */
  createSession(
    id: string,
    cephalonId: string,
    priorityClass: Session['priorityClass'],
    options?: {
      persona?: string;
      systemPrompt?: string;
      developerPrompt?: string;
      attentionFocus?: string;
      toolPermissions?: string[];
      subscriptionFilter?: (event: CephalonEventType) => boolean;
      circuitIndex?: number;
      modelName?: string;
      reasoningEffort?: Session['reasoningEffort'];
      loopIntervalMs?: number;
      defaultChannelHints?: string[];
      homeChannelId?: string;
    }
  ): Session {
    const toolPermissions = new Set(options?.toolPermissions || []);
    // Always-allowed self-modification tools.
    // This keeps `self.growth` available even when circuits run with restricted tool bundles.
    toolPermissions.add("self.growth");
    // Always-allowed meme fuel.
    toolPermissions.add("tenor.search");
    toolPermissions.add("tenor.share");

    const session: Session = {
      id,
      cephalonId,
      priorityClass,
      credits: this.config.credits.max,
      recentBuffer: [],
      toolPermissions,
      subscriptionFilter: options?.subscriptionFilter,
      persona: options?.persona,
      systemPrompt: options?.systemPrompt,
      developerPrompt: options?.developerPrompt,
      attentionFocus: options?.attentionFocus,
      circuitIndex: options?.circuitIndex,
      modelName: options?.modelName,
      reasoningEffort: options?.reasoningEffort,
      loopIntervalMs: options?.loopIntervalMs,
      defaultChannelHints: options?.defaultChannelHints,
      homeChannelId: options?.homeChannelId,
    };

    this.sessions.set(id, {
      session,
      queue: [],
      lastTurnAt: 0
    });

    console.log(`[SessionManager] Created session ${id} (${priorityClass})`);
    return session;
  }

  async routeEvent(event: CephalonEvent): Promise<void> {
    const targetSessions = this.findTargetSessions(event);

    for (const sessionId of targetSessions) {
      const state = this.sessions.get(sessionId);
      if (!state) continue;

      if (state.session.subscriptionFilter &&
          !state.session.subscriptionFilter(event.type as CephalonEventType)) {
        continue;
      }

      this.enqueueEvent(state, event);

      console.log(`[SessionManager] Routed ${event.type} to session ${sessionId}`);
    }

    await this.schedule();
  }

  private enqueueEvent(state: SessionState, event: CephalonEvent): void {
    const maxQueue = this.config.queue.maxPerSession;

    if (state.queue.length >= maxQueue) {
      if (this.config.queue.dropPolicy === 'drop_oldest') {
        state.queue.shift();
        console.log(`[SessionManager] Dropped oldest event (queue limit: ${maxQueue})`);
      } else {
        console.log(`[SessionManager] Dropped new event (queue limit: ${maxQueue})`);
        return;
      }
    }

    state.queue.push({
      event,
      enqueuedAt: Date.now()
    });
  }

  /**
   * Find which sessions should receive an event
   */
  private findTargetSessions(event: CephalonEvent): string[] {
    if (event.sessionId && this.sessions.has(event.sessionId)) {
      return [event.sessionId];
    }

    return Array.from(this.sessions.keys());
  }

  private async schedule(): Promise<void> {
    if (this.isScheduling) return;
    this.isScheduling = true;

    try {
      this.resetLaneUsageIfNeeded();

      const runnable: Array<{ sessionId: string; priority: number }> = [];

      for (const [sessionId, state] of this.sessions) {
        if (state.queue.length === 0) continue;
        if (this.runningSessions.has(sessionId)) continue;

        const laneBudget = this.getLaneBudget(state.session.priorityClass);
        const laneUsed = this.getLaneUsage(state.session.priorityClass);

        if (laneUsed.turns >= laneBudget.turns) continue;
        if (laneUsed.toolCalls >= laneBudget.toolCalls) continue;

        const cost = this.config.credits.cost[state.session.priorityClass];
        if (state.session.credits < cost) continue;

        const priority = this.calculatePriority(state);
        runnable.push({ sessionId, priority });
      }

      runnable.sort((a, b) => b.priority - a.priority);

      const toRun = runnable.slice(0, this.config.concurrency - this.runningSessions.size);

      for (const { sessionId } of toRun) {
        void this.runSessionTurn(sessionId);
      }
    } finally {
      this.isScheduling = false;
    }
  }

  /**
   * Calculate priority score for a session
   */
  private calculatePriority(state: SessionState): number {
    const session = state.session;
    let score = 0;

    // Priority class boost
    switch (session.priorityClass) {
      case 'interactive': score += 100; break;
      case 'operational': score += 50; break;
      case 'maintenance': score += 10; break;
    }

    // Credits boost
    score += session.credits;

    // Staleness boost (older = higher priority)
    const staleness = Date.now() - state.lastTurnAt;
    score += Math.min(staleness / 1000, 60);  // Max 60 point boost

    // Queue length boost
    score += Math.min(state.queue.length * 5, 50);  // Max 50 point boost

    return score;
  }

  private async runSessionTurn(sessionId: string): Promise<void> {
    const state = this.sessions.get(sessionId);
    if (!state) return;

    this.runningSessions.add(sessionId);

    try {
      const queuedEvent = state.queue.shift();
      if (!queuedEvent) {
        this.runningSessions.delete(sessionId);
        return;
      }

      this.incrementLaneUsage(state.session.priorityClass);

      const cost = this.config.credits.cost[state.session.priorityClass];
      state.session.credits -= cost;

      state.lastTurnAt = Date.now();

      console.log(`[SessionManager] Running turn for ${sessionId} (${state.session.priorityClass})`);

      const turnPromise = this.createPendingTurn(sessionId);
      const requestedAt = Date.now();

      await this.eventBus.publish('session.turn.requested', {
        sessionId,
        event: queuedEvent.event,
        timestamp: requestedAt
      });

      await this.eventBus.publish('session.turn.started', {
        sessionId,
        event: queuedEvent.event,
        timestamp: requestedAt
      });

      await turnPromise;

    } catch (error) {
      console.error(`[SessionManager] Turn failed for ${sessionId}:`, error);
      this.runningSessions.delete(sessionId);
    }
  }

  /**
   * Refill credits for all sessions
   */
  refillCredits(): void {
    for (const state of this.sessions.values()) {
      state.session.credits = Math.min(
        state.session.credits + this.config.credits.refillPerSecond,
        this.config.credits.max
      );
    }
  }

  /**
   * Get session by ID
   */
  getSession(id: string): Session | undefined {
    return this.sessions.get(id)?.session;
  }

  /**
   * Get all sessions
   */
  getAllSessions(): Session[] {
    return Array.from(this.sessions.values()).map(s => s.session);
  }

  updateSessionPrompts(
    id: string,
    updates: {
      systemPrompt?: string;
      developerPrompt?: string;
      attentionFocus?: string;
    },
  ): Session | undefined {
    const state = this.sessions.get(id);
    if (!state) {
      return undefined;
    }

    if (typeof updates.systemPrompt === "string") {
      state.session.systemPrompt = updates.systemPrompt;
    }
    if (typeof updates.developerPrompt === "string") {
      state.session.developerPrompt = updates.developerPrompt;
    }
    if (typeof updates.attentionFocus === "string") {
      state.session.attentionFocus = updates.attentionFocus;
    }

    console.log(`[SessionManager] Updated prompts for ${id}`);
    return state.session;
  }

  /**
   * Get lane budget
   */
  private getLaneBudget(priorityClass: Session['priorityClass']) {
    return this.config.lanes[priorityClass];
  }

  /**
   * Get current lane usage
   */
  private getLaneUsage(priorityClass: Session['priorityClass']) {
    return this.laneUsage[priorityClass];
  }

  /**
   * Increment lane usage
   */
  private incrementLaneUsage(priorityClass: Session['priorityClass']): void {
    this.laneUsage[priorityClass].turns++;
  }

  /**
   * Increment tool call usage for a lane
   */
  private incrementToolCallUsage(priorityClass: Session['priorityClass']): void {
    this.laneUsage[priorityClass].toolCalls++;
  }

  /**
   * Reset lane usage every minute
   */
  private resetLaneUsageIfNeeded(): void {
    const now = Date.now();
    const oneMinute = 60 * 1000;

    for (const lane of Object.values(this.laneUsage)) {
      if (now - lane.lastReset > oneMinute) {
        lane.turns = 0;
        lane.toolCalls = 0;
        lane.lastReset = now;
      }
    }
  }

  /**
   * Get queue statistics
   */
  getStats(): {
    totalSessions: number;
    totalQueuedEvents: number;
    runningSessions: number;
    laneUsage: {
      interactive: { turns: number; toolCalls: number; lastReset: number };
      operational: { turns: number; toolCalls: number; lastReset: number };
      maintenance: { turns: number; toolCalls: number; lastReset: number };
    };
  } {
    let totalQueued = 0;
    for (const state of this.sessions.values()) {
      totalQueued += state.queue.length;
    }

    return {
      totalSessions: this.sessions.size,
      totalQueuedEvents: totalQueued,
      runningSessions: this.runningSessions.size,
      laneUsage: this.laneUsage
    };
  }

  /**
   * Get count of currently running sessions
   */
  getActiveSessionCount(): number {
    return this.runningSessions.size;
  }
}

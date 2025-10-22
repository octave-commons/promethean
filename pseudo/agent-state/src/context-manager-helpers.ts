import { AgentContext, ContextEvent, ContextSnapshot, EventStore } from './types.js';
import { RateLimiter } from './security.js';

// Import functional implementations
import {
  checkRateLimit as checkRateLimitFn,
  buildContextFromSnapshot as buildContextFromSnapshotFn,
  buildContextFromEvents as buildContextFromEventsFn,
  applyEventsToState as applyEventsToStateFn,
  logSecurityError as logSecurityErrorFn,
} from './context-manager-helpers-functional.js';

/**
 * @deprecated Use the functional implementations from './context-manager-helpers-functional' instead.
 * This class is provided for backward compatibility and will be removed in a future version.
 */
export class ContextManagerHelpers {
  static async checkRateLimit(
    rateLimiter: RateLimiter,
    agentId: string,
    action: string,
  ): Promise<void> {
    console.warn(
      'ContextManagerHelpers.checkRateLimit is deprecated. Use checkRateLimit from context-manager-helpers-functional instead.',
    );
    return checkRateLimitFn(rateLimiter, agentId, action);
  }

  static async buildContextFromSnapshot(
    agentId: string,
    snapshot: ContextSnapshot,
    eventStore: EventStore,
  ): Promise<AgentContext> {
    console.warn(
      'ContextManagerHelpers.buildContextFromSnapshot is deprecated. Use buildContextFromSnapshot from context-manager-helpers-functional instead.',
    );
    return buildContextFromSnapshotFn(agentId, snapshot, eventStore);
  }

  static async buildContextFromEvents(
    agentId: string,
    eventStore: EventStore,
  ): Promise<AgentContext> {
    console.warn(
      'ContextManagerHelpers.buildContextFromEvents is deprecated. Use buildContextFromEvents from context-manager-helpers-functional instead.',
    );
    return buildContextFromEventsFn(agentId, eventStore);
  }

  static applyEventsToState(initialState: unknown, events: ContextEvent[]): unknown {
    console.warn(
      'ContextManagerHelpers.applyEventsToState is deprecated. Use applyEventsToState from context-manager-helpers-functional instead.',
    );
    return applyEventsToStateFn(initialState, events);
  }

  static logSecurityError(agentId: string, action: string, error: unknown): void {
    console.warn(
      'ContextManagerHelpers.logSecurityError is deprecated. Use logSecurityError from context-manager-helpers-functional instead.',
    );
    return logSecurityErrorFn(agentId, action, error);
  }
}

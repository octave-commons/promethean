/**
 * Test fixtures for context module testing
 */

import type {
  ContextEvent,
  AgentContext,
  ContextSnapshot,
} from '../../../src/context/types.js';

export function createMockEvent(
  overrides: Partial<ContextEvent> = {}
): Omit<ContextEvent, 'id' | 'timestamp'> {
  return {
    type: 'test-event',
    agentId: 'test-agent-123',
    data: { test: 'data' },
    metadata: {},
    ...overrides,
  };
}

export function createMockContext(
  overrides: Partial<AgentContext> = {}
): AgentContext {
  return {
    id: 'context-123',
    agentId: 'test-agent-123',
    state: { initialized: true },
    version: 1,
    createdAt: new Date('2023-01-01T00:00:00Z'),
    updatedAt: new Date('2023-01-01T00:00:00Z'),
    metadata: {},
    ...overrides,
  };
}

export function createMockSnapshot(
  overrides: Partial<ContextSnapshot> = {}
): ContextSnapshot {
  return {
    id: 'snapshot-123',
    agentId: 'test-agent-123',
    timestamp: new Date('2023-01-01T00:00:00Z'),
    state: { snapshot: 'data' },
    version: 1,
    eventId: 'event-123',
    ...overrides,
  };
}

export const TEST_CONSTANTS = {
  AGENT_ID: 'test-agent-123',
  CONTEXT_ID: 'context-123',
  SNAPSHOT_ID: 'snapshot-123',
  EVENT_ID: 'event-123',
  TOKEN: 'test-token-123',
} as const;

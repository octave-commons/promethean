import { ContextEvent, ContextSnapshot, AgentContext, AuthToken } from '../../types';

export const mockEvent: Omit<ContextEvent, 'id' | 'timestamp'> = {
  type: 'test-event',
  agentId: 'agent-123',
  data: { action: 'test', value: 42 },
  metadata: { source: 'unit-test' },
};

export const mockContext: AgentContext = {
  id: 'context-123',
  agentId: 'agent-123',
  state: { status: 'active', counter: 0 },
  version: 1,
  createdAt: new Date('2023-01-01T00:00:00Z'),
  updatedAt: new Date('2023-01-01T00:00:00Z'),
  metadata: { environment: 'test' },
};

export const mockSnapshot: ContextSnapshot = {
  id: 'snapshot-123',
  agentId: 'agent-123',
  timestamp: new Date('2023-01-01T00:00:00Z'),
  state: { status: 'active', counter: 5 },
  version: 5,
  eventId: 'event-123',
};

export const mockToken: AuthToken = {
  token: 'jwt-token-123',
  agentId: 'agent-123',
  expiresAt: new Date(Date.now() + 3600000), // 1 hour from now
  permissions: ['read', 'write', 'execute'],
};

export const createMockEvent = (overrides: Partial<ContextEvent> = {}): ContextEvent => ({
  id: `event-${Math.random().toString(36).substring(2, 11)}`,
  timestamp: new Date(),
  ...mockEvent,
  ...overrides,
});

export const createMockContext = (overrides: Partial<AgentContext> = {}): AgentContext => ({
  ...mockContext,
  ...overrides,
});

export const createMockSnapshot = (overrides: Partial<ContextSnapshot> = {}): ContextSnapshot => ({
  id: `snapshot-${Math.random().toString(36).substring(2, 11)}`,
  agentId: 'agent-123',
  timestamp: new Date('2023-01-01T00:00:00Z'),
  state: { status: 'active', counter: 5 },
  version: 5,
  eventId: 'event-123',
  ...overrides,
});

export const createMockToken = (overrides: Partial<AuthToken> = {}): AuthToken => ({
  ...mockToken,
  ...overrides,
});

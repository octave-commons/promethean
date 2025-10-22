import { randomUUID } from 'node:crypto';

import type { TransitionEvent } from './types.js';

type CreateEventOptions = {
  readonly actor?: 'agent' | 'human' | 'system';
  readonly reason?: string;
  readonly metadata?: Record<string, unknown>;
};

export const createTransitionEvent = (
  taskId: string,
  fromStatus: string,
  toStatus: string,
  options: CreateEventOptions = {},
): TransitionEvent => ({
  id: randomUUID(),
  timestamp: new Date().toISOString(),
  taskId,
  fromStatus,
  toStatus,
  reason: options.reason || `Status updated from ${fromStatus} to ${toStatus}`,
  actor: options.actor || 'system',
  metadata: options.metadata,
});

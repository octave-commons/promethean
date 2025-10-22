import { randomUUID } from 'node:crypto';
import type { ReadonlyDeep } from 'type-fest';

import type { TransitionEvent } from './types.js';

export const createTransitionEvent = (
  taskId: string,
  fromStatus: string,
  toStatus: string,
  actor: 'agent' | 'human' | 'system' = 'system',
  reason?: string,
  metadata?: Record<string, unknown>,
): TransitionEvent => ({
  id: randomUUID(),
  timestamp: new Date().toISOString(),
  taskId,
  fromStatus,
  toStatus,
  reason: reason || `Status updated from ${fromStatus} to ${toStatus}`,
  actor,
  metadata,
});

import { randomUUID } from 'node:crypto';
export const createTransitionEvent = (taskId, fromStatus, toStatus, options = {}) => ({
    id: randomUUID(),
    timestamp: new Date().toISOString(),
    taskId,
    fromStatus,
    toStatus,
    reason: options.reason || `Status updated from ${fromStatus} to ${toStatus}`,
    actor: options.actor || 'system',
    metadata: options.metadata,
});
//# sourceMappingURL=event-creator.js.map
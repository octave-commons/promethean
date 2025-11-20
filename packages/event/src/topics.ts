export const Topics = {
  HEARTBEAT: 'heartbeat',
  HEARTBEAT_RECEIVED: 'heartbeat.received',
  HEARTBEAT_SENT: 'heartbeat.sent',
  SYSTEM: 'system',
  USER: 'user',
  ERROR: 'error',
  LOG: 'log',
} as const;

export type TopicName = (typeof Topics)[keyof typeof Topics];

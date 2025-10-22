// SPDX-License-Identifier: GPL-3.0-only
// Logger Composable - Provides event deduplication and logging

export type EventLogger = (eventType: string, message: string) => void;

export type LoggerManager = {
  readonly logger: EventLogger;
  readonly flush: () => void;
};

export const createLoggerComposable = (): LoggerManager => {
  let previousEventType: string | undefined;
  let consecutiveEventCount = 0;
  let pendingEventLog: string | undefined;

  const logger: EventLogger = (eventType: string, message: string): void => {
    // If this is the same event type as before, just increment counter
    if (previousEventType === eventType) {
      consecutiveEventCount++;
      return;
    }

    // If we have a pending event from a different type, log it with count
    if (previousEventType && pendingEventLog) {
      const count = consecutiveEventCount > 1 ? ` (${consecutiveEventCount}x)` : '';
      console.log(`${pendingEventLog}${count}`);
    }

    // Set up new event as pending
    previousEventType = eventType;
    consecutiveEventCount = 1;
    pendingEventLog = message;
  };

  const flush = (): void => {
    if (previousEventType && pendingEventLog) {
      const count = consecutiveEventCount > 1 ? ` (${consecutiveEventCount}x)` : '';
      console.log(`${pendingEventLog}${count}`);
    }
    previousEventType = undefined;
    consecutiveEventCount = 0;
    pendingEventLog = undefined;
  };

  return { logger, flush };
};
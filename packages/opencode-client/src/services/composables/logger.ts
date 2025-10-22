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
  let lastLogTime = 0;
  const LOG_DEBOUNCE_MS = 5000; // 5 seconds

  const logger: EventLogger = (eventType: string, message: string): void => {
    const now = Date.now();
    const timeSinceLastLog = now - lastLogTime;

    // If this is the same event type as before, just increment counter
    if (previousEventType === eventType) {
      consecutiveEventCount++;
      
      // Only log if it's been 5+ seconds since last log or we're in verbose mode
      const shouldLog = timeSinceLastLog > LOG_DEBOUNCE_MS || process.argv.includes('--verbose');
      
      if (shouldLog) {
        const count = consecutiveEventCount > 1 ? ` (${consecutiveEventCount}x)` : '';
        console.log(`${message}${count}`);
        lastLogTime = now;
      }
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
    lastLogTime = now;
    
    // Log the first occurrence immediately
    console.log(message);
  };

  const flush = (): void => {
    if (previousEventType && pendingEventLog) {
      const count = consecutiveEventCount > 1 ? ` (${consecutiveEventCount}x)` : '';
      console.log(`${pendingEventLog}${count}`);
    }
    previousEventType = undefined;
    consecutiveEventCount = 0;
    pendingEventLog = undefined;
    lastLogTime = 0;
  };

  return { logger, flush };
};
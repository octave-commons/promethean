import type { TransitionEvent, TaskTransitionResult } from './types.js';
import { readEventLog } from './file-operations.js';

export const getTaskHistory = async (
  logPath: string,
  taskId: string,
): Promise<ReadonlyArray<TransitionEvent>> => {
  const allEvents = await readEventLog(logPath);
  return allEvents.filter((event) => event.taskId === taskId);
};

export const replayTaskTransitions = async (
  logPath: string,
  taskId: string,
  currentStatus: string,
): Promise<TaskTransitionResult> => {
  const taskEvents = await getTaskHistory(logPath, taskId);

  if (taskEvents.length === 0) {
    return {
      finalStatus: currentStatus,
      isValid: true,
      events: [],
    };
  }

  // Start from first event's fromStatus
  let status = taskEvents[0]!.fromStatus;
  let lastValidEvent: TransitionEvent | undefined;
  let invalidEvent: TransitionEvent | undefined;

  for (const event of taskEvents) {
    // Verify that event's fromStatus matches our current state
    if (event.fromStatus !== status) {
      invalidEvent = event;
      return {
        finalStatus: status,
        isValid: false,
        lastValidEvent,
        invalidEvent,
        events: taskEvents,
      };
    }

    // Update current status
    status = event.toStatus;
    lastValidEvent = event;
  }

  return {
    finalStatus: status,
    isValid: true,
    lastValidEvent,
    invalidEvent,
    events: taskEvents,
  };
};

export const getAllTaskHistories = async (
  logPath: string,
): Promise<ReadonlyMap<string, ReadonlyArray<TransitionEvent>>> => {
  const allEvents = await readEventLog(logPath);
  const histories = new Map<string, ReadonlyArray<TransitionEvent>>();

  for (const event of allEvents) {
    const taskHistory = histories.get(event.taskId) || [];
    histories.set(event.taskId, [...taskHistory, event]);
  }

  return histories;
};
